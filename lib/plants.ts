import type { CareTask, Diagnosis, SavedPlant } from './types';

/**
 * Plant care library + on-device demo diagnosis.
 *
 * The library is the honest demo mode: when no backend is configured, or
 * the live call fails, diagnoses are built from the symptom keywords
 * below instead of failing — and the UI says so (source 'demo'). The
 * same keyword rules power the Spring Boot backend's demo path, so live
 * and demo answers agree on shape.
 */

export interface LibraryEntry {
  type: string;
  label: string;
  light: string;
  water: string;
  feeding: string;
  notes: string;
  /** Words that match this plant in symptom text. */
  keywords: string[];
}

export const CARE_LIBRARY: LibraryEntry[] = [
  {
    type: 'monstera',
    label: 'Monstera',
    light: 'Bright indirect light',
    water: 'Every 1–2 weeks, when top soil is dry',
    feeding: 'Monthly in spring & summer',
    notes: 'Loves humidity. Wipe big leaves with a damp cloth so they can breathe.',
    keywords: ['monstera', 'swiss cheese'],
  },
  {
    type: 'fiddle-leaf',
    label: 'Fiddle-leaf fig',
    light: 'Bright light, a few hours of gentle sun',
    water: 'Weekly, evenly moist — never soggy',
    feeding: 'Monthly in spring & summer',
    notes: 'Hates being moved and hates draughts. Pick a spot and leave it there.',
    keywords: ['fiddle', 'ficus lyrata'],
  },
  {
    type: 'tomato',
    label: 'Tomato',
    light: 'Full sun, 6–8 hours a day',
    water: 'Deep watering 2–3 times a week',
    feeding: 'Every 2 weeks once fruit sets',
    notes: 'Water the soil, not the leaves — wet leaves invite blight.',
    keywords: ['tomato'],
  },
  {
    type: 'basil',
    label: 'Basil',
    light: 'Full sun, 6+ hours a day',
    water: 'Keep soil moist, water when the top is dry',
    feeding: 'Light feed every 3–4 weeks',
    notes: 'Pinch the top leaves often — it grows bushier instead of leggy.',
    keywords: ['basil', 'herb'],
  },
  {
    type: 'rose',
    label: 'Rose',
    light: 'Full sun, 6+ hours a day',
    water: 'Deep watering twice a week',
    feeding: 'Rose food every 4–6 weeks in season',
    notes: 'Good airflow between stems keeps black spot away. Prune dead wood.',
    keywords: ['rose'],
  },
  {
    type: 'snake-plant',
    label: 'Snake plant',
    light: 'Low to bright indirect light',
    water: 'Every 2–4 weeks — let soil dry fully',
    feeding: 'Twice a year is plenty',
    notes: 'Almost impossible to kill with neglect — overwatering is the one risk.',
    keywords: ['snake plant', 'sansevieria', 'mother-in-law'],
  },
];

export function libraryEntryFor(type: string): LibraryEntry | null {
  const hay = type.toLowerCase();
  return CARE_LIBRARY.find((e) => e.keywords.some((k) => hay.includes(k))) ?? null;
}

/** One-tap sample symptoms for the Diagnose screen. */
export const SAMPLE_SYMPTOMS: { title: string; text: string; plantType: string }[] = [
  {
    title: 'Yellow leaves',
    text: 'The lower leaves of my monstera are turning yellow and feel soft.',
    plantType: 'Monstera',
  },
  {
    title: 'Brown leaf tips',
    text: 'My fiddle-leaf fig has brown crispy edges on several leaves.',
    plantType: 'Fiddle-leaf fig',
  },
  {
    title: 'Drooping basil',
    text: 'My basil plant is drooping and the soil feels bone dry.',
    plantType: 'Basil',
  },
  {
    title: 'Spots on tomato',
    text: 'Dark spots are spreading on the leaves of my tomato plant.',
    plantType: 'Tomato',
  },
];

function slug(text: string): string {
  const s = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s.length > 48 ? s.slice(0, 48) : s;
}

interface DemoRule {
  words: string[];
  cause: string;
  severity: Diagnosis['severity'];
  steps: string[];
  watering: string;
  light: string;
}

const DEMO_RULES: DemoRule[] = [
  {
    words: ['yellow', 'yellowing'],
    cause: 'Most likely overwatering — roots sitting in wet soil starve the leaves.',
    severity: 'moderate',
    steps: [
      'Stop watering for now and let the top 5 cm of soil dry out completely.',
      'Check the pot drains freely — tip out any water sitting in the saucer.',
      'Trim off fully yellow leaves with clean scissors so the plant stops feeding them.',
      'Move the plant somewhere with brighter, indirect light for a week.',
      'Water again only when the top soil feels dry, and water less each time.',
    ],
    watering: 'Water only when the top 5 cm of soil is dry — usually every 1–2 weeks indoors.',
    light: 'Bright indirect light, 4–6 hours a day.',
  },
  {
    words: ['brown', 'crispy', 'dry edges', 'scorched'],
    cause: 'Most likely low humidity or too much direct sun drying the leaf edges.',
    severity: 'mild',
    steps: [
      'Move the plant out of harsh direct sun into bright indirect light.',
      'Trim the brown edges with clean scissors, following the leaf shape.',
      'Mist the leaves in the morning, or set a tray of pebbles and water nearby.',
      'Keep the plant away from heaters and air-conditioning vents.',
      'Water evenly so the soil is moist but never soggy.',
    ],
    watering: 'Keep soil evenly moist; water when the top 2 cm feels dry.',
    light: 'Bright indirect light — no harsh midday sun on the leaves.',
  },
  {
    words: ['droop', 'drooping', 'wilt', 'wilting', 'limp'],
    cause: 'Most likely thirsty — the soil has dried out and the plant cannot hold its leaves up.',
    severity: 'mild',
    steps: [
      'Give the plant a deep drink until water runs out of the drainage holes.',
      'If the soil has pulled away from the pot, soak the pot in a basin for 20 minutes.',
      'Move it out of direct sun until the leaves perk back up.',
      'Check the soil daily for the next week — thirsty plants bounce back fast.',
      'Set a watering reminder so it does not dry out again.',
    ],
    watering: 'Water when the top 2 cm of soil is dry; never let it stay bone-dry for days.',
    light: 'Bright light, but shade from harsh midday sun while it recovers.',
  },
  {
    words: ['spot', 'spots', 'blight', 'fungus', 'mould', 'mold', 'black'],
    cause: 'Most likely a fungal leaf spot — wet leaves and poor airflow spread it.',
    severity: 'moderate',
    steps: [
      'Remove the worst spotted leaves and bin them — do not compost them.',
      'Water the soil only, never the leaves, and water in the morning.',
      'Space the plant out so air can move around the leaves.',
      'Wipe the remaining leaves with a damp cloth to remove spores.',
      'If spots keep spreading after a week, ask a local nursery about a fungicide.',
    ],
    watering: 'Water at the base in the morning; keep leaves dry.',
    light: 'Full sun with good airflow around the plant.',
  },
  {
    words: ['pest', 'aphid', 'bug', 'bugs', 'insect', 'fly', 'flies', 'web', 'mite'],
    cause: 'Most likely sap-sucking pests weakening the leaves.',
    severity: 'moderate',
    steps: [
      'Isolate the plant from your other plants right away.',
      'Shower the leaves with lukewarm water to knock pests off.',
      'Wipe stems and leaf undersides with soapy water (a drop of dish soap in a litre).',
      'Repeat the wipe every 3 days for two weeks — eggs hatch in waves.',
      'If they persist, ask a local nursery about neem oil or insecticidal soap.',
    ],
    watering: 'Water normally; do not overwater while the plant is stressed.',
    light: 'Bright indirect light while it recovers.',
  },
  {
    words: ['root rot', 'mushy', 'smell', 'smelly', 'rotting'],
    cause: 'Most likely root rot — roots have been sitting in waterlogged soil.',
    severity: 'serious',
    steps: [
      'Take the plant out of its pot and shake off the wet soil.',
      'Cut away any black, mushy roots with clean scissors; keep only firm, pale roots.',
      'Repot in fresh, free-draining mix in a pot with drainage holes.',
      'Water lightly once, then wait until the top soil dries before watering again.',
      'If most roots are gone, take a healthy cutting and root it in water as a backup.',
    ],
    watering: 'Water only when the top soil is fully dry; always empty the saucer.',
    light: 'Bright indirect light while it recovers.',
  },
];

const GENERIC_DEMO: Omit<DemoRule, 'words'> = {
  cause:
    'The symptoms do not match a single common problem — the plant may be stressed by water, light, or a recent move.',
  severity: 'mild',
  steps: [
    'Check the soil: soggy means too much water, bone-dry means too little.',
    'Check the light: pale, stretched growth means too little light; scorched edges mean too much.',
    'Remove any fully dead leaves with clean scissors.',
    'Give the plant a week in steady, bright indirect light with even watering.',
    'If it keeps getting worse, take a photo to a local nursery or extension service.',
  ],
  watering: 'Water when the top 2 cm of soil is dry; never leave the pot sitting in water.',
  light: 'Bright indirect light, 4–6 hours a day.',
};

/**
 * Honest on-device demo diagnosis — keyword rules over the symptom text.
 * The app labels this source 'demo' so nobody mistakes it for a live
 * AI answer.
 */
export function demoDiagnosis(
  description: string,
  plantType: string,
  hasPhoto: boolean,
): Diagnosis {
  const hay = description.toLowerCase();
  const rule = DEMO_RULES.find((r) => r.words.some((w) => hay.includes(w))) ?? GENERIC_DEMO;
  const type = plantType.trim() || 'Plant';
  return {
    id: `demo-${slug(type)}-${Date.now()}`,
    plantType: type,
    symptomText: description.trim(),
    hasPhoto,
    likelyCause: rule.cause,
    severity: rule.severity,
    careSteps: rule.steps,
    watering: rule.watering,
    light: rule.light,
    source: 'demo',
    at: Date.now(),
  };
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function task(id: string, kind: string, label: string, dueDays: number, plantId: string): CareTask {
  return { id, kind, label, due: daysFromNow(dueDays), done: false, plantId };
}

/** Seed data so the first open looks alive: 3 plants + 2 past diagnoses. */
export function seedPlants(): SavedPlant[] {
  const now = Date.now();
  const monstera: SavedPlant = {
    id: 'seed-monstera',
    name: 'Mona the Monstera',
    type: 'monstera',
    location: 'Living room window',
    light: 'Bright indirect',
    water: 'Every 1–2 weeks',
    feeding: 'Monthly in spring',
    notes: 'New leaf unfurling this week.',
    addedAt: now - 21 * 86400000,
    diagnoses: [
      {
        id: 'seed-diag-monstera',
        plantType: 'Monstera',
        symptomText: 'Lower leaves turning yellow and soft.',
        hasPhoto: true,
        likelyCause: 'Most likely overwatering — roots sitting in wet soil starve the leaves.',
        severity: 'moderate',
        careSteps: [
          'Stop watering for now and let the top 5 cm of soil dry out completely.',
          'Check the pot drains freely — tip out any water sitting in the saucer.',
          'Trim off fully yellow leaves with clean scissors.',
        ],
        watering: 'Water only when the top 5 cm of soil is dry.',
        light: 'Bright indirect light, 4–6 hours a day.',
        source: 'demo',
        at: now - 3 * 86400000,
      },
    ],
    tasks: [
      task('seed-t1', 'water', 'Water Mona', 0, 'seed-monstera'),
      task('seed-t2', 'feed', 'Feed Mona', 4, 'seed-monstera'),
    ],
  };
  const basil: SavedPlant = {
    id: 'seed-basil',
    name: 'Kitchen Basil',
    type: 'basil',
    location: 'Kitchen windowsill',
    light: 'Full sun',
    water: 'Keep soil moist',
    feeding: 'Every 3–4 weeks',
    notes: 'Pinch the tops for pesto.',
    addedAt: now - 12 * 86400000,
    diagnoses: [
      {
        id: 'seed-diag-basil',
        plantType: 'Basil',
        symptomText: 'Basil drooping, soil bone dry.',
        hasPhoto: false,
        likelyCause: 'Most likely thirsty — the soil has dried out and the plant cannot hold its leaves up.',
        severity: 'mild',
        careSteps: [
          'Give the plant a deep drink until water runs out of the drainage holes.',
          'Move it out of direct sun until the leaves perk back up.',
          'Set a watering reminder so it does not dry out again.',
        ],
        watering: 'Water when the top 2 cm of soil is dry.',
        light: 'Bright light, shade from harsh midday sun while it recovers.',
        source: 'demo',
        at: now - 6 * 86400000,
      },
    ],
    tasks: [task('seed-t3', 'water', 'Water basil', 1, 'seed-basil')],
  };
  const snake: SavedPlant = {
    id: 'seed-snake-plant',
    name: 'Bedroom Snake Plant',
    type: 'snake-plant',
    location: 'Bedroom corner',
    light: 'Low to bright indirect',
    water: 'Every 2–4 weeks',
    feeding: 'Twice a year',
    notes: 'The easy one — leave it alone.',
    addedAt: now - 40 * 86400000,
    diagnoses: [],
    tasks: [task('seed-t4', 'water', 'Water snake plant', 6, 'seed-snake-plant')],
  };
  return [monstera, basil, snake];
}
