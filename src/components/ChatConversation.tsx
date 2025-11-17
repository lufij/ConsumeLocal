import { MessageCircle, Send, ArrowLeft, Store as StoreIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import type { User } from '../App';
import { toast } from 'sonner@2.0.3';
import { chatsAPI } from '../utils/api';
import { cachedAPI } from '../utils/api';
import { notifyNewMessage } from '../utils/notifications';
import { lastSeenAPI } from '../utils/api'; // ✅ Añadido para Supabase KV

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
};

type ChatConversationProps = {
  currentUser: User;
  otherUser: {
    id: string;
    name: string;
    isStore?: boolean;
  };
  onBack: () => void;
};

export function ChatConversation({ currentUser, otherUser, onBack }: ChatConversationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = [currentUser.id, otherUser.id].sort().join('_');

  useEffect(() => {
    loadMessages();
    // Marcar mensajes como leídos cuando se abre la conversación
    markMessagesAsRead();
    // Scroll inmediato al abrir
    setTimeout(() => scrollToBottom(), 100);

    // Marcar como leído al desmontar el componente (cuando el usuario sale del chat)
    return () => {
      markMessagesAsRead();
      console.log('🔵 ChatConversation desmontado - mensajes marcados como leídos');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
    // Marcar como leído cada vez que cambian los mensajes (cuando llegan nuevos)
    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markMessagesAsRead = async () => {
    // ✅ MIGRADO A SUPABASE: Guardar el timestamp actual como "última vez vista" para esta conversación
    const now = new Date().toISOString();
    
    try {
      await lastSeenAPI.set(currentUser.id, conversationId, now);
      console.log(`✅ [CHAT] Mensajes marcados como leídos:`)
      console.log(`  - ConversationId: ${conversationId}`);
      console.log(`  - UserId: ${currentUser.id}`);
      console.log(`  - Timestamp: ${now}`);
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const result = await chatsAPI.getAll();
      if (result.success && result.data) {
        // El backend retorna conversaciones con array de mensajes
        const allChats = result.data as any[];
        
        // Encontrar la conversación actual
        const currentChat = allChats.find((chat: any) => chat.id === conversationId);
        
        if (currentChat && currentChat.messages) {
          setMessages(currentChat.messages);
        } else {
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString() + Math.random(),
      conversationId,
      senderId: currentUser.id,
      receiverId: otherUser.id,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      // Optimistic update
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Send to Supabase
      const result = await chatsAPI.sendMessage(conversationId, message);
      if (!result.success) {
        throw new Error(result.error || 'Error al enviar mensaje');
      }
      
      // Invalidar caché de chats para que los contadores se actualicen
      cachedAPI.invalidateChats();
      
      // Reload messages to get server data
      await loadMessages();
      
      // Notificar al receptor
      notifyNewMessage(otherUser.id, currentUser.name, conversationId, currentUser.id, message.text);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      toast.error('Error al enviar el mensaje');
      // Revert optimistic update
      await loadMessages();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit' });
    }
  };

  const formatDateSeparator = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Resetear horas para comparación de días
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    const messageDate = new Date(date);
    messageDate.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === today.getTime()) {
      return 'Hoy';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-GT', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  const shouldShowDateSeparator = (currentMsg: Message, prevMsg: Message | null) => {
    if (!prevMsg) return true;
    
    const currentDate = new Date(currentMsg.timestamp);
    const prevDate = new Date(prevMsg.timestamp);
    
    // Mostrar separador si es diferente día
    return currentDate.toDateString() !== prevDate.toDateString();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      {/* Header - FIJO para que siempre sea visible */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-lg text-gray-900">{otherUser.name}</h2>
            {otherUser.isStore && (
              <p className="text-xs text-gray-500">Tienda</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area - Anclado al fondo sin espacio vacío */}
      <div className="flex-1 overflow-y-auto flex flex-col-reverse px-4">
        <div className="max-w-4xl mx-auto w-full py-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Inicia la conversación enviando un mensaje
              </p>
            </div>
          ) : (
            <div className="flex flex-col-reverse space-y-3 space-y-reverse">
              <div ref={messagesEndRef} />
              {[...messages].reverse().map((message, index) => {
                const isMine = message.senderId === currentUser.id;
                const reversedMessages = [...messages].reverse();
                const prevMessage = index > 0 ? reversedMessages[index - 1] : null;
                const showDateSeparator = shouldShowDateSeparator(message, prevMessage);
                
                return (
                  <div key={message.id}>
                    {/* Mensaje */}
                    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2 ${
                          isMine
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="break-words">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isMine ? 'text-emerald-100' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Separador de fecha - DESPUÉS del mensaje porque está invertido */}
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-4">
                        <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                          {formatDateSeparator(message.timestamp)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            type="text"
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}