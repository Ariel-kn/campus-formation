export const ENV = {
  appId: process.env.VITE_APP_ID || "campus-medias",
  // PLACEHOLDER: when JWT_SECRET is not configured, a built-in demo key is used so
  // demo sign-in still works. Set JWT_SECRET in the hosting environment to secure sessions.
  cookieSecret:
    process.env.JWT_SECRET || "campus-medias-demo-placeholder-secret-set-JWT_SECRET",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
