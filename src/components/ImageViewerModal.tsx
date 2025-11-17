import { useState, useRef, useEffect, TouchEvent } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

type ImageViewerModalProps = {
  images: string[];
  initialIndex?: number;
  currentIndex?: number;
  onClose: () => void;
  onImageChange?: (index: number) => void;
  visible?: boolean;
};

export function ImageViewerModal({
  images,
  initialIndex = 0,
  currentIndex: propCurrentIndex,
  onClose,
  onImageChange,
  visible = true,
}: ImageViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(propCurrentIndex ?? initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset zoom and position when image changes
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Soporte de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          // Reset zoom
          setScale(1);
          setPosition({ x: 0, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, scale]); // Dependencias para que las funciones tengan acceso al estado actual

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      if (onImageChange) {
        onImageChange(currentIndex - 1);
      }
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      if (onImageChange) {
        onImageChange(currentIndex + 1);
      }
    }
  };

  // Handle pinch to zoom
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialDistance(distance);
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setLastTouch({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && initialDistance > 0) {
      e.preventDefault();
      const distance = getDistance(e.touches[0], e.touches[1]);
      const scaleChange = distance / initialDistance;
      const newScale = Math.min(Math.max(1, scale * scaleChange), 5);
      setScale(newScale);
      setInitialDistance(distance);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      e.preventDefault();
      const deltaX = e.touches[0].clientX - lastTouch.x;
      const deltaY = e.touches[0].clientY - lastTouch.y;

      setPosition({
        x: position.x + deltaX,
        y: position.y + deltaY,
      });

      setLastTouch({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setInitialDistance(0);
  };

  // Double tap to zoom
  const handleDoubleTap = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Detect double tap
  let tapTimeout: NodeJS.Timeout;
  let tapCount = 0;

  const handleTap = () => {
    tapCount++;
    if (tapCount === 1) {
      tapTimeout = setTimeout(() => {
        tapCount = 0;
      }, 300);
    } else if (tapCount === 2) {
      clearTimeout(tapTimeout);
      tapCount = 0;
      handleDoubleTap();
    }
  };

  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.1, 5);
    setScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.1, 1);
    setScale(newScale);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-80 text-white px-4 py-3 flex items-center justify-between absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-sm">
            {currentIndex + 1} / {images.length}
          </span>
          {scale > 1 && (
            <span className="text-sm text-emerald-400">
              {Math.round(scale * 100)}%
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-gray-800"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Image Container */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div
          ref={imageRef}
          className="relative w-full h-full flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleTap}
          style={{
            cursor: scale > 1 ? 'grab' : 'default',
          }}
        >
          <div
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${
                position.y / scale
              }px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease',
            }}
            className="max-w-full max-h-full"
          >
            <ImageWithFallback
              src={images[currentIndex]}
              alt={`Imagen ${currentIndex + 1}`}
              className="max-w-full max-h-screen object-contain"
            />
          </div>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && scale === 1 && (
          <>
            {currentIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full p-3"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}
            {currentIndex < images.length - 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full p-3"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            )}
          </>
        )}
      </div>

      {/* Instructions */}
      {scale === 1 && (
        <div className="bg-black bg-opacity-80 text-white px-4 py-3 text-center text-sm absolute bottom-0 left-0 right-0">
          <p className="text-gray-300">
            Toca dos veces o pellizca para hacer zoom • Desliza para cambiar imagen
          </p>
        </div>
      )}

      {/* Thumbnails */}
      {images.length > 1 && scale === 1 && (
        <div className="bg-black bg-opacity-80 px-4 py-3 overflow-x-auto absolute bottom-12 left-0 right-0">
          <div className="flex gap-2 justify-center">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                  index === currentIndex
                    ? 'border-emerald-500 scale-110'
                    : 'border-transparent opacity-60'
                }`}
              >
                <ImageWithFallback
                  src={img}
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}