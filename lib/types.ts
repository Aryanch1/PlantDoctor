/** PlantDoctor shared types. */

export type Severity = 'mild' | 'moderate' | 'serious';

export type DiagnosisSource = 'live' | 'demo';

export interface CareTask {
  id: string;
  /** 'water' | 'feed' | 'prune' | 'repot' | 'inspect' — free text allowed. */
  kind: string;
  label: string;
  /** '2026-11-18' ISO date the task is due. */
  due: string;
  done: boolean;
  /** Plant the task belongs to (plant id, or '' for a general task). */
  plantId: string;
}

export interface Diagnosis {
  /** Stable id — slug of the plant type + timestamp for live results. */
  id: string;
  plantType: string;
  /** The symptom text the user typed (or the sample text). */
  symptomText: string;
  /** True when the user attached a photo of the plant. */
  hasPhoto: boolean;
  /** Most likely cause, plain language. */
  likelyCause: string;
  severity: Severity;
  /** Numbered care steps, each one short sentence. */
  careSteps: string[];
  /** Watering guidance, e.g. 'Water only when the top 2 cm of soil is dry'. */
  watering: string;
  /** Light guidance, e.g. 'Bright indirect light, 4–6 hours a day'. */
  light: string;
  source: DiagnosisSource;
  /** Epoch milliseconds the diagnosis was made. */
  at: number;
}

export interface SavedPlant {
  id: string;
  name: string;
  /** Common plant type key, e.g. 'monstera' — maps to a bundled photo. */
  type: string;
  /** Free-text location, e.g. 'Living room window'. */
  location: string;
  /** Light need, e.g. 'Bright indirect'. */
  light: string;
  /** Watering need, e.g. 'Weekly'. */
  water: string;
  /** Feeding need, e.g. 'Monthly in spring'. */
  feeding: string;
  notes: string;
  /** Epoch milliseconds it was added. */
  addedAt: number;
  /** Diagnoses attached to this plant. */
  diagnoses: Diagnosis[];
  /** Care tasks attached to this plant. */
  tasks: CareTask[];
}

export interface HistoryEntry {
  id: string;
  symptomText: string;
  plantType: string;
  likelyCause: string;
  severity: Severity;
  /** Epoch milliseconds of the diagnosis. */
  at: number;
}

export interface DiagnoseRequest {
  description: string;
  plantType?: string;
  photoNote?: string;
}

export interface DiagnoseResponse {
  diagnosis?: Diagnosis;
  error?: { message?: string };
}
