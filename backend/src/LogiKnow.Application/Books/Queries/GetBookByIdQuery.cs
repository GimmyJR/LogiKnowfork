using AutoMapper;
using LogiKnow.Application.Common.DTOs;
using LogiKnow.Domain.Interfaces;
using MediatR;

namespace LogiKnow.Application.Books.Queries;

public record GetBookByIdQuery(Guid Id) : IRequest<BookDto>;

public class GetBookByIdHandler : IRequestHandler<GetBookByIdQuery, BookDto>
{
    private readonly IBookRepository _repo;
    private readonly IMapper _mapper;

    public GetBookByIdHandler(IBookRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<BookDto> Handle(GetBookByIdQuery request, CancellationToken ct)
    {
        var book = await _repo.GetByIdAsync(request.Id, ct);
        if (book == null)
            throw new KeyNotFoundException($"Book with ID {request.Id} not found.");

        return _mapper.Map<BookDto>(book);
    }
}
