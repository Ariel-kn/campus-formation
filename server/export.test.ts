import { describe, expect, it } from "vitest";
import { formatCohortCsv } from "./db";

describe("export de cohorte", () => {
  it("génère des lignes CSV exploitables avec notes et moyenne, en échappant les guillemets", () => {
    const csv = formatCohortCsv([{ student: { name: 'Élève "A"', email: "a@example.com" }, enrollment: { status: "active", cohort: "Business digital" }, completed: 3, total: 6, waiting: 1, averageScore: 14.5, moduleScores: [{ code: "BD1", score: 15 }, { code: "BD2", score: 14 }, { code: "BD3", score: null }] }]);
    expect(csv).toContain('"Élève";"Email";"Filière";"Accès";"Modules validés";"Total modules";"À corriger";"Moyenne générale /20";"Note BD1 /20";"Note BD2 /20";"Note BD3 /20"');
    expect(csv).toContain('"Élève ""A""";"a@example.com";"Business digital";"active";"3";"6";"1";"14.5";"15";"14";""');
  });
});
