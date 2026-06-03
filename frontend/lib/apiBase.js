export const resolveApiV1Base = () => {
  const base = (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:5000/api'
  ).replace(/\/$/, '');

  return base.endsWith('/v1') ? base : `${base}/v1`;
};
