// Funcion serverless (Vercel) que recibe el formulario de contacto de la
// landing y lo envia por correo via la API de Resend. Si RESEND_API_KEY no
// esta configurada, igual responde OK (el formulario no debe romperse),
// solo que no se envia el correo -- queda avisado en los logs de Vercel.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'DronPy <onboarding@resend.dev>';
const CONTACT_TO = process.env.CONTACT_TO || 'fermadi@gmail.com';

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo no permitido.' });
    return;
  }

  const body = req.body || {};
  const { nombre, telefono, zona, servicio, hectareas, mensaje } = body;

  if (!nombre || !telefono) {
    res.status(400).json({ error: 'Nombre y telefono son obligatorios.' });
    return;
  }

  const html = `
    <h2>Nuevo pedido de cotizacion - DronPy</h2>
    <p><strong>Nombre:</strong> ${esc(nombre)}</p>
    <p><strong>Telefono/WhatsApp:</strong> ${esc(telefono)}</p>
    <p><strong>Establecimiento / zona:</strong> ${esc(zona) || '-'}</p>
    <p><strong>Servicio de interes:</strong> ${esc(servicio) || '-'}</p>
    <p><strong>Hectareas aproximadas:</strong> ${esc(hectareas) || '-'}</p>
    <p><strong>Mensaje:</strong><br>${esc(mensaje) || '-'}</p>
  `;

  if (!RESEND_API_KEY) {
    console.log('[contact] RESEND_API_KEY no configurada, se omite el envio. Pedido recibido:', body);
    res.status(200).json({ ok: true, omitido: true });
    return;
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: CONTACT_TO,
        reply_to: undefined,
        subject: `Nuevo pedido de cotizacion - ${nombre}`,
        html,
      }),
    });

    if (!r.ok) {
      const texto = await r.text().catch(() => '');
      console.error('[contact] Resend respondio', r.status, texto);
      res.status(200).json({ ok: true, avisoEnvio: false });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[contact] Error de red enviando email:', err.message);
    res.status(200).json({ ok: true, avisoEnvio: false });
  }
};
