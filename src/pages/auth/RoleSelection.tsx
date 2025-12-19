import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wheat, Factory } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Присоединиться к Turan Standard Pool</h1>
          <p className="text-muted-foreground">
            Управляемая платформа для координации поставок скота между фермерами и мясоперерабатывающими предприятиями.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
            onClick={() => navigate('/auth/register/farmer')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Wheat className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Регистрация как Фермер</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-sm">
                Декларируйте партии скота и участвуйте в закупочных пулах.
                Доступ зависит от деклараций партий и соответствия стандартам.
              </CardDescription>
              <Button className="mt-4 w-full" variant="outline">
                Продолжить как Фермер
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
            onClick={() => navigate('/auth/register/mpk')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Factory className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Регистрация как МПК</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-sm">
                Создавайте заявки на закупочные пулы и координируйте закупки скота.
                Стабильность спроса влияет на приоритет доступа.
              </CardDescription>
              <Button className="mt-4 w-full" variant="outline">
                Продолжить как МПК
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth/login')}>
              Войти
            </Button>
          </p>
        </div>

        <div className="text-center text-xs text-muted-foreground border-t pt-4">
          <p>
            Turan Standard Pool — это пилотная программа. Регистрация не гарантирует участие.
            Весь доступ подлежит проверке Администратором и управлению платформой.
          </p>
        </div>
      </div>
    </div>
  );
}