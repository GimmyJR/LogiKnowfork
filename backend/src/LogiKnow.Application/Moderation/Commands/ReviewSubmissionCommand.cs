using LogiKnow.Application.Common.DTOs;
using LogiKnow.Domain.Entities;
using LogiKnow.Domain.Enums;
using LogiKnow.Domain.Interfaces;
using MediatR;

namespace LogiKnow.Application.Moderation.Commands;

public record ReviewSubmissionCommand(Guid Id, bool Approve, string? Reason, string ReviewedBy)
    : IRequest<SubmissionDto>;

public class ReviewSubmissionHandler : IRequestHandler<ReviewSubmissionCommand, SubmissionDto>
{
    private readonly ISubmissionRepository _repo;
    private readonly IAcademicRepository _academicRepo;
    private readonly IBookRepository _bookRepo;

    public ReviewSubmissionHandler(ISubmissionRepository repo, IAcademicRepository academicRepo, IBookRepository bookRepo)
    {
        _repo = repo;
        _academicRepo = academicRepo;
        _bookRepo = bookRepo;
    }

    public async Task<SubmissionDto> Handle(ReviewSubmissionCommand request, CancellationToken ct)
    {
        var submission = await _repo.GetByIdAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Submission {request.Id} not found.");

        if (submission.Status != SubmissionStatus.Pending)
            throw new InvalidOperationException("Submission is not in a pending state.");

        submission.Status      = request.Approve ? SubmissionStatus.Approved : SubmissionStatus.Rejected;
        submission.ReviewNotes = request.Reason;
        submission.ReviewedBy  = request.ReviewedBy;
        submission.ReviewedAt  = DateTime.UtcNow;

        await _repo.UpdateAsync(submission, ct);

        // If approved, update the linked entity's status so it becomes publicly visible
        if (request.Approve)
        {
            var entityId = Guid.Empty;
            
            // support JsonData being either a direct Guid string OR a JSON object with an Id property
            if (Guid.TryParse(submission.JsonData, out var parsedId)) 
            {
                entityId = parsedId;
            } 
            else 
            {
                try 
                {
                    using var doc = System.Text.Json.JsonDocument.Parse(submission.JsonData);
                    // Match 'Id' or 'id'
                    if (doc.RootElement.TryGetProperty("Id", out var idProp) || doc.RootElement.TryGetProperty("id", out idProp))
                    {
                        Guid.TryParse(idProp.GetString(), out entityId);
                    }
                } 
                catch { }
            }

            if (entityId != Guid.Empty)
            {
                if (submission.EntityType == "AcademicEntry")
                {
                    var entry = await _academicRepo.GetByIdAsync(entityId, ct);
                    if (entry != null)
                    {
                        entry.Status = SubmissionStatus.Approved;
                        await _academicRepo.UpdateAsync(entry, ct);
                    }
                }
                else if (submission.EntityType == "Book")
                {
                    var book = await _bookRepo.GetByIdAsync(entityId, ct);
                    if (book != null)
                    {
                        book.IsPublished = true;
                        await _bookRepo.UpdateAsync(book, ct);
                    }
                }
            }
        }

        return new SubmissionDto
        {
            Id         = submission.Id,
            EntityType = submission.EntityType,
            JsonData   = submission.JsonData,
            Status     = submission.Status.ToString(),
            ReviewNotes = submission.ReviewNotes,
            SubmittedBy = submission.SubmittedBy,
            ReviewedBy  = submission.ReviewedBy,
            ReviewedAt  = submission.ReviewedAt,
            CreatedAt   = submission.CreatedAt
        };
    }
}
