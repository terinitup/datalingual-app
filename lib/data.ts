import { GeoArea, GeoType } from './types';

export async function fetchGeographyData(type: GeoType): Promise<GeoArea[]> {
  const fileMap: Record<GeoType, string> = {
    county: '/data/county_ipums.json',
    puma: '/data/pumas.json',
    city: '/data/cities_ipums.json',
    zip: '/data/zips.json',
  };

  const response = await fetch(fileMap[type]);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} data`);
  }
  const data = await response.json();
  
  if (Array.isArray(data)) {
    return data;
  }
  return [data];
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return 'N/A';
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return 'N/A';
  return `${value.toFixed(1)}%`;
}

export function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function getGeographyLabel(type: GeoType): string {
  const labels: Record<GeoType, string> = {
    county: 'County',
    puma: 'PUMA',
    city: 'City',
    zip: 'ZIP Code',
  };
  return labels[type];
}

export function getGeographyPluralLabel(type: GeoType): string {
  const labels: Record<GeoType, string> = {
    county: 'Counties',
    puma: 'PUMAs',
    city: 'Cities',
    zip: 'ZIP Codes',
  };
  return labels[type];
}