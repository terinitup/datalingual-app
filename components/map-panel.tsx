'use client';

import dynamic from 'next/dynamic';
import type { MapPanelProps } from './leaflet-map-view';

export type { MapPanelProps } from './leaflet-map-view';

const LeafletMapView = dynamic(() => import('./leaflet-map-view').then((mod) => mod.LeafletMapView), {
  ssr: false,
  loading: () => <div className="h-[700px] w-full rounded-lg bg-muted animate-pulse" aria-busy />,
});

/** Client-only Leaflet map; implementation is loaded with dynamic(..., { ssr: false }). */
export function MapPanel(props: MapPanelProps) {
  return <LeafletMapView {...props} />;
}
