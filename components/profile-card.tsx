'use client';

import { GeographyData } from '@/lib/types';
import { formatNumber, formatPercent, formatCurrency } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Home, GraduationCap, Briefcase, Heart } from 'lucide-react';

interface ProfileCardProps {
  data: GeographyData;
  onCompare?: () => void;
  isComparing?: boolean;
}

export function ProfileCard({ data, onCompare, isComparing }: ProfileCardProps) {
  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-serif text-xl text-foreground">{data.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {data.type === 'puma' ? 'Public Use Microdata Area' : data.type.charAt(0).toUpperCase() + data.type.slice(1)}
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
        {/* Demographics Section */}
        <section>
          <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Demographics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatItem label="Total Population" value={formatNumber(data.demographics.totalPopulation)} />
            <StatItem label="Median Age" value={data.demographics.medianAge.toString()} />
            <StatItem label="Male" value={formatPercent(data.demographics.malePercent)} />
            <StatItem label="Female" value={formatPercent(data.demographics.femalePercent)} />
          </div>
          
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Race/Ethnicity</p>
            <div className="space-y-2">
              {Object.entries(data.demographics.raceEthnicity).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(value, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {formatPercent(value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Economics Section */}
        <section>
          <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Economics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatItem label="Median Income" value={formatCurrency(data.economics.medianHouseholdIncome)} />
            <StatItem label="Per Capita Income" value={formatCurrency(data.economics.perCapitaIncome)} />
            <StatItem label="Poverty Rate" value={formatPercent(data.economics.povertyRate)} highlight={data.economics.povertyRate > 15} />
            <StatItem label="Unemployment" value={formatPercent(data.economics.unemploymentRate)} />
          </div>
        </section>

        {/* Housing Section */}
        <section>
          <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Home className="h-4 w-4" />
            Housing
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatItem label="Total Units" value={formatNumber(data.housing.totalUnits)} />
            <StatItem label="Median Home Value" value={formatCurrency(data.housing.medianHomeValue)} />
            <StatItem label="Owner Occupied" value={formatPercent(data.housing.ownerOccupiedPercent)} />
            <StatItem label="Renter Occupied" value={formatPercent(data.housing.renterOccupiedPercent)} />
            <StatItem label="Median Rent" value={formatCurrency(data.housing.medianRent)} />
            <StatItem label="Vacancy Rate" value={formatPercent(data.housing.vacancyRate)} />
          </div>
        </section>

        {/* Education Section */}
        <section>
          <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Education
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatItem label="High School+" value={formatPercent(data.education.highSchoolOrHigher)} />
            <StatItem label="Bachelor&apos;s+" value={formatPercent(data.education.bachelorsOrHigher)} />
            <StatItem label="Graduate Degree" value={formatPercent(data.education.graduateOrProfessional)} />
          </div>
        </section>

        {/* Employment Section */}
        <section>
          <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Employment
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatItem label="Labor Force" value={formatNumber(data.employment.laborForce)} />
            <StatItem label="Employed" value={formatNumber(data.employment.employed)} />
          </div>
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">Top Industries</p>
            <div className="flex flex-wrap gap-1">
              {data.employment.topIndustries.slice(0, 3).map((industry) => (
                <Badge key={industry} variant="secondary" className="text-xs">
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Health Section */}
        <section>
          <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Health
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatItem label="With Insurance" value={formatPercent(data.health.withHealthInsurance)} />
            <StatItem label="Uninsured" value={formatPercent(data.health.withoutHealthInsurance)} highlight={data.health.withoutHealthInsurance > 10} />
            <StatItem label="With Disability" value={formatPercent(data.health.withDisability)} />
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

function StatItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-destructive' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}
