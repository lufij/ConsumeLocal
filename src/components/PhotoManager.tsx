import { useState, useRef } from 'react';
import { GripVertical, X, Star, Image as ImageIcon, Camera, Upload, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CameraCapture } from './CameraCapture';
import { processImage, validateImage } from '../utils/imageProcessor';
import { toast } from 'sonner@2.0.3';

type PhotoManagerProps = {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
};

export function PhotoManager({
  images,
  onImagesChange,
  maxImages = 5,
  label = 'Fotos del Producto',
}: PhotoManagerProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Abrir cámara
  const handleOpenCamera = () => {
    setShowCamera(true);
  };

  // Capturar foto desde cámara
  const handleCameraCapture = async (image: string) => {
    try {
      setProcessing(true);
      
      // Agregar imagen
      const newImages = [...images, image];
      onImagesChange(newImages);
      
      setShowCamera(false);
    } catch (err) {
      console.error('Error agregando foto:', err);
      toast.error('Error al agregar la foto');
    } finally {
      setProcessing(false);
    }
  };

  // Seleccionar desde galería
  const handleGallerySelect = () => {
    fileInputRef.current?.click();
  };

  // Procesar archivos seleccionados
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setProcessing(true);

    try {
      // Verificar límite
      if (images.length + files.length > maxImages) {
        toast.error(`Máximo ${maxImages} imágenes`, {
          description: `Solo puedes agregar ${maxImages - images.length} imágenes más`,
        });
        return;
      }

      const newImages: string[] = [];
      let errorCount = 0;

      // Procesar cada archivo
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validar
        const validation = validateImage(file);
        if (!validation.valid) {
          toast.error(`Error: ${file.name}`, {
            description: validation.error,
          });
          errorCount++;
          continue;
        }

        try {
          // Procesar imagen
          const processed = await processImage(file);
          newImages.push(processed.compressed);

          // Mostrar info de compresión
          const savings = Math.round(
            ((processed.size.original - processed.size.compressed) / 
            processed.size.original) * 100
          );
          
          if (savings > 20) {
            console.log(
              `Imagen optimizada: ${file.name} (${savings}% más ligera)`
            );
          }
        } catch (err) {
          console.error(`Error procesando ${file.name}:`, err);
          errorCount++;
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
        
        toast.success(`${newImages.length} foto${newImages.length > 1 ? 's' : ''} agregada${newImages.length > 1 ? 's' : ''}`, {
          description: errorCount > 0 ? `${errorCount} archivo${errorCount > 1 ? 's' : ''} no pudo${errorCount > 1 ? '' : 'o'} procesarse` : undefined,
        });
      } else if (errorCount > 0) {
        toast.error('No se pudo procesar ninguna imagen');
      }
    } catch (err) {
      console.error('Error procesando imágenes:', err);
      toast.error('Error al procesar las imágenes');
    } finally {
      setProcessing(false);
      // Reset input
      e.target.value = '';
    }
  };

  // Eliminar imagen
  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    toast.success('Foto eliminada');
  };

  // Establecer como principal
  const handleSetPrimary = (index: number) => {
    if (index === 0) return;

    const newImages = [...images];
    const [primary] = newImages.splice(index, 1);
    newImages.unshift(primary);
    onImagesChange(newImages);
    
    toast.success('Foto principal actualizada');
  };

  // Drag and Drop para reordenar
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggingIndex === null) return;

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggingIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    onImagesChange(newImages);
    
    setDraggingIndex(null);
    setDragOverIndex(null);
    
    toast.success('Orden actualizado');
  };

  return (
    <div>
      <label className="block text-sm text-gray-700 mb-3">{label} *</label>

      {/* Grid de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {images.map((image, index) => (
            <Card
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`
                relative aspect-square overflow-hidden group cursor-move
                transition-all duration-200
                ${draggingIndex === index ? 'opacity-50 scale-95' : ''}
                ${dragOverIndex === index ? 'ring-2 ring-emerald-500' : ''}
              `}
            >
              {/* Imagen */}
              <img
                src={image}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />

              {/* Overlay con controles */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                  {index !== 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetPrimary(index)}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemove(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Drag handle */}
                <div className="absolute top-2 left-2 bg-white/90 rounded-full p-1">
                  <GripVertical className="w-4 h-4 text-gray-700" />
                </div>
              </div>

              {/* Badge de principal */}
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-emerald-600 text-white text-xs text-center py-1.5 font-medium">
                  <Star className="w-3 h-3 inline mr-1 fill-current" />
                  Principal
                </div>
              )}

              {/* Número de orden */}
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                {index + 1}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Botones de agregar */}
      {images.length < maxImages && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Botón Cámara */}
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenCamera}
              disabled={processing}
              className="h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed hover:border-emerald-500 hover:bg-emerald-50"
            >
              <Camera className="w-8 h-8 text-emerald-600" />
              <div className="text-center">
                <p className="text-sm">Tomar Foto</p>
                <p className="text-xs text-gray-500">Cámara</p>
              </div>
            </Button>

            {/* Botón Galería */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGallerySelect}
              disabled={processing}
              className="h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed hover:border-emerald-500 hover:bg-emerald-50"
            >
              {processing ? (
                <>
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="text-sm">Procesando...</p>
                </>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-emerald-600" />
                  <div className="text-center">
                    <p className="text-sm">Galería</p>
                    <p className="text-xs text-gray-500">Seleccionar</p>
                  </div>
                </>
              )}
            </Button>
          </div>

          {/* Input file oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Info */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            {images.length}/{maxImages} foto{images.length !== 1 ? 's' : ''}
          </span>
          {images.length > 0 && (
            <span className="text-emerald-600">
              Arrastra para reordenar
            </span>
          )}
        </div>

        {images.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <ImageIcon className="w-4 h-4 inline mr-1" />
            La primera foto será la imagen principal del producto
          </div>
        )}
      </div>

      {/* Modal de cámara */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
