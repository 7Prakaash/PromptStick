/**
 * Header component with navigation
 * Sticky header with logo, navigation links, and usage counter
 */

import { Link, useLocation } from 'wouter';
import { Sparkles, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { getUsageStats, getDailyLimit } from '@/utils/localStorage';

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const stats = getUsageStats();
  const dailyLimit = getDailyLimit();
  const usagePercent = (stats.daily.count / dailyLimit) * 100;

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

          {/* Usage Counter */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col items-end" data-testid="usage-counter">
              <span className="text-xs text-muted-foreground">
                Today: {stats.daily.count}/{dailyLimit}
              </span>
              <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    usagePercent > 80 ? 'bg-destructive' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            </div>
          </div>

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
            <div className="px-4 py-2 text-xs text-muted-foreground" data-testid="usage-counter-mobile">
              Daily usage: {stats.daily.count}/{dailyLimit}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
