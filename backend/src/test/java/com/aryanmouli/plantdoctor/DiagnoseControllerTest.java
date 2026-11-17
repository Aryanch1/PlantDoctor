package com.aryanmouli.plantdoctor;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class DiagnoseControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper mapper;

  @MockBean private AiDiagnoser diagnoser;

  @Test
  void liveDiagnosisIsReturned() throws Exception {
    var live = new DiagnoseDtos.Diagnosis(
        "live-monstera-1",
        "Monstera",
        "The lower leaves are turning yellow and feel soft.",
        false,
        "Most likely overwatering.",
        "moderate",
        List.of("Let the soil dry out.", "Trim the yellow leaves."),
        "Water only when the top soil is dry.",
        "Bright indirect light.",
        "live",
        1L);
    when(diagnoser.diagnose(anyString(), anyString(), anyString())).thenReturn(live);

    mockMvc.perform(post("/api/diagnose")
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(
                new DiagnoseDtos.DiagnoseRequest(
                    "The lower leaves are turning yellow and feel soft.", "Monstera", null))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.diagnosis.plantType").value("Monstera"))
        .andExpect(jsonPath("$.diagnosis.source").value("live"))
        .andExpect(jsonPath("$.diagnosis.severity").value("moderate"))
        .andExpect(jsonPath("$.diagnosis.careSteps[0]").value("Let the soil dry out."));
  }

  @Test
  void emptyDescriptionIsRejected() throws Exception {
    mockMvc.perform(post("/api/diagnose")
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(
                new DiagnoseDtos.DiagnoseRequest("   ", null, null))))
        .andExpect(status().isBadRequest());
  }

  @Test
  void aiFailureFallsBackToDemoDiagnosis() throws Exception {
    when(diagnoser.diagnose(anyString(), anyString(), anyString()))
        .thenThrow(new IllegalStateException("Gemini down"));

    mockMvc.perform(post("/api/diagnose")
            .contentType(MediaType.APPLICATION_JSON)
            .content(mapper.writeValueAsString(
                new DiagnoseDtos.DiagnoseRequest(
                    "My basil is drooping and the soil is bone dry.", "Basil", null))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.diagnosis.source").value("demo"))
        .andExpect(jsonPath("$.diagnosis.likelyCause").exists())
        .andExpect(jsonPath("$.diagnosis.careSteps").isArray());
  }

  @Test
  void careLibraryListsSixPlants() throws Exception {
    mockMvc.perform(get("/api/plants"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(6))
        .andExpect(jsonPath("$[0].type").value("monstera"));
  }

  @Test
  void healthEndpointIsOk() throws Exception {
    mockMvc.perform(get("/api/health"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("ok"));
  }
}
