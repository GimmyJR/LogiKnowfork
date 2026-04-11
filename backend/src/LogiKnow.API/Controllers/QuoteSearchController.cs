using LogiKnow.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LogiKnow.API.Controllers;

[ApiController]
[Route("api/quotesearch")]
public class QuoteSearchController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<QuoteSearchController> _logger;

    public QuoteSearchController(AppDbContext db, ILogger<QuoteSearchController> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Search inside book pages for quotes / phrases.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string q,
        [FromQuery] Guid? bookId,
        [FromQuery] int page = 1,
        [FromQuery] int size = 20,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new { error = "Query parameter 'q' is required." });

        page = Math.Max(1, page);
        size = Math.Clamp(size, 1, 50);

        _logger.LogDebug("QuoteSearch: q={Query}, bookId={BookId}, page={Page}, size={Size}", q, bookId, page, size);

        var words = q.Split(new[] { ' ', '\t', '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

        // Build query against BookPages, include the Book for title info
        var query = _db.BookPages
            .Include(p => p.Book)
            .Where(p => p.Book.IsPublished)
            .AsQueryable();

        // Each word must appear in the content
        foreach (var word in words)
        {
            var w = word; // capture for closure
            query = query.Where(p => p.Content.Contains(w));
        }

        // Optional: filter by specific book
        if (bookId.HasValue)
            query = query.Where(p => p.BookId == bookId.Value);

        var total = await query.CountAsync(ct);

        var results = await query
            .OrderBy(p => p.Book.Title)
            .ThenBy(p => p.PageNumber)
            .Skip((page - 1) * size)
            .Take(size)
            .Select(p => new
            {
                p.BookId,
                BookTitle = p.Book.Title,
                BookAuthors = p.Book.Authors,
                BookCategory = p.Book.Category,
                BookCoverUrl = p.Book.CoverUrl,
                p.PageNumber,
                Content = p.Content
            })
            .ToListAsync(ct);

        // Build response with highlighted snippets
        var data = results.Select(r =>
        {
            var snippet = BuildSnippet(r.Content, words, 300);
            var highlight = HighlightWords(snippet, words);

            return new QuoteSearchItem
            {
                BookId = r.BookId,
                BookTitle = r.BookTitle,
                BookAuthors = r.BookAuthors,
                BookCategory = r.BookCategory,
                BookCoverUrl = r.BookCoverUrl,
                PageNumber = r.PageNumber,
                Snippet = snippet,
                Highlight = highlight
            };
        }).ToList();

        return Ok(new
        {
            data,
            meta = new { page, size, total }
        });
    }

    /// <summary>
    /// Get a list of all published books (for the dropdown filter).
    /// </summary>
    [HttpGet("books")]
    public async Task<IActionResult> GetBooksForFilter(CancellationToken ct = default)
    {
        var books = await _db.Books
            .Where(b => b.IsPublished)
            .OrderBy(b => b.Title)
            .Select(b => new
            {
                b.Id,
                b.Title,
                b.Category,
                b.Language,
                HasPages = b.Pages.Any()
            })
            .ToListAsync(ct);

        return Ok(new { data = books });
    }

    /// <summary>
    /// Extract a snippet around the first occurrence of any search word.
    /// </summary>
    private static string BuildSnippet(string content, string[] words, int maxLength)
    {
        if (string.IsNullOrEmpty(content))
            return string.Empty;

        // Find the earliest occurrence of any word
        int earliest = content.Length;
        foreach (var w in words)
        {
            var idx = content.IndexOf(w, StringComparison.OrdinalIgnoreCase);
            if (idx >= 0 && idx < earliest)
                earliest = idx;
        }

        if (earliest == content.Length)
            earliest = 0;

        // Center the snippet around the match
        int start = Math.Max(0, earliest - maxLength / 4);
        int end = Math.Min(content.Length, start + maxLength);
        start = Math.Max(0, end - maxLength);

        var snippet = content[start..end].Trim();

        if (start > 0) snippet = "…" + snippet;
        if (end < content.Length) snippet += "…";

        return snippet;
    }

    /// <summary>
    /// Wrap matched words in mark tags for frontend highlighting.
    /// </summary>
    private static string HighlightWords(string text, string[] words)
    {
        if (string.IsNullOrEmpty(text))
            return string.Empty;

        var result = text;
        foreach (var word in words)
        {
            // Case-insensitive replace with <mark> tags
            var idx = 0;
            while (idx < result.Length)
            {
                var pos = result.IndexOf(word, idx, StringComparison.OrdinalIgnoreCase);
                if (pos < 0) break;

                var matched = result.Substring(pos, word.Length);
                var replacement = $"<mark>{matched}</mark>";
                result = result[..pos] + replacement + result[(pos + word.Length)..];
                idx = pos + replacement.Length;
            }
        }

        return result;
    }

    private class QuoteSearchItem
    {
        public Guid BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string BookAuthors { get; set; } = string.Empty;
        public string BookCategory { get; set; } = string.Empty;
        public string? BookCoverUrl { get; set; }
        public int PageNumber { get; set; }
        public string Snippet { get; set; } = string.Empty;
        public string Highlight { get; set; } = string.Empty;
    }
}
