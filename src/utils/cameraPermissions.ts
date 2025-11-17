/**
 * Gestión de permisos de cámara para PWA
 */

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

export type CameraPermissionResult = {
  status: PermissionStatus;
  message: string;
  canUseCamera: boolean;
};

/**
 * Verifica si la API de cámara está disponible
 */
export function isCameraSupported(): boolean {
  return !!(
    navigator.mediaDevices && 
    navigator.mediaDevices.getUserMedia
  );
}

/**
 * Verifica el estado actual de los permisos de cámara
 */
export async function checkCameraPermission(): Promise<CameraPermissionResult> {
  // Verificar soporte
  if (!isCameraSupported()) {
    return {
      status: 'unsupported',
      message: 'Tu navegador no soporta acceso a la cámara',
      canUseCamera: false,
    };
  }

  try {
    // Intentar verificar el estado del permiso
    if (navigator.permissions && navigator.permissions.query) {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      
      switch (result.state) {
        case 'granted':
          return {
            status: 'granted',
            message: 'Permiso de cámara concedido',
            canUseCamera: true,
          };
        case 'denied':
          return {
            status: 'denied',
            message: 'Permiso de cámara denegado. Por favor, habilítalo en la configuración del navegador',
            canUseCamera: false,
          };
        case 'prompt':
          return {
            status: 'prompt',
            message: 'Se solicitará permiso de cámara',
            canUseCamera: true,
          };
        default:
          return {
            status: 'prompt',
            message: 'Estado de permiso desconocido',
            canUseCamera: true,
          };
      }
    }

    // Si no hay API de permissions, asumir que se puede solicitar
    return {
      status: 'prompt',
      message: 'Se puede solicitar permiso de cámara',
      canUseCamera: true,
    };
  } catch (error) {
    console.error('Error verificando permiso de cámara:', error);
    
    // Asumir que se puede intentar
    return {
      status: 'prompt',
      message: 'Estado de permiso desconocido',
      canUseCamera: true,
    };
  }
}

/**
 * Solicita permiso y acceso a la cámara
 */
export async function requestCameraAccess(): Promise<{
  success: boolean;
  stream?: MediaStream;
  error?: string;
}> {
  try {
    if (!isCameraSupported()) {
      return {
        success: false,
        error: 'Tu navegador no soporta acceso a la cámara',
      };
    }

    // Solicitar acceso con configuración optimizada para móviles
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Cámara trasera por defecto
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    return {
      success: true,
      stream,
    };
  } catch (error) {
    console.error('Error solicitando acceso a la cámara:', error);

    let errorMessage = 'No se pudo acceder a la cámara';

    if (error instanceof Error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Permiso de cámara denegado. Por favor, habilítalo en la configuración';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No se encontró ninguna cámara en tu dispositivo';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'La cámara está siendo usada por otra aplicación';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'No se pudo configurar la cámara con los ajustes solicitados';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Acceso a la cámara bloqueado por seguridad. Usa HTTPS';
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Detiene el stream de la cámara
 */
export function stopCameraStream(stream: MediaStream): void {
  try {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  } catch (error) {
    console.error('Error deteniendo stream de cámara:', error);
  }
}

/**
 * Cambia entre cámara frontal y trasera
 */
export async function switchCamera(
  currentStream: MediaStream,
  currentFacingMode: 'user' | 'environment'
): Promise<{
  success: boolean;
  stream?: MediaStream;
  facingMode?: 'user' | 'environment';
  error?: string;
}> {
  try {
    // Detener el stream actual
    stopCameraStream(currentStream);

    // Solicitar el nuevo stream con la cámara opuesta
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: newFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    return {
      success: true,
      stream,
      facingMode: newFacingMode,
    };
  } catch (error) {
    console.error('Error cambiando cámara:', error);
    
    return {
      success: false,
      error: 'No se pudo cambiar la cámara',
    };
  }
}

/**
 * Guarda el estado del permiso en localStorage
 */
export function savePermissionState(status: PermissionStatus): void {
  try {
    localStorage.setItem('camera_permission_status', status);
    localStorage.setItem('camera_permission_checked_at', new Date().toISOString());
  } catch (error) {
    console.error('Error guardando estado de permiso:', error);
  }
}

/**
 * Obtiene el estado guardado del permiso
 */
export function getSavedPermissionState(): {
  status: PermissionStatus | null;
  checkedAt: string | null;
} {
  try {
    const status = localStorage.getItem('camera_permission_status') as PermissionStatus | null;
    const checkedAt = localStorage.getItem('camera_permission_checked_at');
    
    return { status, checkedAt };
  } catch (error) {
    console.error('Error obteniendo estado de permiso:', error);
    return { status: null, checkedAt: null };
  }
}
