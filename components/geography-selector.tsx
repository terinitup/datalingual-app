'use client';

import { GeoType } from '@/lib/types';
import { getGeographyPluralLabel } from '@/lib/data';
import { Button } from '@/components/ui/button';

interface GeographySelectorProps {
  selected: GeoType;
  onChange: (type: GeoType) => void;
}

const GEOGRAPHY_TYPES: GeoType[] = ['county', 'puma', 'city', 'zip'];

export function GeographySelector({ selected, onChange }: GeographySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {GEOGRAPHY_TYPES.map((type) => (
        <Button
          key={type}
          variant={selected === type ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(type)}
          className="font-sans"
        >
          {getGeographyPluralLabel(type)}
        </Button>
      ))}
    </div>
  );
}
