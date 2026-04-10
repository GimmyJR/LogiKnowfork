using LogiKnow.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;

namespace LogiKnow.Infrastructure.AI;

public class GeminiAIService : IAIService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;
    private readonly ILogger<GeminiAIService> _logger;
    private readonly bool _isConfigured;

    public GeminiAIService(IConfiguration config, ILogger<GeminiAIService> logger)
    {
        _apiKey = config["GoogleAI:ApiKey"] ?? "";
        _model = config["GoogleAI:Model"] ?? "gemini-3-flash";
        _logger = logger;

        _isConfigured = !string.IsNullOrWhiteSpace(_apiKey)
                        && !_apiKey.StartsWith("REPLACE", StringComparison.OrdinalIgnoreCase);

        _httpClient = new HttpClient();
    }

    public async Task<string> GenerateExplanationAsync(
        string termNameEn, string termNameAr, string category,
        string definitionEn, string lang, string style,
        CancellationToken ct = default)
    {
        if (!_isConfigured)
        {
            return $"[AI Config Missing] {definitionEn}";
        }

        var (systemPrompt, userPrompt) = PromptBuilder.BuildExplainTermPrompt(
            termNameEn, termNameAr, category, definitionEn, lang, style);

        // Combined prompt for Gemini (since it doesn't always have a strict separate system role in basic generateContent)
        var fullPrompt = $"{systemPrompt}\n\n{userPrompt}";

        try
        {
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = fullPrompt }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.7,
                    maxOutputTokens = 800
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";
            var response = await _httpClient.PostAsync(url, content, ct);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("Gemini API error: {StatusCode} - {Body}", response.StatusCode, errorBody);
                
                // Fallback to base definition if AI fails
                return definitionEn; 
            }

            var responseJson = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(responseJson);
            
            // Navigate: candidates[0].content.parts[0].text
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return text?.Trim() ?? definitionEn;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate Gemini explanation for term {TermName}", termNameEn);
            return $"[AI unavailable] {definitionEn}";
        }
    }
}
