# 🧪 Sprint 3 PWA - Plan de Testing

## Sistema de Cámara - Casos de Prueba

---

## 📋 Testing Checklist Completo

### ✅ = Probado y funcionando  
### ⚠️ = Funciona con observaciones  
### ❌ = No funciona  
### ⏸️ = Pendiente de probar

---

## 🎯 1. Permisos de Cámara

### 1.1 Primera Solicitud de Permiso

**Escenario:** Usuario abre cámara por primera vez

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 1.1.1 | Abrir cámara por primera vez | Aparece diálogo del navegador | ⏸️ |
| 1.1.2 | Tocar "Permitir" | Cámara se activa correctamente | ⏸️ |
| 1.1.3 | Tocar "Bloquear/Denegar" | Mensaje de error claro | ⏸️ |
| 1.1.4 | Estado guardado después de permitir | No vuelve a pedir en próximo uso | ⏸️ |

---

### 1.2 Gestión de Permisos

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 1.2.1 | Permiso previamente denegado | Muestra mensaje con instrucciones | ⏸️ |
| 1.2.2 | Dispositivo sin cámara | Mensaje "No se encontró cámara" | ⏸️ |
| 1.2.3 | Cámara en uso por otra app | Mensaje "Cámara en uso" | ⏸️ |
| 1.2.4 | Navegador no soporta getUserMedia | Mensaje "No soportado" | ⏸️ |

---

## 📸 2. Captura con Cámara

### 2.1 Inicialización

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 2.1.1 | Abrir componente CameraCapture | Loading spinner aparece | ⏸️ |
| 2.1.2 | Cámara se inicia correctamente | Video preview se muestra | ⏸️ |
| 2.1.3 | Cámara trasera por defecto | Usa environment facingMode | ⏸️ |
| 2.1.4 | Resolución correcta | 1280x720 o similar | ⏸️ |
| 2.1.5 | Grid de composición visible | Líneas guía se muestran | ⏸️ |

---

### 2.2 Captura de Foto

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 2.2.1 | Tocar botón de captura | Foto se captura | ⏸️ |
| 2.2.2 | Feedback háptico (si disponible) | Teléfono vibra brevemente | ⏸️ |
| 2.2.3 | Toast de confirmación | "¡Foto capturada!" aparece | ⏸️ |
| 2.2.4 | Vista previa de captura | Imagen capturada se muestra | ⏸️ |
| 2.2.5 | Calidad de imagen | Base64 JPEG con quality 0.9 | ⏸️ |

---

### 2.3 Controles de Captura

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 2.3.1 | Botón "Repetir" | Vuelve a vista de cámara | ⏸️ |
| 2.3.2 | Botón "Usar Foto" | Procesa y cierra | ⏸️ |
| 2.3.3 | Botón "Cerrar" | Cierra y limpia stream | ⏸️ |
| 2.3.4 | Cambiar cámara | Alterna frontal/trasera | ⏸️ |
| 2.3.5 | Loading durante procesamiento | Spinner en "Usar Foto" | ⏸️ |

---

### 2.4 Limpieza de Recursos

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 2.4.1 | Cerrar cámara | Stream se detiene | ⏸️ |
| 2.4.2 | Cambiar de pantalla | Stream se limpia | ⏸️ |
| 2.4.3 | Capturar y confirmar | Stream se detiene al cerrar | ⏸️ |
| 2.4.4 | Verificar en settings del SO | Cámara no aparece en uso | ⏸️ |

---

## 🖼️ 3. Selección desde Galería

### 3.1 Selección de Archivos

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 3.1.1 | Tocar botón "Galería" | Abre selector de archivos | ⏸️ |
| 3.1.2 | Selector solo muestra imágenes | Filtro image/* funciona | ⏸️ |
| 3.1.3 | Seleccionar 1 imagen | Imagen se procesa | ⏸️ |
| 3.1.4 | Seleccionar múltiples (3) | Todas se procesan | ⏸️ |
| 3.1.5 | Cancelar selección | No pasa nada, no hay error | ⏸️ |

---

### 3.2 Validación de Archivos

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 3.2.1 | Archivo JPG válido | Se acepta y procesa | ⏸️ |
| 3.2.2 | Archivo PNG válido | Se acepta y procesa | ⏸️ |
| 3.2.3 | Archivo GIF válido | Se acepta y procesa | ⏸️ |
| 3.2.4 | Archivo WEBP válido | Se acepta y procesa | ⏸️ |
| 3.2.5 | Archivo no-imagen (PDF) | Error: "Debe ser imagen" | ⏸️ |
| 3.2.6 | Imagen >10MB | Error: "Muy grande" | ⏸️ |
| 3.2.7 | Imagen corrupta | Error: "Error al procesar" | ⏸️ |

---

### 3.3 Procesamiento Múltiple

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 3.3.1 | 5 imágenes válidas | Todas se procesan | ⏸️ |
| 3.3.2 | 3 válidas + 2 inválidas | 3 se agregan, 2 con error | ⏸️ |
| 3.3.3 | Exceder límite (6 con 2 ya agregadas) | Error de límite | ⏸️ |
| 3.3.4 | Indicador de progreso | Spinner visible | ⏸️ |
| 3.3.5 | Toast con resumen | "X fotos agregadas" | ⏸️ |

---

## 🔄 4. Procesamiento de Imágenes

### 4.1 Compresión

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 4.1.1 | Imagen 4000x3000 | Redimensiona a 1200x900 | ⏸️ |
| 4.1.2 | Imagen 800x600 | Mantiene tamaño original | ⏸️ |
| 4.1.3 | Quality 0.85 | JPEG con calidad correcta | ⏸️ |
| 4.1.4 | Tamaño reducido | Menor que original | ⏸️ |
| 4.1.5 | Ratio de aspecto | Se mantiene proporción | ⏸️ |

---

### 4.2 Miniaturas

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 4.2.1 | Generar thumbnail | 200x200 máximo | ⏸️ |
| 4.2.2 | Quality reducida | 0.7 quality | ⏸️ |
| 4.2.3 | Tamaño pequeño | <50KB típicamente | ⏸️ |
| 4.2.4 | Ratio mantenido | Proporciones correctas | ⏸️ |

---

### 4.3 Utilidades

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 4.3.1 | fileToBase64() | Conversión correcta | ⏸️ |
| 4.3.2 | getImageDimensions() | Dimensiones correctas | ⏸️ |
| 4.3.3 | getBase64Size() | Cálculo preciso | ⏸️ |
| 4.3.4 | validateImage() | Validación correcta | ⏸️ |

---

## 🎨 5. PhotoManager Component

### 5.1 Agregar Fotos

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 5.1.1 | Botón "Tomar Foto" visible | Se muestra correctamente | ⏸️ |
| 5.1.2 | Botón "Galería" visible | Se muestra correctamente | ⏸️ |
| 5.1.3 | Ambos botones lado a lado | Grid 2 columnas | ⏸️ |
| 5.1.4 | Click en "Tomar Foto" | Abre CameraCapture | ⏸️ |
| 5.1.5 | Click en "Galería" | Abre file input | ⏸️ |

---

### 5.2 Grid de Fotos

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 5.2.1 | 1 foto | Grid con 1 item | ⏸️ |
| 5.2.2 | 3 fotos | Grid 2 cols (móvil) | ⏸️ |
| 5.2.3 | 5 fotos | Grid 2 cols (móvil) | ⏸️ |
| 5.2.4 | Responsive en desktop | Grid 3 columnas | ⏸️ |
| 5.2.5 | Aspect ratio | Cuadrado (1:1) | ⏸️ |

---

### 5.3 Reordenar (Drag & Drop)

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 5.3.1 | Iniciar arrastre | Foto se vuelve opaca | ⏸️ |
| 5.3.2 | Arrastrar sobre otra | Ring verde aparece | ⏸️ |
| 5.3.3 | Soltar en posición nueva | Orden se actualiza | ⏸️ |
| 5.3.4 | Toast de confirmación | "Orden actualizado" | ⏸️ |
| 5.3.5 | Drag handle visible | Icono GripVertical | ⏸️ |

---

### 5.4 Eliminar Fotos

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 5.4.1 | Hover sobre foto (desktop) | Overlay aparece | ⏸️ |
| 5.4.2 | Botón X visible | En overlay | ⏸️ |
| 5.4.3 | Click en X | Foto se elimina | ⏸️ |
| 5.4.4 | Toast de confirmación | "Foto eliminada" | ⏸️ |
| 5.4.5 | Eliminar última foto | Grid se vacía | ⏸️ |

---

### 5.5 Foto Principal

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 5.5.1 | Primera foto tiene badge | "⭐ Principal" visible | ⏸️ |
| 5.5.2 | Badge color verde | bg-emerald-600 | ⏸️ |
| 5.5.3 | Click estrella en foto 3 | Foto 3 se mueve al inicio | ⏸️ |
| 5.5.4 | Toast de confirmación | "Foto principal actualizada" | ⏸️ |
| 5.5.5 | Nueva primera tiene badge | Badge se actualiza | ⏸️ |

---

### 5.6 Límites y Validaciones

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 5.6.1 | 0 fotos | Botones visibles | ⏸️ |
| 5.6.2 | 4 fotos | Botones aún visibles | ⏸️ |
| 5.6.3 | 5 fotos (máximo) | Botones ocultos | ⏸️ |
| 5.6.4 | Intentar agregar 6ta | Bloquea, no deja | ⏸️ |
| 5.6.5 | Contador visible | "X/5 fotos" correcto | ⏸️ |

---

### 5.7 UI/UX

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 5.7.1 | Números de orden | 1, 2, 3, 4, 5 visibles | ⏸️ |
| 5.7.2 | Info box cuando vacío | "Primera será principal" | ⏸️ |
| 5.7.3 | Hint de reordenar | "Arrastra para reordenar" | ⏸️ |
| 5.7.4 | Loading state | Spinner durante proceso | ⏸️ |
| 5.7.5 | Deshabilitado durante carga | Botones disabled | ⏸️ |

---

## 🖼️ 6. LogoUploader con Cámara

### 6.1 Subir Logo

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 6.1.1 | Área de upload visible | 128x128 con icono | ⏸️ |
| 6.1.2 | Botón "Cámara" debajo | Botón secundario | ⏸️ |
| 6.1.3 | Click en área | File input abre | ⏸️ |
| 6.1.4 | Click en botón cámara | CameraCapture abre | ⏸️ |

---

### 6.2 Flow con Cámara

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 6.2.1 | Capturar con cámara | Pasa a cropper | ⏸️ |
| 6.2.2 | Recortar 1:1 | Crop cuadrado | ⏸️ |
| 6.2.3 | Guardar crop | Logo se establece | ⏸️ |
| 6.2.4 | Logo se muestra | 128x128 con bordes | ⏸️ |
| 6.2.5 | Botones edit/delete | Visible sobre logo | ⏸️ |

---

## 🔗 7. Integración con AddProduct

### 7.1 Crear Producto

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 7.1.1 | Formulario muestra PhotoManager | En lugar de ImageUploader | ⏸️ |
| 7.1.2 | Agregar 3 fotos con cámara | Todas aparecen | ⏸️ |
| 7.1.3 | Reordenar antes de publicar | Orden se mantiene | ⏸️ |
| 7.1.4 | Publicar con fotos | Producto se guarda | ⏸️ |
| 7.1.5 | Verificar en localStorage | Imágenes base64 guardadas | ⏸️ |

---

### 7.2 Editar Producto

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 7.2.1 | Editar producto existente | Fotos se cargan | ⏸️ |
| 7.2.2 | Agregar foto adicional | Se agrega correctamente | ⏸️ |
| 7.2.3 | Eliminar foto existente | Se elimina | ⏸️ |
| 7.2.4 | Cambiar foto principal | Orden actualizado | ⏸️ |
| 7.2.5 | Guardar cambios | Cambios persistidos | ⏸️ |

---

### 7.3 Validaciones

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 7.3.1 | Intentar publicar sin fotos | Error: "Mínimo 1 foto" | ⏸️ |
| 7.3.2 | Toast de error | Aparece toast rojo | ⏸️ |
| 7.3.3 | Mensaje en formulario | Error debajo de fotos | ⏸️ |
| 7.3.4 | Con 1 foto válida | Permite publicar | ⏸️ |

---

## 📱 8. Compatibilidad de Dispositivos

### 8.1 Android

| # | Dispositivo/Navegador | Resultado Esperado | Status |
|---|----------------------|-------------------|--------|
| 8.1.1 | Chrome Android | Todo funcional | ⏸️ |
| 8.1.2 | Firefox Android | Todo funcional | ⏸️ |
| 8.1.3 | Samsung Internet | Todo funcional | ⏸️ |
| 8.1.4 | Opera Android | Todo funcional | ⏸️ |

---

### 8.2 iOS

| # | Dispositivo/Navegador | Resultado Esperado | Status |
|---|----------------------|-------------------|--------|
| 8.2.1 | Safari iOS | Todo funcional | ⏸️ |
| 8.2.2 | Chrome iOS | Usa webkit, funcional | ⏸️ |
| 8.2.3 | Firefox iOS | Usa webkit, funcional | ⏸️ |

**Nota:** En iOS, todos los navegadores usan WebKit, así que el comportamiento debería ser consistente.

---

### 8.3 Desktop

| # | Navegador | Resultado Esperado | Status |
|---|----------|-------------------|--------|
| 8.3.1 | Chrome Desktop | Funcional (con webcam) | ⏸️ |
| 8.3.2 | Firefox Desktop | Funcional (con webcam) | ⏸️ |
| 8.3.3 | Edge | Funcional (con webcam) | ⏸️ |
| 8.3.4 | Safari macOS | Funcional (con webcam) | ⏸️ |

---

## 🚀 9. Performance

### 9.1 Tiempos de Carga

| # | Métrica | Objetivo | Resultado | Status |
|---|---------|----------|-----------|--------|
| 9.1.1 | Inicialización cámara | <2s | - | ⏸️ |
| 9.1.2 | Captura de foto | <100ms | - | ⏸️ |
| 9.1.3 | Procesamiento imagen | <500ms | - | ⏸️ |
| 9.1.4 | Generación thumbnail | <100ms | - | ⏸️ |
| 9.1.5 | Cambio de cámara | <1s | - | ⏸️ |

---

### 9.2 Consumo de Memoria

| # | Escenario | Objetivo | Resultado | Status |
|---|-----------|----------|-----------|--------|
| 9.2.1 | Cámara abierta | <50MB | - | ⏸️ |
| 9.2.2 | 5 fotos procesadas | <100MB | - | ⏸️ |
| 9.2.3 | Después de cerrar | Memoria liberada | - | ⏸️ |

---

### 9.3 Tamaño de Archivos

| # | Tipo | Tamaño Esperado | Resultado | Status |
|---|------|----------------|-----------|--------|
| 9.3.1 | Foto comprimida | 200-400KB | - | ⏸️ |
| 9.3.2 | Thumbnail | 20-40KB | - | ⏸️ |
| 9.3.3 | Reducción vs original | 90-95% | - | ⏸️ |

---

## 🌐 10. Conexiones

### 10.1 WiFi

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 10.1.1 | Subir 5 fotos | Rápido y fluido | ⏸️ |
| 10.1.2 | Procesamiento | Sin delay notable | ⏸️ |

---

### 10.2 4G

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 10.2.1 | Subir 5 fotos | Funcional, pequeño delay | ⏸️ |
| 10.2.2 | Compresión aplicada | Tamaños reducidos | ⏸️ |

---

### 10.3 3G

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 10.3.1 | Subir 5 fotos | Lento pero funcional | ⏸️ |
| 10.3.2 | Compresión agresiva | Máxima reducción | ⏸️ |
| 10.3.3 | UI responsive | No se congela | ⏸️ |

---

### 10.4 Offline

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 10.4.1 | Tomar fotos offline | Funciona localmente | ⏸️ |
| 10.4.2 | Procesar fotos | Todo local, funciona | ⏸️ |
| 10.4.3 | Guardar producto | Guarda en localStorage | ⏸️ |

---

## 🐛 11. Manejo de Errores

### 11.1 Errores de Permisos

| # | Escenario | Mensaje Esperado | Status |
|---|-----------|-----------------|--------|
| 11.1.1 | NotAllowedError | "Permiso denegado..." | ⏸️ |
| 11.1.2 | NotFoundError | "No se encontró cámara" | ⏸️ |
| 11.1.3 | NotReadableError | "Cámara en uso" | ⏸️ |
| 11.1.4 | SecurityError | "Requiere HTTPS" | ⏸️ |

---

### 11.2 Errores de Procesamiento

| # | Escenario | Comportamiento Esperado | Status |
|---|-----------|------------------------|--------|
| 11.2.1 | Imagen corrupta | Error, no crash | ⏸️ |
| 11.2.2 | Formato inválido | Error específico | ⏸️ |
| 11.2.3 | Memoria insuficiente | Error graceful | ⏸️ |
| 11.2.4 | Timeout procesando | Error con retry | ⏸️ |

---

## 🔒 12. Seguridad

| # | Caso de Prueba | Resultado Esperado | Status |
|---|----------------|-------------------|--------|
| 12.1 | Permisos solo cuando necesario | Solicita solo al usar | ⏸️ |
| 12.2 | Stream cerrado correctamente | No queda cámara abierta | ⏸️ |
| 12.3 | No persiste fotos no guardadas | Limpia temporal | ⏸️ |
| 12.4 | Base64 válido | No código malicioso | ⏸️ |

---

## ✅ Criterios de Aceptación

Para considerar el Sprint 3 como **completamente probado**, debe cumplir:

### Funcionalidad Core
- [ ] 100% de casos de "Permisos" funcionando
- [ ] 100% de casos de "Captura" funcionando
- [ ] 100% de casos de "Galería" funcionando
- [ ] 100% de casos de "Procesamiento" funcionando
- [ ] 100% de casos de "PhotoManager" funcionando

### Compatibilidad
- [ ] Funciona en Chrome Android
- [ ] Funciona en Safari iOS
- [ ] Funciona en navegadores desktop principales
- [ ] UI responsive en todos los tamaños

### Performance
- [ ] Cámara inicia en <2s
- [ ] Procesamiento <500ms por imagen
- [ ] Compresión logra 90%+ reducción

### UX
- [ ] Todos los errores tienen mensajes claros
- [ ] Feedback visual en todas las acciones
- [ ] Toasts informativos apropiados
- [ ] No hay bugs visuales

---

## 📝 Reporte de Testing

### Formato de Reporte

```markdown
## Testing Report - [Fecha]

**Tester:** [Nombre]
**Dispositivo:** [Modelo y SO]
**Navegador:** [Nombre y versión]

### Casos Probados: X/Y

### Casos Exitosos: X
- Caso 1.1.1: ✅
- Caso 2.1.1: ✅
...

### Casos Fallidos: Y
- Caso 3.2.1: ❌
  - Error: [descripción]
  - Pasos para reproducir: [pasos]
  - Screenshot: [si aplica]

### Observaciones:
- [Observación 1]
- [Observación 2]

### Recomendaciones:
- [Recomendación 1]
- [Recomendación 2]
```

---

## 🎯 Testing Prioritario

Si el tiempo es limitado, priorizar estos casos:

### Críticos (Must Test)
1. Solicitud de permisos (1.1)
2. Captura básica (2.2)
3. Selección galería (3.1)
4. Reordenar fotos (5.3)
5. Eliminar fotos (5.4)

### Importantes (Should Test)
6. Cambio de cámara (2.3.4)
7. Procesamiento múltiple (3.3)
8. Foto principal (5.5)
9. Límites (5.6)
10. Integración AddProduct (7.1)

### Opcionales (Nice to Test)
11. Performance (9)
12. Compatibilidad completa (8)
13. Errores edge cases (11)

---

## 🚀 Herramientas de Testing Recomendadas

### Manuales
- **Chrome DevTools** - Device simulation
- **BrowserStack** - Testing cross-browser
- **Real devices** - Android y iPhone físicos

### Automatizadas (Futuro)
- **Playwright** - E2E testing
- **Jest** - Unit tests
- **React Testing Library** - Component tests

---

## 📅 Schedule de Testing

### Fase 1: Testing Interno (2 días)
- Developer testing completo
- Casos críticos e importantes

### Fase 2: Beta Testing (3-5 días)
- 5-10 vendedores seleccionados
- Testing en condiciones reales
- Recopilación de feedback

### Fase 3: Soft Launch (1 semana)
- 50 vendedores
- Monitoreo activo
- Hotfixes si necesario

### Fase 4: Full Launch
- Todos los usuarios
- Soporte completo activado

---

**¿Preguntas sobre testing? Documenta en este archivo.**

---

*Gualán Market - Testing para Calidad Excepcional* ✅
