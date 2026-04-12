'use client';

import { GeographyData } from '@/lib/types';
import { formatNumber, formatPercent, formatCurrency } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface ComparisonTableProps {
  data: GeographyData[];
}

interface MetricRow {
  category: string;
  metric: string;
  getValue: (d: GeographyData) => number;
  format: (v: number) => string;
  higherIsBetter: boolean;
}

const METRICS: MetricRow[] = [
  {
    category: 'Demographics',
    metric: 'Total Population',
    getValue: (d) => d.demographics.totalPopulation,
    format: formatNumber,
    higherIsBetter: true,
  },
  {
    category: 'Demographics',
    metric: 'Median Age',
    getValue: (d) => d.demographics.medianAge,
    format: (v) => v.toFixed(1),
    higherIsBetter: true,
  },
  {
    category: 'Economics',
    metric: 'Median Household Income',
    getValue: (d) => d.economics.medianHouseholdIncome,
    format: formatCurrency,
    higherIsBetter: true,
  },
  {
    category: 'Economics',
    metric: 'Poverty Rate',
    getValue: (d) => d.economics.povertyRate,
    format: formatPercent,
    higherIsBetter: false,
  },
  {
    category: 'Economics',
    metric: 'Unemployment Rate',
    getValue: (d) => d.economics.unemploymentRate,
    format: formatPercent,
    higherIsBetter: false,
  },
  {
    category: 'Housing',
    metric: 'Median Home Value',
    getValue: (d) => d.housing.medianHomeValue,
    format: formatCurrency,
    higherIsBetter: true,
  },
  {
    category: 'Housing',
    metric: 'Median Rent',
    getValue: (d) => d.housing.medianRent,
    format: formatCurrency,
    higherIsBetter: false,
  },
  {
    category: 'Housing',
    metric: 'Owner Occupied',
    getValue: (d) => d.housing.ownerOccupiedPercent,
    format: formatPercent,
    higherIsBetter: true,
  },
  {
    category: 'Education',
    metric: 'High School or Higher',
    getValue: (d) => d.education.highSchoolOrHigher,
    format: formatPercent,
    higherIsBetter: true,
  },
  {
    category: 'Education',
    metric: "Bachelor's or Higher",
    getValue: (d) => d.education.bachelorsOrHigher,
    format: formatPercent,
    higherIsBetter: true,
  },
  {
    category: 'Health',
    metric: 'With Health Insurance',
    getValue: (d) => d.health.withHealthInsurance,
    format: formatPercent,
    higherIsBetter: true,
  },
  {
    category: 'Health',
    metric: 'With Disability',
    getValue: (d) => d.health.withDisability,
    format: formatPercent,
    higherIsBetter: false,
  },
];

export function ComparisonTable({ data }: ComparisonTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Select areas to compare
        </CardContent>
      </Card>
    );
  }

  const getComparisonIndicator = (value: number, values: number[], higherIsBetter: boolean) => {
    const best = higherIsBetter ? Math.max(...values) : Math.min(...values);
    const worst = higherIsBetter ? Math.min(...values) : Math.max(...values);

    if (value === best) {
      return <Badge variant="default" className="bg-green-600"><ArrowUp className="h-3 w-3 mr-1" />Best</Badge>;
    }
    if (value === worst && values.length > 1) {
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
                  <TableHead key={d.id} className="text-center min-w-32">
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
                          <TableCell key={d.id} className="text-center">
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
