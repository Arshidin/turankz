import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen, Users, Settings, BarChart3, FileText, HelpCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

/**
 * Individual Documentation Page
 * 
 * Displays content for specific documentation sections
 */
export default function DocPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Define documentation content
  const docContent: Record<string, {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    sections: Array<{
      title: string;
      content: string | React.ReactNode;
    }>;
  }> = {
    'getting-started': {
      title: t('docs.sections.gettingStarted.title', 'Начало работы'),
      description: t('docs.sections.gettingStarted.description', 'Быстрый старт с платформой Turan Standard Pool'),
      icon: BookOpen,
      sections: [
        {
          title: t('docs.gettingStarted.welcome.title', 'Добро пожаловать'),
          content: t('docs.gettingStarted.welcome.content', 'Turan Standard Pool — это управляемая платформа координации рынка живого скота, созданная для обеспечения предсказуемости, стандартов и круглогодичных поставок для мясной отрасли Казахстана.'),
        },
        {
          title: t('docs.gettingStarted.whatIs.title', 'Что такое платформа'),
          content: t('docs.gettingStarted.whatIs.content', 'Платформа не является биржей или маркетплейсом. Это инструмент координации, который обеспечивает прозрачность, стандарты качества и эффективное сопоставление спроса и предложения при сохранении рыночной нейтральности.'),
        },
        {
          title: t('docs.gettingStarted.howToStart.title', 'Как начать'),
          content: (
            <div className="space-y-4">
              <p>{t('docs.gettingStarted.howToStart.step1', '1. Зарегистрируйтесь на платформе, выбрав свою роль (фермер или МПК)')}</p>
              <p>{t('docs.gettingStarted.howToStart.step2', '2. Дождитесь активации вашего аккаунта администратором')}</p>
              <p>{t('docs.gettingStarted.howToStart.step3', '3. После активации начните использовать функции платформы согласно вашей роли')}</p>
            </div>
          ),
        },
      ],
    },
    'farmer-guide': {
      title: t('docs.sections.farmerGuide.title', 'Руководство для фермеров'),
      description: t('docs.sections.farmerGuide.description', 'Как создавать батчи, управлять поголовьем и отслеживать исполнения'),
      icon: Users,
      sections: [
        {
          title: t('docs.farmerGuide.creatingBatches.title', 'Создание партий скота'),
          content: (
            <div className="space-y-4">
              <p>{t('docs.farmerGuide.creatingBatches.content1', 'Партия скота — это основная единица работы на платформе. Для создания партии:')}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('docs.farmerGuide.creatingBatches.item1', 'Укажите количество голов скота')}</li>
                <li>{t('docs.farmerGuide.creatingBatches.item2', 'Выберите регион и целевую неделю поставки')}</li>
                <li>{t('docs.farmerGuide.creatingBatches.item3', 'Укажите характеристики (порода, пол, возраст, вес)')}</li>
                <li>{t('docs.farmerGuide.creatingBatches.item4', 'Выберите сорт (A, B, C)')}</li>
              </ul>
            </div>
          ),
        },
        {
          title: t('docs.farmerGuide.batchStatus.title', 'Статусы партий'),
          content: (
            <div className="space-y-4">
              <p>{t('docs.farmerGuide.batchStatus.content', 'Партии проходят через несколько статусов:')}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>{t('docs.farmerGuide.batchStatus.draft', 'Черновик')}</strong> — {t('docs.farmerGuide.batchStatus.draftDesc', 'партия создана, но еще не опубликована')}</li>
                <li><strong>{t('docs.farmerGuide.batchStatus.softCommitted', 'Мягкая привязка')}</strong> — {t('docs.farmerGuide.batchStatus.softCommittedDesc', 'партия опубликована и доступна для сопоставления')}</li>
                <li><strong>{t('docs.farmerGuide.batchStatus.confirmed', 'Подтверждена')}</strong> — {t('docs.farmerGuide.batchStatus.confirmedDesc', 'партия подтверждена и имеет высокий приоритет')}</li>
                <li><strong>{t('docs.farmerGuide.batchStatus.matched', 'Сопоставлена')}</strong> — {t('docs.farmerGuide.batchStatus.matchedDesc', 'партия сопоставлена с заявкой МПК')}</li>
              </ul>
            </div>
          ),
        },
        {
          title: t('docs.farmerGuide.executions.title', 'Исполнение контрактов'),
          content: t('docs.farmerGuide.executions.content', 'После сопоставления партии с заявкой МПК начинается процесс исполнения. Вы сможете отслеживать статус поставки, подтверждать соответствие и управлять расчетами.'),
        },
      ],
    },
    'mpk-guide': {
      title: t('docs.sections.mpkGuide.title', 'Руководство для МПК'),
      description: t('docs.sections.mpkGuide.description', 'Как создавать заявки на покупку, отслеживать совпадения и управлять исполнениями'),
      icon: BarChart3,
      sections: [
        {
          title: t('docs.mpkGuide.creatingRequests.title', 'Создание заявок на покупку'),
          content: (
            <div className="space-y-4">
              <p>{t('docs.mpkGuide.creatingRequests.content1', 'Заявка на покупку (Pool Request) позволяет вам указать требования к скоту:')}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('docs.mpkGuide.creatingRequests.item1', 'Объем закупки (количество голов)')}</li>
                <li>{t('docs.mpkGuide.creatingRequests.item2', 'Целевая неделя поставки')}</li>
                <li>{t('docs.mpkGuide.creatingRequests.item3', 'Регионы поставки')}</li>
                <li>{t('docs.mpkGuide.creatingRequests.item4', 'Критерии приемки (порода, пол, возраст, вес)')}</li>
              </ul>
            </div>
          ),
        },
        {
          title: t('docs.mpkGuide.matching.title', 'Сопоставление пулов'),
          content: t('docs.mpkGuide.matching.content', 'Платформа автоматически сопоставляет ваши заявки с доступными партиями скота в рамках окон сопоставления. Вы сможете видеть результаты сопоставления и подтверждать совпадения.'),
        },
        {
          title: t('docs.mpkGuide.watchlist.title', 'Отслеживание (Watchlist)'),
          content: t('docs.mpkGuide.watchlist.content', 'Используйте Watchlist для отслеживания интересующих вас партий скота. Это позволяет вам быть в курсе доступного предложения и планировать закупки.'),
        },
      ],
    },
    'admin-guide': {
      title: t('docs.sections.adminGuide.title', 'Руководство для администраторов'),
      description: t('docs.sections.adminGuide.description', 'Управление платформой, сопоставление пулов и настройка системы'),
      icon: Settings,
      sections: [
        {
          title: t('docs.adminGuide.overview.title', 'Обзор платформы'),
          content: t('docs.adminGuide.overview.content', 'Панель администратора предоставляет полный обзор активности платформы: статистика по участникам, партиям, заявкам и исполнениям.'),
        },
        {
          title: t('docs.adminGuide.matching.title', 'Сопоставление пулов'),
          content: t('docs.adminGuide.matching.content', 'Администратор может вручную управлять процессом сопоставления, создавать совпадения между заявками МПК и партиями фермеров, а также контролировать окна сопоставления.'),
        },
        {
          title: t('docs.adminGuide.settings.title', 'Настройки системы'),
          content: (
            <div className="space-y-4">
              <p>{t('docs.adminGuide.settings.content1', 'Администратор может управлять:')}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('docs.adminGuide.settings.item1', 'Справочником цен')}</li>
                <li>{t('docs.adminGuide.settings.item2', 'Правилами премий и стимулов')}</li>
                <li>{t('docs.adminGuide.settings.item3', 'Окнами сопоставления')}</li>
                <li>{t('docs.adminGuide.settings.item4', 'Структурой национального поголовья')}</li>
              </ul>
            </div>
          ),
        },
      ],
    },
    'api': {
      title: t('docs.sections.api.title', 'API и техническая документация'),
      description: t('docs.sections.api.description', 'Техническая документация, API endpoints и интеграции'),
      icon: FileText,
      sections: [
        {
          title: t('docs.api.overview.title', 'Обзор API'),
          content: t('docs.api.overview.content', 'API платформы Turan Standard Pool предоставляет программный доступ к основным функциям платформы. API использует RESTful архитектуру и требует аутентификации.'),
        },
        {
          title: t('docs.api.authentication.title', 'Аутентификация'),
          content: t('docs.api.authentication.content', 'Все API запросы требуют аутентификации через Supabase Auth. Используйте токен доступа в заголовке Authorization.'),
        },
        {
          title: t('docs.api.endpoints.title', 'Основные endpoints'),
          content: (
            <div className="space-y-4">
              <p>{t('docs.api.endpoints.content', 'Основные endpoints API:')}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><code>/api/batches</code> — {t('docs.api.endpoints.batches', 'управление партиями')}</li>
                <li><code>/api/pool-requests</code> — {t('docs.api.endpoints.requests', 'управление заявками')}</li>
                <li><code>/api/matches</code> — {t('docs.api.endpoints.matches', 'сопоставления')}</li>
                <li><code>/api/executions</code> — {t('docs.api.endpoints.executions', 'исполнения')}</li>
              </ul>
            </div>
          ),
        },
      ],
    },
    'faq': {
      title: t('docs.quickLinks.faq', 'Часто задаваемые вопросы'),
      description: t('docs.quickLinks.faqDescription', 'Ответы на популярные вопросы о платформе'),
      icon: HelpCircle,
      sections: [
        {
          title: t('docs.faq.registration.title', 'Как зарегистрироваться?'),
          content: t('docs.faq.registration.content', 'Перейдите на страницу регистрации, выберите свою роль (фермер или МПК) и заполните форму. После регистрации ваш аккаунт будет рассмотрен администратором.'),
        },
        {
          title: t('docs.faq.activation.title', 'Сколько времени занимает активация?'),
          content: t('docs.faq.activation.content', 'Обычно активация занимает 1-3 рабочих дня. Вы получите уведомление по email после активации.'),
        },
        {
          title: t('docs.faq.batches.title', 'Как создать партию скота?'),
          content: t('docs.faq.batches.content', 'После активации перейдите в раздел "Партии скота" и нажмите "Создать партию". Заполните все необходимые поля и опубликуйте партию.'),
        },
      ],
    },
    'support': {
      title: t('docs.quickLinks.support', 'Поддержка'),
      description: t('docs.quickLinks.supportDescription', 'Свяжитесь с нами для получения помощи'),
      icon: Mail,
      sections: [
        {
          title: t('docs.support.contact.title', 'Связаться с поддержкой'),
          content: (
            <div className="space-y-4">
              <p>{t('docs.support.contact.content', 'Если у вас возникли вопросы или проблемы, свяжитесь с нами:')}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t('docs.support.contact.email', 'Email: support@turanstandard.kz')}</li>
                <li>{t('docs.support.contact.phone', 'Телефон: +7 (XXX) XXX-XX-XX')}</li>
              </ul>
            </div>
          ),
        },
        {
          title: t('docs.support.hours.title', 'Часы работы'),
          content: t('docs.support.hours.content', 'Служба поддержки работает с понедельника по пятницу с 9:00 до 18:00 по времени Астаны.'),
        },
      ],
    },
  };

  const content = slug ? docContent[slug] : null;

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-8">{t('docs.notFound', 'Раздел документации не найден')}</p>
            <Button asChild>
              <Link to="/docs">{t('docs.backToDocs', 'Вернуться к документации')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/docs')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('docs.backToDocs', 'Вернуться к документации')}
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{content.title}</h1>
              <p className="text-lg text-gray-600 mt-2">{content.description}</p>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Content Sections */}
        <div className="space-y-8">
          {content.sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-2xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  {typeof section.content === 'string' ? (
                    <p className="text-gray-700 leading-relaxed">{section.content}</p>
                  ) : (
                    section.content
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

