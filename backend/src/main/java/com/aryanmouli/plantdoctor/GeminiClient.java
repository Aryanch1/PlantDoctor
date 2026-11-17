package com.aryanmouli.plantdoctor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Calls Google Gemini (gemini-3.5-flash-lite) through the OpenAI-compatible
 * endpoint, asking for a plant diagnosis as strict JSON.
 *
 * The API key comes from the GEMINI_API_KEY environment variable only —
 * it never appears in code, the repo, or the app. When no key is set, or
 * the call fails, the caller falls back to the on-device demo diagnosis
 * instead of failing the request.
 */
@Service
public class GeminiClient implements AiDiagnoser {

  private static final String SYSTEM_PROMPT =
      "You are a helpful plant doctor for home gardeners and small farmers. "
          + "Reply with ONLY a JSON object, no markdown fences, no extra text, with exactly these fields: "
          + "plantType (string, the plant if you can tell, else \"Plant\"), "
          + "likelyCause (1-2 simple sentences: the most likely cause), "
          + "severity (one of: mild, moderate, serious), "
          + "careSteps (array of 3-5 short simple sentences, numbered actions to help the plant), "
          + "watering (1 sentence of watering guidance), "
          + "light (1 sentence of light guidance). "
          + "Use short words a 12-year-old would understand. Never invent a treatment "
          + "you are unsure of; if the symptoms are unclear, say so in likelyCause and "
          + "suggest asking a local nursery or extension service. Never claim to be a "
          + "professional diagnosis.";

  private final String apiKey;
  private final String model;
  private final String baseUrl;
  private final HttpClient http;
  private final ObjectMapper mapper;

  // @Autowired is required: the class also has a package-private
  // 5-arg constructor (used by unit tests), so without it Spring
  // falls back to looking for a no-arg constructor and boot fails.
  @Autowired
  public GeminiClient(
      @Value("${plantdoctor.gemini.api-key:}") String apiKey,
      @Value("${plantdoctor.gemini.model:gemini-3.5-flash-lite}") String model,
      @Value("${plantdoctor.gemini.base-url:https://generativelanguage.googleapis.com/v1beta/openai/}")
          String baseUrl) {
    this(apiKey, model, baseUrl, HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build(),
        new ObjectMapper());
  }

  GeminiClient(String apiKey, String model, String baseUrl, HttpClient http, ObjectMapper mapper) {
    this.apiKey = apiKey == null ? "" : apiKey.trim();
    this.model = model;
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
    this.http = http;
    this.mapper = mapper;
  }

  public boolean isConfigured() {
    return !apiKey.isBlank();
  }

  @Override
  public DiagnoseDtos.Diagnosis diagnose(String description, String plantType, String photoNote)
      throws Exception {
    if (!isConfigured()) {
      throw new IllegalStateException("GEMINI_API_KEY is not set");
    }
    String userText = "Plant: " + (plantType == null ? "unknown" : plantType)
        + "\nSymptoms:\n" + description
        + (photoNote != null && !photoNote.isBlank() ? "\n" + photoNote : "");
    String body = mapper.writeValueAsString(new ChatRequest(
        model,
        List.of(
            new ChatMessage("system", SYSTEM_PROMPT),
            new ChatMessage("user", userText)),
        0.2));
    HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(baseUrl + "chat/completions"))
        .header("Content-Type", "application/json")
        .header("Authorization", "Bearer " + apiKey)
        .timeout(Duration.ofSeconds(30))
        .POST(HttpRequest.BodyPublishers.ofString(body))
        .build();
    HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
    if (response.statusCode() < 200 || response.statusCode() >= 300) {
      throw new IllegalStateException("Gemini returned HTTP " + response.statusCode());
    }
    JsonNode root = mapper.readTree(response.body());
    JsonNode content = root.path("choices").path(0).path("message").path("content");
    if (!content.isTextual()) {
      throw new IllegalStateException("Gemini returned no text content");
    }
    String json = content.asText().trim();
    // Tolerate models that wrap the JSON in markdown fences.
    if (json.startsWith("```")) {
      json = json.replaceFirst("(?s)^```(?:json)?\\s*", "").replaceFirst("(?s)\\s*```$", "");
    }
    JsonNode data = mapper.readTree(json);
    List<String> careSteps = new ArrayList<>();
    data.path("careSteps").forEach(s -> careSteps.add(s.asText()));
    if (careSteps.isEmpty()) {
      careSteps.add("Give the plant steady, bright indirect light and even watering for a week.");
    }
    String type = SymptomParser.guessPlantType(description, data.path("plantType").asText(""));
    String severity = data.path("severity").asText("");
    if (!List.of("mild", "moderate", "serious").contains(severity)) {
      severity = SymptomParser.guessSeverity(description);
    }
    return new DiagnoseDtos.Diagnosis(
        "live-" + SymptomParser.slug(type) + "-" + System.currentTimeMillis(),
        type,
        description,
        photoNote != null && !photoNote.isBlank(),
        data.path("likelyCause").asText(""),
        severity,
        careSteps,
        data.path("watering").asText("Water when the top 2 cm of soil is dry."),
        data.path("light").asText("Bright indirect light, 4–6 hours a day."),
        "live",
        System.currentTimeMillis());
  }

  private record ChatRequest(String model, List<ChatMessage> messages, double temperature) {}

  private record ChatMessage(String role, String content) {}
}
