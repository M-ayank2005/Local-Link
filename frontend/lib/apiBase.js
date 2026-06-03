export const resolveApiBase = () => {
  const base = (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:5000'
  ).replace(/\/$/, '');

  if (/\/api(?:\/|$)/.test(base)) {
    return base;
  }

  return `${base}/api`;
};

export const resolveApiV1Base = () => {
  const apiBase = resolveApiBase().replace(/\/$/, '');
  return apiBase.endsWith('/v1') ? apiBase : `${apiBase}/v1`;
};
