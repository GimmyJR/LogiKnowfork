using AutoMapper;
using LogiKnow.Application.Common.DTOs;
using LogiKnow.Domain.Entities;
using LogiKnow.Domain.Enums;
using LogiKnow.Domain.Interfaces;
using MediatR;
using System.Text.Json;

namespace LogiKnow.Application.Books.Commands;

public record SubmitBookCommand(SubmitBookRequest Data, string SubmittedBy, bool IsAdmin = false) : IRequest<BookDto>;

public class SubmitBookHandler : IRequestHandler<SubmitBookCommand, BookDto>
{
    private readonly ISubmissionRepository _submissionRepo;
    private readonly IBookRepository _bookRepo;

    public SubmitBookHandler(ISubmissionRepository submissionRepo, IBookRepository bookRepo)
    {
        _submissionRepo = submissionRepo;
        _bookRepo = bookRepo;
    }

    public async Task<BookDto> Handle(SubmitBookCommand request, CancellationToken ct)
    {
        var book = new Book
        {
            Id = Guid.NewGuid(),
            Title = request.Data.Title,
            Authors = JsonSerializer.Serialize(request.Data.Authors),
            Year = request.Data.Year,
            ISBN = request.Data.ISBN,
            Language = request.Data.Language,
            Category = request.Data.Category,
            CoverUrl = request.Data.CoverUrl,
            ExternalLink = request.Data.ExternalLink,
            IsIndexedForSearch = false,
            IsPublished = request.IsAdmin
        };

        if (request.IsAdmin)
        {
            // Directly create the book for admins
            await _bookRepo.CreateAsync(book, ct);
        }
        else 
        {
            // Create a Submission record for regular users
            var submission = new Submission
            {
                EntityType = "Book",
                JsonData = JsonSerializer.Serialize(book),
                Status = SubmissionStatus.Pending,
                SubmittedBy = request.SubmittedBy
            };
            await _submissionRepo.CreateAsync(submission, ct);
        }

        return new BookDto
        {
            Id = book.Id,
            Title = book.Title,
            Authors = JsonSerializer.Deserialize<List<string>>(book.Authors) ?? new(),
            Year = book.Year,
            ISBN = book.ISBN,
            Language = book.Language,
            Category = book.Category,
            IsPublished = book.IsPublished
        };
    }
}
