import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDocsPage, type DocsLanguage } from '@/hooks/useDocs';
import { DocsLayout } from '@/components/docs/DocsLayout';
import { MarkdownRenderer } from '@/components/docs/MarkdownRenderer';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getDocsBasePath } from '@/lib/hostname';

export default function DocsPage() {
  const { slug, lang } = useParams<{ slug?: string; lang?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = getDocsBasePath();

  // Extract language and slug from path
  const pathWithoutBase = location.pathname.replace(basePath, '').replace(/^\//, '');
  const pathParts = pathWithoutBase.split('/').filter(p => p);
  
  // First part should be language, rest is slug
  const pathLang = (lang || pathParts[0] || 'ru') as DocsLanguage;
  const [language, setLanguage] = useState<DocsLanguage>(
    pathLang === 'ru' || pathLang === 'en' ? pathLang : 'ru'
  );
  
  // Slug is either from params or from path (after language)
  const actualSlug = slug || (pathParts.length > 1 
    ? pathParts.slice(1).join('/') 
    : (pathParts.length === 1 && pathParts[0] !== 'ru' && pathParts[0] !== 'en' 
      ? pathParts[0] 
      : 'getting-started'));

  const { data: page, isLoading, error } = useDocsPage(actualSlug, language);

  // Sync language state with URL on mount
  useEffect(() => {
    if (pathLang !== language && (pathLang === 'ru' || pathLang === 'en')) {
      setLanguage(pathLang);
    }
  }, [pathLang]); // Only depend on pathLang, not language

  const handleLanguageChange = (newLang: DocsLanguage) => {
    setLanguage(newLang);
    const separator = basePath && !basePath.endsWith('/') ? '/' : '';
    navigate(`${basePath}${separator}${newLang}/${actualSlug}`, { replace: true });
  };

  // Breadcrumbs
  const separator = basePath && !basePath.endsWith('/') ? '/' : '';
  const breadcrumbs = [
    { label: 'Documentation', href: `${basePath}${separator}${language}` },
    ...(page ? [{ label: language === 'ru' ? page.title_ru : page.title_en, href: null }] : []),
  ];

  return (
    <DocsLayout language={language} onLanguageChange={handleLanguageChange}>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load documentation page. Please try again later.
          </AlertDescription>
        </Alert>
      ) : !page ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Page not found. The documentation page you're looking for doesn't exist.
          </AlertDescription>
        </Alert>
      ) : (
        <article>
          {/* Breadcrumbs */}
          <nav className="mb-6 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx}>
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-foreground">
                    {crumb.label}
                  </a>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
              </span>
            ))}
          </nav>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-6">
            {language === 'ru' ? page.title_ru : page.title_en}
          </h1>

          {/* Content */}
          <MarkdownRenderer
            content={language === 'ru' ? page.content_ru : page.content_en}
          />
        </article>
      )}
    </DocsLayout>
  );
}

