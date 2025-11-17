import { useState } from 'react';
import { X, Plus, Trash2, Camera, Upload, AlertCircle, PackageCheck, PackageX } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { Switch } from './ui/switch';
import { PhotoManager } from './PhotoManager';
import type { Product, Store } from '../App';
import { capturePhoto } from '../utils/camera';
import { productsAPI } from '../utils/api';

type AddProductProps = {
  store: Store;
  existingProduct?: Product | null;
  onSave: () => void;
  onCancel: () => void;
};

// Límites de caracteres
const LIMITS = {
  TITLE: 80,
  DESCRIPTION: 500,
  MIN_PRICE: 0.01,
  MAX_PRICE: 999999.99,
};

export function AddProduct({
  store,
  existingProduct,
  onSave,
  onCancel,
}: AddProductProps) {
  const [title, setTitle] = useState(existingProduct?.title || '');
  const [description, setDescription] = useState(
    existingProduct?.description || ''
  );
  const [price, setPrice] = useState(
    existingProduct?.price.toString() || ''
  );
  const [category, setCategory] = useState(existingProduct?.category || '');
  const [images, setImages] = useState<string[]>(
    existingProduct?.images || []
  );
  const [inStock, setInStock] = useState(existingProduct?.inStock ?? true);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación: Título
    if (!title.trim()) {
      setError('Por favor ingresa el título del producto');
      toast.error('Título requerido');
      return;
    }

    if (title.trim().length > LIMITS.TITLE) {
      setError(`El título no puede superar los ${LIMITS.TITLE} caracteres`);
      toast.error('Título muy largo');
      return;
    }

    // Validación: Descripción
    if (!description.trim()) {
      setError('Por favor ingresa una descripción');
      toast.error('Descripción requerida');
      return;
    }

    if (description.trim().length > LIMITS.DESCRIPTION) {
      setError(`La descripción no puede superar los ${LIMITS.DESCRIPTION} caracteres`);
      toast.error('Descripción muy larga');
      return;
    }

    // Validación: Precio mejorada
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
      setError('Por favor ingresa un precio válido');
      toast.error('Precio inválido');
      return;
    }

    if (priceNum < LIMITS.MIN_PRICE) {
      setError(`El precio debe ser mayor a Q${LIMITS.MIN_PRICE}`);
      toast.error('Precio muy bajo');
      return;
    }

    if (priceNum > LIMITS.MAX_PRICE) {
      setError(`El precio no puede superar Q${LIMITS.MAX_PRICE.toLocaleString()}`);
      toast.error('Precio muy alto');
      return;
    }

    // Validar que tenga máximo 2 decimales
    const decimals = price.split('.')[1];
    if (decimals && decimals.length > 2) {
      setError('El precio solo puede tener hasta 2 decimales');
      toast.error('Precio con demasiados decimales');
      return;
    }

    // Validación: Categoría
    if (!category) {
      setError('Por favor selecciona una categoría');
      toast.error('Categoría requerida');
      return;
    }

    // Validación: Imágenes (mínimo 1)
    const validImages = images.filter(img => img.trim() !== '');
    if (validImages.length === 0) {
      setError('Por favor agrega al menos una imagen del producto');
      toast.error('Imagen requerida', {
        description: 'Los productos necesitan al menos una foto para ser publicados',
      });
      return;
    }

    const product: Product = {
      id: existingProduct?.id || Date.now().toString(),
      storeId: store.id, // Se completará en el componente padre
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(priceNum.toFixed(2)), // Redondear a 2 decimales
      category,
      images: validImages,
      createdAt: existingProduct?.createdAt || new Date().toISOString(),
      inStock,
    };

    try {
      if (existingProduct) {
        // Actualizar producto existente
        const result = await productsAPI.update(product.id, product);
        if (!result.success) {
          throw new Error(result.error || 'Error al actualizar producto');
        }
        toast.success('¡Producto actualizado!', {
          description: 'Los cambios se han guardado correctamente',
        });
      } else {
        // Crear nuevo producto
        const result = await productsAPI.create(product);
        if (!result.success) {
          throw new Error(result.error || 'Error al crear producto');
        }
        toast.success('¡Producto publicado!', {
          description: 'Tu producto ya está visible en el mercado',
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Error guardando producto:', error);
      setError(error instanceof Error ? error.message : 'Error al guardar producto');
      toast.error('Error', {
        description: 'No se pudo guardar el producto. Intenta nuevamente.',
      });
    }
  };

  const addImageField = () => {
    if (images.length < 5) {
      setImages([...images, '']);
    }
  };

  const removeImageField = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages.length > 0 ? newImages : ['']);
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const handleCapturePhoto = async () => {
    const photo = await capturePhoto();
    if (photo) {
      setImages([...images, photo]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <Button variant="ghost" onClick={onCancel} className="mb-4">
        <X className="w-4 h-4 mr-2" />
        Volver
      </Button>

      <Card className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl text-gray-900 mb-4 sm:mb-6">
          {existingProduct ? 'Editar Producto' : 'Agregar Producto'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <Label htmlFor="title">Título del Producto *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Ej: Blusa bordada artesanal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={LIMITS.TITLE}
              required
            />
            <p className={`text-xs mt-1 ${title.length > LIMITS.TITLE - 10 ? 'text-orange-600' : 'text-gray-500'}`}>
              {title.length}/{LIMITS.TITLE} caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              placeholder="Describe tu producto en detalle..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={LIMITS.DESCRIPTION}
              rows={4}
              required
            />
            <p className={`text-xs mt-1 ${description.length > LIMITS.DESCRIPTION - 50 ? 'text-orange-600' : 'text-gray-500'}`}>
              {description.length}/{LIMITS.DESCRIPTION} caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="price">Precio (Q) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min={LIMITS.MIN_PRICE}
              max={LIMITS.MAX_PRICE}
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingresa el precio en quetzales. Mínimo Q{LIMITS.MIN_PRICE}
            </p>
          </div>

          <div>
            <Label htmlFor="category">Categoría *</Label>
            <Select
              id="category"
              value={category}
              onValueChange={(e) => setCategory(e)}
              required
            >
              <SelectTrigger className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ropa">Ropa</SelectItem>
                <SelectItem value="Calzado">Calzado</SelectItem>
                <SelectItem value="Alimentos">Alimentos</SelectItem>
                <SelectItem value="Artesanías">Artesanías</SelectItem>
                <SelectItem value="Electrónica">Electrónica</SelectItem>
                <SelectItem value="Hogar">Hogar</SelectItem>
                <SelectItem value="Belleza">Belleza</SelectItem>
                <SelectItem value="Deportes">Deportes</SelectItem>
                <SelectItem value="Juguetes">Juguetes</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <PhotoManager
              images={images}
              onImagesChange={setImages}
              maxImages={5}
              label="Fotos del Producto *"
            />
            <p className="text-xs text-gray-500 mt-2">
              <AlertCircle className="w-3 h-3 inline mr-1" />
              Mínimo 1 foto requerida, máximo 5 fotos
            </p>
          </div>

          {/* Estado de Disponibilidad */}
          <Card className={`p-4 border-2 transition-colors ${inStock ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {inStock ? (
                  <PackageCheck className="w-5 h-5 text-emerald-600" />
                ) : (
                  <PackageX className="w-5 h-5 text-gray-500" />
                )}
                <div>
                  <Label htmlFor="inStock" className="text-base cursor-pointer">
                    Disponibilidad
                  </Label>
                  <p className="text-sm text-gray-600">
                    {inStock ? 'Producto disponible para venta' : 'Producto agotado'}
                  </p>
                </div>
              </div>
              <Switch
                id="inStock"
                checked={inStock}
                onCheckedChange={setInStock}
              />
            </div>
          </Card>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {existingProduct ? 'Guardar Cambios' : 'Publicar Producto'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="sm:w-auto">
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}