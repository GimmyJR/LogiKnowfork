using LogiKnow.Domain.Interfaces;
using LogiKnow.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LogiKnow.Infrastructure.Search;

public class MockSearchService : ISearchService
{
    private readonly AppDbContext _context;

    public MockSearchService(AppDbContext context)
    {
        _context = context;
    }

    public Task IndexTermAsync(Guid termId, CancellationToken ct = default) => Task.CompletedTask;
    public Task IndexBookPagesAsync(Guid bookId, CancellationToken ct = default) => Task.CompletedTask;
    public Task IndexAcademicEntryAsync(Guid entryId, CancellationToken ct = default) => Task.CompletedTask;

    public async Task<(IReadOnlyList<SearchResult> Items, int Total)> GlobalSearchAsync(
        string query, string[]? types = null, int page = 1, int size = 20, CancellationToken ct = default)
    {
        var results = new List<SearchResult>();
        var lq = query.ToLower();

        bool includeTerms   = types == null || types.Length == 0 || types.Any(t => t.Equals("term",     StringComparison.OrdinalIgnoreCase));
        bool includeBooks    = types == null || types.Length == 0 || types.Any(t => t.Equals("book",     StringComparison.OrdinalIgnoreCase));
        bool includeAcademic = types == null || types.Length == 0 || types.Any(t => t.Equals("academic", StringComparison.OrdinalIgnoreCase));

        if (includeTerms)
        {
            var terms = await _context.Terms
                .Where(t => t.IsPublished &&
                    (t.NameEn.ToLower().Contains(lq) ||
                     t.NameAr.Contains(query) ||
                     t.DefinitionEn.ToLower().Contains(lq) ||
                     t.Category.ToLower().Contains(lq)))
                .Take(size)
                .ToListAsync(ct);

            results.AddRange(terms.Select(t => new SearchResult
            {
                Id      = t.Id,
                Type    = "term",
                Title   = t.NameEn,
                Snippet = t.DefinitionEn.Length > 150 ? t.DefinitionEn[..150] + "…" : t.DefinitionEn,
                Score   = t.NameEn.ToLower().StartsWith(lq) ? 1.0 : 0.7
            }));
        }

        if (includeBooks)
        {
            var books = await _context.Books
                .Where(b => b.IsPublished &&
                    (b.Title.ToLower().Contains(lq) ||
                     b.Authors.ToLower().Contains(lq) ||
                     b.Category.ToLower().Contains(lq)))
                .Take(size)
                .ToListAsync(ct);

            results.AddRange(books.Select(b => new SearchResult
            {
                Id      = b.Id,
                Type    = "book",
                Title   = b.Title,
                Snippet = $"{b.Category} · {b.Language}",
                Score   = b.Title.ToLower().StartsWith(lq) ? 0.95 : 0.65
            }));
        }

        if (includeAcademic)
        {
            var academic = await _context.AcademicEntries
                .Where(a => a.Status == Domain.Enums.SubmissionStatus.Approved &&
                    (a.Title.ToLower().Contains(lq) ||
                     a.Author.ToLower().Contains(lq) ||
                     a.Abstract.ToLower().Contains(lq) ||
                     a.University.ToLower().Contains(lq)))
                .Take(size)
                .ToListAsync(ct);

            results.AddRange(academic.Select(a => new SearchResult
            {
                Id      = a.Id,
                Type    = "academic",
                Title   = a.Title,
                Snippet = a.Abstract.Length > 150 ? a.Abstract[..150] + "…" : a.Abstract,
                Score   = a.Title.ToLower().StartsWith(lq) ? 0.9 : 0.6
            }));
        }

        var sorted = results
            .OrderByDescending(r => r.Score)
            .Skip((page - 1) * size)
            .Take(size)
            .ToList();

        return (sorted, results.Count);
    }

    public async Task<(IReadOnlyList<QuoteSearchResult> Items, int Total)> SearchQuotesAsync(
        string query, Guid? bookId = null, int page = 1, int size = 20, CancellationToken ct = default)
    {
        var words = query.Split(new[] { ' ', '\r', '\n', '\t' }, StringSplitOptions.RemoveEmptyEntries);
        var dbQuery = _context.BookPages
            .Include(p => p.Book).AsQueryable();

        foreach (var word in words)
        {
            var searchWord = word;
            dbQuery = dbQuery.Where(p => p.Content.Contains(searchWord));
        }

        if (bookId.HasValue)
            dbQuery = dbQuery.Where(p => p.BookId == bookId.Value);

        var total = await dbQuery.CountAsync(ct);
        var paged = await dbQuery
            .OrderBy(p => p.Book!.Title)
            .ThenBy(p => p.PageNumber)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(ct);

        var results = paged.Select(p => new QuoteSearchResult
        {
            BookId             = p.BookId,
            BookTitle          = p.Book?.Title ?? "Unknown Book",
            PageNumber         = p.PageNumber,
            Highlight          = p.Content.Length > 200 ? p.Content[..200] + "…" : p.Content,
            SurroundingContext = p.Content.Length > 500 ? p.Content[..500] + "…" : p.Content
        }).ToList();

        return (results, total);
    }

    public Task EnsureIndicesCreatedAsync(CancellationToken ct = default) => Task.CompletedTask;
}
