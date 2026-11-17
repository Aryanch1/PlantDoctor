package com.aryanmouli.plantdoctor;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class PlantDoctorApplicationTests {

  @Test
  void contextLoads() {
    // Boots the whole context with no API key set, so a wiring mistake
    // (e.g. an ambiguous GeminiClient constructor) fails the suite
    // instead of failing at first real boot.
  }
}
