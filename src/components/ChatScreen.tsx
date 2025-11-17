import { MessageCircle, Search, ArrowLeft, Store as StoreIcon, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { ChatConversation } from './ChatConversation';
import type { User, Store } from '../App';
import { cachedAPI, lastSeenAPI } from '../utils/api';

type ChatScreenProps = {
  currentUser: User;
  onBack?: () => void;
  initialStoreId?: string;
  initialStoreName?: string;
  initialUserId?: string; // ID del usuario a contactar directamente
  initialUserName?: string; // Nombre del usuario a contactar
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
};

type Conversation = {
  id: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  isStore?: boolean;
};

export function ChatScreen({ currentUser, onBack, initialStoreId, initialStoreName, initialUserId, initialUserName }: ChatScreenProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    loadConversations();

    // Si se proporciona una tienda inicial, abrir esa conversación
    if (initialStoreId && initialStoreName) {
      openConversation(initialStoreId, initialStoreName, true);
    }

    // Si se proporciona un usuario inicial, abrir esa conversación
    if (initialUserId && initialUserName) {
      openConversation(initialUserId, initialUserName, false);
    }
  }, []);

  const openConversation = (otherUserId: string, otherUserName: string, isStore: boolean = false) => {
    const conversationId = [currentUser.id, otherUserId].sort().join('_');
    
    setSelectedConversation({
      id: conversationId,
      otherUserId,
      otherUserName,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unread: 0,
      isStore,
    });
  };

  const loadConversations = async () => {
    try {
      // Cargar todos los datos en paralelo con caché
      const [chatsResult, usersResult, storesResult] = await Promise.all([
        cachedAPI.getChats(),
        cachedAPI.getUsers(),
        cachedAPI.getStores(),
      ]);

      if (!chatsResult.success || !chatsResult.data) {
        setConversations([]);
        return;
      }

      const allChats = chatsResult.data as any[];
      const users = usersResult.success ? usersResult.data as User[] : [];
      const stores = storesResult.success ? storesResult.data as Store[] : [];

      console.log('📱 [ChatScreen] Datos cargados con caché - Chats:', allChats.length);

      // ✅ MIGRADO A SUPABASE: Obtener todos los lastSeen del usuario
      const lastSeenData = await lastSeenAPI.getAll(currentUser.id);

      // Crear lista de conversaciones
      const conversationsList: Conversation[] = [];
      
      allChats.forEach((chat: any) => {
        const conversationId = chat.id;
        const messages = chat.messages || [];
        
        // Filtrar solo conversaciones donde participa el usuario actual
        const participatesInChat = messages.some((msg: any) => 
          msg.senderId === currentUser.id || msg.receiverId === currentUser.id
        );
        
        if (!participatesInChat || messages.length === 0) {
          return;
        }
        
        // Ordenar mensajes por fecha
        messages.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        const lastMessage = messages[0];
        const otherUserId = lastMessage.senderId === currentUser.id 
          ? lastMessage.receiverId 
          : lastMessage.senderId;
        
        // Obtener nombre del otro usuario
        let otherUserName = 'Usuario';
        let isStore = false;
        
        const store = stores.find(s => s.userId === otherUserId);
        if (store) {
          otherUserName = store.name;
          isStore = true;
        } else {
          const user = users.find(u => u.id === otherUserId);
          if (user) {
            otherUserName = user.name;
          }
        }
        
        // ✅ Contar mensajes no leídos desde Supabase
        const lastSeenTime = lastSeenData[conversationId] || null;
        const lastSeen = lastSeenTime ? new Date(lastSeenTime) : new Date(0);
        
        const unreadCount = messages.filter((msg: any) => 
          msg.receiverId === currentUser.id && 
          new Date(msg.timestamp) > lastSeen
        ).length;
        
        conversationsList.push({
          id: conversationId,
          otherUserId,
          otherUserName,
          lastMessage: lastMessage.text,
          lastMessageTime: lastMessage.timestamp,
          unread: unreadCount,
          isStore,
        });
      });

      // Ordenar por última actividad
      conversationsList.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      setConversations(conversationsList);
    } catch (error) {
      console.error('Error cargando conversaciones:', error);
      setConversations([]);
    }
  };

  const handleBack = () => {
    if (selectedConversation) {
      setSelectedConversation(null);
      loadConversations(); // Recargar conversaciones al volver
    } else if (onBack) {
      onBack();
    }
  };

  if (selectedConversation) {
    return (
      <ChatConversation
        currentUser={currentUser}
        otherUser={{
          id: selectedConversation.otherUserId,
          name: selectedConversation.otherUserName,
          isStore: selectedConversation.isStore,
        }}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </Button>
      )}
      <h2 className="text-2xl text-gray-900 mb-6">Mensajes</h2>

      {conversations.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl text-gray-600 mb-2">
            No tienes conversaciones
          </h3>
          <p className="text-gray-500">
            Cuando contactes a un vendedor, tus conversaciones aparecerán aquí
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map(conversation => (
            <Card
              key={conversation.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openConversation(
                conversation.otherUserId, 
                conversation.otherUserName,
                conversation.isStore
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg text-gray-900 mb-1">
                    {conversation.otherUserName}
                    {conversation.isStore && (
                      <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                        Tienda
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {conversation.lastMessage}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">
                    {new Date(conversation.lastMessageTime).toLocaleDateString('es-GT', {
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </p>
                  {conversation.unread > 0 && (
                    <span className="bg-emerald-600 text-white text-xs rounded-full px-2 py-1">
                      {conversation.unread}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}