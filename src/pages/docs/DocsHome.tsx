import { useNavigate } from 'react-router-dom';
import { DocsLayout } from '@/components/docs/DocsLayout';
import { useDocsNavigation, type DocsLanguage } from '@/hooks/useDocs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getDocsBasePath } from '@/lib/hostname';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function DocsHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = getDocsBasePath();
  
  // Extract language from URL or default to 'ru'
  const pathWithoutBase = location.pathname.replace(basePath, '').replace(/^\//, '');
  const pathParts = pathWithoutBase.split('/').filter(p => p);
  const langFromPath = pathParts[0] || 'ru';
  const [language, setLanguage] = useState<DocsLanguage>(
    (langFromPath === 'en' || langFromPath === 'ru' ? langFromPath : 'ru') as DocsLanguage
  );

  const { data: navigation, isLoading } = useDocsNavigation(language);

  // Group navigation by section
  const navigationBySection = navigation?.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navigation>) || {};

  const handleLanguageChange = (newLang: DocsLanguage) => {
    setLanguage(newLang);
    const separator = basePath && !basePath.endsWith('/') ? '/' : '';
    navigate(`${basePath}${separator}${newLang}`, { replace: true });
  };

  return (
    <DocsLayout language={language} onLanguageChange={handleLanguageChange}>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">
            {language === 'ru' ? 'Документация' : 'Documentation'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === 'ru'
              ? 'Полное руководство по использованию платформы Turan Standard Pool'
              : 'Complete guide to using the Turan Standard Pool platform'}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(navigationBySection).map(([section, items]) => (
              <Card key={section} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{section}</CardTitle>
                  <CardDescription>
                    {items.length} {language === 'ru' ? 'страниц' : 'pages'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {items.slice(0, 5).map((item) => {
                      const separator = basePath && !basePath.endsWith('/') ? '/' : '';
                      return (
                        <li key={item.id}>
                          <a
                            href={`${basePath}${separator}${language}/${item.slug}`}
                            className="text-primary hover:underline"
                          >
                            {language === 'ru' ? item.label_ru : item.label_en}
                          </a>
                        </li>
                      );
                    })}
                    {items.length > 5 && (
                      <li className="text-sm text-muted-foreground">
                        +{items.length - 5} {language === 'ru' ? 'еще' : 'more'}
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DocsLayout>
  );
}

