using LogiKnow.Domain.Entities;
using LogiKnow.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LogiKnow.Infrastructure.Persistence.Repositories;

public class BookRepository : IBookRepository
{
    private readonly AppDbContext _context;

    public BookRepository(AppDbContext context) => _context = context;

    public async Task<Book?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Books.Include(b => b.Pages)
            .FirstOrDefaultAsync(b => b.Id == id, ct);

    public async Task<(IReadOnlyList<Book> Items, int Total)> GetAllAsync(
        string? lang = null, string? category = null, int page = 1, int size = 20,
        bool onlyPublished = true, CancellationToken ct = default)
    {
        var query = _context.Books.AsQueryable();

        if (onlyPublished)
            query = query.Where(b => b.IsPublished);

        if (!string.IsNullOrEmpty(lang))
            query = query.Where(b => b.Language == lang);
        if (!string.IsNullOrEmpty(category))
            query = query.Where(b => b.Category == category);

        var total = await query.CountAsync(ct);
        var items = await query.OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * size).Take(size)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<Book> CreateAsync(Book book, CancellationToken ct = default)
    {
        _context.Books.Add(book);
        await _context.SaveChangesAsync(ct);
        return book;
    }

    public async Task<Book> UpdateAsync(Book book, CancellationToken ct = default)
    {
        _context.Books.Update(book);
        await _context.SaveChangesAsync(ct);
        return book;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var book = await _context.Books.FindAsync(new object[] { id }, ct);
        if (book != null)
        {
            _context.Books.Remove(book);
            await _context.SaveChangesAsync(ct);
        }
    }

    public async Task<IReadOnlyList<BookPage>> GetPagesAsync(Guid bookId, CancellationToken ct = default)
        => await _context.BookPages
            .Where(p => p.BookId == bookId)
            .OrderBy(p => p.PageNumber)
            .ToListAsync(ct);
}
