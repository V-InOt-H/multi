import { useState } from 'react';
import { GraduationCap, Radio, Moon, Sun } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSessionLive: boolean;
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

export function Navbar({ 
  activeTab, 
  onTabChange, 
  isSessionLive,
  onThemeToggle,
  isDarkMode 
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-semibold tracking-tight">EduSense</h1>
              <p className="text-xs text-muted-foreground">Multilingual Lecture Assistant</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={onTabChange} className="hidden md:block">
            <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="join">Join</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Live Indicator */}
            {isSessionLive && (
              <div className="flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1.5">
                <Radio className="h-3.5 w-3.5 animate-pulse text-destructive" />
                <span className="text-xs font-medium text-destructive">LIVE</span>
              </div>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeToggle}
              className="h-9 w-9"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="block md:hidden pb-3">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="teacher" className="text-xs">Teacher</TabsTrigger>
              <TabsTrigger value="student" className="text-xs">Student</TabsTrigger>
              <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
              <TabsTrigger value="join" className="text-xs">Join</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </nav>
  );
}
