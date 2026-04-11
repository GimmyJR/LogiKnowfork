using AutoMapper;
using LogiKnow.Application.Common.DTOs;
using LogiKnow.Domain.Interfaces;
using MediatR;
using System.Text.Json;

namespace LogiKnow.Application.Books.Commands;

public record UpdateBookCommand(Guid Id, UpdateBookRequest Request) : IRequest<BookDto>;

public class UpdateBookHandler : IRequestHandler<UpdateBookCommand, BookDto>
{
    private readonly IBookRepository _repo;
    private readonly IMapper _mapper;

    public UpdateBookHandler(IBookRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<BookDto> Handle(UpdateBookCommand command, CancellationToken ct)
    {
        var book = await _repo.GetByIdAsync(command.Id, ct);
        if (book == null) throw new Exception("Book not found");

        var request = command.Request;
        book.Title = request.Title;
        book.Authors = JsonSerializer.Serialize(request.Authors);
        book.Year = request.Year;
        book.ISBN = request.ISBN;
        book.Language = request.Language;
        book.Category = request.Category;
        book.CoverUrl = request.CoverUrl;
        book.ExternalLink = request.ExternalLink;
        book.IsPublished = request.IsPublished;
        book.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(book, ct);
        return _mapper.Map<BookDto>(book);
    }
}
