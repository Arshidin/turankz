import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { Loader2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { z } from 'zod';

const REGIONS = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Тараз', 'Павлодар', 'Семей'];
const VOLUME_RANGES = ['До 100', '100-250', '250-500', '500-1000', '1000+'];
const INTAKE_MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const step1Schema = z.object({
  companyName: z.string().min(2, 'Название компании должно содержать минимум 2 символа').max(100),
  contactPerson: z.string().min(2, 'Имя контактного лица должно содержать минимум 2 символа').max(100),
  email: z.string().email('Введите корректный email адрес'),
  phone: z.string().min(10, 'Введите корректный номер телефона').max(20),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

const step2Schema = z.object({
  intakeRegions: z.array(z.string()).min(1, 'Выберите хотя бы один регион приема'),
  typicalVolume: z.string().min(1, 'Выберите типичный месячный объем'),
  ageRangeMin: z.string().optional(),
  ageRangeMax: z.string().optional(),
  weightRangeMin: z.string().optional(),
  weightRangeMax: z.string().optional(),
  intakeMonths: z.array(z.string()).min(1, 'Выберите хотя бы один месяц приема'),
});

export default function MpkRegistration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, assignRole } = useAuthContext();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    // Step 1
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    // Step 2
    intakeRegions: [] as string[],
    typicalVolume: '',
    ageRangeMin: '',
    ageRangeMax: '',
    weightRangeMin: '',
    weightRangeMax: '',
    intakeMonths: [] as string[],
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

  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      intakeRegions: prev.intakeRegions.includes(region)
        ? prev.intakeRegions.filter(r => r !== region)
        : [...prev.intakeRegions, region]
    }));
  };

  const toggleMonth = (month: string) => {
    setFormData(prev => ({
      ...prev,
      intakeMonths: prev.intakeMonths.includes(month)
        ? prev.intakeMonths.filter(m => m !== month)
        : [...prev.intakeMonths, month]
    }));
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

      // Assign mpk role
      const { error: roleError } = await assignRole(authData.user.id, 'mpk');
      if (roleError) {
        logger.error('Failed to assign MPK role during registration', roleError, { 
          action: 'assignRole', 
          userId: authData.user.id,
          role: 'mpk' 
        });
        // Continue registration even if role assignment fails - admin can fix later
      }

      // Generate mpk_id
      const mpkId = `MPK${Date.now().toString().slice(-6)}`;

      // Parse volume range
      const volumeMap: Record<string, { min: number; max: number }> = {
        'До 100': { min: 0, max: 100 },
        '100-250': { min: 100, max: 250 },
        '250-500': { min: 250, max: 500 },
        '500-1000': { min: 500, max: 1000 },
        '1000+': { min: 1000, max: 5000 },
      };
      const volume = volumeMap[formData.typicalVolume] || { min: null, max: null };

      // Create MPK profile
      const { error: profileError } = await supabase
        .from('mpks')
        .insert({
          user_id: authData.user.id,
          mpk_id: mpkId,
          name: formData.companyName,
          intake_regions: formData.intakeRegions,
          typical_volume_min: volume.min,
          typical_volume_max: volume.max,
          default_age_range_min: formData.ageRangeMin ? parseInt(formData.ageRangeMin) : null,
          default_age_range_max: formData.ageRangeMax ? parseInt(formData.ageRangeMax) : null,
          default_weight_range_min: formData.weightRangeMin ? parseInt(formData.weightRangeMin) : null,
          default_weight_range_max: formData.weightRangeMax ? parseInt(formData.weightRangeMax) : null,
          common_target_weeks: formData.intakeMonths,
          registration_status: 'pending',
          status: 'inactive',
        });

      if (profileError) {
        logger.error('Failed to create MPK profile during registration', profileError, { 
          action: 'createMpkProfile', 
          userId: authData.user.id 
        });
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
      logger.error('MPK registration failed', error, { action: 'mpkRegistration' });
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
            {step === 1 && 'Данные компании'}
            {step === 2 && 'Профиль приема'}
            {step === 3 && 'Проверка и отправка'}
            {step === 4 && 'Заявка отправлена'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Создайте аккаунт МПК для присоединения к Turan Standard Pool'}
            {step === 2 && 'Укажите ваши типичные параметры приема'}
            {step === 3 && 'Проверьте условия доступа перед отправкой'}
            {step === 4 && 'Ваша заявка ожидает рассмотрения'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Название компании</Label>
                <Input
                  id="companyName"
                  placeholder="Название мясоперерабатывающего предприятия"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
                {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Контактное лицо</Label>
                <Input
                  id="contactPerson"
                  placeholder="Имя основного контакта"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
                {errors.contactPerson && <p className="text-sm text-destructive">{errors.contactPerson}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@company.com"
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

              <Button className="w-full" onClick={handleNext}>
                Продолжить <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Регионы приема</Label>
                <div className="grid grid-cols-2 gap-2">
                  {REGIONS.map(region => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={region}
                        checked={formData.intakeRegions.includes(region)}
                        onCheckedChange={() => toggleRegion(region)}
                      />
                      <label htmlFor={region} className="text-sm">{region}</label>
                    </div>
                  ))}
                </div>
                {errors.intakeRegions && <p className="text-sm text-destructive">{errors.intakeRegions}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="typicalVolume">Типичный месячный объем</Label>
                <Select value={formData.typicalVolume} onValueChange={(v) => setFormData({ ...formData, typicalVolume: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите диапазон объема" />
                  </SelectTrigger>
                  <SelectContent>
                    {VOLUME_RANGES.map(v => <SelectItem key={v} value={v}>{v} голов/месяц</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.typicalVolume && <p className="text-sm text-destructive">{errors.typicalVolume}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ageRangeMin">Мин. возраст (мес.)</Label>
                  <Input
                    id="ageRangeMin"
                    type="number"
                    placeholder="напр. 18"
                    value={formData.ageRangeMin}
                    onChange={(e) => setFormData({ ...formData, ageRangeMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageRangeMax">Макс. возраст (мес.)</Label>
                  <Input
                    id="ageRangeMax"
                    type="number"
                    placeholder="напр. 30"
                    value={formData.ageRangeMax}
                    onChange={(e) => setFormData({ ...formData, ageRangeMax: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weightRangeMin">Мин. вес (кг)</Label>
                  <Input
                    id="weightRangeMin"
                    type="number"
                    placeholder="напр. 400"
                    value={formData.weightRangeMin}
                    onChange={(e) => setFormData({ ...formData, weightRangeMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightRangeMax">Макс. вес (кг)</Label>
                  <Input
                    id="weightRangeMax"
                    type="number"
                    placeholder="напр. 550"
                    value={formData.weightRangeMax}
                    onChange={(e) => setFormData({ ...formData, weightRangeMax: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Основные месяцы приема</Label>
                <div className="grid grid-cols-3 gap-2">
                  {INTAKE_MONTHS.map(month => (
                    <div key={month} className="flex items-center space-x-2">
                      <Checkbox
                        id={month}
                        checked={formData.intakeMonths.includes(month)}
                        onCheckedChange={() => toggleMonth(month)}
                      />
                      <label htmlFor={month} className="text-sm">{month.slice(0, 3)}</label>
                    </div>
                  ))}
                </div>
                {errors.intakeMonths && <p className="text-sm text-destructive">{errors.intakeMonths}</p>}
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
                  Заявки на закупочные пулы подлежат одобрению Администратором.
                  Стабильность спроса влияет на приоритет доступа.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Компания</span>
                  <span>{formData.companyName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Контакт</span>
                  <span>{formData.contactPerson}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Email</span>
                  <span>{formData.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Регионы приема</span>
                  <span>{formData.intakeRegions.join(', ')}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Месячный объем</span>
                  <span>{formData.typicalVolume}</span>
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
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              
              <div className="space-y-2">
                <p className="font-medium text-lg">Неактивен — Ожидает активации</p>
                <p className="text-sm text-muted-foreground">
                  Ваша регистрация отправлена на рассмотрение.
                  У вас будет доступ только для чтения до одобрения Администратором.
                </p>
              </div>

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