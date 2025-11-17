/**
 * Utilidad para procesamiento y optimización de imágenes
 * Optimizado para conexiones 3G/4G
 */

export type ImageProcessOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
};

export type ProcessedImage = {
  original: string;
  compressed: string;
  thumbnail: string;
  size: {
    original: number;
    compressed: number;
    thumbnail: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
};

/**
 * Comprime una imagen manteniendo la calidad visual
 */
export async function compressImage(
  file: File | string,
  options: ImageProcessOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    format = 'jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calcular dimensiones manteniendo aspecto
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Crear canvas para redimensionar
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }

        // Mejorar calidad de redimensionamiento
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a base64 comprimido
        const mimeType = `image/${format}`;
        const compressed = canvas.toDataURL(mimeType, quality);
        
        resolve(compressed);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'));
    };

    // Cargar imagen desde File o string (base64/URL)
    if (typeof file === 'string') {
      img.src = file;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    }
  });
}

/**
 * Genera una miniatura para vista previa rápida
 */
export async function generateThumbnail(
  image: string,
  size: number = 200
): Promise<string> {
  return compressImage(image, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg',
  });
}

/**
 * Procesa una imagen completa con todas las variantes
 */
export async function processImage(
  file: File
): Promise<ProcessedImage> {
  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }

  // Validar tamaño (máximo 10MB para el original)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('La imagen es muy grande. Máximo 10MB');
  }

  // Leer imagen original
  const originalBase64 = await fileToBase64(file);
  
  // Obtener dimensiones originales
  const dimensions = await getImageDimensions(originalBase64);

  // Generar versión comprimida (para display)
  const compressed = await compressImage(originalBase64, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.85,
    format: 'jpeg',
  });

  // Generar miniatura (para listas/grid)
  const thumbnail = await generateThumbnail(originalBase64, 200);

  // Calcular tamaños
  const originalSize = Math.round((originalBase64.length * 3) / 4);
  const compressedSize = Math.round((compressed.length * 3) / 4);
  const thumbnailSize = Math.round((thumbnail.length * 3) / 4);

  return {
    original: originalBase64,
    compressed,
    thumbnail,
    size: {
      original: originalSize,
      compressed: compressedSize,
      thumbnail: thumbnailSize,
    },
    dimensions,
  };
}

/**
 * Convierte un File a base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Obtiene las dimensiones de una imagen
 */
export function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'));
    };
    img.src = src;
  });
}

/**
 * Calcula el tamaño en KB/MB de una imagen base64
 */
export function getBase64Size(base64: string): { bytes: number; formatted: string } {
  const bytes = Math.round((base64.length * 3) / 4);
  
  let formatted: string;
  if (bytes < 1024) {
    formatted = `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    formatted = `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    formatted = `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return { bytes, formatted };
}

/**
 * Valida si una imagen es válida
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  // Validar tipo
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'El archivo debe ser una imagen' };
  }

  // Validar extensión
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !validExtensions.includes(extension)) {
    return { 
      valid: false, 
      error: 'Formato no soportado. Use: JPG, PNG, GIF o WEBP' 
    };
  }

  // Validar tamaño
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'La imagen es muy grande. Máximo 10MB' 
    };
  }

  return { valid: true };
}
