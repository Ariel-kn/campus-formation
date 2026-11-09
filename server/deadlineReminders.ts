import { eq } from "drizzle-orm";
import { appNotifications, assessments, assignments, courseModules, enrollments } from "../drizzle/schema";
import { getDb } from "./db";

export function isDeadlineWithinReminderWindow(dueAt: Date, now = new Date()) {
  const hours = (dueAt.getTime() - now.getTime()) / 3_600_000;
  return hours >= 0 && hours <= 72;
}

export async function createDailyDeadlineReminders() {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const [activeEnrollments, modules, allAssignments, allAssessments, recentNotifications] = await Promise.all([
    db.select().from(enrollments).where(eq(enrollments.status, "active")),
    db.select().from(courseModules).where(eq(courseModules.isPublished, true)),
    db.select().from(assignments),
    db.select().from(assessments),
    db.select().from(appNotifications),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  let created = 0;
  for (const module of modules) {
    const items = [
      { title: allAssignments.find(item => item.moduleId === module.id)?.title, dueAt: allAssignments.find(item => item.moduleId === module.id)?.dueAt, label: "livrable" },
      { title: allAssessments.find(item => item.moduleId === module.id)?.title, dueAt: allAssessments.find(item => item.moduleId === module.id)?.dueAt, label: "évaluation" },
    ];
    for (const item of items) {
      if (!item.title || !item.dueAt) continue;
      if (!isDeadlineWithinReminderWindow(item.dueAt)) continue;
      const dateLabel = item.dueAt.toLocaleDateString("fr-FR");
      const title = `Échéance proche : ${item.title}`;
      for (const enrollment of activeEnrollments) {
        const alreadyCreated = recentNotifications.some(notification => notification.userId === enrollment.userId && notification.title === title && notification.createdAt.toISOString().slice(0, 10) === today);
        if (alreadyCreated) continue;
        await db.insert(appNotifications).values({
          userId: enrollment.userId,
          type: "deadline",
          title,
          body: `Le ${item.label} du ${module.title} est à remettre avant le ${dateLabel}.`,
          link: "/",
        });
        created += 1;
      }
    }
  }
  return { created };
}
