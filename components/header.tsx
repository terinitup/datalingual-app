'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6 max-w-none">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <span className="font-serif text-xl font-bold text-foreground">
                DataLingual
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button
                  variant={pathname === '/' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  Explorer
                </Button>
              </Link>
              <Link href="/historical">
                <Button
                  variant={pathname === '/historical' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  Historical Demographics
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
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
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">DataLingual</h2>
            <div className="space-y-4 text-sm text-foreground">
              <p>
                DataLingual is an interactive geospatial dashboard that maps Limited English Proficient (LEP) populations alongside poverty, education, housing, and digital access indicators. In doing so, DataLingual allows agencies to understand the communities they serve and direct resources where they are needed most.
              </p>
              <p>
                Data is sourced from the American Community Survey (ACS). County and city profiles come from the Migration Policy Institute&apos;s Characteristics by Language among Individuals with LEP (ACS 2019–2023). PUMA-level data comes from IPUMS USA (ACS 2020–2024).
              </p>
              <div className="pt-2 border-t border-border space-y-3">
                <p className="text-muted-foreground">Built by <span className="text-foreground font-medium">Terin Lee</span></p>
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
