/**
 * Header component with navigation
 * Sticky header with logo, navigation links, and usage counter
 */

import { Link, useLocation } from 'wouter';
import { Sparkles, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { getUsageStats, getDailyLimit, getMonthlyLimit } from '@/utils/localStorage';

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState(getUsageStats());
  const dailyLimit = getDailyLimit();
  const monthlyLimit = getMonthlyLimit();
  const dailyPercent = (stats.daily.count / dailyLimit) * 100;
  const monthlyPercent = (stats.monthly.count / monthlyLimit) * 100;

  // Listen for usage updates
  useEffect(() => {
    const handleUsageUpdate = () => {
      setStats(getUsageStats());
    };

    window.addEventListener('usageUpdated', handleUsageUpdate);
    return () => window.removeEventListener('usageUpdated', handleUsageUpdate);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/generators', label: 'Generators' },
    { href: '/templates', label: 'Templates' },
    { href: '/saved', label: 'Saved Prompts' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="header">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-lg" data-testid="link-home">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">PromptStick</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" data-testid="nav-desktop">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors hover-elevate ${
                  location === link.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                }`}
                data-testid={`link-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Usage Counter - Only on generator pages */}
          {location.startsWith('/generator/') && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex flex-col items-end gap-1" data-testid="usage-counter">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Daily: {stats.daily.count}/{dailyLimit}
                  </span>
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        dailyPercent > 80 ? 'bg-destructive' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(dailyPercent, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Monthly: {stats.monthly.count}/{monthlyLimit}
                  </span>
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        monthlyPercent > 80 ? 'bg-destructive' : 'bg-chart-2'
                      }`}
                      style={{ width: `${Math.min(monthlyPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2" data-testid="nav-mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 rounded-lg text-sm font-medium hover-elevate ${
                  location === link.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`link-mobile-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                {link.label}
              </Link>
            ))}
            {location.startsWith('/generator/') && (
              <div className="px-4 py-2 space-y-1" data-testid="usage-counter-mobile">
                <div className="text-xs text-muted-foreground">
                  Daily: {stats.daily.count}/{dailyLimit}
                </div>
                <div className="text-xs text-muted-foreground">
                  Monthly: {stats.monthly.count}/{monthlyLimit}
                </div>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
