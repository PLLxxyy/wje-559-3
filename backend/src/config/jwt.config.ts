export const jwtConfig = () => ({
  secret: process.env.JWT_SECRET || 'communitygov-dev-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
});
