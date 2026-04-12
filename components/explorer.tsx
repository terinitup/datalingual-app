'use client';

import { useState, useEffect } from 'react';
import { GeoArea, GeoType } from '@/lib/types';
import { fetchGeographyData, getGeographyLabel } from '@/lib/data';
import { MapPanel } from './map-panel';
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
  const [geographyType, setGeographyType] = useState<GeoType>('county');
  const [data, setData] = useState<GeoArea[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [colorMetric, setColorMetric] = useState<'population' | 'median_hh_income' | 'lep_pct'>('population');

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

  const selectedData = Array.isArray(data) ? data.find((d) => d.geo_id === selectedId) ?? null : null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-border bg-card">
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
              <SelectItem value="median_hh_income">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Median Income
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
          {data.length} {getGeographyLabel(geographyType)}{data.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Map Panel */}
        <div className="h-[500px] lg:h-full lg:flex-[3] p-4 min-h-[600px]">
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
        <div className="lg:w-72 lg:flex-none border-t lg:border-t-0 lg:border-l border-border overflow-auto">
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
                Select an area on the map to view details
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
