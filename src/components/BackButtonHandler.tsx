import { useEffect, useRef } from 'react';
import { toast } from 'sonner@2.0.3';

type BackButtonHandlerProps = {
  currentScreen: string;
  onNavigateBack: () => void;
  isAtRoot: boolean; // true cuando está en la pantalla principal (Inicio) sin modales/detalles
};

export function BackButtonHandler({
  currentScreen,
  onNavigateBack,
  isAtRoot,
}: BackButtonHandlerProps) {
  const lastBackPressTime = useRef<number>(0);
  const backPressToastId = useRef<string | number | undefined>();

  useEffect(() => {
    // Agregar entrada inicial al historial
    window.history.pushState({ screen: currentScreen }, '', '');

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();

      // Si está en la pantalla principal Y en la raíz (sin sub-pantallas), 
      // implementar "presiona dos veces para salir"
      if (isAtRoot && currentScreen === 'home') {
        const now = Date.now();
        const timeSinceLastPress = now - lastBackPressTime.current;

        if (timeSinceLastPress < 2000) {
          // Si presionó dos veces en menos de 2 segundos, permitir salir
          if (backPressToastId.current) {
            toast.dismiss(backPressToastId.current);
          }
          // No hacer nada, dejar que el navegador maneje la salida
          return;
        } else {
          // Primera presión, mostrar mensaje y prevenir salida
          lastBackPressTime.current = now;
          
          // Volver a agregar al historial para que no salga
          window.history.pushState({ screen: currentScreen }, '', '');
          
          // Mostrar toast
          if (backPressToastId.current) {
            toast.dismiss(backPressToastId.current);
          }
          backPressToastId.current = toast.info('Presiona atrás nuevamente para salir', {
            duration: 2000,
          });
        }
      } else {
        // No está en la raíz completa, navegar hacia atrás
        console.log('⬅️ Navegando hacia atrás desde:', currentScreen, 'isAtRoot:', isAtRoot);
        onNavigateBack();
        // Volver a agregar al historial
        window.history.pushState({ screen: currentScreen }, '', '');
      }
    };

    // Escuchar el evento popstate (botón de retroceso)
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (backPressToastId.current) {
        toast.dismiss(backPressToastId.current);
      }
    };
  }, [currentScreen, onNavigateBack, isAtRoot]);

  // Actualizar el historial cuando cambia la pantalla
  useEffect(() => {
    window.history.replaceState({ screen: currentScreen }, '', '');
  }, [currentScreen]);

  return null; // Este componente no renderiza nada
}