export const appConfig = () => ({
  port: Number(process.env.PORT || 38306),
  corsOrigin: process.env.CORS_ORIGIN || '*',
});
