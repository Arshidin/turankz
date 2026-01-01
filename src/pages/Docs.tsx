import { useTranslation } from 'react-i18next';
import { BookOpen, FileText, Users, Settings, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

/**
 * Documentation Page
 * 
 * Simple documentation page using Lovable's built-in routing
 * No Supabase dependency, no subdomain routing
 */
export default function Docs() {
  const { t } = useTranslation();

  const docSections = [
    {
      title: t('docs.sections.gettingStarted.title', 'Начало работы'),
      description: t('docs.sections.gettingStarted.description', 'Быстрый старт с платформой Turan Standard Pool'),
      icon: BookOpen,
      href: '/docs/getting-started',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: t('docs.sections.farmerGuide.title', 'Руководство для фермеров'),
      description: t('docs.sections.farmerGuide.description', 'Как создавать батчи, управлять поголовьем и отслеживать исполнения'),
      icon: Users,
      href: '/docs/farmer-guide',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: t('docs.sections.mpkGuide.title', 'Руководство для МПК'),
      description: t('docs.sections.mpkGuide.description', 'Как создавать заявки на покупку, отслеживать совпадения и управлять исполнениями'),
      icon: BarChart3,
      href: '/docs/mpk-guide',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: t('docs.sections.adminGuide.title', 'Руководство для администраторов'),
      description: t('docs.sections.adminGuide.description', 'Управление платформой, сопоставление пулов и настройка системы'),
      icon: Settings,
      href: '/docs/admin-guide',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: t('docs.sections.api.title', 'API и техническая документация'),
      description: t('docs.sections.api.description', 'Техническая документация, API endpoints и интеграции'),
      icon: FileText,
      href: '/docs/api',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('docs.title', 'Документация Turan Standard Pool')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('docs.description', 'Полное руководство по использованию платформы для координации рынка скота')}
          </p>
        </div>

        {/* Documentation Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {docSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.href} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 ${section.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${section.color}`} />
                  </div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  <CardDescription className="text-base">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={section.href}>
                      {t('docs.readMore', 'Читать далее')} →
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="mt-16 border-t pt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {t('docs.quickLinks.title', 'Быстрые ссылки')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">{t('docs.quickLinks.faq', 'Часто задаваемые вопросы')}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('docs.quickLinks.faqDescription', 'Ответы на популярные вопросы о платформе')}
                </p>
                <Button asChild variant="link" className="p-0">
                  <Link to="/docs/faq">{t('docs.view', 'Посмотреть')} →</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">{t('docs.quickLinks.support', 'Поддержка')}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('docs.quickLinks.supportDescription', 'Свяжитесь с нами для получения помощи')}
                </p>
                <Button asChild variant="link" className="p-0">
                  <Link to="/docs/support">{t('docs.view', 'Посмотреть')} →</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

