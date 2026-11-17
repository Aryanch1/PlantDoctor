package com.aryanmouli.plantdoctor;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * POST /api/diagnose — diagnoses a plant problem from a symptom
 * description (and optional plant type / photo note).
 * GET /api/plants — the curated care library.
 * GET /api/health — liveness check.
 *
 * Live path: Gemini (key held server-side). If the key is not set or the
 * AI call fails, the endpoint still answers with the demo diagnosis
 * (source "demo") instead of failing — the app always says which mode
 * the answer came from.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DiagnoseController {

  private final AiDiagnoser diagnoser;

  public DiagnoseController(AiDiagnoser diagnoser) {
    this.diagnoser = diagnoser;
  }

  @PostMapping("/diagnose")
  public ResponseEntity<?> diagnose(@RequestBody DiagnoseDtos.DiagnoseRequest request) {
    String description = request == null || request.description() == null
        ? "" : request.description().trim();
    if (description.isEmpty()) {
      return ResponseEntity.badRequest()
          .body(new DiagnoseDtos.ErrorResponse("description must not be empty"));
    }
    if (description.length() > 4000) {
      return ResponseEntity.badRequest()
          .body(new DiagnoseDtos.ErrorResponse("description is too long (max 4000 characters)"));
    }
    String plantType = request.plantType() == null ? "" : request.plantType().trim();
    String photoNote = request.photoNote() == null ? "" : request.photoNote().trim();
    try {
      DiagnoseDtos.Diagnosis diagnosis = diagnoser.diagnose(description, plantType, photoNote);
      return ResponseEntity.ok(new DiagnoseDtos.DiagnoseResponse(diagnosis));
    } catch (Exception e) {
      // Live AI unavailable — answer with the honest demo diagnosis.
      return ResponseEntity.ok(new DiagnoseDtos.DiagnoseResponse(
          SymptomParser.demoDiagnosis(description, plantType, !photoNote.isEmpty())));
    }
  }

  @GetMapping("/plants")
  public ResponseEntity<List<DiagnoseDtos.LibraryEntry>> plants() {
    return ResponseEntity.ok(SymptomParser.careLibrary());
  }

  @GetMapping("/health")
  public ResponseEntity<java.util.Map<String, String>> health() {
    return ResponseEntity.ok(java.util.Map.of("status", "ok", "app", "plantdoctor"));
  }
}
