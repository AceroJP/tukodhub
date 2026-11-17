using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace TukodHub.Api.Middleware;

public sealed class GlobalExceptionMiddleware(
    RequestDelegate next,
    IProblemDetailsService problemDetailsService,
    ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (AntiforgeryValidationException exception)
        {
            logger.LogWarning(exception, "CSRF validation failed at {Path}", context.Request.Path);
            await WriteProblemAsync(context, StatusCodes.Status400BadRequest, "The request is missing a valid CSRF token.");
        }
        catch (BadHttpRequestException exception)
        {
            logger.LogWarning(exception, "Bad request at {Path}", context.Request.Path);
            await WriteProblemAsync(context, StatusCodes.Status400BadRequest, "Bad request.");
        }
        catch (UnauthorizedAccessException exception)
        {
            logger.LogWarning(exception, "Unauthorized request at {Path}", context.Request.Path);
            await WriteProblemAsync(context, StatusCodes.Status403Forbidden, "You are not allowed to access this resource.");
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
            await WriteProblemAsync(context, StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
        }
    }

    private async Task WriteProblemAsync(HttpContext context, int statusCode, string title)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.Clear();
        context.Response.StatusCode = statusCode;

        await problemDetailsService.WriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            ProblemDetails = new ProblemDetails
            {
                Status = statusCode,
                Title = title,
                Type = $"https://httpstatuses.com/{statusCode}"
            }
        });
    }
}
