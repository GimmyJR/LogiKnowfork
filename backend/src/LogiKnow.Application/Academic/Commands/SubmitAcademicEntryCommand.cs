using AutoMapper;
using LogiKnow.Application.Common.DTOs;
using LogiKnow.Domain.Entities;
using LogiKnow.Domain.Enums;
using LogiKnow.Domain.Interfaces;
using MediatR;

namespace LogiKnow.Application.Academic.Commands;

public record SubmitAcademicEntryCommand(SubmitAcademicEntryRequest Data, string SubmittedBy)
    : IRequest<AcademicEntryDto>;

public class SubmitAcademicEntryHandler : IRequestHandler<SubmitAcademicEntryCommand, AcademicEntryDto>
{
    private readonly IAcademicRepository _repo;
    private readonly ISubmissionRepository _submissionRepo;
    private readonly IMapper _mapper;

    public SubmitAcademicEntryHandler(IAcademicRepository repo, ISubmissionRepository submissionRepo, IMapper mapper)
    {
        _repo = repo;
        _submissionRepo = submissionRepo;
        _mapper = mapper;
    }

    public async Task<AcademicEntryDto> Handle(SubmitAcademicEntryCommand request, CancellationToken ct)
    {
        var entry = _mapper.Map<AcademicEntry>(request.Data);
        entry.Status = SubmissionStatus.Pending;
        entry.SubmittedBy = request.SubmittedBy;

        if (Enum.TryParse<AcademicEntryType>(request.Data.Type, true, out var type))
            entry.Type = type;

        var created = await _repo.CreateAsync(entry, ct);

        // Create a Submission record so admin moderation panel can see and approve/reject it
        var submission = new Submission
        {
            EntityType  = "AcademicEntry",
            JsonData    = created.Id.ToString(),   // Store the AcademicEntry Id
            Status      = SubmissionStatus.Pending,
            SubmittedBy = request.SubmittedBy
        };
        await _submissionRepo.CreateAsync(submission, ct);

        return _mapper.Map<AcademicEntryDto>(created);
    }
}
