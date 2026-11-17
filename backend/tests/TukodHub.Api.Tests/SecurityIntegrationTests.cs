using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.IdentityModel.Tokens;
using TukodHub.Api.Tests.TestHost;
using Xunit;

namespace TukodHub.Api.Tests;

public sealed class SecurityIntegrationTests
{
    [Fact]
    public async Task PlatformOwnerEndpoint_Returns401_WhenMissingBearerToken()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

        var response = await client.GetAsync("/api/v1/platform/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task PlatformOwnerEndpoint_Returns401_WhenTenantSessionCookieProvided()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/platform/me");
        request.Headers.Add("Cookie", $"tukodhub_session={TestDataSeeder.ActiveSessionToken}");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task PlatformOwnerEndpoint_Returns403_WhenSubDoesNotMatchOwner()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", CreateOwnerJwt("other-user", DateTime.UtcNow.AddMinutes(5)));

        var response = await client.GetAsync("/api/v1/platform/me");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task PlatformOwnerEndpoint_Returns200_WhenTokenIsValid()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", CreateOwnerJwt(TestApplicationFactory.OwnerUserId, DateTime.UtcNow.AddMinutes(5)));

        var response = await client.GetAsync("/api/v1/platform/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task PlatformOwnerEndpoint_Returns401_WhenTokenExpired()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", CreateOwnerJwt(TestApplicationFactory.OwnerUserId, DateTime.UtcNow.AddMinutes(-5)));

        var response = await client.GetAsync("/api/v1/platform/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task PlatformOwnerEndpoint_Returns401_WhenSignatureInvalid()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", CreateOwnerJwt(TestApplicationFactory.OwnerUserId, DateTime.UtcNow.AddMinutes(5), "different-signing-key-should-fail-validation-123456"));

        var response = await client.GetAsync("/api/v1/platform/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task TenantEndpoint_Returns401_WhenOnlyBearerTokenProvided()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://aceroaircon.localhost") });
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", CreateOwnerJwt(TestApplicationFactory.OwnerUserId, DateTime.UtcNow.AddMinutes(5)));

        var response = await client.GetAsync("/api/v1/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task TenantAccountEndpoint_Returns401_WhenOnlyBearerTokenProvided()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://aceroaircon.localhost") });
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", CreateOwnerJwt(TestApplicationFactory.OwnerUserId, DateTime.UtcNow.AddMinutes(5)));

        var response = await client.GetAsync("/api/v1/auth/account");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task TenantMe_Returns200_ForMatchingTenantHostAndActiveMembership()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://aceroaircon.localhost") });

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/me");
        request.Headers.Add("Cookie", $"tukodhub_session={TestDataSeeder.ActiveSessionToken}");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task TenantMe_Returns401_ForCrossTenantHostAccess()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://othertenant.localhost") });

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/me");
        request.Headers.Add("Cookie", $"tukodhub_session={TestDataSeeder.ActiveSessionToken}");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task TenantMe_Returns403_ForUnknownHost()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://unknown.local") });

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/me");
        request.Headers.Add("Cookie", $"tukodhub_session={TestDataSeeder.ActiveSessionToken}");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task TenantMe_Returns401_ForInactiveMembership()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://aceroaircon.localhost") });

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/me");
        request.Headers.Add("Cookie", $"tukodhub_session={TestDataSeeder.SuspendedSessionToken}");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Sessions_ReturnsCurrentSession_ForAuthenticatedTenantUser()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://aceroaircon.localhost"),
            HandleCookies = true
        });

        await LoginAsync(client, "active@tenant.test", "CorrectHorseBattery1!");

        var response = await client.GetAsync("/api/v1/auth/sessions");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var sessions = await response.Content.ReadFromJsonAsync<List<SessionSummaryResponse>>();
        Assert.NotNull(sessions);
        Assert.NotEmpty(sessions!);
        Assert.Contains(sessions!, item => item.IsCurrent);
    }

    [Fact]
    public async Task Logout_RequiresValidCsrfToken()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://aceroaircon.localhost"),
            HandleCookies = true
        });

        await LoginAsync(client, "active@tenant.test", "CorrectHorseBattery1!");

        var withoutCsrf = await client.PostAsJsonAsync("/api/v1/auth/logout", new { });
        Assert.Equal(HttpStatusCode.BadRequest, withoutCsrf.StatusCode);

        var tokenResponse = await client.GetFromJsonAsync<CsrfTokenResponse>("/api/v1/auth/csrf");
        Assert.NotNull(tokenResponse);

        using var logoutRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/logout");
        logoutRequest.Headers.Add("X-CSRF-TOKEN", tokenResponse!.Token);
        logoutRequest.Content = JsonContent.Create(new { });

        var withCsrf = await client.SendAsync(logoutRequest);
        Assert.Equal(HttpStatusCode.NoContent, withCsrf.StatusCode);
    }

    [Fact]
    public async Task ChangePassword_RequiresValidCsrfToken()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://aceroaircon.localhost"),
            HandleCookies = true
        });

        await LoginAsync(client, "active@tenant.test", "CorrectHorseBattery1!");

        var withoutCsrf = await client.PostAsJsonAsync("/api/v1/auth/password/change", new
        {
            currentPassword = "CorrectHorseBattery1!",
            newPassword = "EvenMoreSecurePassw0rd!"
        });

        Assert.Equal(HttpStatusCode.BadRequest, withoutCsrf.StatusCode);
    }

    [Fact]
    public async Task Login_ReturnsAvailableMemberships_AndRequiresSelection_ForMultiTenantUser()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://aceroaircon.localhost"),
            HandleCookies = true
        });

        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "multi@tenant.test",
            password = "CorrectHorseBattery1!"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var account = await response.Content.ReadFromJsonAsync<AuthenticatedAccountResponse>();
        Assert.NotNull(account);
        Assert.True(account!.RequiresTenantSelection);
        Assert.Null(account.ActiveTenant);
        Assert.Equal(2, account.AvailableTenants.Count);
    }

    [Fact]
    public async Task Login_ReturnsSingleActiveMembership_WithoutTenantSelection_WhenUserHasOneMembership()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://aceroaircon.localhost"),
            HandleCookies = true
        });

        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "active@tenant.test",
            password = "CorrectHorseBattery1!"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.Headers.TryGetValues("Set-Cookie", out var cookieHeaders));
        Assert.Contains(cookieHeaders!, item => item.StartsWith("tukodhub_session=", StringComparison.OrdinalIgnoreCase));

        var account = await response.Content.ReadFromJsonAsync<AuthenticatedAccountResponse>();
        Assert.NotNull(account);
        Assert.False(account!.RequiresTenantSelection);
        Assert.NotNull(account.ActiveTenant);
        Assert.Single(account.AvailableTenants);

        var onlyMembership = Assert.Single(account.AvailableTenants);
        Assert.Equal(account.ActiveTenant!.MembershipId, onlyMembership.MembershipId);
        Assert.Equal(account.ActiveTenant.TenantId, onlyMembership.TenantId);
        Assert.Equal("aceroaircon", onlyMembership.TenantSlug);
        Assert.Equal("Acero Aircon", onlyMembership.TenantName);
        Assert.Equal("Owner", onlyMembership.RoleName);
    }

    [Fact]
    public async Task TenantSwitch_Works_WhenUserHasMembershipInTargetTenant()
    {
        await using var factory = new TestApplicationFactory();
        var sourceClient = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://aceroaircon.localhost"),
            HandleCookies = true
        });

        await sourceClient.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "multi@tenant.test",
            password = "CorrectHorseBattery1!",
            preferredTenantHost = "aceroaircon.localhost"
        });

        var tokenResponse = await sourceClient.GetFromJsonAsync<CsrfTokenResponse>("/api/v1/auth/csrf");
        Assert.NotNull(tokenResponse);

        using var switchRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/tenant/switch")
        {
            Content = JsonContent.Create(new { targetTenantHost = "othertenant.localhost" })
        };
        switchRequest.Headers.Add("X-CSRF-TOKEN", tokenResponse!.Token);

        var switchResponse = await sourceClient.SendAsync(switchRequest);
        Assert.Equal(HttpStatusCode.OK, switchResponse.StatusCode);

        var switchedAccount = await switchResponse.Content.ReadFromJsonAsync<AuthenticatedAccountResponse>();
        Assert.NotNull(switchedAccount);
        Assert.NotNull(switchedAccount!.ActiveTenant);
        Assert.Equal("othertenant", switchedAccount.ActiveTenant!.TenantSlug);
        Assert.Equal("Manager", switchedAccount.ActiveTenant.RoleName);

        var setCookie = switchResponse.Headers.TryGetValues("Set-Cookie", out var values)
            ? values.FirstOrDefault(item => item.StartsWith("tukodhub_session=", StringComparison.OrdinalIgnoreCase))
            : null;
        Assert.False(string.IsNullOrWhiteSpace(setCookie));

        var sessionToken = ExtractCookieValue(setCookie!, "tukodhub_session");
        Assert.False(string.IsNullOrWhiteSpace(sessionToken));

        var destinationClient = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://othertenant.localhost")
        });

        using var meRequest = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/me");
        meRequest.Headers.Add("Cookie", $"tukodhub_session={sessionToken}");
        var meResponse = await destinationClient.SendAsync(meRequest);

        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
    }

    [Fact]
    public async Task TenantRole_IsScopedPerTenant_AfterSwitchingBetweenMemberships()
    {
        await using var factory = new TestApplicationFactory();
        var sourceClient = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://aceroaircon.localhost"),
            HandleCookies = true
        });

        var loginResponse = await sourceClient.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "multi@tenant.test",
            password = "CorrectHorseBattery1!",
            preferredTenantHost = "aceroaircon.localhost"
        });

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        var loginAccount = await loginResponse.Content.ReadFromJsonAsync<AuthenticatedAccountResponse>();
        Assert.NotNull(loginAccount);
        Assert.NotNull(loginAccount!.ActiveTenant);
        Assert.Equal("aceroaircon", loginAccount.ActiveTenant!.TenantSlug);
        Assert.Equal("Owner", loginAccount.ActiveTenant.RoleName);

        var tokenResponse = await sourceClient.GetFromJsonAsync<CsrfTokenResponse>("/api/v1/auth/csrf");
        Assert.NotNull(tokenResponse);

        using var switchRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/tenant/switch")
        {
            Content = JsonContent.Create(new { targetTenantHost = "othertenant.localhost" })
        };
        switchRequest.Headers.Add("X-CSRF-TOKEN", tokenResponse!.Token);

        var switchResponse = await sourceClient.SendAsync(switchRequest);
        Assert.Equal(HttpStatusCode.OK, switchResponse.StatusCode);

        var switchedAccount = await switchResponse.Content.ReadFromJsonAsync<AuthenticatedAccountResponse>();
        Assert.NotNull(switchedAccount);
        Assert.NotNull(switchedAccount!.ActiveTenant);
        Assert.Equal("othertenant", switchedAccount.ActiveTenant!.TenantSlug);
        Assert.Equal("Manager", switchedAccount.ActiveTenant.RoleName);
        Assert.NotEqual("Owner", switchedAccount.ActiveTenant.RoleName);
    }

    [Fact]
    public async Task TenantSwitchEndpoint_Returns401_WhenOnlyBearerTokenProvided()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://aceroaircon.localhost"),
            HandleCookies = true
        });

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", CreateOwnerJwt(TestApplicationFactory.OwnerUserId, DateTime.UtcNow.AddMinutes(5)));

        var tokenResponse = await client.GetFromJsonAsync<CsrfTokenResponse>("/api/v1/auth/csrf");
        Assert.NotNull(tokenResponse);

        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/tenant/switch")
        {
            Content = JsonContent.Create(new { targetTenantHost = "othertenant.localhost" })
        };
        request.Headers.Add("X-CSRF-TOKEN", tokenResponse!.Token);

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task TenantSwitch_Returns401_ForUnauthorizedTenant()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://aceroaircon.localhost"),
            HandleCookies = true
        });

        await LoginAsync(client, "active@tenant.test", "CorrectHorseBattery1!");

        var tokenResponse = await client.GetFromJsonAsync<CsrfTokenResponse>("/api/v1/auth/csrf");
        Assert.NotNull(tokenResponse);

        using var switchRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/tenant/switch")
        {
            Content = JsonContent.Create(new { targetTenantHost = "othertenant.localhost" })
        };
        switchRequest.Headers.Add("X-CSRF-TOKEN", tokenResponse!.Token);

        var switchResponse = await client.SendAsync(switchRequest);
        Assert.Equal(HttpStatusCode.Unauthorized, switchResponse.StatusCode);
    }

    [Fact]
    public async Task TenantSwitch_Returns400_ForInvalidTenantHostname_AndKeepsSessionValid()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://aceroaircon.localhost"),
            HandleCookies = true
        });

        await LoginAsync(client, "active@tenant.test", "CorrectHorseBattery1!");

        var tokenResponse = await client.GetFromJsonAsync<CsrfTokenResponse>("/api/v1/auth/csrf");
        Assert.NotNull(tokenResponse);

        using var switchRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/tenant/switch")
        {
            Content = JsonContent.Create(new { targetTenantHost = "invalid host $$$" })
        };
        switchRequest.Headers.Add("X-CSRF-TOKEN", tokenResponse!.Token);

        var switchResponse = await client.SendAsync(switchRequest);
        Assert.Equal(HttpStatusCode.BadRequest, switchResponse.StatusCode);

        var meResponse = await client.GetAsync("/api/v1/auth/me");
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
    }

    [Fact]
    public async Task Session_RemainsValidForAuthorizedHost_WhenRejectedOnUnauthorizedHost()
    {
        await using var factory = new TestApplicationFactory();
        var sourceClient = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://aceroaircon.localhost"),
            HandleCookies = true
        });

        var loginResponse = await sourceClient.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "active@tenant.test",
            password = "CorrectHorseBattery1!"
        });

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        var setCookie = loginResponse.Headers.TryGetValues("Set-Cookie", out var values)
            ? values.FirstOrDefault(item => item.StartsWith("tukodhub_session=", StringComparison.OrdinalIgnoreCase))
            : null;
        Assert.False(string.IsNullOrWhiteSpace(setCookie));

        var sessionToken = ExtractCookieValue(setCookie!, "tukodhub_session");
        Assert.False(string.IsNullOrWhiteSpace(sessionToken));

        var onSourceHost = await sourceClient.GetAsync("/api/v1/auth/me");
        Assert.Equal(HttpStatusCode.OK, onSourceHost.StatusCode);

        var crossTenantClient = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://othertenant.localhost")
        });

        using var crossHostRequest = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/me");
        crossHostRequest.Headers.Add("Cookie", $"tukodhub_session={sessionToken}");

        var crossHostResponse = await crossTenantClient.SendAsync(crossHostRequest);
        Assert.Equal(HttpStatusCode.Unauthorized, crossHostResponse.StatusCode);

        var stillValidOnSourceHost = await sourceClient.GetAsync("/api/v1/auth/me");
        Assert.Equal(HttpStatusCode.OK, stillValidOnSourceHost.StatusCode);
    }

    [Fact]
    public async Task Login_Returns401_WhenUserHasNoActiveMemberships()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "nomembership@tenant.test",
            password = "CorrectHorseBattery1!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_Returns401_WhenMembershipIsRevoked()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "revoked@tenant.test",
            password = "CorrectHorseBattery1!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_Returns401_WhenMembershipIsSuspended()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "suspended@tenant.test",
            password = "CorrectHorseBattery1!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_Returns401_WhenOnlyMembershipBelongsToInactiveTenant()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "inactivetenant@tenant.test",
            password = "CorrectHorseBattery1!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task TenantMe_Returns401_WhenMembershipIsRevoked()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://aceroaircon.localhost") });

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/me");
        request.Headers.Add("Cookie", $"tukodhub_session={TestDataSeeder.RevokedSessionToken}");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_IsRateLimited()
    {
        await using var factory = new TestApplicationFactory();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

        HttpStatusCode lastCode = HttpStatusCode.OK;
        for (var index = 0; index < 11; index++)
        {
            var response = await client.PostAsJsonAsync("/api/v1/auth/login", new
            {
                email = "active@tenant.test",
                password = "wrong-password"
            });

            lastCode = response.StatusCode;
        }

        Assert.Equal((HttpStatusCode)429, lastCode);
    }

    private static async Task LoginAsync(HttpClient client, string email, string password)
    {
        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new { email, password });
        response.EnsureSuccessStatusCode();
    }

    private static string ExtractCookieValue(string setCookieHeader, string cookieName)
    {
        var first = setCookieHeader.Split(';', 2, StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)[0];
        var parts = first.Split('=', 2);
        if (parts.Length != 2 || !string.Equals(parts[0], cookieName, StringComparison.Ordinal))
        {
            return string.Empty;
        }

        return parts[1];
    }

    private static string CreateOwnerJwt(string subject, DateTime expiresUtc, string? signingKey = null)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey ?? TestApplicationFactory.JwtSigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: TestApplicationFactory.JwtIssuer,
            audience: "authenticated",
            claims:
            [
                new Claim("sub", subject),
                new Claim("email", "owner@tukodhub.test")
            ],
            notBefore: DateTime.UtcNow.AddMinutes(-1),
            expires: expiresUtc,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private sealed record CsrfTokenResponse(string Token);
    private sealed record SessionSummaryResponse(Guid SessionId, DateTimeOffset ExpiresAt, DateTimeOffset CreatedAt, bool IsCurrent);
    private sealed record AuthenticatedAccountResponse(
        AuthPrincipalResponse User,
        TenantMembershipSummaryResponse? ActiveTenant,
        IReadOnlyList<TenantMembershipSummaryResponse> AvailableTenants,
        bool RequiresTenantSelection);
    private sealed record AuthPrincipalResponse(Guid UserId, string Email, string DisplayName);
    private sealed record TenantMembershipSummaryResponse(
        Guid MembershipId,
        Guid TenantId,
        string TenantSlug,
        string TenantName,
        Guid RoleId,
        string RoleName);
}
