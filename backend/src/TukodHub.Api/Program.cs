using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TukodHub.Api.Data;
using TukodHub.Api.Infrastructure;
using TukodHub.Api.Middleware;
using TukodHub.Api.Security;
using TukodHub.Api.Services;

var builder = WebApplication.CreateBuilder(args);

var supabaseUrl = builder.Configuration["SupabaseUrl"];
var platformOwnerUserId = builder.Configuration["PlatformOwnerUserId"];
var frontendUrl = builder.Configuration["FrontendUrl"];
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var platformOwnerJwtSigningKey = builder.Configuration["PlatformOwnerJwtSigningKey"];
var platformOwnerJwtIssuer = builder.Configuration["PlatformOwnerJwtIssuer"];

ValidateConfiguration(
    builder.Environment,
    supabaseUrl,
    platformOwnerUserId,
    frontendUrl,
    connectionString,
    platformOwnerJwtSigningKey,
    platformOwnerJwtIssuer);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = context =>
    {
        context.ProblemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
    };
});

builder.Services.AddScoped<ITenantContextAccessor, TenantContextAccessor>();
builder.Services.AddSingleton<ITenantHostResolver, TenantHostResolver>();
builder.Services.AddScoped<IAuthorizationHandler, TenantMembershipHandler>();

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = AuthSchemes.TenantSession;
        options.DefaultChallengeScheme = AuthSchemes.TenantSession;
    })
    .AddScheme<AuthenticationSchemeOptions, TenantSessionAuthenticationHandler>(AuthSchemes.TenantSession, _ => { })
    .AddJwtBearer(AuthSchemes.PlatformOwnerJwt, options =>
    {
        options.MapInboundClaims = false;
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                var logger = context.HttpContext.RequestServices
                    .GetRequiredService<ILoggerFactory>()
                    .CreateLogger("PlatformOwnerJwt");
                logger.LogWarning(context.Exception, "Platform owner JWT authentication failed.");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                var subject = context.Principal?.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(subject))
                {
                    context.Fail("The token subject is missing.");
                }

                return Task.CompletedTask;
            }
        };

        var ownerIssuer = ResolvePlatformOwnerIssuer(supabaseUrl, platformOwnerJwtIssuer);

        if (!string.IsNullOrWhiteSpace(supabaseUrl))
        {
            options.Authority = ownerIssuer;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                RequireSignedTokens = true,
                ValidateIssuer = true,
                ValidIssuer = ownerIssuer,
                ValidateAudience = true,
                ValidAudience = "authenticated",
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(1),
                ValidAlgorithms =
                [
                    SecurityAlgorithms.RsaSha256,
                    SecurityAlgorithms.EcdsaSha256
                ]
            };

            return;
        }

        if (!string.IsNullOrWhiteSpace(platformOwnerJwtSigningKey))
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(platformOwnerJwtSigningKey)),
                RequireSignedTokens = true,
                ValidateIssuer = true,
                ValidIssuer = ownerIssuer,
                ValidateAudience = true,
                ValidAudience = "authenticated",
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(1),
                ValidAlgorithms = [SecurityAlgorithms.HmacSha256]
            };

            return;
        }

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var authorization = context.Request.Headers.Authorization.ToString();
                if (authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    context.Fail("Platform owner JWT authentication is not configured.");
                }

                return Task.CompletedTask;
            }
        };

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            RequireSignedTokens = true,
            ValidateLifetime = true,
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("PlatformOwner", policy =>
    {
        policy.AddAuthenticationSchemes(AuthSchemes.PlatformOwnerJwt)
            .RequireAuthenticatedUser()
            .RequireAssertion(context =>
            {
                var subject = context.User.FindFirst("sub")?.Value;
                if (string.IsNullOrWhiteSpace(subject))
                {
                    return false;
                }

                if (builder.Environment.IsDevelopment() && string.IsNullOrWhiteSpace(platformOwnerUserId))
                {
                    return true;
                }

                return string.Equals(subject, platformOwnerUserId, StringComparison.Ordinal);
            });
    });

    options.AddPolicy("TenantMember", policy =>
    {
        policy.AddAuthenticationSchemes(AuthSchemes.TenantSession)
            .RequireAuthenticatedUser()
            .AddRequirements(new TenantMembershipRequirement());
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var origins = BuildAllowedOrigins(frontendUrl, builder.Environment.IsDevelopment());
        policy.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        var problem = new ProblemDetails
        {
            Title = "Too many requests.",
            Status = StatusCodes.Status429TooManyRequests
        };

        await context.HttpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
    };

    options.AddPolicy("AuthWrite", context =>
    {
        var key = $"{context.Request.Path}|{context.Connection.RemoteIpAddress}";
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: key,
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            });
    });
});

builder.Services.AddAntiforgery(options =>
{
    options.Cookie.Name = "tukodhub_csrf";
    options.Cookie.HttpOnly = false;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.HeaderName = "X-CSRF-TOKEN";
});

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        if (!builder.Environment.IsDevelopment())
        {
            throw new InvalidOperationException("ConnectionStrings:DefaultConnection must be configured outside development.");
        }

        return;
    }

    options.UseNpgsql(connectionString);
});

builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseMiddleware<TenantHostMiddleware>();
app.UseCors("Frontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

static void ValidateConfiguration(
    IHostEnvironment environment,
    string? supabaseUrl,
    string? platformOwnerUserId,
    string? frontendUrl,
    string? connectionString,
    string? platformOwnerJwtSigningKey,
    string? platformOwnerJwtIssuer)
{
    if (environment.IsDevelopment())
    {
        return;
    }

    if (string.IsNullOrWhiteSpace(platformOwnerUserId))
    {
        throw new InvalidOperationException("PlatformOwnerUserId must be configured outside development.");
    }

    if (string.IsNullOrWhiteSpace(frontendUrl))
    {
        throw new InvalidOperationException("FrontendUrl must be configured outside development.");
    }

    if (!Uri.TryCreate(frontendUrl, UriKind.Absolute, out _))
    {
        throw new InvalidOperationException("FrontendUrl must be an absolute URL.");
    }

    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException("ConnectionStrings:DefaultConnection must be configured outside development.");
    }

    if (string.IsNullOrWhiteSpace(supabaseUrl))
    {
        throw new InvalidOperationException("SupabaseUrl must be configured outside development for platform-owner authentication.");
    }

    if (!Uri.TryCreate(supabaseUrl, UriKind.Absolute, out var supabaseUri) || supabaseUri.Scheme != Uri.UriSchemeHttps)
    {
        throw new InvalidOperationException("SupabaseUrl must be a valid HTTPS URL.");
    }

    if (!string.IsNullOrWhiteSpace(platformOwnerJwtSigningKey))
    {
        throw new InvalidOperationException("PlatformOwnerJwtSigningKey is only supported for development and test environments.");
    }

    if (!string.IsNullOrWhiteSpace(platformOwnerJwtIssuer)
        && !Uri.TryCreate(platformOwnerJwtIssuer, UriKind.Absolute, out _))
    {
        throw new InvalidOperationException("PlatformOwnerJwtIssuer must be a valid absolute URL when configured.");
    }
}

static string ResolvePlatformOwnerIssuer(string? supabaseUrl, string? configuredIssuer)
{
    if (!string.IsNullOrWhiteSpace(configuredIssuer))
    {
        return configuredIssuer.TrimEnd('/');
    }

    if (!string.IsNullOrWhiteSpace(supabaseUrl))
    {
        return $"{supabaseUrl.TrimEnd('/')}/auth/v1";
    }

    return string.Empty;
}

static string[] BuildAllowedOrigins(string? frontendUrl, bool isDevelopment)
{
    var origins = new List<string>();
    if (!string.IsNullOrWhiteSpace(frontendUrl))
    {
        origins.Add(frontendUrl.TrimEnd('/'));
    }

    if (isDevelopment)
    {
        origins.Add("http://localhost:3000");
        origins.Add("http://localhost:3001");
    }

    var normalized = origins
        .Where(origin => Uri.TryCreate(origin, UriKind.Absolute, out _))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();

    if (normalized.Length == 0)
    {
        throw new InvalidOperationException("No valid CORS origins were configured.");
    }

    return normalized;
}

public partial class Program;
