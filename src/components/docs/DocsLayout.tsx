import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useDocsNavigation, type DocsLanguage } from '@/hooks/useDocs';
import { getDocsBasePath } from '@/lib/hostname';

interface DocsLayoutProps {
  children: ReactNode;
  language: DocsLanguage;
  onLanguageChange: (lang: DocsLanguage) => void;
}

export function DocsLayout({ children, language, onLanguageChange }: DocsLayoutProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: navigation, isLoading } = useDocsNavigation(language);
  const basePath = getDocsBasePath();

  // Group navigation by section
  const navigationBySection = navigation?.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navigation>) || {};

  // Extract current slug from path for active highlighting
  const pathWithoutBase = location.pathname.replace(basePath, '').replace(/^\//, '');
  const pathParts = pathWithoutBase.split('/').filter(p => p);
  // Skip language part (first), rest is slug
  const currentSlug = pathParts.length > 1 
    ? pathParts.slice(1).join('/') 
    : (pathParts.length === 1 && pathParts[0] !== 'ru' && pathParts[0] !== 'en' 
      ? pathParts[0] 
      : '');

  const handleNavClick = (slug: string) => {
    const separator = basePath && !basePath.endsWith('/') ? '/' : '';
    navigate(`${basePath}${separator}${language}/${slug}`);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <a href={`${basePath}${basePath && !basePath.endsWith('/') ? '/' : ''}${language}`} className="flex items-center gap-2 font-semibold">
              <span>Documentation</span>
            </a>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={language === 'ru' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLanguageChange('ru')}
            >
              RU
            </Button>
            <Button
              variant={language === 'en' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLanguageChange('en')}
            >
              EN
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-14 z-40 w-64 border-r bg-background transition-transform lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <ScrollArea className="h-[calc(100vh-3.5rem)]">
            <nav className="p-4 space-y-6">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : (
                Object.entries(navigationBySection).map(([section, items]) => (
                  <div key={section}>
                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
                      {section}
                    </h3>
                    <ul className="space-y-1">
                      {items.map((item) => {
                        const isActive = currentSlug === item.slug || currentSlug.startsWith(`${item.slug}/`);
                        return (
                          <li key={item.id}>
                            <button
                              onClick={() => handleNavClick(item.slug)}
                              className={cn(
                                'w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors',
                                isActive
                                  ? 'bg-primary text-primary-foreground font-medium'
                                  : 'text-foreground hover:bg-muted'
                              )}
                            >
                              {language === 'ru' ? item.label_ru : item.label_en}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </nav>
          </ScrollArea>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="container max-w-4xl mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

