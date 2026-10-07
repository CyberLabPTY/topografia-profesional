# Topografía Profesional — Panamá

Base de sitio web profesional para una topógrafa idónea en Panamá.

## Incluye
- Diseño responsive para móvil, tablet y escritorio.
- Portada técnica con visual topográfico.
- Servicios, proceso, portafolio y credenciales.
- Formulario de cotización preparado para n8n.
- PWA básica (manifest + service worker).
- SEO inicial, robots.txt y sitemap.xml.

## Integración n8n
El sitio NO expone credenciales. Configure únicamente un webhook HTTPS público en `config.js`:

```js
window.SITE_CONFIG = {
  n8nWebhookUrl: "https://TU-N8N/webhook/solicitud-topografia",
  whatsappNumber: "507XXXXXXXX",
  professionalName: "NOMBRE",
  environment: "production"
};
```

El flujo recomendado en n8n:
1. Webhook recibe solicitud.
2. Validación y normalización de datos.
3. Generación de ID tipo `TOP-YYYY-####`.
4. Registro en Google Sheets/PostgreSQL.
5. Aviso por correo/WhatsApp.
6. Respuesta automática al cliente.
7. Seguimiento opcional.

## Seguridad
- No guardar API keys ni contraseñas en GitHub Pages.
- Mantener secretos dentro de n8n/servidor.
- Aplicar rate limiting/CAPTCHA en producción si el webhook es público.
- Publicar número de idoneidad y datos personales solo con autorización de la profesional.

## Personalización pendiente
- Nombre completo.
- Número de idoneidad/licencia.
- Teléfono/WhatsApp.
- Correo profesional.
- Fotografía.
- Servicios exactos.
- Cobertura geográfica.
- Proyectos reales.
- Dominio final para canonical/sitemap.
