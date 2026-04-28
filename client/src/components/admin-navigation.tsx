import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";

interface AdminNavigationProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'leads', label: 'Leads' },
  { key: 'campaigns', label: 'Campaigns' },
  { key: 'create-job', label: 'Create Job' },
  { key: 'posted-jobs', label: 'Posted Jobs' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'applications', label: 'Applications' },
  { key: 'partners', label: 'Partners' },
  { key: 'tests', label: 'Tests' },
  { key: 'candidates', label: 'Candidates' },
];

export default function AdminNavigation({ onNavigate, currentPage }: AdminNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
  };

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <nav className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <h1 className="text-lg font-bold text-primary whitespace-nowrap shrink-0">SkillVeda Admin</h1>

          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          <div className="hidden md:flex items-center gap-1 ml-4">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`px-2 py-1.5 text-xs font-medium whitespace-nowrap rounded transition-colors duration-200 ${
                  currentPage === item.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}
              >
                {item.label}
              </button>
            ))}
            <Button variant="outline" size="sm" onClick={handleLogout} className="ml-2 shrink-0 h-7 text-xs px-2">
              <LogOut className="h-3 w-3 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
