using LogiKnow.Application.Academic.Commands;
using LogiKnow.Application.Academic.Queries;
using LogiKnow.Application.Common.DTOs;
using LogiKnow.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LogiKnow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AcademicController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<AcademicController> _logger;

    public AcademicController(IMediator mediator, ILogger<AcademicController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? type, [FromQuery] string? tag, [FromQuery] int? year,
        [FromQuery] int page = 1, [FromQuery] int size = 20, CancellationToken ct = default)
    {
        _logger.LogDebug("GetAll academic entries: type={Type}, tag={Tag}, year={Year}", type, tag, year);
        AcademicEntryType? entryType = null;
        if (!string.IsNullOrEmpty(type) && Enum.TryParse<AcademicEntryType>(type, true, out var parsed))
            entryType = parsed;

        var result = await _mediator.Send(new GetAcademicEntriesQuery(entryType, tag, year, page, size), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        _logger.LogDebug("GetById academic entry: {Id}", id);
        var result = await _mediator.Send(new GetAcademicEntryByIdQuery(id), ct);
        return Ok(new SingleResponse<AcademicEntryDto> { Data = result });
    }

    [Authorize]
    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] SubmitAcademicEntryRequest request, CancellationToken ct = default)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        var isAdmin = User.IsInRole("Admin");
        _logger.LogDebug("Submit academic entry by user: {UserId}, IsAdmin: {IsAdmin}", userId, isAdmin);
        var result = await _mediator.Send(new SubmitAcademicEntryCommand(request, userId, isAdmin), ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            new SingleResponse<AcademicEntryDto> { Data = result });
    }
}
