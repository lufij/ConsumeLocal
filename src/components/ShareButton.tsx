import { Share2, Copy, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { copyToClipboard } from '../utils/share';
import { toast } from 'sonner@2.0.3';

type ShareButtonProps = {
  onWhatsAppShare: () => void;
  shareMessage: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  label?: string;
  showLabel?: boolean;
};

export function ShareButton({
  onWhatsAppShare,
  shareMessage,
  variant = 'outline',
  size = 'default',
  className = '',
  label = 'Compartir',
  showLabel = true,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('🔵 ShareButton montado');
    console.log('📝 Mensaje a compartir:', shareMessage?.substring(0, 100) + '...');
  }, [shareMessage]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleCopyLink = async () => {
    console.log('📋 Intentando copiar mensaje...');
    const success = await copyToClipboard(shareMessage);
    
    if (success) {
      setCopied(true);
      toast.success('¡Mensaje copiado al portapapeles!');
      console.log('✅ Mensaje copiado exitosamente');
      setIsOpen(false);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } else {
      toast.error('No se pudo copiar el mensaje');
      console.log('❌ Error al copiar mensaje');
    }
  };

  const handleWhatsAppShare = () => {
    console.log('📲 Compartiendo por WhatsApp...');
    console.log('📝 Mensaje completo:', shareMessage);
    try {
      onWhatsAppShare();
      setIsOpen(false);
      console.log('✅ Función onWhatsAppShare ejecutada');
    } catch (error) {
      console.error('❌ Error al ejecutar onWhatsAppShare:', error);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `
      }} />
      
      <div className="relative">
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          onClick={(e) => {
            console.log('🔘 Botón Compartir presionado');
            console.log('📊 Estado isOpen:', isOpen);
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <Share2 className={showLabel ? 'w-4 h-4 mr-2' : 'w-4 h-4'} />
          {showLabel && label}
        </Button>

        {isOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[10000]"
            style={{
              animation: 'fadeIn 0.15s ease-out'
            }}
          >
            <button
              onClick={handleWhatsAppShare}
              className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">WhatsApp</p>
                <p className="text-xs text-gray-500">Compartir por mensaje</p>
              </div>
            </button>
            
            <div className="h-px bg-gray-200 my-1" />
            
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">
                  {copied ? '¡Copiado!' : 'Copiar mensaje'}
                </p>
                <p className="text-xs text-gray-500">
                  {copied ? 'Listo para pegar' : 'Copiar al portapapeles'}
                </p>
              </div>
            </button>
          </div>
        )}
      </div>
    </>
  );
}