import { backendConfigured, BACKEND_URL } from './config';
import { demoDiagnosis } from './plants';
import type { DiagnoseResponse, Diagnosis } from './types';

/**
 * Diagnosis client.
 *
 * Live mode: POSTs the symptoms to the Spring Boot backend
 * (POST /api/diagnose), which calls Gemini server-side with the key held
 * there. On web the app talks to the configured backend origin; native
 * builds use the same origin.
 *
 * Demo mode: when no backend is configured, or the live call fails, a
 * curated on-device diagnosis is returned instead (source 'demo') and
 * the UI says so honestly.
 */

export interface DiagnoseResult {
  diagnosis: Diagnosis;
  /** True when the live backend was configured but could not answer. */
  liveFailed: boolean;
}

function isDiagnosis(value: unknown): value is Diagnosis {
  if (!value || typeof value !== 'object') return false;
  const d = value as Record<string, unknown>;
  return (
    typeof d.id === 'string' &&
    typeof d.plantType === 'string' &&
    typeof d.likelyCause === 'string' &&
    typeof d.severity === 'string' &&
    Array.isArray(d.careSteps) &&
    typeof d.watering === 'string' &&
    typeof d.light === 'string'
  );
}

export async function diagnosePlant(
  description: string,
  plantType: string,
  hasPhoto: boolean,
): Promise<DiagnoseResult> {
  const trimmed = description.trim();
  if (!trimmed) throw new Error('Describe what is wrong with the plant first.');
  if (!backendConfigured) {
    return { diagnosis: demoDiagnosis(trimmed, plantType, hasPhoto), liveFailed: false };
  }
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: trimmed,
        plantType: plantType.trim() || undefined,
        photoNote: hasPhoto ? 'User attached a photo of the plant.' : undefined,
      }),
    });
  } catch {
    return { diagnosis: demoDiagnosis(trimmed, plantType, hasPhoto), liveFailed: true };
  }
  const data = (await response.json().catch(() => ({}))) as DiagnoseResponse;
  if (!response.ok || !isDiagnosis(data.diagnosis)) {
    return { diagnosis: demoDiagnosis(trimmed, plantType, hasPhoto), liveFailed: true };
  }
  const live = data.diagnosis;
  return {
    diagnosis: {
      ...live,
      symptomText: trimmed,
      hasPhoto,
      source: 'live',
      at: Date.now(),
    },
    liveFailed: false,
  };
}
