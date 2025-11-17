import { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle, Loader2, SwitchCamera } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  requestCameraAccess, 
  stopCameraStream,
  switchCamera as switchCameraUtil,
  checkCameraPermission
} from '../utils/cameraPermissions';
import { compressImage } from '../utils/imageProcessor';
import { toast } from 'sonner@2.0.3';

type CameraCaptureProps = {
  onCapture: (image: string) => void;
  onClose: () => void;
};

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [switching, setSwitching] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Inicializar cámara
  useEffect(() => {
    initCamera();
    
    return () => {
      // Limpiar al desmontar
      if (stream) {
        stopCameraStream(stream);
      }
    };
  }, []);

  const initCamera = async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar permiso primero
      const permissionResult = await checkCameraPermission();
      
      if (!permissionResult.canUseCamera) {
        setError(permissionResult.message);
        setLoading(false);
        return;
      }

      // Solicitar acceso
      const result = await requestCameraAccess();
      
      if (!result.success || !result.stream) {
        setError(result.error || 'No se pudo acceder a la cámara');
        setLoading(false);
        return;
      }

      // Configurar video
      if (videoRef.current) {
        videoRef.current.srcObject = result.stream;
        await videoRef.current.play();
      }

      setStream(result.stream);
      setLoading(false);
      
      toast.success('Cámara lista', {
        description: 'Toca el botón para capturar',
      });
    } catch (err) {
      console.error('Error inicializando cámara:', err);
      setError('Error al inicializar la cámara');
      setLoading(false);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Configurar canvas con las dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Dibujar frame actual del video
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error('Error al capturar');
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convertir a base64
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageData);

      // Feedback auditivo/visual
      playShutterSound();
      
      toast.success('¡Foto capturada!', {
        description: 'Revisa la vista previa',
      });
    } catch (err) {
      console.error('Error capturando imagen:', err);
      toast.error('Error al capturar la foto');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = async () => {
    if (!capturedImage) return;

    setProcessing(true);

    try {
      // Comprimir imagen antes de enviar
      const compressed = await compressImage(capturedImage, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        format: 'jpeg',
      });

      onCapture(compressed);
      
      toast.success('¡Foto agregada!', {
        description: 'La imagen ha sido procesada',
      });

      // Cerrar después de un breve delay
      setTimeout(() => {
        handleClose();
      }, 300);
    } catch (err) {
      console.error('Error procesando imagen:', err);
      toast.error('Error al procesar la imagen');
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (stream) {
      stopCameraStream(stream);
    }
    onClose();
  };

  const handleSwitchCamera = async () => {
    if (!stream) return;

    setSwitching(true);
    
    try {
      const result = await switchCameraUtil(stream, facingMode);
      
      if (result.success && result.stream && result.facingMode) {
        // Configurar nuevo stream
        if (videoRef.current) {
          videoRef.current.srcObject = result.stream;
          await videoRef.current.play();
        }

        setStream(result.stream);
        setFacingMode(result.facingMode);
        
        toast.success('Cámara cambiada', {
          description: result.facingMode === 'user' ? 'Cámara frontal' : 'Cámara trasera',
        });
      } else {
        toast.error(result.error || 'No se pudo cambiar la cámara');
      }
    } catch (err) {
      console.error('Error cambiando cámara:', err);
      toast.error('Error al cambiar la cámara');
    } finally {
      setSwitching(false);
    }
  };

  const playShutterSound = () => {
    // Feedback háptico en dispositivos compatibles
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <h3 className="text-white flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Capturar Foto
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative">
        {loading && (
          <div className="text-center text-white">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
            <p>Iniciando cámara...</p>
          </div>
        )}

        {error && (
          <Card className="mx-4 p-6 max-w-md">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg mb-2">Error de Cámara</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-y-2">
                <Button onClick={initCamera} className="w-full">
                  Reintentar
                </Button>
                <Button variant="outline" onClick={handleClose} className="w-full">
                  Cerrar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {!loading && !error && !capturedImage && (
          <>
            {/* Video Preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Switch Camera Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwitchCamera}
              disabled={switching}
              className="absolute top-20 right-4 bg-black/50 text-white hover:bg-black/70"
            >
              {switching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <SwitchCamera className="w-5 h-5" />
              )}
            </Button>

            {/* Capture Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-white/20" />
                ))}
              </div>
            </div>
          </>
        )}

        {capturedImage && (
          <div className="w-full h-full relative">
            <img
              src={capturedImage}
              alt="Captura"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      {!loading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <div className="max-w-2xl mx-auto">
            {!capturedImage ? (
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleCapture}
                  className="w-20 h-20 rounded-full bg-white hover:bg-gray-100 border-4 border-white/50 shadow-xl"
                >
                  <Camera className="w-8 h-8 text-gray-900" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleRetake}
                  disabled={processing}
                  className="bg-white/90 hover:bg-white"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Repetir
                </Button>
                <Button
                  size="lg"
                  onClick={handleConfirm}
                  disabled={processing}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5 mr-2" />
                  )}
                  Usar Foto
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
