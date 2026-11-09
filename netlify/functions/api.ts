import serverless from "serverless-http";
import { createApp } from "../../server/_core/app";

const app = createApp();

// Serves every /api/* route (tRPC, OAuth callback, storage proxy, scheduled tasks).
// Requests may arrive with the internal function path; normalise it back to /api/*.
export const handler = serverless((req: any, res: any) => {
  if (typeof req.url === "string" && req.url.startsWith("/.netlify/functions/api")) {
    req.url = "/api" + req.url.slice("/.netlify/functions/api".length);
  }
  return app(req, res);
});
