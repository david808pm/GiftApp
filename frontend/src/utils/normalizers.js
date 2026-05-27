export function normalizeText(value) {
  return String(value ?? '').trim();
}

export function normalizeLower(value) {
  return normalizeText(value).toLowerCase();
}

export function normalizeUpper(value) {
  return normalizeText(value).toUpperCase();
}

export function normalizeDocumentId(value) {
  return normalizeText(value);
}
