import { useState, useEffect } from 'react';
import { X, Camera, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LogoUploader } from './LogoUploader';
import { toast } from 'sonner@2.0.3';
import type { User, Store } from '../App';
import { capturePhoto } from '../utils/camera';
import { storesAPI, usersAPI } from '../utils/api';

type StoreSetupProps = {
  currentUser: User;
  existingStore?: Store | null;
  onSave: (store: Store) => void;
  onCancel: () => void;
};

export function StoreSetup({
  currentUser,
  existingStore,
  onSave,
  onCancel,
}: StoreSetupProps) {
  const [name, setName] = useState(existingStore?.name || '');
  const [description, setDescription] = useState(
    existingStore?.description || ''
  );
  const [location, setLocation] = useState(existingStore?.location || '');
  const [logo, setLogo] = useState(existingStore?.logo || '');
  const [error, setError] = useState('');

  // Update state when existingStore changes
  useEffect(() => {
    if (existingStore) {
      setName(existingStore.name);
      setDescription(existingStore.description);
      setLocation(existingStore.location);
      setLogo(existingStore.logo || '');
      console.log('🟢 [StoreSetup] Estado inicializado con logo:', existingStore.logo ? 'SÍ' : 'NO');
    }
  }, [existingStore]);

  // Log when logo changes
  useEffect(() => {
    console.log('🟡 [StoreSetup] Estado del logo cambió:', logo ? `SÍ (${logo.substring(0, 50)}...)` : 'NO');
  }, [logo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('🔴 [StoreSetup] SUBMIT - Logo en estado:', logo ? `SÍ (${logo.substring(0, 50)}...)` : 'NO');

    if (!name.trim()) {
      setError('Por favor ingresa el nombre de tu tienda');
      return;
    }

    if (!description.trim()) {
      setError('Por favor ingresa una descripción');
      return;
    }

    if (!location) {
      setError('Por favor ingresa una ubicación');
      return;
    }

    const store: Store = {
      id: existingStore?.id || Date.now().toString(),
      userId: currentUser.id,
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      logo,
      verified: existingStore?.verified || false,
      rating: existingStore?.rating || 0,
      totalReviews: existingStore?.totalReviews || 0,
    };

    console.log('🔴 [StoreSetup] Store object creado con logo:', store.logo ? 'SÍ' : 'NO');

    try {
      if (existingStore) {
        // Actualizar tienda existente
        const result = await storesAPI.update(store.id, store);
        if (!result.success) {
          throw new Error(result.error || 'Error al actualizar tienda');
        }
        toast.success('Tienda actualizada correctamente');
      } else {
        // Crear nueva tienda
        const result = await storesAPI.create(store);
        if (!result.success) {
          throw new Error(result.error || 'Error al crear tienda');
        }
        
        // Actualizar usuario para indicar que tiene tienda
        await usersAPI.update(currentUser.id, { 
          hasStore: true, 
          storeId: store.id 
        });
        
        toast.success('¡Tienda creada exitosamente!');
      }
      
      console.log('🔴 [StoreSetup] Guardado en Supabase exitoso');
      onSave(store);
    } catch (error) {
      console.error('Error guardando tienda:', error);
      setError(error instanceof Error ? error.message : 'Error al guardar tienda');
      toast.error('Error al guardar la tienda');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Button
        variant="ghost"
        onClick={onCancel}
        className="mb-4"
      >
        <X className="w-4 h-4 mr-2" />
        Volver
      </Button>

      <Card className="p-6">
        <h2 className="text-2xl text-gray-900 mb-6">
          {existingStore ? 'Editar Tienda' : 'Crear Tu Tienda'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Nombre de la Tienda *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Tienda Mary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {name.length}/50 caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              placeholder="Describe qué vendes en tu tienda..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={4}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/200 caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="location">Ubicación *</Label>
            <Input
              id="location"
              type="text"
              placeholder="Ej: Barrio El Carmen, Centro de Gualán, etc."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Escribe tu dirección o zona en Gualán ({location.length}/100 caracteres)
            </p>
          </div>

          <div>
            <LogoUploader
              logo={logo}
              onLogoChange={setLogo}
              label="Logo de la Tienda"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {existingStore ? 'Guardar Cambios' : 'Crear Tienda'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}