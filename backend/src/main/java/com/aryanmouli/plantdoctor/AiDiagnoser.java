package com.aryanmouli.plantdoctor;

/** Diagnoses a plant problem; the live implementation is GeminiClient. */
public interface AiDiagnoser {
  DiagnoseDtos.Diagnosis diagnose(String description, String plantType, String photoNote)
      throws Exception;
}
