import { useState, useEffect } from 'react';
import { Store, Phone, User as UserIcon, Sparkles, ShoppingBag, TrendingUp, Share2, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Toaster } from './ui/sonner';
import { AppLogo } from './AppLogo';
import type { User } from '../App';
import { shareApp } from '../utils/share';
import { toast } from 'sonner@2.0.3';
import { useCountUp } from '../hooks/useCountUp';
import { requestNotificationPermissionWithContext } from '../utils/browserNotifications';
import { FloatingInstallButton } from './FloatingInstallButton';
import { usersAPI } from '../utils/api';

type AuthScreenProps = {
  onLogin: (user: User) => void;
};

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);

  // Obtener cantidad de usuarios registrados desde Supabase
  useEffect(() => {
    const loadTotalUsers = async () => {
      try {
        const result = await usersAPI.getAll();
        if (result.success && result.data) {
          setTotalUsers((result.data as any[]).length);
        }
      } catch (error) {
        console.error('Error al obtener total de usuarios:', error);
      }
    };
    
    loadTotalUsers();
  }, []);

  const animatedCount = useCountUp(totalUsers, 2000);

  const handleShareApp = () => {
    console.log('📲 Compartiendo aplicación...');
    try {
      shareApp(totalUsers);
      toast.success('¡Abriendo WhatsApp para compartir!');
    } catch (error) {
      console.error('Error al compartir:', error);
      toast.error('No se pudo abrir WhatsApp');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate phone number
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 8) {
      setError('Por favor ingresa un número de teléfono válido (8 dígitos)');
      return;
    }

    if (!isLogin && !name.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    try {
      if (isLogin) {
        // Login - buscar usuario en Supabase
        const result = await usersAPI.getByPhone(cleanPhone);
        
        if (!result.success || !result.data) {
          setError('No existe una cuenta con este número. Por favor regístrate.');
          return;
        }
        
        onLogin(result.data as User);
      } else {
        // Register - crear usuario en Supabase
        const result = await usersAPI.create({
          phone: cleanPhone,
          name: name.trim(),
        });
        
        if (!result.success) {
          if (result.error?.includes('ya existe')) {
            setError('Ya existe una cuenta con este número. Inicia sesión.');
          } else {
            setError(result.error || 'Error al crear la cuenta');
          }
          return;
        }
        
        onLogin(result.data as User);
      }
    } catch (error) {
      console.error('Error en autenticación:', error);
      setError('Error de conexión. Por favor intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center p-4">
      <Toaster position="top-center" richColors />
      <Card className="w-full max-w-md p-6 bg-white/95 backdrop-blur">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <AppLogo size="xl" />
          </div>
          <h1 className="text-2xl text-emerald-900 mb-1">Gualán Consume Local</h1>
          <p className="text-sm text-gray-600">
            Tu mercado local en línea
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="phone" className="flex items-center gap-2 mb-1.5 text-sm">
              <Phone className="w-3.5 h-3.5" />
              Número de Teléfono
            </Label>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2.5 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600 text-sm">
                +502
              </span>
              <Input
                id="phone"
                type="tel"
                placeholder="12345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={8}
                className="flex-1 rounded-l-none h-9"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">8 dígitos</p>
          </div>

          {!isLogin && (
            <div>
              <Label htmlFor="name" className="flex items-center gap-2 mb-1.5 text-sm">
                <UserIcon className="w-3.5 h-3.5" />
                Nombre Completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9"
                required={!isLogin}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 h-9"
          >
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </Button>

          {/* Área de registro/cambio más llamativa */}
          {isLogin ? (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 rounded-lg blur opacity-75 animate-pulse"></div>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="relative w-full bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 hover:from-amber-500 hover:via-orange-500 hover:to-pink-600 text-white py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center justify-center gap-2 mb-0.5">
                  <Sparkles className="w-4 h-4 animate-bounce" />
                  <span className="font-bold">¡Únete Gratis!</span>
                  <Sparkles className="w-4 h-4 animate-bounce" />
                </div>
                <p className="text-xs text-white/90">
                  Crea tu cuenta y empieza a comprar o vender
                </p>
              </button>
            </div>
          ) : (
            <div className="text-center bg-gray-50 py-2.5 px-4 rounded-lg border-2 border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-emerald-700 hover:text-emerald-800 font-medium transition-colors text-sm"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            </div>
          )}
        </form>

        {/* Beneficios destacados cuando está en modo login */}
        {isLogin && (
          <div className="mt-4 space-y-1.5">
            {/* Tarjetas de beneficios ultra compactas en una sola fila */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="flex flex-col items-center gap-1 bg-emerald-50 p-1.5 rounded-lg">
                <div className="bg-emerald-100 p-1 rounded-full">
                  <ShoppingBag className="w-3 h-3 text-emerald-600" />
                </div>
                <p className="text-[10px] text-gray-700 text-center leading-tight">
                  <span className="font-semibold block">Compra</span>
                  <span className="text-gray-600">local</span>
                </p>
              </div>
              <div className="flex flex-col items-center gap-1 bg-amber-50 p-1.5 rounded-lg">
                <div className="bg-amber-100 p-1 rounded-full">
                  <Store className="w-3 h-3 text-amber-600" />
                </div>
                <p className="text-[10px] text-gray-700 text-center leading-tight">
                  <span className="font-semibold block">Vende</span>
                  <span className="text-gray-600">fácil</span>
                </p>
              </div>
              <div className="flex flex-col items-center gap-1 bg-blue-50 p-1.5 rounded-lg">
                <div className="bg-blue-100 p-1 rounded-full">
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                </div>
                <p className="text-[10px] text-gray-700 text-center leading-tight">
                  <span className="font-semibold block">Crece</span>
                  <span className="text-gray-600">negocio</span>
                </p>
              </div>
            </div>

            {/* Contador de usuarios compacto */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-2.5 rounded-lg border-2 border-purple-200">
              <div className="flex items-center justify-center gap-2">
                <div className="bg-purple-100 p-1.5 rounded-full">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-900 tabular-nums">
                    {animatedCount.toLocaleString('es-GT')}
                  </div>
                  <p className="text-[10px] text-purple-700 font-medium -mt-0.5">
                    usuarios registrados
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de compartir aplicación compacto */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-2.5 rounded-lg border-2 border-emerald-200">
              <div className="text-center mb-2">
                <p className="text-xs text-gray-700">
                  <span className="font-semibold text-emerald-800">¡Ayúdanos a crecer!</span>
                </p>
              </div>
              
              <Button
                type="button"
                onClick={handleShareApp}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md h-8 text-xs"
              >
                <Share2 className="w-3.5 h-3.5 mr-1.5" />
                Compartir Aplicación
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Compra y vende productos locales en Gualán, Zacapa
          </p>
        </div>
      </Card>
      <FloatingInstallButton />
    </div>
  );
}