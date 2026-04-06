using AutoMapper;
using LogiKnow.Application.Common.DTOs;
using LogiKnow.Domain.Entities;
using LogiKnow.Domain.Enums;
using LogiKnow.Domain.Interfaces;
using MediatR;

namespace LogiKnow.Application.Academic.Commands;

public record SubmitAcademicEntryCommand(SubmitAcademicEntryRequest Data, string SubmittedBy, bool IsAdmin = false)
    : IRequest<AcademicEntryDto>;

public class SubmitAcademicEntryHandler : IRequestHandler<SubmitAcademicEntryCommand, AcademicEntryDto>
{
    private readonly IAcademicRepository _repo;
    private readonly ISubmissionRepository _submissionRepo;
    private readonly ISearchService _searchService;
    private readonly IMapper _mapper;

    public SubmitAcademicEntryHandler(
        IAcademicRepository repo, 
        ISubmissionRepository submissionRepo, 
        ISearchService searchService,
        IMapper mapper)
    {
        _repo = repo;
        _submissionRepo = submissionRepo;
        _searchService = searchService;
        _mapper = mapper;
    }

    public async Task<AcademicEntryDto> Handle(SubmitAcademicEntryCommand request, CancellationToken ct)
    {
        var entry = _mapper.Map<AcademicEntry>(request.Data);
        entry.Status = request.IsAdmin ? SubmissionStatus.Approved : SubmissionStatus.Pending;
        entry.SubmittedBy = request.SubmittedBy;

        if (Enum.TryParse<AcademicEntryType>(request.Data.Type, true, out var type))
            entry.Type = type;

        var created = await _repo.CreateAsync(entry, ct);

        if (request.IsAdmin)
        {
            // Directly index for admins
            await _searchService.IndexAcademicEntryAsync(created.Id, ct);
        }
        else 
        {
            // Create a Submission record for regular users to be reviewed
            var submission = new Submission
            {
                EntityType  = "AcademicEntry",
                JsonData    = created.Id.ToString(),
                Status      = SubmissionStatus.Pending,
                SubmittedBy = request.SubmittedBy
            };
            await _submissionRepo.CreateAsync(submission, ct);
        }

        return _mapper.Map<AcademicEntryDto>(created);
    }
}
