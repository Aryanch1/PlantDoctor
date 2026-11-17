package com.aryanmouli.plantdoctor;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class SymptomParserTest {

  @Test
  void yellowLeavesGiveOverwateringCause() {
    var diagnosis = SymptomParser.demoDiagnosis(
        "The lower leaves of my monstera are turning yellow and feel soft.", "Monstera", false);
    assertEquals("demo", diagnosis.source());
    assertTrue(diagnosis.likelyCause().toLowerCase().contains("overwater"));
    assertEquals("moderate", diagnosis.severity());
    assertTrue(diagnosis.careSteps().size() >= 3);
  }

  @Test
  void brownCrispyEdgesGiveHumidityCause() {
    var diagnosis = SymptomParser.demoDiagnosis(
        "My fiddle-leaf fig has brown crispy edges on several leaves.", "Fiddle-leaf fig", false);
    assertTrue(diagnosis.likelyCause().toLowerCase().contains("humidity")
        || diagnosis.likelyCause().toLowerCase().contains("sun"));
    assertEquals("mild", diagnosis.severity());
  }

  @Test
  void droopingGivesThirstCause() {
    var diagnosis = SymptomParser.demoDiagnosis(
        "My basil plant is drooping and the soil feels bone dry.", "Basil", false);
    assertTrue(diagnosis.likelyCause().toLowerCase().contains("thirsty"));
    assertEquals("mild", diagnosis.severity());
  }

  @Test
  void rootRotIsSerious() {
    assertEquals(
        "serious",
        SymptomParser.guessSeverity("The roots are black and mushy and smell bad."));
    var diagnosis = SymptomParser.demoDiagnosis(
        "Roots are black and mushy, the plant is rotting.", "", false);
    assertEquals("serious", diagnosis.severity());
    assertTrue(diagnosis.careSteps().size() >= 3);
  }

  @Test
  void plantTypeGuessingFindsTomatoAndSnakePlant() {
    assertEquals("Tomato", SymptomParser.guessPlantType("Dark spots on my tomato plant.", ""));
    assertEquals("Snake plant", SymptomParser.guessPlantType("My snake plant is fine.", ""));
    assertEquals("Monstera", SymptomParser.guessPlantType("Leaves are yellow.", "Monstera"));
    assertEquals("Plant", SymptomParser.guessPlantType("Something is wrong.", ""));
  }

  @Test
  void demoDiagnosisKeepsSymptomTextAndPhotoFlag() {
    var diagnosis = SymptomParser.demoDiagnosis("Spots on the leaves.", "Tomato", true);
    assertEquals("Spots on the leaves.", diagnosis.symptomText());
    assertTrue(diagnosis.hasPhoto());
    assertEquals("Tomato", diagnosis.plantType());
    assertTrue(diagnosis.watering().length() > 10);
    assertTrue(diagnosis.light().length() > 10);
  }

  @Test
  void careLibraryHasSixPlants() {
    var library = SymptomParser.careLibrary();
    assertEquals(6, library.size());
    assertTrue(library.stream().anyMatch(e -> e.type().equals("monstera")));
    assertTrue(library.stream().anyMatch(e -> e.type().equals("snake-plant")));
    assertTrue(library.stream().allMatch(e -> !e.light().isBlank() && !e.water().isBlank()));
  }
}
