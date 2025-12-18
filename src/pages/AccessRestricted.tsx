/**
 * ACCESS RESTRICTED PAGE
 * 
 * Displayed when a user navigates to a route they don't have access to.
 * Explains why access is blocked and what action is required.
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, ArrowLeft, Home, Lock, AlertTriangle, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAccountStatus } from '@/hooks/useAccountStatus';

interface LocationState {
  reason?: string;
  requiredStatus?: string;
}

export default function AccessRestricted() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { role, signOut } = useAuthContext();
  const { accountStatus, getStatusLabel } = useAccountStatus();
  
  const state = location.state as LocationState | null;
  const reason = state?.reason || 'You do not have permission to access this page.';
  
  // Determine what action is needed
  const getActionRequired = () => {
    if (accountStatus === 'observer') {
      return {
        icon: UserCheck,
        title: 'Activation Required',
        titleRu: 'Требуется активация',
        description: 'Your account is pending activation by a Platform Administrator.',
        descriptionRu: 'Ваш аккаунт ожидает активации Администратором платформы.',
        action: 'Wait for Admin to review and activate your account.',
        actionRu: 'Ожидайте рассмотрения и активации вашего аккаунта Администратором.',
      };
    }
    if (accountStatus === 'suspended') {
      return {
        icon: AlertTriangle,
        title: 'Account Suspended',
        titleRu: 'Аккаунт приостановлен',
        description: 'Your account has been temporarily suspended.',
        descriptionRu: 'Ваш аккаунт был временно приостановлен.',
        action: 'Please contact Platform Administration for assistance.',
        actionRu: 'Пожалуйста, свяжитесь с Администрацией платформы для получения помощи.',
      };
    }
    return {
      icon: Lock,
      title: 'Access Denied',
      titleRu: 'Доступ запрещён',
      description: 'You do not have the required permissions for this page.',
      descriptionRu: 'У вас нет необходимых прав для доступа к этой странице.',
      action: 'Navigate to a page you have access to, or contact Admin if you believe this is an error.',
      actionRu: 'Перейдите на страницу, к которой у вас есть доступ, или свяжитесь с Администратором.',
    };
  };
  
  const actionInfo = getActionRequired();
  const ActionIcon = actionInfo.icon;
  
  // Get current language
  const lang = localStorage.getItem('i18nextLng')?.startsWith('ru') ? 'ru' : 'en';
  
  // Get home path based on role
  const getHomePath = () => {
    switch (role) {
      case 'admin':
        return '/';
      case 'farmer':
        return '/';
      case 'mpk':
        return '/mpk/market';
      default:
        return '/auth';
    }
  };
  
  const handleGoHome = () => {
    navigate(getHomePath());
  };
  
  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      handleGoHome();
    }
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">
            {lang === 'ru' ? actionInfo.titleRu : actionInfo.title}
          </CardTitle>
          <CardDescription>
            {lang === 'ru' ? actionInfo.descriptionRu : actionInfo.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="text-sm text-muted-foreground">
              {lang === 'ru' ? 'Статус аккаунта:' : 'Account Status:'}
            </span>
            <Badge variant={accountStatus === 'active' ? 'default' : accountStatus === 'suspended' ? 'destructive' : 'secondary'}>
              {getStatusLabel(lang)}
            </Badge>
            {role && (
              <>
                <span className="text-muted-foreground">•</span>
                <Badge variant="outline">
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
              </>
            )}
          </div>
          
          {/* Reason Alert */}
          <Alert>
            <ActionIcon className="h-4 w-4" />
            <AlertDescription>
              {reason}
            </AlertDescription>
          </Alert>
          
          {/* Action Required */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="font-medium mb-1">
              {lang === 'ru' ? 'Требуемое действие:' : 'Action Required:'}
            </p>
            <p className="text-muted-foreground">
              {lang === 'ru' ? actionInfo.actionRu : actionInfo.action}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={handleGoHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              {lang === 'ru' ? 'На главную' : 'Go to Home'}
            </Button>
            <div className="flex gap-2">
              <Button onClick={handleGoBack} variant="outline" className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {lang === 'ru' ? 'Назад' : 'Go Back'}
              </Button>
              <Button onClick={handleLogout} variant="ghost" className="flex-1">
                {lang === 'ru' ? 'Выйти' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
