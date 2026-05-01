'use client';

import { useEffect, useRef, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import type { FeatureCollection } from 'geojson';
import type { GeoArea, GeoType } from '@/lib/types';

export interface MapPanelProps {
  geographyType: GeoType;
  data: GeoArea[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  colorMetric: 'population' | 'median_hh_income' | 'lep_pct';
}

const GEO_PATHS: Record<GeoType, string> = {
  puma: '/geo/pumas.geojson',
  city: '/geo/cities.geojson',
  county: '/geo/county.geojson',
  zip: '/geo/zips.geojson',
};

const LEP_LEGEND = [
  { label: '< 10%', color: '#1D9E75' },
  { label: '10–20%', color: '#8BC34A' },
  { label: '20–30%', color: '#FFC107' },
  { label: '30–40%', color: '#FF7043' },
  { label: '≥ 40%', color: '#C4501A' },
] as const;

function getNativeGeoId(type: GeoType, props: Record<string, unknown>): string {
  switch (type) {
    case 'county':
      return props.GEOID != null ? String(props.GEOID) : '';
    case 'puma':
      return props.GEOID10 != null ? String(props.GEOID10) : '';
    case 'city':
      return props.GEOID != null ? String(props.GEOID) : '';
    case 'zip':
      return props.GEOID20 != null ? String(props.GEOID20) : '';
    default:
      return '';
  }
}

function getMetricColor(value: number, metric: string): string {
  if (metric === 'lep_pct') {
    if (value < 10) return '#1D9E75';
    if (value < 20) return '#8BC34A';
    if (value < 30) return '#FFC107';
    if (value < 40) return '#FF7043';
    return '#C4501A';
  }
  if (metric === 'poverty_pct') {
    if (value < 10) return '#1D9E75';
    if (value < 20) return '#8BC34A';
    if (value < 30) return '#FFC107';
    if (value < 40) return '#FF7043';
    return '#C4501A';
  }
  if (metric === 'median_hh_income') {
    if (value > 100000) return '#1D9E75';
    if (value > 75000) return '#8BC34A';
    if (value > 50000) return '#FFC107';
    if (value > 30000) return '#FF7043';
    return '#C4501A';
  }
  if (metric === 'population') {
    if (value > 200000) return '#C4501A';
    if (value > 150000) return '#FF7043';
    if (value > 100000) return '#FFC107';
    if (value > 50000) return '#8BC34A';
    return '#1D9E75';
  }
  return '#94a3b8';
}

function mergeGeojsonWithLep(
  geojson: FeatureCollection,
  data: GeoArea[],
  geographyType: GeoType,
  colorMetric: string,
): FeatureCollection {
  const byId = new globalThis.Map<string, GeoArea>(data.map((d) => [d.geo_id, d]));

  const features = geojson.features.map((f) => {
    const props: Record<string, unknown> =
      f.properties && typeof f.properties === 'object' ? { ...(f.properties as Record<string, unknown>) } : {};
    const gid = getNativeGeoId(geographyType, props);
    props.geo_id = gid;
    const row = gid ? byId.get(gid) : undefined;
    const value = row ? (row[colorMetric as keyof GeoArea] as number ?? 0) : 0;
    props._fillColor = getMetricColor(value, colorMetric);
    return { ...f, properties: props };
  });

  return { type: 'FeatureCollection', features };
}

/** Leaflet center is [latitude, longitude] — same point as [-118.2437, 34.0522] in lng/lat form. */
const LA_CENTER: [number, number] = [34.0522, -118.2437];
const MAP_ZOOM = 10;
const MAP_HEIGHT_PX = 500;

function invalidateMapSize(map: LeafletMap | null) {
  if (!map) return;
  map.invalidateSize();
  requestAnimationFrame(() => {
    map.invalidateSize();
  });
  window.setTimeout(() => map.invalidateSize(), 100);
}

/** Leaflet + react-leaflet only run in this module; load via dynamic({ ssr: false }) from map-panel. */
export function LeafletMapView({
  geographyType,
  data,
  onSelect,
  selectedId,
  colorMetric,
}: MapPanelProps) {
  const [merged, setMerged] = useState<FeatureCollection | null>(null);
  const [clientReady, setClientReady] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const res = await fetch(GEO_PATHS[geographyType]);
      if (!res.ok || cancelled) return;
      const raw = (await res.json()) as FeatureCollection;
      if (cancelled) return;
      setMerged(mergeGeojsonWithLep(raw, data, geographyType, colorMetric));
    }

    load().catch((err) => console.error('GeoJSON load failed:', err));

    return () => {
      cancelled = true;
    };
  }, [geographyType, data, colorMetric]);

  useEffect(() => {
    if (!mapReady || !wrapperRef.current) return;

    const ro = new ResizeObserver(() => {
      invalidateMapSize(mapRef.current);
    });
    ro.observe(wrapperRef.current);

    return () => ro.disconnect();
  }, [mapReady]);

  return (
    <div ref={wrapperRef} className="relative w-full rounded-lg overflow-hidden border border-border">
      {clientReady ? (
        <MapContainer
          ref={mapRef}
          center={LA_CENTER}
          zoom={MAP_ZOOM}
          style={{ width: '100%', height: MAP_HEIGHT_PX, zIndex: 0 }}
          scrollWheelZoom
          whenReady={() => {
            invalidateMapSize(mapRef.current);
            setMapReady(true);
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {merged && (
            <GeoJSON
              key={geographyType}
              data={merged}
              style={(feature) => {
                const fill =
                  feature?.properties && typeof feature.properties === 'object' && '_fillColor' in feature.properties
                    ? String((feature.properties as { _fillColor: string })._fillColor)
                    : '#94a3b8';
                const gid =
                  feature?.properties && typeof feature.properties === 'object' && 'geo_id' in feature.properties
                    ? String((feature.properties as { geo_id: string }).geo_id)
                    : '';
                const selected = selectedId && gid === selectedId;
                return {
                  fillColor: fill,
                  fillOpacity: 0.72,
                  color: selected ? '#1a56a0' : '#ffffff',
                  weight: selected ? 3 : 1,
                  zIndex: selected ? 1000 : 1,
                };
              }}
              onEachFeature={(feature, layer) => {
                layer.on('click', () => {
                  const id =
                    feature.properties && typeof feature.properties === 'object' && 'geo_id' in feature.properties
                      ? String((feature.properties as { geo_id: string }).geo_id)
                      : '';
                      if (id) {
                        onSelect(id);
                        if ('bringToFront' in layer) {
                          (layer as import('leaflet').Path).bringToFront?.();
                        }
                      }
                    });
                  }}
                />
              )}
            </MapContainer>
          ) : (
        <div className="w-full bg-muted animate-pulse rounded-lg" style={{ height: MAP_HEIGHT_PX }} aria-hidden />
      )}

      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border z-[1000] pointer-events-none">
        <p className="text-xs font-medium text-muted-foreground mb-2">LEP %</p>
        <div className="flex flex-col gap-1">
          {LEP_LEGEND.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-3 w-6 shrink-0 rounded-sm border border-border" style={{ backgroundColor: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
