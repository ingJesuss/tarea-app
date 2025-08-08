# Configuración de Firebase Storage Security Rules

## Problema
Error 412 en Firebase Storage generalmente indica problemas con las reglas de seguridad.

## Solución: Configurar Storage Rules

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a "Storage" en el menú lateral
4. Ve a la pestaña "Rules"
5. Reemplaza las reglas actuales con estas:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura y escritura solo a usuarios autenticados
    match /imagenes/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Reglas más específicas (opcional)
    match /imagenes/{imageId} {
      allow read: if true; // Lectura pública
      allow write: if request.auth != null 
        && request.resource.size < 5 * 1024 * 1024 // Máximo 5MB
        && request.resource.contentType.matches('image/.*'); // Solo imágenes
    }
  }
}
```

## Reglas Alternativas (Más Permisivas para Desarrollo)

Si estás en desarrollo y quieres reglas más permisivas temporalmente:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **IMPORTANTE**: Las reglas permisivas solo deben usarse en desarrollo.

## Verificación
1. Guarda las reglas
2. Espera unos minutos para que se propaguen
3. Intenta subir una imagen nuevamente

## Otros Problemas Posibles
- Variables de entorno no configuradas (.env.local)
- Usuario no autenticado
- Problemas de red
- Límites de cuota excedidos
