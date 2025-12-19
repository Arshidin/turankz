/**
 * OBSERVER DASHBOARD
 * 
 * Lightweight activation overview for Farmer users with Observer status.
 * Designed to reduce cognitive load and clearly communicate:
 * - Current status (profile under review)
 * - Why access is limited
 * - What actions are available now
 * 
 * No operational complexity, no empty states, no zero-value metrics.
 * Links ONLY to existing pages with read-only access.
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, 
  BookOpen,
  Grid3X3,
  Beef,
  Info,
  ChevronRight
} from 'lucide-react';

interface ObserverDashboardProps {
  farmerName?: string;
}

export function ObserverDashboard({ farmerName }: ObserverDashboardProps) {
  const availableActions = [
    {
      icon: BookOpen,
      title: 'Изучить правила работы платформы',
      description: 'Этапы, роли участников и правила работы Turan Standard Pool.',
      path: '/overview',
    },
    {
      icon: Grid3X3,
      title: 'Ознакомиться с ценовыми ориентирами',
      description: 'Референсная ценовая сетка, используемая в системе. Данные носят ориентировочный характер.',
      path: '/price-grid',
    },
    {
      icon: Beef,
      title: 'Подготовить структуру поголовья',
      description: 'Добровольные индикативные данные о поголовье. Используются только в агрегированном виде.',
      path: '/admin/herd-structure',
    },
  ];

  const limitations = [
    'создание партий скота',
    'участие в закупочных пулах',
    'просмотр заявок мясокомбинатов',
  ];

  return (
    <div className="space-y-6">
      {/* Main Status Card - Single unified status block */}
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-500/[0.02]">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-7 h-7 text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Профиль на проверке
              </h2>
              <p className="text-muted-foreground mb-3">
                Администратор рассматривает вашу заявку. На этом этапе доступен только режим просмотра.
              </p>
              <p className="text-sm text-muted-foreground/70">
                Обычно проверка занимает 1–2 рабочих дня.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What You Can Do Now - Exactly 3 items with links */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-muted-foreground uppercase tracking-wide">
            Что вы можете сделать на этом этапе
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 hover:border-border transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <action.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {action.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-2" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Limitations Notice - Informational, not warning */}
      <Card className="bg-muted/30 border-border/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                На этом этапе недоступно:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {limitations.map((item, index) => (
                  <li key={index}>– {item}</li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                Эти функции откроются после активации профиля.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
