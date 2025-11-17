import { useState } from 'react';
import { Upload, X, Edit, Camera } from 'lucide-react';
import { ImageCropperModal } from './ImageCropperModal';
import { CameraCapture } from './CameraCapture';
import { Button } from './ui/button';

type LogoUploaderProps = {
  logo: string;
  onLogoChange: (logo: string) => void;
  label?: string;
};

export function LogoUploader({
  logo,
  onLogoChange,
  label = 'Logo',
}: LogoUploaderProps) {
  const [error, setError] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [tempImage, setTempImage] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }

    // Validate file size (max 2MB for logos)
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen es muy grande. Máximo 2MB');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setTempImage(base64);
      setShowCropper(true);
    } catch (err) {
      setError('Error al cargar la imagen');
    }

    // Reset input
    e.target.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSaveCrop = (croppedImage: string) => {
    console.log('🔵 [LogoUploader] Logo recortado, tamaño:', croppedImage.substring(0, 50) + '...');
    onLogoChange(croppedImage);
    console.log('🔵 [LogoUploader] Callback onLogoChange ejecutado');
    setShowCropper(false);
    setTempImage('');
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setTempImage('');
  };

  const removeLogo = () => {
    onLogoChange('');
  };

  const editLogo = () => {
    if (logo) {
      setTempImage(logo);
      setShowCropper(true);
    }
  };

  const handleCameraCapture = (base64: string) => {
    setTempImage(base64);
    setShowCropper(true);
  };

  return (
    <div>
      <label className="block text-sm text-gray-700 mb-2">{label}</label>

      {logo ? (
        <div className="space-y-2">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-emerald-500 bg-gray-50 shadow-md">
              <img
                src={logo}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={editLogo}
              className="absolute -bottom-2 -right-2 bg-emerald-600 text-white rounded-full p-2 hover:bg-emerald-700 transition-colors shadow-lg"
              title="Editar logo"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={removeLogo}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
              title="Eliminar logo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-emerald-600 font-medium">✓ Logo cargado correctamente</p>
        </div>
      ) : (
        <div className="space-y-2">
          <label
            htmlFor="logo-upload"
            className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-1" />
            <p className="text-xs text-gray-600 text-center px-2">Subir logo</p>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCamera(true)}
            className="w-32"
          >
            <Camera className="w-4 h-4 mr-1" />
            Cámara
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <p className="text-xs text-gray-500 mt-2">
        Opcional. PNG, JPG o JPEG (máx. 2MB)
      </p>

      {showCropper && tempImage && (
        <ImageCropperModal
          image={tempImage}
          onSave={handleSaveCrop}
          onCancel={handleCancelCrop}
          aspectRatio={1}
        />
      )}

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}