export type ExactCourseSource = { url: string; start?: string; end?: string; startOccurrence?: number };

const gmsPrecoursParcoursA = "/manus-storage/precours-gms-parcours-a_3a6d2042.txt";
const gmsPrecoursParcoursB = "/manus-storage/precours-gms-parcours-b_f6a8e582.txt";
const gmsPrecoursR2ParcoursA = "/manus-storage/precours-r2-parcours-a_0c3fc9db.txt";
const gmsPrecoursR2ParcoursB = "/manus-storage/precours-r2-parcours-b_d81b4726.txt";
const gmsM1Cours1 = "/manus-storage/m1-cours-1-fondations_ceeded6e.txt";
const gmsLessonUrls = {
  M1: [gmsM1Cours1, "/manus-storage/m1-cours-2_f4af2f35.txt", "/manus-storage/m1-cours-3_72c23218.txt", "/manus-storage/m1-cours-4_af168bb7.txt", "/manus-storage/m1-cours-5_a164333a.txt"],
  M2: ["/manus-storage/m2-cours-1_6bee4d1d.txt", "/manus-storage/m2-cours-2_fdb20e0e.txt", "/manus-storage/m2-cours-3_a02d875c.txt", "/manus-storage/m2-cours-4_4e555c69.txt", "/manus-storage/m2-cours-5_861a20cd.txt"],
  M3: ["/manus-storage/m3-cours-1_0c68d506.txt", "/manus-storage/m3-cours-2_0501c698.txt", "/manus-storage/m3-cours-3_4ab7dd78.txt", "/manus-storage/m3-cours-4_51b2e5b1.txt"],
  M4: ["/manus-storage/m4-cours-1_5d42f05b.txt", "/manus-storage/m4-cours-2_d9d9ea6f.txt", "/manus-storage/m4-cours-3_7caaa25a.txt"],
  M5: ["/manus-storage/m5-cours-1_7e4dd58d.txt", "/manus-storage/m5-cours-2_659ca50b.txt", "/manus-storage/m5-cours-3_79534115.txt", "/manus-storage/m5-cours-4_42010c59.txt"],
  M6: ["/manus-storage/m6-cours-1_b5e5ec44.txt", "/manus-storage/m6-cours-2_e94b4789.txt", "/manus-storage/m6-cours-3_9eeb25cb.txt", "/manus-storage/m6-cours-4_9c520ee3.txt"],
  M7: ["/manus-storage/m7-cours-1_4b3bd481.txt", "/manus-storage/m7-cours-2_e3457aaf.txt", "/manus-storage/m7-cours-3_47e998c4.txt", "/manus-storage/m7-cours-4_3279e4a5.txt"],
  M8: ["/manus-storage/m8-cours-1_9b417d7f.txt", "/manus-storage/m8-cours-2_bddc5c93.txt", "/manus-storage/m8-cours-3_c174890e.txt", "/manus-storage/m8-cours-4_43e1850c.txt"],
  M9: ["/manus-storage/m9-cours-1_07ff79b4.txt", "/manus-storage/m9-cours-2_019fc3dd.txt", "/manus-storage/m9-cours-3_68ebfdbe.txt", "/manus-storage/m9-cours-4_fe4fbf3a.txt"],
  M10: ["/manus-storage/m10-cours-1_790c89dd.txt", "/manus-storage/m10-cours-2_703eb433.txt", "/manus-storage/m10-cours-3_d09931ea.txt", "/manus-storage/m10-cours-4_1c2c7636.txt"],
} as const;

const staticLessonSources = (urls: readonly string[]): ExactCourseSource[] => urls.map((url) => ({ url }));

const businessDigitalLessonUrls = {
  BD1: ["/manus-storage/bd1-cours-1_79eb701e.md", "/manus-storage/bd1-cours-2_ca7ba6cd.md", "/manus-storage/bd1-cours-3_d04a586d.md"],
  BD2: ["/manus-storage/bd2-cours-1_4891ac82.md", "/manus-storage/bd2-cours-2_536f10e8.md", "/manus-storage/bd2-cours-3_d65ff254.md"],
  BD3: ["/manus-storage/bd3-cours-1_ef9a05b3.md", "/manus-storage/bd3-cours-2_857edcbc.md", "/manus-storage/bd3-cours-3_18641177.md"],
  BD4: ["/manus-storage/bd4-cours-1_12618097.md", "/manus-storage/bd4-cours-2_0cb93231.md", "/manus-storage/bd4-cours-3_2c98c8a1.md"],
  BD5: ["/manus-storage/bd5-cours-1_e9a5bf2e.md", "/manus-storage/bd5-cours-2_5220a4f3.md", "/manus-storage/bd5-cours-3_15e04a9e.md"],
  BD6: ["/manus-storage/bd6-cours-1_76bd6ee6.md", "/manus-storage/bd6-cours-2_ffe30159.md", "/manus-storage/bd6-cours-3_bffd7342.md"],
} as const;

export const exactCourseSources: Record<string, ExactCourseSource[]> = {
  PREC: [
    { url: gmsPrecoursParcoursA },
    { url: gmsPrecoursParcoursB },
  ],
  M1: staticLessonSources(gmsLessonUrls.M1),
  M2: staticLessonSources(gmsLessonUrls.M2),
  M3: staticLessonSources(gmsLessonUrls.M3),
  M4: staticLessonSources(gmsLessonUrls.M4),
  M5: staticLessonSources(gmsLessonUrls.M5),
  M6: staticLessonSources(gmsLessonUrls.M6),
  M7: staticLessonSources(gmsLessonUrls.M7),
  M8: staticLessonSources(gmsLessonUrls.M8),
  M9: staticLessonSources(gmsLessonUrls.M9),
  M10: staticLessonSources(gmsLessonUrls.M10),
  BD1: staticLessonSources(businessDigitalLessonUrls.BD1),
  BD2: staticLessonSources(businessDigitalLessonUrls.BD2),
  BD3: staticLessonSources(businessDigitalLessonUrls.BD3),
  BD4: staticLessonSources(businessDigitalLessonUrls.BD4),
  BD5: staticLessonSources(businessDigitalLessonUrls.BD5),
  BD6: staticLessonSources(businessDigitalLessonUrls.BD6),
};

export function getExactCourseSource(moduleCode: string, lessonSequence: number, intake?: string): ExactCourseSource | undefined {
  if (moduleCode === "PREC" && lessonSequence === 1 && intake === "Rentrée 2 — Novembre 2026") return { url: gmsPrecoursR2ParcoursA };
  if (moduleCode === "PREC" && lessonSequence === 2 && intake === "Rentrée 2 — Novembre 2026") return { url: gmsPrecoursR2ParcoursB };
  return exactCourseSources[moduleCode]?.[lessonSequence - 1];
}
