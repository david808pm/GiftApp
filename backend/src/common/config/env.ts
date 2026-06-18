/**
 * Centralized environment access. Fails fast at startup if a required
 * secret is missing or too weak, instead of silently using an insecure
 * fallback value.
 */

export function requireEnv(name: string, minLength = 1): string {
  const value = process.env[name];
  if (!value || value.length < minLength) {
    throw new Error(
      `Variable de entorno requerida ausente o demasiado débil: ${name} ` +
        `(longitud mínima ${minLength}). Define un valor seguro en .env.`,
    );
  }
  return value;
}

export function optionalEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.length > 0 ? value : fallback;
}

/** Minimum length enforced for JWT signing secrets. */
export const MIN_SECRET_LENGTH = 32;
