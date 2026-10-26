'use client';

import { GeoArea } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users,  Globe, Languages } from 'lucide-react';

interface ProfileCardProps {
  data: GeoArea;
  onCompare?: () => void;
  isComparing?: boolean;
}

function formatNumber(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return 'N/A';
  return new Intl.NumberFormat('en-US').format(n);
}

function formatPercent(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return 'N/A';
  return `${n.toFixed(1)}%`;
}

function formatCurrency(n: number | null): string {
  if (n === null || n === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function ProfileCard({ data, onCompare, isComparing }: ProfileCardProps) {
  if (!data || !data.geo_type) {
    return null;
  }

  const geoTypeLabel = {
    county: 'County',
    puma: 'Public Use Microdata Area',
    city: 'City',
    zip: 'ZIP Code',
  };

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-serif text-xl text-foreground">{data.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {geoTypeLabel[data.geo_type]}
            </p>
          </div>
          {onCompare && (
            <Badge
              variant={isComparing ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={onCompare}
            >
              {isComparing ? 'Comparing' : 'Compare'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Population
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatItem label="Total Population" value={formatNumber(data.population)} />
            <StatItem label="Top Language Population with LEP" value={data.top_language ?? 'N/A'} />
            <StatItem label="Population with LEP" value={formatNumber(data.lep_total)} />
            <StatItem 
              label="LEP Rate" 
              value={formatPercent(data.lep_pct)} 
            />
          </div>
        </section>

        <section>
          <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Language Proficiency
          </h3>
          <div className="space-y-2">
          <ProgressItem label="English Only" value={data.proficiency?.english_only_pct} />
<ProgressItem label="Bilingual" value={data.proficiency?.bilingual_pct} />
<ProgressItem label="Limited English Proficient" value={data.proficiency?.lep_pct} color="destructive" />
          </div>
        </section>

        {data.languages && data.languages.length > 0 && (
          <section>
            <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Top Languages (LEP Speakers)
            </h3>
            <div className="space-y-2">
              {data.languages.slice(0, 5).map((lang) => (
                <div key={lang.name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{lang.name}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(lang.lep_count)} ({formatPercent(lang.lep_pct_of_area)})
                  </span>
                </div>
              ))}
            </div>
            {data.languages.length > 5 && (
  <p className="text-xs text-muted-foreground mt-2 italic">
    See the Languages Spoken tab below for all {data.languages.length} languages.
  </p>
)}
        </section>
        )}
        
      </CardContent>
    </Card>
  );
}

function StatItem({ 
  label, 
  value, 
  highlight,
  benchmark 
}: { 
  label: string; 
  value: string; 
  highlight?: boolean;
  benchmark?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-destructive' : 'text-foreground'}`}>
        {value}
      </p>
      {benchmark && (
        <p className="text-xs text-muted-foreground">{benchmark}</p>
      )}
    </div>
  );
}

function ProgressItem({ 
  label, 
  value, 
  color = 'primary' 
}: { 
  label: string; 
  value: number | null | undefined; 
  color?: 'primary' | 'destructive' | 'warning' | 'success';
}) {
  const colorClasses = {
    primary: 'bg-primary',
    destructive: 'bg-destructive',
    warning: 'bg-amber-500',
    success: 'bg-green-600',
  };

  const safeValue = value != null && !isNaN(value) ? value : 0;

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${colorClasses[color]}`}
            style={{ width: `${Math.min(safeValue, 100)}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground w-12 text-right">
          {value != null && !isNaN(value) ? `${value.toFixed(1)}%` : 'N/A'}
        </span>
      </div>
    </div>
  );
}