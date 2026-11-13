document.getElementById('year').textContent = new Date().getFullYear();

// ---- Menu movil ----
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');
navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
mainNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => mainNav.classList.remove('open')));

// ---- Formulario de contacto ----
const form = document.getElementById('contact-form');
const msgBox = document.getElementById('form-msg');
const submitBtn = document.getElementById('form-submit');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msgBox.classList.add('hidden');

  const payload = {
    nombre: document.getElementById('f-nombre').value.trim(),
    telefono: document.getElementById('f-telefono').value.trim(),
    zona: document.getElementById('f-zona').value.trim(),
    servicio: document.getElementById('f-servicio').value,
    hectareas: document.getElementById('f-hectareas').value,
    mensaje: document.getElementById('f-mensaje').value.trim(),
  };

  if (!payload.nombre || !payload.telefono) {
    msgBox.textContent = 'Completá al menos tu nombre y teléfono.';
    msgBox.className = 'form-msg error';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'No se pudo enviar el pedido.');

    msgBox.textContent = '¡Listo! Recibimos tu pedido y te vamos a contactar a la brevedad.';
    msgBox.className = 'form-msg ok';
    form.reset();
  } catch (err) {
    msgBox.textContent = 'No pudimos enviar el formulario. Mejor escribinos directo por WhatsApp (botón verde).';
    msgBox.className = 'form-msg error';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar pedido de cotización';
    msgBox.classList.remove('hidden');
  }
});
