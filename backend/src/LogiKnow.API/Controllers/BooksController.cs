using LogiKnow.Application.Books.Commands;
using LogiKnow.Application.Books.Queries;
using LogiKnow.Application.Common.DTOs;
using LogiKnow.Application.Interfaces;
using LogiKnow.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LogiKnow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ISearchService _searchService;
    private readonly ILogger<BooksController> _logger;
    private readonly IWebHostEnvironment _env;
    private readonly IStorageService _storageService;

    public BooksController(IMediator mediator, ISearchService searchService, ILogger<BooksController> logger, IWebHostEnvironment env, IStorageService storageService)
    {
        _mediator = mediator;
        _searchService = searchService;
        _logger = logger;
        _env = env;
        _storageService = storageService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? lang, [FromQuery] string? category,
        [FromQuery] int page = 1, [FromQuery] int size = 20, CancellationToken ct = default)
    {
        _logger.LogDebug("GetAll books: lang={Lang}, category={Category}", lang, category);
        var result = await _mediator.Send(new GetBooksQuery(lang, category, page, size), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        _logger.LogDebug("GetById book: {Id}", id);
        var result = await _mediator.Send(new GetBookByIdQuery(id), ct);
        return Ok(new SingleResponse<BookDto> { Data = result });
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> Add([FromBody] AddBookRequest request, CancellationToken ct = default)
    {
        _logger.LogDebug("Add book: {Title}", request.Title);
        var result = await _mediator.Send(new AddBookCommand(request), ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, new SingleResponse<BookDto> { Data = result });
    }

    [HttpPost("submit")]
    [Authorize]
    public async Task<IActionResult> Submit([FromBody] SubmitBookRequest request, CancellationToken ct = default)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        var isAdmin = User.IsInRole("Admin");
        _logger.LogDebug("Submit book by user: {UserId}, IsAdmin: {IsAdmin}", userId, isAdmin);
        var result = await _mediator.Send(new SubmitBookCommand(request, userId, isAdmin), ct);
        return Ok(new SingleResponse<BookDto> { Data = result });
    }

    [HttpPut("{id:guid}/index")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> TriggerIndex(Guid id, CancellationToken ct = default)
    {
        _logger.LogDebug("Trigger ES indexing for book: {Id}", id);
        await _searchService.IndexBookPagesAsync(id, ct);
        return Ok(new { message = "Indexing triggered successfully." });
    }

    [HttpPost("{id:guid}/upload")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> UploadBookPdf(Guid id, IFormFile file, [FromServices] LogiKnow.Infrastructure.Persistence.AppDbContext dbContext, CancellationToken ct = default)
    {
        if (file == null || file.Length == 0) return BadRequest("File is empty or not provided.");
        if (Path.GetExtension(file.FileName).ToLower() != ".pdf") return BadRequest("Only PDF files are allowed.");

        var book = await dbContext.Books.FindAsync(new object[] { id }, ct);
        if (book == null) return NotFound("Book not found.");

        using var stream = file.OpenReadStream();
        
        // 1. Upload to storage
        var uploadedUrl = await _storageService.UploadFileAsync($"{id}.pdf", stream, file.ContentType, "books", ct);
        book.BlobStoragePath = uploadedUrl;
        book.UpdatedAt = DateTime.UtcNow;

        // Reset stream position for PDF parsing
        stream.Position = 0;

        // 2. Parse PDF and extract pages
        try
        {
            var pages = new List<LogiKnow.Domain.Entities.BookPage>();
            using (var pdfDocument = UglyToad.PdfPig.PdfDocument.Open(stream))
            {
                foreach (var page in pdfDocument.GetPages())
                {
                    var text = page.Text;
                    if (!string.IsNullOrWhiteSpace(text))
                    {
                        pages.Add(new LogiKnow.Domain.Entities.BookPage
                        {
                            Id = Guid.NewGuid(),
                            BookId = id,
                            PageNumber = page.Number,
                            Content = text,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            if (pages.Any())
            {
                // Remove existing pages if re-uploading
                var existingPages = dbContext.BookPages.Where(p => p.BookId == id);
                dbContext.BookPages.RemoveRange(existingPages);

                dbContext.BookPages.AddRange(pages);
                book.IsIndexedForSearch = true; // Mark as indexed
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse PDF for book {Id}", id);
            // We can still continue to save the uploaded URL even if parsing fails
        }

        await dbContext.SaveChangesAsync(ct);
        
        _logger.LogInformation("Uploaded PDF and extracted pages for book {Id}", id);
        
        return Ok(new { message = "Book PDF uploaded and processed successfully.", path = uploadedUrl });
    }
}
