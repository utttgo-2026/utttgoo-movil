import type { ImageSource } from 'expo-image';

export interface FoodMedia {
  /** Shared photo identity across resolutions and consumers. */
  photoId: string;
  thumbnail?: ImageSource;
  detail?: ImageSource;
  focalPoint: { x: number; y: number };
  provenance: 'figma-crop' | 'licensed-alternative' | 'pending';
}

const pending: FoodMedia = {
  photoId: 'neutral-pending', focalPoint: { x: 50, y: 50 }, provenance: 'pending',
};

// Provenance, license, limitations and generated dimensions: specs/006-*/media-manifest.md.
// Static require calls are intentional: Metro bundles these for offline use.
export const foodMedia: Readonly<Record<string, FoodMedia>> = {
  'food-1': { photoId: 'pexels-37074229', thumbnail: require('../../assets/images/foods/food-1-thumb.jpg'), detail: require('../../assets/images/foods/food-1-detail.jpg'), focalPoint: { x: 50, y: 50 }, provenance: 'licensed-alternative' },
  'food-2': { photoId: 'pexels-376464', thumbnail: require('../../assets/images/foods/food-2-thumb.jpg'), detail: require('../../assets/images/foods/food-2-detail.jpg'), focalPoint: { x: 50, y: 50 }, provenance: 'licensed-alternative' },
  'food-3': { photoId: 'pexels-31823016', thumbnail: require('../../assets/images/foods/food-3-thumb.jpg'), detail: require('../../assets/images/foods/food-3-detail.jpg'), focalPoint: { x: 50, y: 50 }, provenance: 'licensed-alternative' },
  'food-4': { photoId: 'pexels-4725753', thumbnail: require('../../assets/images/foods/food-4-thumb.jpg'), detail: require('../../assets/images/foods/food-4-detail.jpg'), focalPoint: { x: 50, y: 50 }, provenance: 'licensed-alternative' },
  'food-5': { photoId: 'figma-UI-013', thumbnail: require('../../assets/images/foods/food-5-thumb.jpg'), detail: require('../../assets/images/foods/food-5-detail.jpg'), focalPoint: { x: 50, y: 50 }, provenance: 'figma-crop' },
  'food-5b': { photoId: 'figma-UI-037', thumbnail: require('../../assets/images/foods/food-5b-thumb.jpg'), detail: require('../../assets/images/foods/food-5b-detail.jpg'), focalPoint: { x: 50, y: 50 }, provenance: 'figma-crop' },
  'food-5c': { photoId: 'pexels-27603300', thumbnail: require('../../assets/images/foods/food-5c-thumb.jpg'), detail: require('../../assets/images/foods/food-5c-detail.jpg'), focalPoint: { x: 50, y: 50 }, provenance: 'licensed-alternative' },
  'food-5d': pending,
  'food-6': pending,
  'food-7': pending,
  'food-7b': pending,
  'food-7c': pending,
  'food-8': { photoId: 'pexels-5946635', thumbnail: require('../../assets/images/foods/food-8-thumb.jpg'), detail: require('../../assets/images/foods/food-8-detail.jpg'), focalPoint: { x: 50, y: 50 }, provenance: 'licensed-alternative' },
  'food-8b': { photoId: 'pexels-17429050', thumbnail: require('../../assets/images/foods/food-8b-thumb.jpg'), detail: require('../../assets/images/foods/food-8b-detail.jpg'), focalPoint: { x: 50, y: 65 }, provenance: 'licensed-alternative' },
  'food-8c': { photoId: 'pexels-18142614', thumbnail: require('../../assets/images/foods/food-8c-thumb.jpg'), detail: require('../../assets/images/foods/food-8c-detail.jpg'), focalPoint: { x: 50, y: 50 }, provenance: 'licensed-alternative' },
  'food-9': pending,
  'food-9b': pending,
  'food-9c': pending,
  'food-10': pending,
  'food-10b': pending,
  'food-10c': pending,
};

export function getFoodMedia(foodId: string): FoodMedia {
  return Object.prototype.hasOwnProperty.call(foodMedia, foodId) ? foodMedia[foodId] : pending;
}
