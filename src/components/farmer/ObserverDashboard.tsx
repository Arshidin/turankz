/**
 * OBSERVER DASHBOARD
 * 
 * Lightweight activation overview for users with Observer status.
 * Designed to reduce cognitive load and clearly communicate:
 * - Current status
 * - Why access is limited
 * - What will unlock next
 * 
 * No operational complexity, no empty states, no zero-value metrics.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  CheckCircle2, 
  Clock, 
  CircleDot,
  BookOpen,
  ClipboardList,
  Database
} from 'lucide-react';

interface ObserverDashboardProps {
  farmerName?: string;
}

export function ObserverDashboard({ farmerName }: ObserverDashboardProps) {
  const activationSteps = [
    {
      step: 1,
      title: 'Регистрация',
      status: 'completed' as const,
      description: 'Ваша заявка получена',
    },
    {
      step: 2,
      title: 'Проверка',
      status: 'in_progress' as const,
      description: 'Администратор рассматривает профиль',
    },
    {
      step: 3,
      title: 'Активация',
      status: 'pending' as const,
      description: 'Полный доступ к платформе',
    },
  ];

  const availableActions = [
    {
      icon: BookOpen,
      title: 'Изучить структуру платформы',
      description: 'Ознакомьтесь с разделами и навигацией',
    },
    {
      icon: ClipboardList,
      title: 'Просмотреть стандарты поставщика',
      description: 'Требования к качеству и срокам поставок',
    },
    {
      icon: Database,
      title: 'Подготовить данные хозяйства',
      description: 'Соберите информацию о поголовье и планах',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-500/[0.02]">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Eye className="w-7 h-7 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-foreground">
                  Режим наблюдателя
                </h2>
                <Badge 
                  variant="outline" 
                  className="bg-amber-500/10 text-amber-700 border-amber-500/30"
                >
                  Только просмотр
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Ожидание активации от Администратора Turan Standard Pool
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activation Progress */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-muted-foreground uppercase tracking-wide">
            Прогресс активации
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-border" />
            
            <div className="space-y-6">
              {activationSteps.map((step) => (
                <div key={step.step} className="flex items-start gap-4 relative">
                  {/* Step Icon */}
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10
                    ${step.status === 'completed' 
                      ? 'bg-emerald-500/10' 
                      : step.status === 'in_progress'
                      ? 'bg-amber-500/10 ring-2 ring-amber-500/30'
                      : 'bg-secondary'
                    }
                  `}>
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : step.status === 'in_progress' ? (
                      <Clock className="w-5 h-5 text-amber-600" />
                    ) : (
                      <CircleDot className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${
                        step.status === 'completed' 
                          ? 'text-emerald-700' 
                          : step.status === 'in_progress'
                          ? 'text-amber-700'
                          : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </span>
                      {step.status === 'completed' && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                          Выполнено
                        </Badge>
                      )}
                      {step.status === 'in_progress' && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-700 border-amber-500/20">
                          В процессе
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What You Can Do Now */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-muted-foreground uppercase tracking-wide">
            Что доступно сейчас
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableActions.map((action, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <action.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Note */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Примечание:</span>{' '}
              После активации вы сможете создавать партии скота и участвовать в закупочных пулах. 
              Активация обычно занимает 1–2 рабочих дня.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}