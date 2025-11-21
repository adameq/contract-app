/**
 * App Header Component
 *
 * Shared header for all application pages (form steps and standalone pages).
 * Provides consistent branding and theme toggle across the entire application.
 *
 * ARCHITECTURE:
 * - Single source of truth for logo and theme toggle
 * - Minimalist design: logo left, theme toggle right
 * - Consistent layout across all breakpoints (no responsive complexity)
 *
 * USAGE:
 * ```tsx
 * <AppHeader />
 * ```
 */

import { Link } from 'react-router-dom';

import logoDark from '@/assets/logo-thespace-dark.svg';
import logoLight from '@/assets/logo-thespace-light.svg';
import { ThemeToggle } from '@/shared/components/common/ThemeToggle';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3 md:py-4">
          {/* Logo - left side */}
          <Link
            to="/"
            className="w-36 sm:w-40 md:w-36 lg:w-40 xl:w-44 flex-shrink-0 transition-all duration-300 ease-out hover:scale-105"
          >
            <img
              src={logoDark}
              alt="Logo The Space"
              width="505"
              height="122"
              className="w-full h-auto dark:hidden drop-shadow-md filter brightness-100 contrast-110"
            />
            <img
              src={logoLight}
              alt="Logo The Space"
              width="505"
              height="122"
              className="w-full h-auto hidden dark:block drop-shadow-md filter brightness-100 contrast-110"
            />
          </Link>

          {/* Theme toggle - right side */}
          <div className="flex-shrink-0">
            <div className="p-1 rounded-lg bg-muted/50 backdrop-blur-sm border border-border/30 shadow-sm hover:shadow-md transition-all duration-200">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
