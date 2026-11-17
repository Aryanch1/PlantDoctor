package com.aryanmouli.plantdoctor;

import java.util.List;

/** Request/response shapes for POST /api/diagnose and GET /api/plants. Mirrors lib/types.ts. */
public final class DiagnoseDtos {

  private DiagnoseDtos() {}

  public record DiagnoseRequest(String description, String plantType, String photoNote) {}

  public record Diagnosis(
      String id,
      String plantType,
      String symptomText,
      boolean hasPhoto,
      String likelyCause,
      String severity,
      List<String> careSteps,
      String watering,
      String light,
      String source,
      long at) {}

  public record DiagnoseResponse(Diagnosis diagnosis) {}

  public record ErrorResponse(String message) {}

  public record LibraryEntry(
      String type,
      String label,
      String light,
      String water,
      String feeding,
      String notes) {}
}
