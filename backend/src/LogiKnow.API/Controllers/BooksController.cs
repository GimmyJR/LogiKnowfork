using LogiKnow.Application.Books.Commands;
using LogiKnow.Application.Books.Queries;
using LogiKnow.Application.Common.DTOs;
using LogiKnow.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LogiKnow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ISearchService _searchService;
    private readonly ILogger<BooksController> _logger;
    private readonly IWebHostEnvironment _env;

    public BooksController(IMediator mediator, ISearchService searchService, ILogger<BooksController> logger, IWebHostEnvironment env)
    {
        _mediator = mediator;
        _searchService = searchService;
        _logger = logger;
        _env = env;
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
        return Ok(); // Delegate to mediator
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> Add([FromBody] AddBookRequest request, CancellationToken ct = default)
    {
        _logger.LogDebug("Add book: {Title}", request.Title);
        var result = await _mediator.Send(new AddBookCommand(request), ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, new SingleResponse<BookDto> { Data = result });
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

        var uploadsPath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "books");
        if (!Directory.Exists(uploadsPath)) Directory.CreateDirectory(uploadsPath);

        var fileName = $"{id}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream, ct);
        }

        var relativePath = $"/uploads/books/{fileName}";
        
        book.BlobStoragePath = relativePath;
        book.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(ct);
        
        _logger.LogInformation("Uploaded PDF and updated path for book {Id} to {Path}", id, relativePath);
        
        return Ok(new { message = "Book PDF uploaded successfully.", path = relativePath });
    }
}
