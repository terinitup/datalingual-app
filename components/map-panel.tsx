'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GeographyData, GeographyType } from '@/lib/types';

interface MapPanelProps {
  geographyType: GeographyType;
  data: GeographyData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  colorMetric: 'population' | 'medianIncome' | 'povertyRate';
}

const LA_CENTER: [number, number] = [-118.2437, 34.0522];
const LA_BOUNDS: [[number, number], [number, number]] = [
  [-118.9448, 33.7037],
  [-117.6462, 34.8233],
];

// Approximate boundaries for different geography types
const GEOGRAPHY_BOUNDS: Record<GeographyType, { center: [number, number]; zoom: number }[]> = {
  county: [{ center: LA_CENTER, zoom: 9 }],
  puma: [
    { center: [-118.45, 34.05], zoom: 10 },
    { center: [-118.25, 33.95], zoom: 10 },
    { center: [-118.1, 34.15], zoom: 10 },
    { center: [-118.35, 34.25], zoom: 10 },
    { center: [-118.55, 34.1], zoom: 10 },
  ],
  city: [
    { center: [-118.2437, 34.0522], zoom: 11 },
    { center: [-118.4085, 33.9425], zoom: 12 },
    { center: [-118.1445, 34.1478], zoom: 12 },
    { center: [-118.3287, 34.0901], zoom: 12 },
    { center: [-118.0772, 33.9533], zoom: 12 },
  ],
  zip: [
    { center: [-118.2437, 34.0522], zoom: 12 },
    { center: [-118.35, 34.05], zoom: 12 },
    { center: [-118.15, 34.05], zoom: 12 },
    { center: [-118.25, 34.15], zoom: 12 },
    { center: [-118.25, 33.95], zoom: 12 },
  ],
};

function getColorScale(metric: 'population' | 'medianIncome' | 'povertyRate') {
  switch (metric) {
    case 'population':
      return ['#E8F4F8', '#B8DDE6', '#6BB8CC', '#2E8B9A', '#1A5F6B'];
    case 'medianIncome':
      return ['#FEF3E2', '#FCD9A8', '#F5B041', '#D4A03A', '#8B6914'];
    case 'povertyRate':
      return ['#FDE8E8', '#F5B7B7', '#E57373', '#C62828', '#8B0000'];
    default:
      return ['#E8F4F8', '#B8DDE6', '#6BB8CC', '#2E8B9A', '#1A5F6B'];
  }
}

function getMetricValue(item: GeographyData, metric: 'population' | 'medianIncome' | 'povertyRate'): number {
  switch (metric) {
    case 'population':
      return item.demographics.totalPopulation;
    case 'medianIncome':
      return item.economics.medianHouseholdIncome;
    case 'povertyRate':
      return item.economics.povertyRate;
    default:
      return 0;
  }
}

export function MapPanel({ geographyType, data, selectedId, onSelect, colorMetric }: MapPanelProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: LA_CENTER,
      zoom: 9,
      maxBounds: LA_BOUNDS,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded || data.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const colors = getColorScale(colorMetric);
    const values = data.map((item) => getMetricValue(item, colorMetric));
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    const bounds = GEOGRAPHY_BOUNDS[geographyType];

    data.forEach((item, index) => {
      const value = getMetricValue(item, colorMetric);
      const normalizedValue = (value - minVal) / range;
      const colorIndex = Math.min(Math.floor(normalizedValue * colors.length), colors.length - 1);
      const color = colors[colorIndex];

      // Use predefined positions or distribute markers
      const position = bounds[index % bounds.length];
      const offset = index >= bounds.length ? [(index * 0.02) % 0.1, (index * 0.015) % 0.08] : [0, 0];

      const el = document.createElement('div');
      el.className = 'geography-marker';
      el.style.cssText = `
        width: ${geographyType === 'county' ? '120px' : geographyType === 'puma' ? '80px' : '60px'};
        height: ${geographyType === 'county' ? '120px' : geographyType === 'puma' ? '80px' : '60px'};
        background-color: ${color};
        border: ${selectedId === item.id ? '3px solid #1A5F6B' : '2px solid white'};
        border-radius: ${geographyType === 'zip' ? '4px' : '8px'};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${geographyType === 'county' ? '12px' : '10px'};
        font-weight: 600;
        color: ${normalizedValue > 0.5 ? 'white' : '#1A5F6B'};
        text-align: center;
        padding: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        transition: transform 0.2s, box-shadow 0.2s;
        opacity: 0.9;
      `;
      el.innerHTML = `<span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;">${item.name}</span>`;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
        el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
        el.style.zIndex = '10';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        el.style.zIndex = '1';
      });

      el.addEventListener('click', () => {
        onSelect(item.id);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([position.center[0] + offset[0], position.center[1] + offset[1]])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (geographyType === 'county') {
      map.current.flyTo({ center: LA_CENTER, zoom: 9 });
    } else {
      map.current.flyTo({ center: LA_CENTER, zoom: 10 });
    }
  }, [data, geographyType, selectedId, colorMetric, mapLoaded, onSelect]);

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-border">
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          {colorMetric === 'population' && 'Population'}
          {colorMetric === 'medianIncome' && 'Median Income'}
          {colorMetric === 'povertyRate' && 'Poverty Rate'}
        </p>
        <div className="flex items-center gap-1">
          {getColorScale(colorMetric).map((color, i) => (
            <div
              key={i}
              className="w-6 h-3 first:rounded-l last:rounded-r"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
