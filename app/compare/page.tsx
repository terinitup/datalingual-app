'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { GeographySelector } from '@/components/geography-selector';
import { ComparisonTable } from '@/components/comparison-table';
import { DemographicsChart } from '@/components/demographics-chart';
import { EconomicsChart } from '@/components/economics-chart';
import { GeoArea, GeoType } from '@/lib/types';
import { fetchGeographyData } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { X, Plus } from 'lucide-react';

export default function ComparePage() {
  const [geographyType, setGeographyType] = useState<GeoType>('city');
  const [data, setData] = useState<GeoArea[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const result = await fetchGeographyData(geographyType);
        setData(result);
        // Pre-select first two items for comparison
        if (result.length >= 2) {
          setSelectedIds([result[0].geo_id, result[1].geo_id]);
        } else if (result.length === 1) {
          setSelectedIds([result[0].geo_id]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [geographyType]);

  const selectedData = Array.isArray(data) ? data.filter((d) => selectedIds.includes(d.geo_id)) : [];
  const availableToAdd = Array.isArray(data) ? data.filter((d) => !selectedIds.includes(d.geo_id)) : [];

  const handleRemove = (id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const handleAdd = (id: string) => {
    if (selectedIds.length < 4) {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Compare Areas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select up to 4 areas to compare side-by-side
            </p>
          </div>
          <GeographySelector selected={geographyType} onChange={setGeographyType} />
        </div>

        {/* Selection Area */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-sans">Selected Areas ({selectedIds.length}/4)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex gap-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-32" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedData.map((item) => (
                  <Badge
                    key={item.geo_id}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm flex items-center gap-2"
                  >
                    {item.name}
                    <button
                      onClick={() => handleRemove(item.geo_id)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}

                {selectedIds.length < 4 && availableToAdd.length > 0 && (
                  <div className="relative group">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Plus className="h-3 w-3" />
                      Add Area
                    </Button>
                    <div className="absolute top-full left-0 mt-1 w-64 max-h-48 overflow-auto bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      {availableToAdd.map((item) => (
                        <button
                          key={item.geo_id}
                          onClick={() => handleAdd(item.geo_id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison Content */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : selectedData.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>Select at least one area to view comparison data</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="table">Data Table</TabsTrigger>
              <TabsTrigger value="demographics">Language</TabsTrigger>
              <TabsTrigger value="economics">Economics</TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <ComparisonTable data={selectedData} />
            </TabsContent>

            <TabsContent value="demographics">
              {selectedData.length >= 1 && (
                <DemographicsChart
                  data={selectedData[0]}
                  compareData={selectedData[1]}
                />
              )}
            </TabsContent>

            <TabsContent value="economics">
              {selectedData.length >= 1 && (
                <EconomicsChart
                  data={selectedData[0]}
                  compareData={selectedData[1]}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
