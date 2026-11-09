import { describe, expect, it } from "vitest";
import { isEnrollmentAuthorized } from "../shared/access";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "admin" | "user" | null): TrpcContext {
  return {
    user: role ? {
      id: 42,
      openId: "test-user",
      name: "Utilisateur de test",
      email: "test@example.com",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("contrôle d’accès à la filière", () => {
  it("autorise uniquement une inscription active", () => {
    expect(isEnrollmentAuthorized({ status: "active" })).toBe(true);
    expect(isEnrollmentAuthorized({ status: "suspended" })).toBe(false);
    expect(isEnrollmentAuthorized()).toBe(false);
  });

  it("refuse les procédures formateur pour un élève", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.admin.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("refuse les procédures élève lorsqu’aucune session n’est ouverte", async () => {
    const caller = appRouter.createCaller(contextFor(null));
    await expect(caller.student.program()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
