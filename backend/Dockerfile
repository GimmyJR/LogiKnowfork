# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source

# Copy solution and restore dependencies
COPY *.sln .
COPY src/LogiKnow.Domain/*.csproj ./src/LogiKnow.Domain/
COPY src/LogiKnow.Application/*.csproj ./src/LogiKnow.Application/
COPY src/LogiKnow.Infrastructure/*.csproj ./src/LogiKnow.Infrastructure/
COPY src/LogiKnow.API/*.csproj ./src/LogiKnow.API/
RUN dotnet restore

# Copy full source and build
COPY src/ ./src/
WORKDIR /source/src/LogiKnow.API
RUN dotnet publish -c Release -o /app

# Run Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app ./

EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

ENTRYPOINT ["dotnet", "LogiKnow.API.dll"]
