import type { ImageSourcePropType } from 'react-native';

import type { Diagnosis } from './types';

/**
 * Bundled plant photography — one warm, cream-styled photo per plant.
 * Diagnoses arrive as text with no imagery of their own, so a photo is
 * picked by keyword matching over the plant type and symptom text. The
 * ailing-leaf close-up is the fallback for diagnoses.
 */

export const HERO_PHOTO: ImageSourcePropType = require('../assets/plants/monstera.jpg');

export type PlantPhotoKey =
  | 'monstera'
  | 'fiddle-leaf'
  | 'tomato'
  | 'basil'
  | 'rose'
  | 'snake-plant'
  | 'ailing-leaf';

export const PHOTOS: Record<PlantPhotoKey, ImageSourcePropType> = {
  monstera: require('../assets/plants/monstera.jpg') as ImageSourcePropType,
  'fiddle-leaf': require('../assets/plants/fiddle-leaf.jpg') as ImageSourcePropType,
  tomato: require('../assets/plants/tomato.jpg') as ImageSourcePropType,
  basil: require('../assets/plants/basil.jpg') as ImageSourcePropType,
  rose: require('../assets/plants/rose.jpg') as ImageSourcePropType,
  'snake-plant': require('../assets/plants/snake-plant.jpg') as ImageSourcePropType,
  'ailing-leaf': require('../assets/plants/ailing-leaf.jpg') as ImageSourcePropType,
};

const RULES: { key: PlantPhotoKey; words: string[] }[] = [
  { key: 'monstera', words: ['monstera', 'swiss cheese'] },
  { key: 'fiddle-leaf', words: ['fiddle', 'ficus lyrata'] },
  { key: 'tomato', words: ['tomato'] },
  { key: 'basil', words: ['basil', 'herb'] },
  { key: 'rose', words: ['rose'] },
  { key: 'snake-plant', words: ['snake plant', 'sansevieria', 'mother-in-law'] },
];

function pickFrom(text: string): PlantPhotoKey | null {
  const hay = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.words.some((word) => hay.includes(word))) return rule.key;
  }
  return null;
}

/** The bundled photo that best matches a plant type or diagnosis. */
export function getPlantPhoto(type: string): ImageSourcePropType {
  return PHOTOS[pickFrom(type) ?? 'ailing-leaf'];
}

/** The bundled photo that best matches a diagnosis. */
export function getDiagnosisPhoto(diagnosis: Diagnosis): ImageSourcePropType {
  const headline = `${diagnosis.plantType} ${diagnosis.symptomText}`;
  return PHOTOS[pickFrom(headline) ?? 'ailing-leaf'];
}

/** Human label for a plant type key. */
export const PLANT_LABELS: Record<PlantPhotoKey, string> = {
  monstera: 'Monstera',
  'fiddle-leaf': 'Fiddle-leaf fig',
  tomato: 'Tomato',
  basil: 'Basil',
  rose: 'Rose',
  'snake-plant': 'Snake plant',
  'ailing-leaf': 'Plant',
};
