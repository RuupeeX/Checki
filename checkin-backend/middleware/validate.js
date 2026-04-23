// ============================================================================
// CheckIn — Middleware de validación de inputs
// ============================================================================

/**
 * Valida que los campos requeridos están presentes y no vacíos.
 * @param  {...string} fields - nombres de campos del req.body
 */
const requireFields = (...fields) => (req, res, next) => {
  for (const field of fields) {
    const val = req.body[field];
    if (val === undefined || val === null || String(val).trim() === '') {
      return res.status(400).json({ error: `Field '${field}' is required.` });
    }
  }
  next();
};

/**
 * Limpia strings del body (trim) para los campos indicados.
 * @param  {...string} fields
 */
const sanitizeBody = (...fields) => (req, res, next) => {
  for (const field of fields) {
    if (typeof req.body[field] === 'string') {
      req.body[field] = req.body[field].trim();
    }
  }
  next();
};

/**
 * Valida que un campo del body pertenece a un conjunto de valores permitidos.
 * @param {string} field
 * @param {string[]} allowed
 */
const allowedValues = (field, allowed) => (req, res, next) => {
  const val = req.body[field];
  if (val !== undefined && !allowed.includes(val)) {
    return res.status(400).json({
      error: `Invalid value for '${field}'. Allowed: ${allowed.join(', ')}.`,
    });
  }
  next();
};

/**
 * Valida que un parámetro de ruta (:id) es un entero positivo.
 */
const validateId = (req, res, next) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid ID parameter.' });
  }
  req.params.id = id;
  next();
};

/**
 * Valida paginación en query params y normaliza los valores.
 */
const validatePagination = (req, res, next) => {
  const maxLimit = parseInt(process.env.MAX_PAGE_SIZE) || 100;
  const defaultLimit = parseInt(process.env.DEFAULT_PAGE_SIZE) || 20;

  let page  = parseInt(req.query.page)  || 1;
  let limit = parseInt(req.query.limit) || defaultLimit;

  if (page < 1)  page  = 1;
  if (limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  req.query.page  = page;
  req.query.limit = limit;
  next();
};

/**
 * Valida formato de fecha YYYY-MM-DD en query o body.
 * @param {string} field
 * @param {'query'|'body'} source
 */
const validateDate = (field, source = 'body') => (req, res, next) => {
  const val = req[source][field];
  if (val && !/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return res.status(400).json({ error: `Invalid date format for '${field}'. Use YYYY-MM-DD.` });
  }
  next();
};

/**
 * Valida email con regex básico.
 */
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }
  next();
};

module.exports = {
  requireFields,
  sanitizeBody,
  allowedValues,
  validateId,
  validatePagination,
  validateDate,
  validateEmail,
};