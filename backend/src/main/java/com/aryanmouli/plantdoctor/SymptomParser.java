package com.aryanmouli.plantdoctor;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Pure symptom parsing — no network, fully unit-tested.
 *
 * Turns a gardener's description ("lower leaves turning yellow and soft",
 * "brown crispy edges", "drooping, soil bone dry") into a likely cause, a
 * severity, and numbered care steps. The same rules power the app's
 * on-device demo mode, so live and demo answers agree on shape.
 */
public final class SymptomParser {

  private SymptomParser() {}

  /** Slug for stable diagnosis ids. */
  public static String slug(String text) {
    String s = text.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
    return s.length() > 48 ? s.substring(0, 48) : s;
  }

  /** Best-guess plant type from the description, or "Plant". */
  public static String guessPlantType(String description, String plantType) {
    if (plantType != null && !plantType.isBlank()) return plantType.trim();
    String hay = description.toLowerCase(Locale.ROOT);
    if (hay.contains("monstera") || hay.contains("swiss cheese")) return "Monstera";
    if (hay.contains("fiddle")) return "Fiddle-leaf fig";
    if (hay.contains("tomato")) return "Tomato";
    if (hay.contains("basil")) return "Basil";
    if (hay.contains("rose")) return "Rose";
    if (hay.contains("snake plant") || hay.contains("sansevieria")) return "Snake plant";
    return "Plant";
  }

  /** Severity for a symptom description: mild, moderate or serious. */
  public static String guessSeverity(String description) {
    String hay = description.toLowerCase(Locale.ROOT);
    if (hay.contains("root rot") || hay.contains("mushy") || hay.contains("rotting")
        || hay.contains("smell")) {
      return "serious";
    }
    if (hay.contains("yellow") || hay.contains("spot") || hay.contains("blight")
        || hay.contains("fungus") || hay.contains("mould") || hay.contains("mold")
        || hay.contains("pest") || hay.contains("aphid") || hay.contains("bug")
        || hay.contains("insect") || hay.contains("web") || hay.contains("mite")) {
      return "moderate";
    }
    return "mild";
  }

  /**
   * Generic demo-style diagnosis for symptoms the AI did not answer —
   * honest about its limits, with care steps matched to the wording.
   */
  public static DiagnoseDtos.Diagnosis demoDiagnosis(
      String description, String plantType, boolean hasPhoto) {
    String hay = description.toLowerCase(Locale.ROOT);
    String type = guessPlantType(description, plantType);
    String cause;
    List<String> steps;
    String watering = "Water when the top 2 cm of soil is dry; never leave the pot sitting in water.";
    String light = "Bright indirect light, 4–6 hours a day.";

    if (hay.contains("yellow")) {
      cause = "Most likely overwatering — roots sitting in wet soil starve the leaves.";
      steps = List.of(
          "Stop watering for now and let the top 5 cm of soil dry out completely.",
          "Check the pot drains freely — tip out any water sitting in the saucer.",
          "Trim off fully yellow leaves with clean scissors so the plant stops feeding them.",
          "Move the plant somewhere with brighter, indirect light for a week.",
          "Water again only when the top soil feels dry, and water less each time.");
      watering = "Water only when the top 5 cm of soil is dry — usually every 1–2 weeks indoors.";
    } else if (hay.contains("brown") || hay.contains("crispy") || hay.contains("scorched")) {
      cause = "Most likely low humidity or too much direct sun drying the leaf edges.";
      steps = List.of(
          "Move the plant out of harsh direct sun into bright indirect light.",
          "Trim the brown edges with clean scissors, following the leaf shape.",
          "Mist the leaves in the morning, or set a tray of pebbles and water nearby.",
          "Keep the plant away from heaters and air-conditioning vents.",
          "Water evenly so the soil is moist but never soggy.");
      watering = "Keep soil evenly moist; water when the top 2 cm feels dry.";
      light = "Bright indirect light — no harsh midday sun on the leaves.";
    } else if (hay.contains("droop") || hay.contains("wilt") || hay.contains("limp")) {
      cause = "Most likely thirsty — the soil has dried out and the plant cannot hold its leaves up.";
      steps = List.of(
          "Give the plant a deep drink until water runs out of the drainage holes.",
          "If the soil has pulled away from the pot, soak the pot in a basin for 20 minutes.",
          "Move it out of direct sun until the leaves perk back up.",
          "Check the soil daily for the next week — thirsty plants bounce back fast.",
          "Set a watering reminder so it does not dry out again.");
      watering = "Water when the top 2 cm of soil is dry; never let it stay bone-dry for days.";
      light = "Bright light, but shade from harsh midday sun while it recovers.";
    } else if (hay.contains("spot") || hay.contains("blight") || hay.contains("fungus")
        || hay.contains("mould") || hay.contains("mold")) {
      cause = "Most likely a fungal leaf spot — wet leaves and poor airflow spread it.";
      steps = List.of(
          "Remove the worst spotted leaves and bin them — do not compost them.",
          "Water the soil only, never the leaves, and water in the morning.",
          "Space the plant out so air can move around the leaves.",
          "Wipe the remaining leaves with a damp cloth to remove spores.",
          "If spots keep spreading after a week, ask a local nursery about a fungicide.");
      watering = "Water at the base in the morning; keep leaves dry.";
      light = "Full sun with good airflow around the plant.";
    } else if (hay.contains("pest") || hay.contains("aphid") || hay.contains("bug")
        || hay.contains("insect") || hay.contains("web") || hay.contains("mite")) {
      cause = "Most likely sap-sucking pests weakening the leaves.";
      steps = List.of(
          "Isolate the plant from your other plants right away.",
          "Shower the leaves with lukewarm water to knock pests off.",
          "Wipe stems and leaf undersides with soapy water (a drop of dish soap in a litre).",
          "Repeat the wipe every 3 days for two weeks — eggs hatch in waves.",
          "If they persist, ask a local nursery about neem oil or insecticidal soap.");
      watering = "Water normally; do not overwater while the plant is stressed.";
    } else if (hay.contains("root rot") || hay.contains("mushy") || hay.contains("rotting")) {
      cause = "Most likely root rot — roots have been sitting in waterlogged soil.";
      steps = List.of(
          "Take the plant out of its pot and shake off the wet soil.",
          "Cut away any black, mushy roots with clean scissors; keep only firm, pale roots.",
          "Repot in fresh, free-draining mix in a pot with drainage holes.",
          "Water lightly once, then wait until the top soil dries before watering again.",
          "If most roots are gone, take a healthy cutting and root it in water as a backup.");
      watering = "Water only when the top soil is fully dry; always empty the saucer.";
    } else {
      cause = "The symptoms do not match a single common problem — the plant may be stressed "
          + "by water, light, or a recent move.";
      steps = List.of(
          "Check the soil: soggy means too much water, bone-dry means too little.",
          "Check the light: pale, stretched growth means too little light; scorched edges mean too much.",
          "Remove any fully dead leaves with clean scissors.",
          "Give the plant a week in steady, bright indirect light with even watering.",
          "If it keeps getting worse, take a photo to a local nursery or extension service.");
    }

    return new DiagnoseDtos.Diagnosis(
        "demo-" + slug(type) + "-" + System.currentTimeMillis(),
        type,
        description,
        hasPhoto,
        cause,
        guessSeverity(description),
        new ArrayList<>(steps),
        watering,
        light,
        "demo",
        System.currentTimeMillis());
  }

  /** Curated care library — the same entries as the app's lib/plants.ts. */
  public static List<DiagnoseDtos.LibraryEntry> careLibrary() {
    return List.of(
        new DiagnoseDtos.LibraryEntry(
            "monstera", "Monstera", "Bright indirect light",
            "Every 1–2 weeks, when top soil is dry", "Monthly in spring & summer",
            "Loves humidity. Wipe big leaves with a damp cloth so they can breathe."),
        new DiagnoseDtos.LibraryEntry(
            "fiddle-leaf", "Fiddle-leaf fig", "Bright light, a few hours of gentle sun",
            "Weekly, evenly moist — never soggy", "Monthly in spring & summer",
            "Hates being moved and hates draughts. Pick a spot and leave it there."),
        new DiagnoseDtos.LibraryEntry(
            "tomato", "Tomato", "Full sun, 6–8 hours a day",
            "Deep watering 2–3 times a week", "Every 2 weeks once fruit sets",
            "Water the soil, not the leaves — wet leaves invite blight."),
        new DiagnoseDtos.LibraryEntry(
            "basil", "Basil", "Full sun, 6+ hours a day",
            "Keep soil moist, water when the top is dry", "Light feed every 3–4 weeks",
            "Pinch the top leaves often — it grows bushier instead of leggy."),
        new DiagnoseDtos.LibraryEntry(
            "rose", "Rose", "Full sun, 6+ hours a day",
            "Deep watering twice a week", "Rose food every 4–6 weeks in season",
            "Good airflow between stems keeps black spot away. Prune dead wood."),
        new DiagnoseDtos.LibraryEntry(
            "snake-plant", "Snake plant", "Low to bright indirect light",
            "Every 2–4 weeks — let soil dry fully", "Twice a year is plenty",
            "Almost impossible to kill with neglect — overwatering is the one risk."));
  }
}
