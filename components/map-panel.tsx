'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { GeoArea, GeoType } from '@/lib/types';

interface MapPanelProps {
  geographyType: GeoType;
  data: GeoArea[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  colorMetric: 'population' | 'median_hh_income' | 'lep_pct';
}

const PUMA_GEOJSON_URL = '/geo/pumas.geojson';

const LEP_COLORS = ['#E8F4F8', '#B8DDE6', '#6BB8CC', '#2E8B9A', '#1A5F6B'];

function mergePumaGeojsonWithLep(geojson: GeoJSON.FeatureCollection, data: GeoArea[]): GeoJSON.FeatureCollection {
  const values = data.length > 0 ? data.map((d) => d.lep_pct ?? 0) : [0];
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const byId = new globalThis.Map<string, GeoArea>(data.map((d) => [d.geo_id, d]));

  const features = geojson.features.map((f) => {
    const props: Record<string, unknown> =
      f.properties && typeof f.properties === 'object' ? { ...(f.properties as Record<string, unknown>) } : {};
    const geoId = props.GEOID10 != null ? String(props.GEOID10) : '';
    props.geo_id = geoId;
    const row = geoId ? byId.get(geoId) : undefined;
    const lep = row ? (row.lep_pct ?? 0) : 0;
    const t = (lep - minVal) / range;
    const idx = Math.min(Math.floor(t * LEP_COLORS.length), LEP_COLORS.length - 1);
    props._color = LEP_COLORS[idx];
    return { ...f, properties: props };
  });

  return { type: 'FeatureCollection', features };
}

export function MapPanel({
  geographyType: _geographyType,
  data,
  selectedId: _selectedId,
  onSelect,
  colorMetric: _colorMetric,
}: MapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const onSelectRef = useRef(onSelect);
  const dataRef = useRef(data);

  onSelectRef.current = onSelect;
  dataRef.current = data;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

    const map = new mapboxgl.Map({
      container: el,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-118.2437, 34.0522],
      zoom: 9,
    });

    mapRef.current = map;

    const onClick = (e: mapboxgl.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      const geoId = feature?.properties?.geo_id;
      if (typeof geoId === 'string' && geoId) {
        onSelectRef.current(geoId);
      }
    };

    const onEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };
    const onLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('load', () => {
      void (async () => {
        const res = await fetch(PUMA_GEOJSON_URL);
        if (!res.ok) return;
        const raw = (await res.json()) as GeoJSON.FeatureCollection;
        const merged = mergePumaGeojsonWithLep(raw, dataRef.current);

        map.addSource('pumas', {
          type: 'geojson',
          data: merged,
        });

        map.addLayer({
          id: 'pumas-fill',
          type: 'fill',
          source: 'pumas',
          paint: {
            'fill-color': ['get', '_color'] as mapboxgl.ExpressionSpecification,
            'fill-opacity': 0.72,
          },
        });

        map.on('click', 'pumas-fill', onClick);
        map.on('mouseenter', 'pumas-fill', onEnter);
        map.on('mouseleave', 'pumas-fill', onLeave);
      })();
    });

    return () => {
      map.off('click', 'pumas-fill', onClick);
      map.off('mouseenter', 'pumas-fill', onEnter);
      map.off('mouseleave', 'pumas-fill', onLeave);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;

    void (async () => {
      const res = await fetch(PUMA_GEOJSON_URL);
      if (!res.ok) return;
      const raw = (await res.json()) as GeoJSON.FeatureCollection;
      const merged = mergePumaGeojsonWithLep(raw, data);

      const src = map.getSource('pumas') as mapboxgl.GeoJSONSource | undefined;
      if (src) {
        src.setData(merged);
      }
    })();
  }, [data]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-border">
      <div ref={containerRef} style={{ width: '100%', height: '500px' }} />
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border z-10 pointer-events-none">
        <p className="text-xs font-medium text-muted-foreground mb-2">LEP %</p>
        <div className="flex items-center gap-1">
          {LEP_COLORS.map((color, i) => (
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
