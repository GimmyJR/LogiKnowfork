using LogiKnow.Domain.Entities;

namespace LogiKnow.Domain.Interfaces;

public interface IBookRepository
{
    Task<Book?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IReadOnlyList<Book> Items, int Total)> GetAllAsync(
        string? lang = null, string? category = null, int page = 1, int size = 20,
        bool onlyPublished = true, CancellationToken ct = default);
    Task<Book> CreateAsync(Book book, CancellationToken ct = default);
    Task<Book> UpdateAsync(Book book, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<BookPage>> GetPagesAsync(Guid bookId, CancellationToken ct = default);
}
