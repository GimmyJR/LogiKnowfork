# LogiKnow Platform - Project Status & Features

## Project Overview
LogiKnow is an educational and research document management platform featuring a frontend built with modern web technologies and a backend built with .NET (C#) using Clean Architecture. It incorporates Arabic, French, and English internationalization (i18n), a premium futuristic "MANAR" theme, and an AI explanation feature powered by OpenAI.

## Implemented Features

### Backend & Infrastructure
- **Clean Architecture**: Structured with API, Application (MediatR), Infrastructure, and Domain layers.
- **Database**: Configured to use Microsoft SQL Server via Docker, shifting from an InMemory database.
- **Docker Compose**: Setup for SQL Server (`1433`) and Elasticsearch (`9200`).

### Frontend & Localization (i18n)
- **Multi-language Support**: Complete translation of the application into Arabic (with RTL support), French, and English.
- **Dynamic Content**: Replaced hardcoded strings using translation keys across all major pages (Books, Academic, Submit, TermDetail) and components (SearchBar, ExplanationPanel).

### Design & MANAR Theme
- **Glassmorphism UI**: Applied a futuristic blue (`#1a3a5c`) and gold/amber (`#c9a84c`) glassmorphism theme throughout the project.
- **Visual Enhancements**: Integrated a deep ocean background image with subtle parallax, transparent backdrop-blur navigation panels, and sleek hover glow effects.
- **Branding**: Rebranded the platform visually to "MANAR (منار)" featuring a lighthouse motif.

### AI Integration
- **OpenAI Explanations**: Ability to generate AI explanations for terms and documents.
- **Graceful Fallbacks**: The system gracefully handles missing OpenAI API keys by returning localized fallback messages instead of failing silently.

## How to Run & Verify
1. **Infrastructure**: `docker-compose up -d` in `d:\ATD\Downloads\logi\infra`
2. **Backend**: Access Swagger at `http://localhost:5001/swagger`
3. **Frontend**: Accessible at `http://localhost:3000` via `npm run dev`
