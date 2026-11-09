import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getLessonTranscript } from "../client/src/data/lessonTranscript";
import { exactCourseSources } from "../client/src/data/exactCourseSources";
import { isRawCourseTableBlock, stripRawCourseTables } from "../client/src/data/lessonTables";
import { businessDigitalCurriculum } from "./businessDigitalSeed";
import { curriculum } from "./courseSeed";

describe("contenus textuels des leçons", () => {
  it("développe intégralement les objectifs et sections de chaque leçon des deux filières", () => {
    for (const module of [...curriculum, ...businessDigitalCurriculum]) {
      const mainHeadings = new Set<string>();
      for (const [index, lesson] of module.lessons.entries()) {
        const transcript = getLessonTranscript(module.code, index + 1, lesson);
        expect(transcript.introduction.length).toBeGreaterThan(30);
        expect(transcript.objectives.length).toBeGreaterThanOrEqual(3);
        expect(transcript.sections.length).toBeGreaterThanOrEqual(2);
        expect(transcript.sections.every(section => section.heading.length > 2 && section.paragraphs.every(paragraph => paragraph.length > 40))).toBe(true);
        mainHeadings.add(transcript.sections[0].heading);
      }
      expect(mainHeadings.size).toBe(module.lessons.length);
    }
  });

  it("conserve le tableau de repères dans la première leçon Business Digital", () => {
    const transcript = getLessonTranscript("BD1", 1, businessDigitalCurriculum[0].lessons[0]);
    expect(transcript.table?.headers).toEqual(["Période", "Volume horaire", "Focus principal"]);
    expect(transcript.table?.rows).toHaveLength(3);
  });

  it("retranscrit la leçon du pré-cours sur les métiers du marketing numérique avec ses exemples et son exercice", () => {
    const transcript = getLessonTranscript("PREC", 2, curriculum[0].lessons[1]);
    const text = transcript.sections.flatMap(section => section.paragraphs).join(" ");
    expect(text).toContain("Responsable marketing numérique");
    expect(text).toContain("Mounia, 40 ans");
    expect(text).toContain("Cas pratique 1");
    expect(text).toContain("document de 20 lignes minimum et de 30 lignes maximum");
  });

  it("associe chaque leçon des deux filières à une transcription immuable et distincte", () => {
    for (const module of [...curriculum, ...businessDigitalCurriculum]) {
      const sources = exactCourseSources[module.code] ?? [];
      expect(sources).toHaveLength(module.lessons.length);
      expect(sources.every(source => source.url.startsWith("/manus-storage/"))).toBe(true);
      expect(sources.every(source => !source.start && !source.end)).toBe(true);
      expect(new Set(sources.map(source => source.url)).size).toBe(sources.length);
    }
  });

  it("masque les lignes de tableaux PDF lorsqu’une version structurée est prévue", () => {
    const rawPlatforms = "Plateforme Audience Format privilégié Algorithme Facebook Généraliste Instagram Jeune";
    const rawMissions = "Mission Description Livrable Stratégie Création Planification Animation Analyse";
    expect(isRawCourseTableBlock("M1", 1, rawPlatforms)).toBe(true);
    expect(isRawCourseTableBlock("M1", 1, rawMissions)).toBe(true);
    expect(isRawCourseTableBlock("M1", 1, "Le Community Manager est la voix de l’entreprise.")).toBe(false);
  });

  it("retire toutes les lignes de tableaux M1 avant d’afficher leur version structurée", () => {
    const rawLesson = "1.2 Le Panorama\nPlateforme           Audience                 Format privilégié     Algorithme\nFacebook Généraliste\n1.3 Les 5 Missions du CM\nMission           Description                                                    Livrable\nStratégie Définir\n1.4 Cadre Légal et Éthique";
    const cleaned = stripRawCourseTables("M1", 1, rawLesson);
    expect(cleaned).toContain("1.3 Les 5 Missions du CM");
    expect(cleaned).toContain("1.4 Cadre Légal et Éthique");
    expect(cleaned).not.toContain("Facebook Généraliste");
    expect(cleaned).not.toContain("Stratégie Définir");
  });

  it("retire les tableaux bruts des cinq fichiers réels Community Management", () => {
    const checks = [
      [1, "Généraliste, 25-55", "1.4 Cadre Légal et Éthique"],
      [2, "Rédaction impeccable", "2.2 L'Écosystème Collaboratif"],
      [3, "Marc, 28 ans", "3.2 Le Tone of Voice"],
      [4, "Date & Heure", "4.3 La Méthode du Batching"],
      [5, "Client déçu", "Règle d'or"],
    ] as const;
    for (const [sequence, rawCell, retainedHeading] of checks) {
      const raw = readFileSync(resolve("/home/ubuntu/webdev-static-assets/deterministic-lessons", `m1-cours-${sequence}.txt`), "utf8");
      const cleaned = stripRawCourseTables("M1", sequence, raw);
      expect(cleaned).not.toContain(rawCell);
      expect(cleaned).toContain(retainedHeading);
    }
  });
});
