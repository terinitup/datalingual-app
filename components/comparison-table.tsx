'use client';

import { GeoArea } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface ComparisonTableProps {
  data: GeoArea[];
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

function formatCurrency(n: number | null): string {
  if (n === null) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

interface MetricRow {
  category: string;
  metric: string;
  getValue: (d: GeoArea) => number | null;
  format: (v: number | null) => string;
  higherIsBetter: boolean;
}

const METRICS: MetricRow[] = [
  {
    category: 'Population',
    metric: 'Total Population',
    getValue: (d) => d.population,
    format: (v) => v !== null ? formatNumber(v) : 'N/A',
    higherIsBetter: true,
  },
  {
    category: 'Population',
    metric: 'LEP Population',
    getValue: (d) => d.lep_total,
    format: (v) => v !== null ? formatNumber(v) : 'N/A',
    higherIsBetter: false,
  },
  {
    category: 'Language',
    metric: 'LEP Rate',
    getValue: (d) => d.lep_pct,
    format: (v) => v !== null ? formatPercent(v) : 'N/A',
    higherIsBetter: false,
  },
  {
    category: 'Language',
    metric: 'English Only',
    getValue: (d) => d.proficiency?.english_only_pct ?? null,
    format: (v) => v !== null ? formatPercent(v) : 'N/A',
    higherIsBetter: true,
  },
  {
    category: 'Language',
    metric: 'Bilingual',
    getValue: (d) => d.proficiency?.bilingual_pct ?? null,
    format: (v) => v !== null ? formatPercent(v) : 'N/A',
    higherIsBetter: true,
  },
  {
    category: 'Economics',
    metric: 'Median Household Income',
    getValue: (d) => d.median_hh_income,
    format: formatCurrency,
    higherIsBetter: true,
  },
  {
    category: 'Economics',
    metric: 'Poverty Rate',
    getValue: (d) => d.poverty_pct,
    format: (v) => v !== null ? formatPercent(v) : 'N/A',
    higherIsBetter: false,
  },
  {
    category: 'Economics',
    metric: 'SNAP Recipients',
    getValue: (d) => d.snap_pct,
    format: (v) => v !== null ? formatPercent(v) : 'N/A',
    higherIsBetter: false,
  },
  {
    category: 'Education',
    metric: 'Under 9th Grade',
    getValue: (d) => d.education?.under_9th_pct ?? null,
    format: (v) => v !== null ? formatPercent(v) : 'N/A',
    higherIsBetter: false,
  },
  {
    category: 'Education',
    metric: "Bachelor's or Higher",
    getValue: (d) => d.education?.ba_higher_pct ?? null,
    format: (v) => v !== null ? formatPercent(v) : 'N/A',
    higherIsBetter: true,
  },
  {
    category: 'Access',
    metric: 'No Internet',
    getValue: (d) => d.no_internet_pct,
    format: (v) => v !== null ? formatPercent(v) : 'N/A',
    higherIsBetter: false,
  },
  {
    category: 'Access',
    metric: 'Linguistically Isolated',
    getValue: (d) => d.access?.linguistically_isolated_pct ?? null,
    format: (v) => v !== null ? formatPercent(v) : 'N/A',
    higherIsBetter: false,
  },
];

export function ComparisonTable({ data }: ComparisonTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Select areas to compare
        </CardContent>
      </Card>
    );
  }

  const getComparisonIndicator = (value: number | null, values: (number | null)[], higherIsBetter: boolean) => {
    const validValues = values.filter((v): v is number => v !== null);
    if (value === null || validValues.length < 2) return null;

    const best = higherIsBetter ? Math.max(...validValues) : Math.min(...validValues);
    const worst = higherIsBetter ? Math.min(...validValues) : Math.max(...validValues);

    if (value === best) {
      return <Badge variant="default" className="bg-green-600"><ArrowUp className="h-3 w-3 mr-1" />Best</Badge>;
    }
    if (value === worst && validValues.length > 1) {
      return <Badge variant="destructive"><ArrowDown className="h-3 w-3 mr-1" />Lowest</Badge>;
    }
    return <Badge variant="secondary"><Minus className="h-3 w-3 mr-1" />Mid</Badge>;
  };

  let currentCategory = '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Side-by-Side Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Metric</TableHead>
                {data.map((d) => (
                  <TableHead key={d.geo_id} className="text-center min-w-32">
                    {d.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {METRICS.map((row, idx) => {
                const showCategory = row.category !== currentCategory;
                currentCategory = row.category;
                const values = data.map((d) => row.getValue(d));

                return (
                  <>
                    {showCategory && (
                      <TableRow key={`category-${row.category}`} className="bg-muted/50">
                        <TableCell colSpan={data.length + 1} className="font-semibold text-sm uppercase tracking-wide text-muted-foreground py-2">
                          {row.category}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{row.metric}</TableCell>
                      {data.map((d) => {
                        const value = row.getValue(d);
                        return (
                          <TableCell key={d.geo_id} className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-semibold">{row.format(value)}</span>
                              {data.length > 1 && getComparisonIndicator(value, values, row.higherIsBetter)}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
