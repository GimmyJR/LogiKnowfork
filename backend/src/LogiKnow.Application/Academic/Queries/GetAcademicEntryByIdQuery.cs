using AutoMapper;
using LogiKnow.Application.Common.DTOs;
using LogiKnow.Domain.Interfaces;
using MediatR;

namespace LogiKnow.Application.Academic.Queries;

public record GetAcademicEntryByIdQuery(Guid Id) : IRequest<AcademicEntryDto>;

public class GetAcademicEntryByIdHandler : IRequestHandler<GetAcademicEntryByIdQuery, AcademicEntryDto>
{
    private readonly IAcademicRepository _repo;
    private readonly IMapper _mapper;

    public GetAcademicEntryByIdHandler(IAcademicRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<AcademicEntryDto> Handle(GetAcademicEntryByIdQuery request, CancellationToken ct)
    {
        var entry = await _repo.GetByIdAsync(request.Id, ct);
        if (entry == null)
            throw new KeyNotFoundException($"Academic entry with ID {request.Id} not found.");
            
        return _mapper.Map<AcademicEntryDto>(entry);
    }
}
