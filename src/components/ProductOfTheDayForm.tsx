import { useState } from 'react';
import { X, AlertCircle, Upload, Plus, Minus, Clock, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { toast } from 'sonner@2.0.3';
import type { Product } from '../App';
import { PhotoManager } from './PhotoManager';
import { productsAPI } from '../utils/api';
import { 
  createProductOfTheDayFields, 
  getCurrentGuatemalaTime,
  formatGuatemalaTime 
} from '../utils/productOfTheDay';

type ProductOfTheDayFormProps = {
  storeId: string;
  categories: string[];
  onClose: () => void;
  onProductAdded: () => void;
};

const LIMITS = {
  TITLE: 100,
  DESCRIPTION: 500,
  IMAGES: 5,
};

export function ProductOfTheDayForm({
  storeId,
  categories,
  onClose,
  onProductAdded,
}: ProductOfTheDayFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Comida');
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(true);

  const currentTime = getCurrentGuatemalaTime();
  const formattedCurrentTime = formatGuatemalaTime(currentTime);
  const endOfDayTime = new Date(currentTime);
  endOfDayTime.setHours(23, 59, 59, 999);
  const formattedEndTime = formatGuatemalaTime(endOfDayTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const newErrors: string[] = [];

    // Validaciones
    if (!title.trim()) {
      newErrors.push('El título es obligatorio');
    }
    if (title.length > LIMITS.TITLE) {
      newErrors.push(`El título no puede superar ${LIMITS.TITLE} caracteres`);
    }
    if (!description.trim()) {
      newErrors.push('La descripción es obligatoria');
    }
    if (description.length > LIMITS.DESCRIPTION) {
      newErrors.push(`La descripción no puede superar ${LIMITS.DESCRIPTION} caracteres`);
    }
    if (!price || parseFloat(price) <= 0) {
      newErrors.push('El precio debe ser mayor a 0');
    }
    if (parseFloat(price) > 999999) {
      newErrors.push('El precio es demasiado alto (máx. Q999,999)');
    }
    if (images.length === 0) {
      newErrors.push('Debes agregar al menos una imagen');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      toast.error('Por favor corrige los errores');
      return;
    }

    // Crear campos especiales para producto del día
    const productOfTheDayFields = createProductOfTheDayFields();

    // Crear producto
    const newProduct: Omit<Product, 'id' | 'createdAt'> = {
      storeId,
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      images,
      inStock: true,
      ...productOfTheDayFields, // Agregar campos de producto del día
    };

    // Guardar en Supabase
    productsAPI.create(newProduct)
      .then((result) => {
        if (result.success) {
          toast.success('¡Producto del día creado! 🌟', {
            description: `Se ocultará automáticamente a las 23:59`,
          });
          onProductAdded();
          onClose();
        } else {
          toast.error('Error al crear el producto');
          setErrors([result.error || 'Error desconocido']);
        }
      })
      .catch((error) => {
        console.error('Error creating product of the day:', error);
        toast.error('Error al crear el producto');
        setErrors(['Error al conectar con el servidor']);
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-amber-500 text-white p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6" />
            <h2 className="text-xl font-bold">Producto del Día</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-yellow-600">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Información importante */}
          {showInfo && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6 relative">
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-2 right-2 text-yellow-600 hover:text-yellow-800"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-bold text-yellow-900">⏰ Producto Temporal</h3>
                  <p className="text-sm text-yellow-800">
                    Este producto es ideal para ventas del día como:
                  </p>
                  <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
                    <li>Comida preparada (atol, tamales, pan fresco)</li>
                    <li>Productos perecederos</li>
                    <li>Ofertas especiales del día</li>
                  </ul>
                  <div className="bg-yellow-100 rounded-lg p-3 mt-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-yellow-900 mb-1">
                      <Calendar className="w-4 h-4" />
                      Hora de Guatemala
                    </div>
                    <p className="text-sm text-yellow-800">
                      <strong>Ahora:</strong> {formattedCurrentTime}
                    </p>
                    <p className="text-sm text-red-700 font-bold mt-1">
                      <strong>⚠️ Expira:</strong> {formattedEndTime}
                    </p>
                    <p className="text-xs text-yellow-700 mt-2">
                      El producto se eliminará automáticamente al finalizar el día
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <Label htmlFor="title">Título del Producto *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Ej: Atol de Arroz Caliente"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={LIMITS.TITLE}
                className="mt-1"
              />
              <p className={`text-xs mt-1 ${title.length > LIMITS.TITLE - 20 ? 'text-orange-600' : 'text-gray-500'}`}>
                {title.length}/{LIMITS.TITLE} caracteres
              </p>
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                placeholder="Describe tu producto del día..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={LIMITS.DESCRIPTION}
                rows={4}
                className="mt-1"
              />
              <p className={`text-xs mt-1 ${description.length > LIMITS.DESCRIPTION - 50 ? 'text-orange-600' : 'text-gray-500'}`}>
                {description.length}/{LIMITS.DESCRIPTION} caracteres
              </p>
            </div>

            {/* Precio y Categoría */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Precio (Q) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Imágenes */}
            <div>
              <PhotoManager
                images={images}
                onImagesChange={setImages}
                maxImages={LIMITS.IMAGES}
                label="Fotos del Producto *"
              />
              
              <p className="text-xs text-gray-500 mt-2">
                {images.length}/{LIMITS.IMAGES} imágenes agregadas
              </p>
            </div>

            {/* Errores */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    {errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-700">
                        • {error}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Producto del Día
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}