using LogiKnow.Application.Common.DTOs;
using LogiKnow.Application.Terms.Commands;
using LogiKnow.Application.Terms.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LogiKnow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TermsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<TermsController> _logger;

    public TermsController(IMediator mediator, ILogger<TermsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? category, [FromQuery] string? lang,
        [FromQuery] int page = 1, [FromQuery] int size = 20, CancellationToken ct = default)
    {
        _logger.LogDebug("GetAll terms: category={Category}, lang={Lang}", category, lang);
        var result = await _mediator.Send(new SearchTermsQuery(category, lang, page, size), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        _logger.LogDebug("GetById term: {Id}", id);
        var result = await _mediator.Send(new GetTermByIdQuery(id), ct);
        return Ok(new SingleResponse<TermDto> { Data = result });
    }

    [HttpGet("{id:guid}/explain")]
    public async Task<IActionResult> Explain(Guid id,
        [FromQuery] string lang = "ar", [FromQuery] string style = "formal",
        CancellationToken ct = default)
    {
        _logger.LogDebug("Explain term: {Id}, lang={Lang}, style={Style}", id, lang, style);
        var result = await _mediator.Send(new ExplainTermQuery(id, lang, style), ct);
        return Ok(new SingleResponse<ExplanationResponse> { Data = result });
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> Create([FromBody] CreateTermRequest request, CancellationToken ct = default)
    {
        _logger.LogDebug("Create term: {Name}", request.NameEn);
        var result = await _mediator.Send(new CreateTermCommand(request), ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, new SingleResponse<TermDto> { Data = result });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Moderator")]
    public IActionResult Update(Guid id, [FromBody] UpdateTermRequest request)
    {
        _logger.LogDebug("Update term: {Id}", id);
        // Delegate to mediator (handler to be added)
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public IActionResult Delete(Guid id)
    {
        _logger.LogDebug("Delete term: {Id}", id);
        // Delegate to mediator (handler to be added)
        return NoContent();
    }
}
