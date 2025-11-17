import { MessageSquare, Package, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type FloatingNotificationButtonsProps = {
  messagesCount: number;
  ordersCount: number;
  onMessagesClick: () => void;
  onOrdersClick: () => void;
  currentScreen?: string;
};

export function FloatingNotificationButtons({
  messagesCount,
  ordersCount,
  onMessagesClick,
  onOrdersClick,
  currentScreen = 'home',
}: FloatingNotificationButtonsProps) {
  const [dismissedMessages, setDismissedMessages] = useState(false);
  const [dismissedOrders, setDismissedOrders] = useState(false);

  // Reset dismissed state cuando cambian los contadores
  useEffect(() => {
    if (messagesCount > 0) {
      setDismissedMessages(false);
    }
  }, [messagesCount]);

  useEffect(() => {
    if (ordersCount > 0) {
      setDismissedOrders(false);
    }
  }, [ordersCount]);

  // No mostrar en la pantalla de perfil
  const showButtons = currentScreen !== 'profile';

  const showMessages = messagesCount > 0 && !dismissedMessages && showButtons;
  const showOrders = ordersCount > 0 && !dismissedOrders && showButtons;

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-3">
      <AnimatePresence>
        {/* Botón de Mensajes */}
        {showMessages && (
          <motion.div
            key="messages-notification"
            initial={{ scale: 0, opacity: 0, x: 100 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0, x: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative"
          >
            <button
              onClick={onMessagesClick}
              className="bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-3 pl-5 pr-6 py-4 group"
            >
              {/* Icono de Mensaje con Badge */}
              <div className="relative">
                <MessageSquare className="w-6 h-6" />
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10">
                  <span className="text-xs font-bold text-white">{messagesCount}</span>
                </div>
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-400 rounded-full animate-ping" />
              </div>

              {/* Texto */}
              <div className="flex flex-col items-start">
                <span className="font-semibold text-sm">
                  {messagesCount} {messagesCount === 1 ? 'Mensaje' : 'Mensajes'}
                </span>
                <span className="text-xs text-blue-100">
                  {messagesCount === 1 ? 'nuevo' : 'nuevos'}
                </span>
              </div>

              {/* Botón de cerrar (X) - Cambiado de button a div */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setDismissedMessages(true);
                }}
                className="ml-2 p-1 hover:bg-blue-500 rounded-full transition-colors cursor-pointer"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </div>
            </button>

            {/* Indicador de pulsación */}
            <div className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping pointer-events-none" />
          </motion.div>
        )}

        {/* Botón de Pedidos */}
        {showOrders && (
          <motion.div
            key="orders-notification"
            initial={{ scale: 0, opacity: 0, x: 100 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0, x: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
            className="relative"
          >
            <button
              onClick={onOrdersClick}
              className="bg-emerald-600 text-white rounded-full shadow-xl hover:bg-emerald-700 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-3 pl-5 pr-6 py-4 group"
            >
              {/* Icono de Pedido con Badge */}
              <div className="relative">
                <Package className="w-6 h-6" />
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10">
                  <span className="text-xs font-bold text-white">{ordersCount}</span>
                </div>
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-400 rounded-full animate-ping" />
              </div>

              {/* Texto */}
              <div className="flex flex-col items-start">
                <span className="font-semibold text-sm">
                  {ordersCount} {ordersCount === 1 ? 'Pedido' : 'Pedidos'}
                </span>
                <span className="text-xs text-emerald-100">
                  {ordersCount === 1 ? 'confirmado' : 'confirmados'}
                </span>
              </div>

              {/* Botón de cerrar (X) - Cambiado de button a div */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setDismissedOrders(true);
                }}
                className="ml-2 p-1 hover:bg-emerald-500 rounded-full transition-colors cursor-pointer"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </div>
            </button>

            {/* Indicador de pulsación */}
            <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}