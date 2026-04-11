using LogiKnow.Domain.Interfaces;
using MediatR;

namespace LogiKnow.Application.Books.Commands;

public record DeleteBookCommand(Guid Id) : IRequest;

public class DeleteBookHandler : IRequestHandler<DeleteBookCommand>
{
    private readonly IBookRepository _repo;

    public DeleteBookHandler(IBookRepository repo)
    {
        _repo = repo;
    }

    public async Task Handle(DeleteBookCommand request, CancellationToken ct)
    {
        await _repo.DeleteAsync(request.Id, ct);
    }
}
