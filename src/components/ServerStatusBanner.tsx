import { AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ServerStatusBanner() {
  const [isServerDown, setIsServerDown] = useState(false);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const projectId = (await import('../utils/supabase/info')).projectId;
        const publicAnonKey = (await import('../utils/supabase/info')).publicAnonKey;
        const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5d0cb103`;
        
        const response = await fetch(`${API_BASE_URL}/health`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        if (!response.ok) {
          setIsServerDown(true);
        }
      } catch (error) {
        setIsServerDown(true);
      }
    };

    checkServer();
  }, []);

  if (!isServerDown) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
      <div className="flex items-start gap-3 max-w-7xl mx-auto">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Servidor No Disponible (Modo Preview)
          </h3>
          <p className="text-sm text-amber-700 mt-1">
            El servidor Supabase Edge Functions no está desplegado. 
            Esta es una vista previa limitada. Para usar la aplicación completa, 
            despliega en: <span className="font-medium">https://github.com/lufij/ConsumeLocal.git</span>
          </p>
          <p className="text-xs text-amber-600 mt-2">
            ℹ️ El sistema de mensajes usa localStorage como respaldo temporal.
          </p>
        </div>
      </div>
    </div>
  );
}
