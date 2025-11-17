import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, User as UserIcon, Phone, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { toast } from 'sonner@2.0.3';
import type { User } from '../App';

type ProfileEditScreenProps = {
  currentUser: User;
  onSave: (user: User) => void;
  onCancel: () => void;
};

const LIMITS = {
  NAME: 50,
  PHONE: 8,
};

export function ProfileEditScreen({
  currentUser,
  onSave,
  onCancel,
}: ProfileEditScreenProps) {
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación: Nombre
    if (!name.trim()) {
      setError('Por favor ingresa tu nombre');
      toast.error('Nombre requerido');
      return;
    }

    if (name.trim().length > LIMITS.NAME) {
      setError(`El nombre no puede superar los ${LIMITS.NAME} caracteres`);
      toast.error('Nombre muy largo');
      return;
    }

    // Validación: Teléfono
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== LIMITS.PHONE) {
      setError(`El número de teléfono debe tener ${LIMITS.PHONE} dígitos`);
      toast.error('Teléfono inválido');
      return;
    }

    // Verificar que el nuevo teléfono no esté en uso por otro usuario
    const usersStr = localStorage.getItem('users');
    if (usersStr) {
      const users: User[] = JSON.parse(usersStr);
      const phoneExists = users.some(
        u => u.phone === cleanPhone && u.id !== currentUser.id
      );
      if (phoneExists) {
        setError('Este número de teléfono ya está registrado');
        toast.error('Teléfono en uso');
        return;
      }
    }

    // Actualizar usuario
    const updatedUser: User = {
      ...currentUser,
      name: name.trim(),
      phone: cleanPhone,
    };

    // Actualizar en localStorage (array de usuarios)
    if (usersStr) {
      const users: User[] = JSON.parse(usersStr);
      const index = users.findIndex(u => u.id === currentUser.id);
      if (index >= 0) {
        users[index] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }

    // Actualizar usuario actual
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    toast.success('¡Perfil actualizado!', {
      description: 'Tus cambios se han guardado correctamente',
    });

    onSave(updatedUser);
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <Button variant="ghost" onClick={onCancel} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </Button>

      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="bg-emerald-100 p-3 rounded-full">
            <UserIcon className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-xl sm:text-2xl text-gray-900">
            Editar Perfil
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <Label htmlFor="name">Nombre Completo *</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={LIMITS.NAME}
                className="pl-10"
                required
              />
            </div>
            <p className={`text-xs mt-1 ${name.length > LIMITS.NAME - 10 ? 'text-orange-600' : 'text-gray-500'}`}>
              {name.length}/{LIMITS.NAME} caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="phone">Número de Teléfono *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                  +502
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="12345678"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= LIMITS.PHONE) {
                      setPhone(value);
                    }
                  }}
                  maxLength={LIMITS.PHONE}
                  className="rounded-l-none pl-3"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {phone.length}/{LIMITS.PHONE} dígitos
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Al cambiar tu número de teléfono, asegúrate de que sea un número válido y activo en WhatsApp.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
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
