import { GeographyData, GeographyType } from './types';

export async function fetchGeographyData(type: GeographyType): Promise<GeographyData[]> {
  const fileMap: Record<GeographyType, string> = {
    county: '/data/county.json',
    puma: '/data/pumas.json',
    city: '/data/cities.json',
    zip: '/data/zips.json',
  };

  const response = await fetch(fileMap[type]);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} data`);
  }
  const data = await response.json();
  
  // county.json is a single object, others are arrays
  // Normalize to always return an array
  if (Array.isArray(data)) {
    return data;
  }
  return [data];
}

export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function getGeographyLabel(type: GeographyType): string {
  const labels: Record<GeographyType, string> = {
    county: 'County',
    puma: 'PUMA',
    city: 'City',
    zip: 'ZIP Code',
  };
  return labels[type];
}

export function getGeographyPluralLabel(type: GeographyType): string {
  const labels: Record<GeographyType, string> = {
    county: 'Counties',
    puma: 'PUMAs',
    city: 'Cities',
    zip: 'ZIP Codes',
  };
  return labels[type];
}
