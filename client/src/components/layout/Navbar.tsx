import React from 'react';
import { Menu, Search } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({
  onMenuClick,
  title,
  subtitle,
  searchValue,
  onSearchChange,
  actions,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-border dark:border-border-dark px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="btn-ghost rounded-lg p-2 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2
              className="text-lg md:text-xl font-bold text-text-primary dark:text-text-dark"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-text-tertiary mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Search + Actions */}
        <div className="flex items-center gap-3">
          {onSearchChange && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="input pl-10 pr-4 py-2 w-64 text-sm rounded-full bg-surface-secondary dark:bg-surface-dark-tertiary border-transparent focus:border-accent"
              />
            </div>
          )}
          {actions}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
