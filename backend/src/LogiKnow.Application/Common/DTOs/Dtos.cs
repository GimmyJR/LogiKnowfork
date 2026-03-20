namespace LogiKnow.Application.Common.DTOs;

// ===== Shared =====
public class PaginatedResponse<T>
{
    public IReadOnlyList<T> Data { get; set; } = Array.Empty<T>();
    public PaginationMeta Meta { get; set; } = new();
}

public class PaginationMeta
{
    public int Page { get; set; }
    public int Size { get; set; }
    public int Total { get; set; }
}

public class SingleResponse<T>
{
    public T Data { get; set; } = default!;
}

// ===== Term DTOs =====
public class TermDto
{
    public Guid Id { get; set; }
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string? NameFr { get; set; }
    public string Category { get; set; } = string.Empty;
    public string DefinitionEn { get; set; } = string.Empty;
    public string DefinitionAr { get; set; } = string.Empty;
    public string? ExampleEn { get; set; }
    public string? ExampleAr { get; set; }
    public bool IsPublished { get; set; }
    public List<string> Tags { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateTermRequest
{
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string? NameFr { get; set; }
    public string Category { get; set; } = string.Empty;
    public string DefinitionEn { get; set; } = string.Empty;
    public string DefinitionAr { get; set; } = string.Empty;
    public string? ExampleEn { get; set; }
    public string? ExampleAr { get; set; }
    public bool IsPublished { get; set; } = true;
    public List<string> Tags { get; set; } = new();
}

public class UpdateTermRequest
{
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string? NameFr { get; set; }
    public string Category { get; set; } = string.Empty;
    public string DefinitionEn { get; set; } = string.Empty;
    public string DefinitionAr { get; set; } = string.Empty;
    public string? ExampleEn { get; set; }
    public string? ExampleAr { get; set; }
    public bool IsPublished { get; set; }
    public List<string> Tags { get; set; } = new();
}

public class ExplanationResponse
{
    public string Explanation { get; set; } = string.Empty;
    public string Language { get; set; } = string.Empty;
    public string Style { get; set; } = string.Empty;
}

// ===== Book DTOs =====
public class BookDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public List<string> Authors { get; set; } = new();
    public int? Year { get; set; }
    public string? ISBN { get; set; }
    public string Language { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? CoverUrl { get; set; }
    public string? ExternalLink { get; set; }
    public string? BlobStoragePath { get; set; }
    public bool IsIndexedForSearch { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class AddBookRequest
{
    public string Title { get; set; } = string.Empty;
    public List<string> Authors { get; set; } = new();
    public int? Year { get; set; }
    public string? ISBN { get; set; }
    public string Language { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? CoverUrl { get; set; }
    public string? ExternalLink { get; set; }
    public bool IsPublished { get; set; } = false;
}

// ===== Arena Video DTOs =====
public class ArenaVideoDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string Platform { get; set; } = "YouTube";
    public string Views { get; set; } = "0";
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateArenaVideoRequest
{
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string Platform { get; set; } = "YouTube";
    public bool IsPublished { get; set; } = true;
}

// ===== Academic DTOs =====
public class AcademicEntryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string University { get; set; } = string.Empty;
    public int Year { get; set; }
    public string? Supervisor { get; set; }
    public string Abstract { get; set; } = string.Empty;
    public string? DocumentUrl { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SubmitAcademicEntryRequest
{
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string University { get; set; } = string.Empty;
    public int Year { get; set; }
    public string? Supervisor { get; set; }
    public string Abstract { get; set; } = string.Empty;
    public string? DocumentUrl { get; set; }
    public string Type { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
}

// ===== Search DTOs =====
public class SearchResultDto
{
    public string Type { get; set; } = string.Empty;
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Snippet { get; set; }
    public double Score { get; set; }
    public Dictionary<string, object?> Metadata { get; set; } = new();
}

public class QuoteSearchResultDto
{
    public Guid BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public int PageNumber { get; set; }
    public string Highlight { get; set; } = string.Empty;
    public string SurroundingContext { get; set; } = string.Empty;
}

// ===== Submission DTOs =====
public class SubmissionDto
{
    public Guid Id { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string JsonData { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ReviewNotes { get; set; }
    public string SubmittedBy { get; set; } = string.Empty;
    public string? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ReviewSubmissionRequest
{
    public bool Approve { get; set; }
    public string? Reason { get; set; }
}

// ===== Auth DTOs =====
public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string PreferredLanguage { get; set; } = "ar";
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}
