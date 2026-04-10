namespace LogiKnow.Infrastructure.AI;

public static class PromptBuilder
{
    public static (string SystemPrompt, string UserPrompt) BuildExplainTermPrompt(
        string termNameEn, string termNameAr, string category,
        string definitionEn, string lang, string style)
    {
        var systemPrompt = $@"You are a logistics domain expert. Your task is to explain the provided logistics term.
Language: The explanation MUST be in {lang}.
Style: {style}
- formal     → professional, precise, suitable for official documents
- simplified → clear language for someone new to the field
- colloquial → conversational, use Egyptian Arabic dialect
Return ONLY the explanation text. No intro, no outro, no markdown.";

        var userPrompt = $@"Term: {termNameEn} ({termNameAr})
Category: {category}
Base definition: {definitionEn}
Explain this term.";

        return (systemPrompt, userPrompt);
    }
}
