using AutoMapper;
using LogiKnow.Application.Common.DTOs;
using LogiKnow.Domain.Interfaces;
using MediatR;

namespace LogiKnow.Application.Books.Queries;

public record GetAdminBooksQuery(string? Lang, string? Category, int Page = 1, int Size = 20)
    : IRequest<PaginatedResponse<BookDto>>;

public class GetAdminBooksHandler : IRequestHandler<GetAdminBooksQuery, PaginatedResponse<BookDto>>
{
    private readonly IBookRepository _repo;
    private readonly IMapper _mapper;

    public GetAdminBooksHandler(IBookRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<PaginatedResponse<BookDto>> Handle(GetAdminBooksQuery request, CancellationToken ct)
    {
        var size = Math.Clamp(request.Size, 1, 100);
        var (items, total) = await _repo.GetAllAsync(request.Lang, request.Category, request.Page, size, onlyPublished: false, ct: ct);
        return new PaginatedResponse<BookDto>
        {
            Data = _mapper.Map<IReadOnlyList<BookDto>>(items),
            Meta = new PaginationMeta { Page = request.Page, Size = size, Total = total }
        };
    }
}
