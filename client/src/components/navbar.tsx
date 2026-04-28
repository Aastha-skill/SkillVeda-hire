import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { Menu, LogOut, Users, Monitor } from "lucide-react";
import PartnerRegistrationModal from "@/components/partner-registration-modal";
import logoPath from "@assets/skill veda final-01 (3)_1750160992799.jpg";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [hireDesktopOnly, setHireDesktopOnly] = useState(false);
  const [, navigate] = useLocation();
  const { isAdmin, logout } = useAuth();
  
  const isAuthenticated = isAdmin || localStorage.getItem('isAdmin') === 'true';

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const publicNavLinks = [
    { href: "/", label: "Home" },
    { href: "/programs", label: "Programs" },
    { href: "/jobs", label: "Jobs" },
    { href: "/company-partnership", label: "For Companies" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
  ];

  const adminNavLinks = [
    { href: "/", label: "Home" },
    { href: "/programs", label: "Programs" },
    { href: "/jobs", label: "Jobs" },
    { href: "/company-partnership", label: "For Companies" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
    { href: "/admin-dashboard", label: "Admin Dashboard" },
  ];

  const navLinks = isAuthenticated ? adminNavLinks : publicNavLinks;

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex-shrink-0 flex items-center"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              <img 
                src={logoPath} 
                alt="SkillVeda" 
                className="h-10 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200"
                data-testid="logo-skillveda"
              />
            </Link>
            <div className="hidden lg:block ml-10">
              <div className="flex items-baseline space-x-6">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <span
                      className={`px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                        isActive(link.href)
                          ? "text-purple-600 font-semibold"
                          : "text-gray-600 hover:text-purple-600"
                      }`}
                      data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => {
                        if (link.href === "/") {
                          window.location.href = "/";
                        }
                      }}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="flex items-center space-x-4">
              <Link href="/hire">
                <span
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                    isActive("/hire")
                      ? "text-purple-600 font-semibold"
                      : "text-gray-600 hover:text-purple-600"
                  }`}
                  data-testid="nav-link-hire-cs-talent"
                >
                  Hire CS Talent
                </span>
              </Link>
              <Link href="/community" onClick={() => window.scrollTo(0, 0)}>
                <Button 
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50 font-semibold px-4 py-2 rounded-full flex items-center space-x-2"
                  data-testid="button-community"
                >
                  <Users className="h-4 w-4" />
                  <span>Community</span>
                </Button>
              </Link>
              {!isAuthenticated ? (
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  data-testid="button-signup"
                  onClick={() => setPartnerModalOpen(true)}
                >
                  Sign Up
                </Button>
              ) : (
                <Button variant="outline" onClick={logout} className="flex items-center space-x-2" data-testid="button-logout">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              )}
            </div>
          </div>
          <div className="lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <span
                        className={`block px-3 py-2 text-base font-medium cursor-pointer ${
                          isActive(link.href)
                            ? "text-purple-600 font-semibold"
                            : "text-gray-600"
                        }`}
                        data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (link.href === "/") {
                            window.location.href = "/";
                          }
                        }}
                      >
                        {link.label}
                      </span>
                    </Link>
                  ))}
                  <span
                    className={`block px-3 py-2 text-base font-medium cursor-pointer ${
                      isActive("/hire")
                        ? "text-purple-600 font-semibold"
                        : "text-gray-600"
                    }`}
                    data-testid="mobile-nav-hire-cs-talent"
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setMobileMenuOpen(false);
                        setHireDesktopOnly(true);
                      } else {
                        setMobileMenuOpen(false);
                        navigate("/hire");
                      }
                    }}
                  >
                    Hire CS Talent
                  </span>
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <Link href="/community" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0, 0); }}>
                      <Button 
                        variant="outline"
                        className="w-full border-green-500 text-green-600 hover:bg-green-50 font-semibold rounded-full flex items-center justify-center space-x-2 mb-2"
                        data-testid="mobile-button-community"
                      >
                        <Users className="h-4 w-4" />
                        <span>Community</span>
                      </Button>
                    </Link>
                    {!isAuthenticated ? (
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-full"
                        data-testid="mobile-button-signup"
                        onClick={() => {
                          setPartnerModalOpen(true);
                          setMobileMenuOpen(false);
                        }}
                      >
                        Sign Up
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={logout} className="w-full justify-start" data-testid="mobile-button-logout">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <PartnerRegistrationModal 
        isOpen={partnerModalOpen} 
        onClose={() => setPartnerModalOpen(false)} 
      />

      <Dialog open={hireDesktopOnly} onOpenChange={setHireDesktopOnly}>
        <DialogContent className="sm:max-w-sm rounded-2xl text-center">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Desktop Only Feature</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Monitor className="h-7 w-7 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              This feature is available on desktop. Please open SkillVeda on a laptop or desktop to continue hiring.
            </p>
          </div>
          <Button
            onClick={() => setHireDesktopOnly(false)}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-full"
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
