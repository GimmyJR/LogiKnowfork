# LogiKnow Platform — Implementation Plan

Build a full-stack logistics knowledge platform per the SOP: .NET 8 Clean Architecture backend + Next.js React frontend with multilingual support, Elasticsearch, and OpenAI integration.

## User Review Required

> [!IMPORTANT]
> This is a greenfield project with **200+ files**. It will be built in phases, and each phase must complete before the next begins. The build will run locally with `docker-compose` for SQL Server + Elasticsearch.

> [!WARNING]
> External services (OpenAI, SendGrid, Azure Blob) use placeholder configuration. You'll need to supply real API keys before those features work end-to-end.

> [!CAUTION]
> EF Core migrations (`dotnet ef migrations add`) require a running SQL Server. We will create the migration commands but defer actual execution until `docker-compose up` is run.

---

## Proposed Changes

### Phase 1 — Backend Foundation (`backend/`)

#### [NEW] Solution & Projects
- `LogiKnow.sln` — solution file
- `LogiKnow.Domain` — class library (entities, enums, interfaces)
- `LogiKnow.Application` — class library (MediatR handlers, DTOs, validators)
- `LogiKnow.Infrastructure` — class library (EF Core, Elasticsearch, OpenAI, Email)
- `LogiKnow.API` — ASP.NET Core Web API

NuGet packages per layer:
| Project | Packages |
|---|---|
| Domain | *(none — pure C#)* |
| Application | MediatR, AutoMapper, FluentValidation |
| Infrastructure | EF Core + SqlServer, NEST, Azure.AI.OpenAI, SendGrid, ASP.NET Identity |
| API | Swashbuckle, Serilog, AspNetCoreRateLimit |

---

### Phase 1a — Domain Layer

#### [NEW] `BaseEntity.cs`, `Term.cs`, `Book.cs`, `BookPage.cs`, `AcademicEntry.cs`, `Submission.cs`, `User.cs`, `Tag.cs`
All entities per SOP Section 04, verbatim.

#### [NEW] Enums: `AcademicEntryType.cs`, `SubmissionStatus.cs`, `ContentLanguage.cs`, `ExplanationStyle.cs`

#### [NEW] Interfaces: `ITermRepository.cs`, `IBookRepository.cs`, `IAcademicRepository.cs`, `ISearchService.cs`, `IAIService.cs`

---

### Phase 2 — Database (Infrastructure)

#### [NEW] `AppDbContext.cs` — All DbSets + `IEntityTypeConfiguration<T>` per entity
#### [NEW] `Configurations/` — One config file per entity
#### [NEW] Seed data — Admin user + base term categories via `IHostedService`

---

### Phase 3 — Application Layer

#### [NEW] DTOs — Request/response DTOs for all entities
#### [NEW] `MappingProfile.cs` — AutoMapper mappings
#### [NEW] MediatR Handlers:
- Terms: `GetTermByIdQuery`, `SearchTermsQuery`, `ExplainTermQuery`, `CreateTermCommand`
- Books: `GetBooksQuery`, `SearchQuotesQuery`, `AddBookCommand`
- Academic: `GetAcademicEntriesQuery`, `SubmitAcademicEntryCommand`
- Search: `GlobalSearchQuery`
- Moderation: `GetPendingSubmissionsQuery`, `ReviewSubmissionCommand`

#### [NEW] FluentValidation validators for all commands
#### [NEW] `IJwtService.cs`, `IEmailService.cs` interfaces

---

### Phase 4 — Services (Infrastructure)

#### [NEW] Repository implementations: `TermRepository.cs`, `BookRepository.cs`, `AcademicRepository.cs`
#### [NEW] `ElasticsearchService.cs` + index models
#### [NEW] `OpenAIService.cs` + `PromptBuilder.cs`
#### [NEW] `JwtService.cs`, `EmailService.cs`
#### [NEW] `DependencyInjection.cs` — `AddInfrastructure()` extension method

---

### Phase 5 — API Layer

#### [NEW] Controllers: `TermsController`, `BooksController`, `AcademicController`, `SearchController`, `SubmissionsController`, `ModerationController`, `AuthController`
#### [NEW] Middleware: `ExceptionMiddleware.cs`, `RequestLoggingMiddleware.cs`
#### [NEW] `Program.cs` — Full DI registration, Swagger, CORS, JWT, rate limiting
#### [NEW] `appsettings.json` + `appsettings.Development.json`

---

### Phase 6 — Frontend (`frontend/`)

#### [NEW] Next.js 14 app with App Router + `next-intl` for i18n
- Locales: `ar` (default, RTL), `en`, `fr`
- Tailwind CSS for styling (per SOP `tailwind.config.ts`)
- Typed API client matching backend DTOs

#### [NEW] Pages:
- `[locale]/page.tsx` — Home / search landing
- `[locale]/terms/[id]/page.tsx` — Term detail with AI explanation
- `[locale]/books/page.tsx` — Books catalog
- `[locale]/academic/page.tsx` — Academic repository
- `[locale]/submit/page.tsx` — User submission form

#### [NEW] Components:
- `SearchBar.tsx` — Debounced global search (500ms)
- `TermCard.tsx` + `ExplanationPanel.tsx`
- `BookCard.tsx`, `AcademicCard.tsx`
- Shared UI components

---

### Phase 7 — Infrastructure & Deployment (`infra/`)

#### [NEW] `docker-compose.yml` — SQL Server 2022 + Elasticsearch 8 + API + Frontend
#### [NEW] `Dockerfile.api` + `Dockerfile.frontend` — Multi-stage builds
#### [NEW] `azure/main.bicep` + `parameters.json` — Azure IaC

---

## Verification Plan

### Automated Tests
1. **Backend build**: `dotnet build backend/LogiKnow.sln` — must compile with 0 errors
2. **Frontend build**: `cd frontend && npm run build` — must compile with 0 errors

### Manual Verification
1. Run `docker-compose up` and verify all services start
2. Open Swagger UI at `https://localhost:5001/swagger` and test public endpoints
3. Verify Arabic RTL layout renders correctly in the frontend at `http://localhost:3000/ar`
