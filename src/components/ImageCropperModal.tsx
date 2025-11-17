import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, Check, X } from 'lucide-react';

type ImageCropperModalProps = {
  image: string;
  onSave: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
};

export function ImageCropperModal({
  image,
  onSave,
  onCancel,
  aspectRatio = 1,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onSave(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
        <h3 className="text-lg">Ajustar Imagen</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-white hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Cropper Area */}
      <div className="flex-1 relative">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          restrictPosition={false}
          style={{
            containerStyle: {
              backgroundColor: '#000',
            },
            mediaStyle: {
              display: 'block',
            },
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-gray-900 text-white px-4 py-6 space-y-4">
        {/* Zoom Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Zoom</span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <ZoomOut className="w-5 h-5 text-gray-400" />
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <ZoomIn className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={createCroppedImage}
          >
            <Check className="w-5 h-5 mr-2" />
            Listo
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to create cropped image
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: any
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
    }, 'image/jpeg');
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}