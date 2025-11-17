/**
 * Camera Utilities for Gualán Market
 * Handles camera capture for product photos and store logos
 */

export interface CameraOptions {
  quality?: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  facing?: 'user' | 'environment';
}

/**
 * Capture a photo using the device camera
 * Returns a base64 data URL of the captured image
 */
export async function capturePhoto(options: CameraOptions = {}): Promise<string | null> {
  const {
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1920,
    facing = 'environment'
  } = options;

  try {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('La cámara no está disponible en este dispositivo');
    }

    // Request camera access
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facing,
        width: { ideal: maxWidth },
        height: { ideal: maxHeight }
      }
    });

    // Create video element to display camera feed
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;

    // Wait for video to be ready
    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => {
        resolve();
      };
    });

    // Create modal overlay for camera UI
    const overlay = createCameraOverlay(video);
    document.body.appendChild(overlay);

    // Return promise that resolves when photo is captured or cancelled
    return new Promise<string | null>((resolve) => {
      const captureButton = overlay.querySelector('#camera-capture-btn') as HTMLButtonElement;
      const cancelButton = overlay.querySelector('#camera-cancel-btn') as HTMLButtonElement;

      const cleanup = () => {
        // Stop camera stream
        stream.getTracks().forEach(track => track.stop());
        // Remove overlay
        document.body.removeChild(overlay);
      };

      // Handle capture
      captureButton.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          cleanup();
          resolve(null);
          return;
        }

        // Set canvas dimensions to video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0);

        // Convert to base64 data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        cleanup();
        resolve(dataUrl);
      });

      // Handle cancel
      cancelButton.addEventListener('click', () => {
        cleanup();
        resolve(null);
      });
    });

  } catch (error) {
    console.error('Error al capturar foto:', error);
    
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No se encontró ninguna cámara en tu dispositivo.');
      } else if (error.name === 'NotReadableError') {
        throw new Error('La cámara está siendo usada por otra aplicación.');
      }
    }
    
    throw error;
  }
}

/**
 * Create camera overlay UI
 */
function createCameraOverlay(video: HTMLVideoElement): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: black;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `;

  // Video container
  const videoContainer = document.createElement('div');
  videoContainer.style.cssText = `
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  `;
  
  video.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: cover;
  `;
  
  videoContainer.appendChild(video);

  // Controls container
  const controls = document.createElement('div');
  controls.style.cssText = `
    padding: 2rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    width: 100%;
  `;

  // Capture button
  const captureButton = document.createElement('button');
  captureButton.id = 'camera-capture-btn';
  captureButton.textContent = '📷 Capturar';
  captureButton.style.cssText = `
    padding: 1rem 2rem;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;

  // Cancel button
  const cancelButton = document.createElement('button');
  cancelButton.id = 'camera-cancel-btn';
  cancelButton.textContent = '❌ Cancelar';
  cancelButton.style.cssText = `
    padding: 1rem 2rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;

  controls.appendChild(captureButton);
  controls.appendChild(cancelButton);

  overlay.appendChild(videoContainer);
  overlay.appendChild(controls);

  return overlay;
}

/**
 * Check if camera is available on the device
 */
export async function isCameraAvailable(): Promise<boolean> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'videoinput');
  } catch (error) {
    console.error('Error checking camera availability:', error);
    return false;
  }
}

/**
 * Request camera permission
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Stop the stream immediately after getting permission
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Camera permission denied:', error);
    return false;
  }
}
