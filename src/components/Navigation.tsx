import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { User, Video, Sparkles, Coins, LogOut, Menu, X } from 'lucide-react';
import type { ViewState } from '@/types';

const navItems: { id: ViewState; label: string; icon: React.ElementType }[] = [
  { id: 'avatars', label: 'Avatars', icon: User },
  { id: 'script', label: 'Create', icon: Sparkles },
  { id: 'history', label: 'History', icon: Video },
  { id: 'credits', label: 'Credits', icon: Coins }
];

export function Navigation() {
  const { user, currentView, setView, logout } = useAppStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (view: ViewState) => {
    setView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 hidden md:block ${
          isScrolled ? 'top-2' : 'top-4'
        }`}
      >
        <div
          className={`flex items-center gap-1 px-2 py-2 rounded-full transition-all duration-300 ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl'
              : 'bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg'
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 px-4 border-r border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">AvatarGen</span>
          </div>

          {/* Nav Items */}
          <div className="flex items-center gap-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Credits & Profile */}
          <div className="flex items-center gap-3 px-4 border-l border-gray-200">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full credit-badge">
              <Coins className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-900">{user?.credits || 0}</span>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 md:hidden">
        <div
          className={`flex items-center justify-between px-4 py-3 transition-all duration-300 ${
            isScrolled ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200' : 'bg-white/80 backdrop-blur-md'
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">AvatarGen</span>
          </div>

          {/* Credits & Menu */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full credit-badge">
              <Coins className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-900">{user?.credits || 0}</span>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-all"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/98 backdrop-blur-xl border-t border-gray-200 p-4 shadow-xl">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                      isActive
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all mt-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
