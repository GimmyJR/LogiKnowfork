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
    private readonly ISearchService _searchService;

    public ReviewSubmissionHandler(
        ISubmissionRepository repo, 
        IAcademicRepository academicRepo, 
        IBookRepository bookRepo,
        ISearchService searchService)
    {
        _repo = repo;
        _academicRepo = academicRepo;
        _bookRepo = bookRepo;
        _searchService = searchService;
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
            if (submission.EntityType == "AcademicEntry" &&
                Guid.TryParse(submission.JsonData, out var academicId))
            {
                var entry = await _academicRepo.GetByIdAsync(academicId, ct);
                if (entry != null)
                {
                    entry.Status = SubmissionStatus.Approved;
                    await _academicRepo.UpdateAsync(entry, ct);
                    
                    // Trigger indexing for the approved entry
                    await _searchService.IndexAcademicEntryAsync(entry.Id, ct);
                }
            }
            else if (submission.EntityType == "Book")
            {
                try 
                {
                    var book = System.Text.Json.JsonSerializer.Deserialize<Book>(submission.JsonData);
                    if (book != null)
                    {
                        book.IsPublished = true;
                        
                        // Submissions for books might contain new books or updates
                        var existing = await _bookRepo.GetByIdAsync(book.Id, ct);
                        if (existing == null)
                            await _bookRepo.CreateAsync(book, ct);
                        else
                            await _bookRepo.UpdateAsync(book, ct);
                        
                        // Note: Full-text indexing for books (pages) is triggered after PDF upload
                    }
                }
                catch (System.Text.Json.JsonException)
                {
                    // If it's just an ID (future proofing), handle that as well
                    if (Guid.TryParse(submission.JsonData, out var bookId))
                    {
                        var book = await _bookRepo.GetByIdAsync(bookId, ct);
                        if (book != null)
                        {
                            book.IsPublished = true;
                            await _bookRepo.UpdateAsync(book, ct);
                        }
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
