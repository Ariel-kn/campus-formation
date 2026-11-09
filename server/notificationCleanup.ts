import { deleteExpiredReadNotifications } from "./db";

/** Purge idempotente des notifications déjà consultées depuis plus de sept jours. */
export async function cleanupExpiredReadNotifications() {
  return deleteExpiredReadNotifications();
}
