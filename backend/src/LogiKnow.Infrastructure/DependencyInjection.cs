using LogiKnow.Application.Interfaces;
using LogiKnow.Domain.Entities;
using LogiKnow.Domain.Interfaces;
using LogiKnow.Infrastructure.AI;
using LogiKnow.Infrastructure.Auth;
using LogiKnow.Infrastructure.Email;
using LogiKnow.Infrastructure.Persistence;
using LogiKnow.Infrastructure.Persistence.Repositories;
using LogiKnow.Infrastructure.Search;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nest;

namespace LogiKnow.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database — SQL Server via Docker
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        // Identity
        services.AddIdentityCore<User>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 8;
        })
        .AddRoles<IdentityRole>()
        .AddSignInManager<SignInManager<User>>()
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders();

        // Elasticsearch
        var elasticUri = configuration["Elasticsearch:Uri"] ?? "http://localhost:9200";
        var settings = new ConnectionSettings(new Uri(elasticUri));
        var esUser = configuration["Elasticsearch:Username"];
        var esPass = configuration["Elasticsearch:Password"];
        if (!string.IsNullOrEmpty(esUser) && !string.IsNullOrEmpty(esPass))
            settings = settings.BasicAuthentication(esUser, esPass);
        settings.DefaultIndex("logiknow");
        services.AddSingleton<IElasticClient>(new ElasticClient(settings));

        // Repositories
        services.AddScoped<ITermRepository, TermRepository>();
        services.AddScoped<IBookRepository, BookRepository>();
        services.AddScoped<IAcademicRepository, AcademicRepository>();
        services.AddScoped<ISubmissionRepository, SubmissionRepository>();

        // Services
        services.AddScoped<ISearchService, MockSearchService>();
        services.AddScoped<IAIService, OpenAIService>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IEmailService, EmailService>();

        return services;
    }
}
