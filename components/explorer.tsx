'use client';

import { useState, useEffect } from 'react';
import { GeoArea, GeoType } from '@/lib/types';
import { fetchGeographyData, getGeographyLabel, getGeographyPluralLabel } from '@/lib/data';import { MapPanel } from './map-panel';
import { ProfileCard } from './profile-card';
import { DemographicsChart } from './demographics-chart';
import { EconomicsChart } from './economics-chart';
import { GeographySelector } from './geography-selector';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, DollarSign, Globe } from 'lucide-react';

export function Explorer() {
  const [geographyType, setGeographyType] = useState<GeoType>('puma');
  const [data, setData] = useState<GeoArea[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGeoInfo, setShowGeoInfo] = useState(true);
  const [colorMetric, setColorMetric] = useState<'population' | 'lep_pct'>('lep_pct');
  const GEO_INFO: Record<GeoType, string> = {
    county: 'Showing LA County and Orange County. County-level data offers the most detailed language breakdowns (39+ groups). Data from IPUMS ACS 2019–2023.',
    city: 'Showing 11 major LA County cities. Not all cities are included due to data availability at the city level. Data from IPUMS ACS 2019–2024.',
    puma: 'Showing 71 Public Use Microdata Areas (PUMAs) covering LA County. Data from IPUMS ACS 2020–2024.',
    zip: '',
  };
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const result = await fetchGeographyData(geographyType);
        setData(result);
        if (result.length > 0) {
          setSelectedId(result[0].geo_id);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [geographyType]);

  useEffect(() => {
    setShowGeoInfo(true);
  }, [geographyType]);

  const selectedData = Array.isArray(data) ? data.find((d) => d.geo_id === selectedId) ?? null : null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-border bg-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <GeographySelector selected={geographyType} onChange={setGeographyType} />
          
          <Select value={colorMetric} onValueChange={(v) => setColorMetric(v as typeof colorMetric)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Color by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="population">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Population
                </span>
              </SelectItem>
              
              <SelectItem value="lep_pct">
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  LEP Rate
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
        {geographyType === 'city' ? '11' : data.length} {data.length !== 1 ? getGeographyPluralLabel(geographyType) : getGeographyLabel(geographyType)} available
        </div>
      </div>

      {showGeoInfo && GEO_INFO[geographyType] && (
        <div className="mx-4 mt-3 flex items-start justify-between gap-3 bg-[#2E8B9A]/10 border border-[#2E8B9A]/30 rounded-lg px-4 py-3 text-sm text-foreground">
          <p>{GEO_INFO[geographyType]}</p>
          <button onClick={() => setShowGeoInfo(false)} className="text-muted-foreground hover:text-foreground shrink-0 text-xs">✕</button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Map Panel */}
        <div className="lg:h-full lg:flex-[2] p-4">
          {loading ? (
            <Skeleton className="h-full w-full rounded-lg" />
          ) : (
            <MapPanel
              geographyType={geographyType}
              data={data}
              selectedId={selectedId}
              onSelect={setSelectedId}
              colorMetric={colorMetric}
            />
          )}
        </div>

      

        {/* Profile Panel */}
        <div className="lg:w-96 lg:flex-none border-t lg:border-t-0 lg:border-l border-border overflow-y-auto max-h-[500px]">
          {loading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : selectedData ? (
            <div className="h-full">
              <ProfileCard data={selectedData} />
            </div>
          ) : (
            <Card className="m-4">
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>Select an area on the map to view details</p>
                {(geographyType === 'puma' || geographyType === 'city') && (
                  <p className="text-xs mt-2 px-4">Some areas shown in grey are not matched in this dataset. PUMA boundaries are based on 2010 Census definitions. Data reflects ACS 2019–2023 5-year estimates.</p>)}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Charts Section */}
      {selectedData && !loading && (
        <div className="border-t border-border p-4 bg-muted/30">
          <Tabs defaultValue="demographics" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="demographics">Language & Demographics</TabsTrigger>
              <TabsTrigger value="economics">Economics & Wellbeing</TabsTrigger>
            </TabsList>
            <TabsContent value="demographics">
              <DemographicsChart data={selectedData} />
            </TabsContent>
            <TabsContent value="economics">
              <EconomicsChart data={selectedData} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
