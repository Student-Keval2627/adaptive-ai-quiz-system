const configuredApiBase = String(
  import.meta.env.VITE_API_BASE || ""
).trim();

export const API_BASE = configuredApiBase.replace(
  /\\\/+$/,
  ""
);
