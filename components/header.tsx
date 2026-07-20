'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MapPin, BarChart3, GitCompare, Download, X } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6 max-w-none">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <MapPin className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-bold text-foreground">
                DataLingual LA
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button
                  variant={pathname === '/' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Explorer
                </Button>
              </Link>
              <Link href="/compare">
                <Button
                  variant={pathname === '/compare' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <GitCompare className="h-4 w-4" />
                  Compare
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <button
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-[#2E8B9A] text-white hover:bg-[#267a88] shadow-md transition-colors"
            >
              About
            </button>
          </div>
        </div>
      </header>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAbout(false)} />
          <div className="relative bg-card rounded-2xl shadow-2xl border border-border max-w-lg w-full p-8 z-10 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowAbout(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-1">DataLingual</h2>
            <p className="text-sm text-muted-foreground italic mb-6">Interpreting data. Serving communities.</p>
            <div className="space-y-4 text-sm text-foreground">
              <p>
                DataLingual is an interactive data dashboard designed to help nonprofits, service providers, and community organizations understand the language access needs of communities across Los Angeles.
              </p>
              <p>
                Growing up in Koreatown, founder Terin Lee witnessed firsthand how language barriers limit access to essential services for immigrant and Limited English Proficient (LEP) communities. She built DataLingual to address a critical gap: the lack of disaggregated, community-level data that makes the needs of marginalized populations visible — and actionable.
              </p>
              <p>
                By mapping LEP populations alongside poverty, education, housing, and digital access indicators, DataLingual empowers organizations to identify underserved communities and direct resources where they are needed most.
              </p>
              <p>
                Data is sourced from the American Community Survey (ACS) 2019–2023 5-year estimates via IPUMS and the U.S. Census Bureau.
              </p>
              <div className="pt-2 border-t border-border space-y-3">
                <p className="text-muted-foreground">Built by <span className="text-foreground font-medium">Terin Lee</span></p>
                <p className="text-muted-foreground text-xs italic">&ldquo;Interpreting data. Serving communities.&rdquo;</p>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-foreground mb-2">Data Citation</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Steven Ruggles, Sarah Flood, Matthew Sobek, Daniel Backman, Grace Cooper, Julia A. Rivera Drew, Stephanie Richards, Renae Rodgers, Jonathan Schroeder, and Kari C.W. Williams. <em>IPUMS USA: Version 16.0 [dataset].</em> Minneapolis, MN: IPUMS, 2025.{' '}
                    <a href="https://doi.org/10.18128/D010.V16.0" target="_blank" rel="noreferrer" className="underline hover:text-foreground">doi.org/10.18128/D010.V16.0</a>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    IPUMS USA, University of Minnesota,{' '}
                    <a href="https://www.ipums.org" target="_blank" rel="noreferrer" className="underline hover:text-foreground">www.ipums.org</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
