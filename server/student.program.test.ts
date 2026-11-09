import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getProgramForStudent: vi.fn() }));
vi.mock("./db", async importOriginal => ({ ...(await importOriginal<typeof import("./db")>()), ...mocks }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function studentContext(): TrpcContext {
  return { user: { id: 41, openId: "business-student", name: "Élève Business", email: "business@example.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("student.program par filière", () => {
  beforeEach(() => vi.clearAllMocks());
  it("expose le parcours Business digital attribué à l’élève", async () => {
    mocks.getProgramForStudent.mockResolvedValue([{ id: 21, cohort: "Business digital", title: "Module 1 — Fondamentaux du marketing digital et stratégie" }]);
    const result = await appRouter.createCaller(studentContext()).student.program();
    expect(mocks.getProgramForStudent).toHaveBeenCalledWith(41);
    expect(result).toHaveLength(1);
    expect(result[0]?.cohort).toBe("Business digital");
    expect(result.some((module: any) => module.cohort === "Gestion des médias sociaux")).toBe(false);
  });
});
