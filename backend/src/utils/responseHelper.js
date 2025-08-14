// src/utils/responseHelper.js
const ok = (res, data = null, meta = null) =>
  res.status(200).json({ success: true, data, meta });

const created = (res, data = null, meta = null) =>
  res.status(201).json({ success: true, data, meta });

const badRequest = (res, message = 'Solicitud inválida', details = null) =>
  res.status(400).json({ success: false, message, details });

const notFound = (res, message = 'Recurso no encontrado') =>
  res.status(404).json({ success: false, message });

/** Siempre responde 500; NO pasarle un Error como status */
const error = (res, message = 'Error interno del servidor', err = null) => {
  const payload = { success: false, message };
  if (err) {
    payload.error = process.env.NODE_ENV === 'production'
      ? undefined
      : { name: err.name, message: err.message, stack: err.stack };
  }
  return res.status(500).json(payload);
};

module.exports = {
  ok,
  created,
  badRequest,
  notFound,
  error,
};
