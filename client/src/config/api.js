const configuredApiBase = String(
  import.meta.env.VITE_API_BASE || ""
).trim();

export const API_BASE = configuredApiBase.replace(
  /\/+$/,
  ""
);

export async function apiFetch(resource, options) {
  if (API_BASE) {
    return window.fetch(resource, options);
  }

  const { firebaseApiFetch } = await import(
    "../services/firebaseApi"
  );

  return firebaseApiFetch(resource, options);
}
