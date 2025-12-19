import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ChevronLeft, ChevronRight, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { z } from 'zod';

const REGIONS = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Тараз', 'Павлодар', 'Семей'];
const DISTRICTS = ['Центральный', 'Северный', 'Южный', 'Восточный', 'Западный'];
const FARM_TYPES = ['Мясное скотоводство', 'Смешанное хозяйство', 'Откормочная площадка', 'Молочное с мясным'];
const HERD_SIZES = ['До 50', '50-100', '100-250', '250-500', '500+'];
const CATTLE_TYPES = ['Мясной скот', 'Универсальный', 'Молочные помеси'];

const step1Schema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100),
  email: z.string().email('Введите корректный email адрес'),
  phone: z.string().min(10, 'Введите корректный номер телефона').max(20),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  region: z.string().min(1, 'Выберите регион'),
});

const step2Schema = z.object({
  farmName: z.string().min(2, 'Название хозяйства должно содержать минимум 2 символа').max(100),
  district: z.string().min(1, 'Выберите район'),
  farmType: z.string().min(1, 'Выберите тип хозяйства'),
  herdSize: z.string().min(1, 'Выберите размер стада'),
  cattleType: z.string().min(1, 'Выберите тип скота'),
});

export default function FarmerRegistration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, assignRole } = useAuthContext();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    // Step 1
    name: '',
    email: '',
    phone: '',
    password: '',
    region: '',
    // Step 2
    farmName: '',
    district: '',
    farmType: '',
    herdSize: '',
    cattleType: '',
  });

  const validateStep1 = () => {
    const result = step1Schema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep2 = () => {
    const result = step2Schema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Create auth account
      const { data: authData, error: authError } = await signUp(formData.email, formData.password);
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          toast({
            title: 'Аккаунт существует',
            description: 'Аккаунт с этим email уже существует. Пожалуйста, войдите.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Ошибка регистрации',
            description: authError.message,
            variant: 'destructive',
          });
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast({
          title: 'Ошибка регистрации',
          description: 'Не удалось создать аккаунт. Попробуйте снова.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Assign farmer role
      const { error: roleError } = await assignRole(authData.user.id, 'farmer');
      if (roleError) {
        console.error('Role assignment error:', roleError);
      }

      // Generate farmer_id
      const farmerId = `F${Date.now().toString().slice(-6)}`;

      // Create farmer profile
      const { error: profileError } = await supabase
        .from('farmers')
        .insert({
          user_id: authData.user.id,
          farmer_id: farmerId,
          name: formData.farmName || formData.name,
          contact_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          region: formData.region,
          district: formData.district,
          farm_type: formData.farmType,
          registration_status: 'pending',
          grading: 'observer',
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast({
          title: 'Ошибка создания профиля',
          description: 'Аккаунт создан, но настройка профиля не удалась. Свяжитесь с поддержкой.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      setStep(4); // Move to pending status screen
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Ошибка регистрации',
        description: 'Произошла непредвиденная ошибка. Попробуйте снова.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" onClick={() => step === 1 ? navigate('/auth') : setStep(step - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Шаг {Math.min(step, 3)} из 3</span>
          </div>
          <CardTitle className="text-2xl">
            {step === 1 && 'Данные аккаунта'}
            {step === 2 && 'Профиль хозяйства'}
            {step === 3 && 'Проверка и отправка'}
            {step === 4 && 'Заявка отправлена'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Создайте аккаунт для присоединения к Turan Standard Pool'}
            {step === 2 && 'Расскажите о вашем хозяйстве'}
            {step === 3 && 'Проверьте условия доступа перед отправкой'}
            {step === 4 && 'Ваша заявка ожидает рассмотрения'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Контактное лицо</Label>
                <Input
                  id="name"
                  placeholder="Ваше полное имя"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  placeholder="+7 XXX XXX XXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Регион</Label>
                <Select value={formData.region} onValueChange={(v) => setFormData({ ...formData, region: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите регион" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.region && <p className="text-sm text-destructive">{errors.region}</p>}
              </div>

              <Button className="w-full" onClick={handleNext}>
                Продолжить <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="farmName">Название хозяйства / Имя фермера</Label>
                <Input
                  id="farmName"
                  placeholder="Как зарегистрировано"
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                />
                {errors.farmName && <p className="text-sm text-destructive">{errors.farmName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">Район</Label>
                <Select value={formData.district} onValueChange={(v) => setFormData({ ...formData, district: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите район" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.district && <p className="text-sm text-destructive">{errors.district}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmType">Тип хозяйства</Label>
                <Select value={formData.farmType} onValueChange={(v) => setFormData({ ...formData, farmType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип хозяйства" />
                  </SelectTrigger>
                  <SelectContent>
                    {FARM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.farmType && <p className="text-sm text-destructive">{errors.farmType}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="herdSize">Примерный размер стада</Label>
                <Select value={formData.herdSize} onValueChange={(v) => setFormData({ ...formData, herdSize: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите диапазон" />
                  </SelectTrigger>
                  <SelectContent>
                    {HERD_SIZES.map(s => <SelectItem key={s} value={s}>{s} голов</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.herdSize && <p className="text-sm text-destructive">{errors.herdSize}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cattleType">Основной тип скота</Label>
                <Select value={formData.cattleType} onValueChange={(v) => setFormData({ ...formData, cattleType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип скота" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATTLE_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.cattleType && <p className="text-sm text-destructive">{errors.cattleType}</p>}
              </div>

              <Button className="w-full" onClick={handleNext}>
                Продолжить <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Регистрация не гарантирует участие в закупочных пулах.
                  Доступ зависит от декларированных партий и соответствия стандартам.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Имя</span>
                  <span>{formData.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Email</span>
                  <span>{formData.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Регион</span>
                  <span>{formData.region}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Название хозяйства</span>
                  <span>{formData.farmName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Тип хозяйства</span>
                  <span>{formData.farmType}</span>
                </div>
              </div>

              <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  'Отправить на проверку'
                )}
              </Button>
            </>
          )}

          {step === 4 && (
            <div className="space-y-5">
              {/* Status Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
              </div>
              
              {/* Status Block */}
              <div className="text-center space-y-1">
                <div className="inline-block px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                  <span className="text-sm font-semibold text-amber-700">Наблюдатель — Ожидает активации</span>
                </div>
              </div>

              {/* Description */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Ваш профиль находится на рассмотрении Администрации TURAN.
                </p>
                <p className="text-sm text-muted-foreground">
                  Сейчас у вас доступ только для чтения.<br />
                  Вы сможете декларировать партии скота только после одобрения Администратором.
                </p>
              </div>

              {/* Access Limitations */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Текущий доступ</p>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    Просмотр рыночных стандартов и ценовой сетки
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    Обзор спроса (только чтение)
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Пока нельзя создавать или подтверждать партии</span>
                  </li>
                </ul>
              </div>

              {/* Expectation Note */}
              <Alert className="border-border bg-background">
                <Clock className="h-4 w-4" />
                <AlertDescription className="text-xs text-muted-foreground">
                  Активация обычно происходит после краткой проверки профиля.
                  Вы получите уведомление после предоставления доступа.
                </AlertDescription>
              </Alert>

              {/* CTA */}
              <Button className="w-full" onClick={() => navigate('/overview')}>
                Перейти к панели управления
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}