// Datos del negocio. Todo lo marcado con TODO está pendiente del cliente (ver README).
export const SITE_URL = 'https://procarperformance.com'; // TODO: dominio definitivo

// TODO: número real en formato internacional sin "+" ni espacios, p. ej. '13055550123'
export const WHATSAPP = '';
export const waLink = () => (WHATSAPP ? `https://wa.me/${WHATSAPP}` : 'https://wa.me/');

// TODO: URL del calendario de GHL de cada servicio (en el orden 01..05).
// Si una URL está vacía, el botón lleva a la sección #agendar.
export const GHL_CALENDARS = [
  '', // 01 Programación de módulos
  '', // 02 Revisión general (diagnóstico)
  '', // 03 Urgencia
  '', // 04 Asesoría telefónica
  '', // 05 Manuales y diagramas
];

export const CONTACT = {
  phone: '(000) 000-0000', // TODO
  phoneHref: 'tel:+10000000000', // TODO
  email: 'info@procarperformance.com', // TODO confirmar
  location: 'Ciudad, Estado', // TODO
  mapsHref: '#', // TODO enlace a Google Maps
};

export const SOCIAL = [
  ['TikTok', 'https://www.tiktok.com/@procarperformancellc'],
  ['Instagram', 'https://www.instagram.com/procarperformancellc/'],
  ['Facebook', 'https://www.facebook.com/share/CeCvyw649pjFLPwb/?mibextid=qi2Omg'],
  ['YouTube', 'https://youtube.com/@procarperformancellc'],
];

export const REVIEW_URL = 'https://admin.trustindex.io/api/googleWriteReview?place-id=ChIJCZafOfIp2YgRXGLHXZKqzeY';
