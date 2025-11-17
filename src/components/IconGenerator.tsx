import { useState, useRef, useEffect } from 'react';
import logoImage from 'figma:asset/f363da58c695d80309a491d46687c31d09664423.png';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { CheckCircle2 } from 'lucide-react';

type IconSize = {
  size: number;
  name: string;
  maskable?: boolean;
};

const ICON_SIZES: IconSize[] = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 512, name: 'maskable-icon-512x512.png', maskable: true }
];

export default function IconGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [generatedIcons, setGeneratedIcons] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Precargar la imagen
    const img = new Image();
    img.src = logoImage;
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
    };
  }, []);

  const generateIcon = (size: number, maskable = false): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!imgRef.current) {
        reject(new Error('Logo no cargado'));
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No se pudo crear el contexto del canvas'));
        return;
      }

      if (maskable) {
        // Para maskable icons, agregar padding del 10%
        const padding = size * 0.1;
        const imageSize = size - (padding * 2);
        
        // Fondo de seguridad para maskable (verde oscuro del logo)
        ctx.fillStyle = '#1e4620';
        ctx.fillRect(0, 0, size, size);
        
        ctx.drawImage(imgRef.current, padding, padding, imageSize, imageSize);
      } else {
        // Sin padding para iconos normales
        ctx.drawImage(imgRef.current, 0, 0, size, size);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('No se pudo generar el blob'));
        }
      }, 'image/png');
    });
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateAllIcons = async () => {
    setIsGenerating(true);
    setProgress(0);
    setGeneratedIcons([]);
    setIsComplete(false);

    try {
      const total = ICON_SIZES.length;
      const generated: string[] = [];

      for (let i = 0; i < total; i++) {
        const { size, name, maskable } = ICON_SIZES[i];
        
        setStatus(`Generando ${name}...`);
        setProgress(((i + 1) / total) * 100);

        const blob = await generateIcon(size, maskable);
        downloadFile(blob, name);
        generated.push(name);
        setGeneratedIcons([...generated]);

        // Pequeño delay entre descargas para no saturar el navegador
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setStatus('✅ ¡Todos los iconos generados exitosamente!');
      setIsComplete(true);

    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      console.error('Error generando iconos:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-emerald-600 mb-2">
            Generador de Iconos PWA
          </h1>
          <p className="text-gray-600">
            Gualán Market - Genera los 9 iconos necesarios para la PWA
          </p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
          <p className="text-blue-800">
            <strong>📱 Importante:</strong> Este generador creará los 9 iconos PNG optimizados 
            para tu PWA. El proceso es automático y tomará solo unos segundos.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
          <img 
            src={logoImage} 
            alt="Logo Gualán Market" 
            className="max-w-xs mx-auto rounded-lg shadow-md"
          />
          <p className="text-gray-500 text-sm mt-3">Logo original</p>
        </div>

        <Button 
          onClick={generateAllIcons}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-6 text-lg"
        >
          {isGenerating ? '⏳ Generando...' : '📥 Generar y Descargar Todos los Iconos (9 archivos PNG)'}
        </Button>

        {isGenerating && (
          <div className="mt-6">
            <Progress value={progress} className="mb-2" />
            <p className="text-center text-gray-600 text-sm">{status}</p>
          </div>
        )}

        {generatedIcons.length > 0 && (
          <div className="mt-6 space-y-2">
            {generatedIcons.map((icon) => (
              <div 
                key={icon}
                className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">{icon}</span>
              </div>
            ))}
          </div>
        )}

        {isComplete && (
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <h3 className="text-yellow-900 mb-2">
              ✅ ¡Iconos generados exitosamente!
            </h3>
            <p className="text-yellow-800 text-sm mb-3">
              Se han descargado 9 archivos PNG. Ahora debes:
            </p>
            <ol className="text-yellow-800 text-sm space-y-2 ml-5 list-decimal">
              <li>Abre la carpeta <code className="bg-white px-2 py-1 rounded text-xs">Downloads</code> (Descargas) de tu navegador</li>
              <li>Mueve todos los archivos <code className="bg-white px-2 py-1 rounded text-xs">icon-*.png</code> a: <code className="bg-white px-2 py-1 rounded text-xs">/public/icons/</code></li>
              <li>Verifica con: <code className="bg-white px-2 py-1 rounded text-xs">ls public/icons/*.png</code></li>
              <li>Ejecuta: <code className="bg-white px-2 py-1 rounded text-xs">node scripts/check-deployment-ready.js</code></li>
            </ol>
            <p className="text-yellow-800 mt-3">
              <strong>🚀 Después puedes proceder al deployment en Vercel</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
