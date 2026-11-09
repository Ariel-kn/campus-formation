import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { businessDigitalCurriculum } from "./businessDigitalSeed";
import { curriculum } from "./courseSeed";

const projectPath = resolve(import.meta.dirname, "..");

describe("correctifs UI et contenus pédagogiques", () => {
  it("conserve un panneau de notifications adapté aux écrans mobiles", () => {
    const home = readFileSync(resolve(projectPath, "client/src/pages/Home.tsx"), "utf8");
    expect(home).toContain("createPortal");
    expect(home).toContain("z-[9999]");
    expect(home).toContain("max-h-[65vh]");
  });

  it("retire la saisie et l’affichage des durées de leçons", () => {
    const manager = readFileSync(resolve(projectPath, "client/src/components/ContentManager.tsx"), "utf8");
    const styles = readFileSync(resolve(projectPath, "client/src/index.css"), "utf8");
    expect(manager).not.toContain('placeholder="Durée"');
    expect(manager).not.toContain("item.duration");
    expect(styles).toContain("text-\\[\\#758d86\\]");
  });

  it("expose la consultation, le téléchargement et la correction d’un PDF", () => {
    const queue = readFileSync(resolve(projectPath, "client/src/components/DeliverableReviewQueue.tsx"), "utf8");
    expect(queue).toContain("Ouvrir le fichier");
    expect(queue).toContain("Télécharger");
    expect(queue).toContain("Générer une suggestion");
    expect(queue).toContain("Enregistrer la correction");
  });

  it("affiche une mise en situation spécifique dans chaque cas pratique", () => {
    expect(curriculum).toHaveLength(11);
    expect(businessDigitalCurriculum).toHaveLength(7);
    expect([...curriculum, ...businessDigitalCurriculum].every(module => module.assessment.instructions.includes("Situation"))).toBe(true);
    expect([...curriculum, ...businessDigitalCurriculum].every(module => module.assessment.questions.filter(question => question.type !== "essay").length >= 5 && module.assessment.questions.filter(question => question.type === "essay").length >= 1)).toBe(true);
  });

  it("conserve dans la vue élève une partie Quiz suivie de la rédaction contextualisée", () => {
    const home = readFileSync(resolve(projectPath, "client/src/pages/Home.tsx"), "utf8");
    expect(home).toContain("Partie 1 — Quiz");
    expect(home).toContain("Partie 2 — Rédaction");
    expect(home).toContain("Mise en situation complète");
    expect(home).toContain("COURSE_CASE_STUDIES[module.code]");
  });

  it("affiche la durée et le partage théorie/pratique de BD7", () => {
    const home = readFileSync(resolve(projectPath, "client/src/pages/Home.tsx"), "utf8");
    expect(home).toContain('module.code === "BD7"');
    expect(home).toContain("Durée totale : 2 heures");
    expect(home).toContain("Théorie : 30 min · Pratique : 1 h 30");
    expect(home).toContain("Théorie 10 points · Pratique 10 points");
  });

  it("maintient le détail nominatif des réponses dans les indicateurs", () => {
    const panel = readFileSync(resolve(projectPath, "client/src/components/AnalyticsPanel.tsx"), "utf8");
    expect(panel).toContain("Élèves concernés par cette question");
    expect(panel).toContain("Réponse donnée");
    expect(panel).toContain("questionInsights");
  });

  it("réserve le corrigé type aux apprenants sélectionnés par le formateur", () => {
    const home = readFileSync(resolve(projectPath, "client/src/pages/Home.tsx"), "utf8");
    expect(home).toContain("Préparer puis envoyer un corrigé type");
    expect(home).toContain("Envoyer le corrigé aux apprenants sélectionnés");
    expect(home).toContain("module.answerKey &&");
  });

  it("permet de restaurer une suggestion IA précédente de corrigé type", () => {
    const home = readFileSync(resolve(projectPath, "client/src/pages/Home.tsx"), "utf8");
    expect(home).toContain("answer-key-suggestion-history");
    expect(home).toContain("Suggestions précédentes sur cet appareil");
    expect(home).toContain("Suggestion précédente restaurée dans l’éditeur.");
  });

  it("expose des consignes formateur avant la génération de corrigé type par IA", () => {
    const home = readFileSync(resolve(projectPath, "client/src/pages/Home.tsx"), "utf8");
    expect(home).toContain("Vos consignes pour la proposition IA");
    expect(home).toContain("Générer avec mes consignes");
    expect(home).toContain("suggest.mutate({ assessmentId: Number(assessmentId), guidance })");
    expect(home).toContain("const [guidance, setGuidance] = useState");
  });

  it("retire les supports détaillés au profit d’une leçon React textuelle structurée", () => {
    const home = readFileSync(resolve(projectPath, "client/src/pages/Home.tsx"), "utf8");
    const shelf = readFileSync(resolve(projectPath, "client/src/components/StudentResourceShelf.tsx"), "utf8");
    expect(shelf).toContain("return null");
    expect(home).toContain("function CourseLessonItem");
    expect(home).toContain("Support de cours autorisé");
    expect(home).toContain("Lire le cours complet");
    expect(home).toContain("getExactCourseSource");
    expect(home).toContain("getLessonTranscript");
    expect(home).toContain("function ExactCourseRenderer");
    expect(home).not.toContain("function findCourseMarker");
    expect(home).toContain("function CourseTables");
    expect(home).toContain("getCourseTables");
    expect(home).not.toContain("querySelectorAll(\".divide-y");
    expect(home).not.toContain("window.open(`${exactCoursePdf");
  });

  it("rend l’ouverture des évaluations explicite pour le formateur", () => {
    const manager = readFileSync(resolve(projectPath, "client/src/components/ContentManager.tsx"), "utf8");
    expect(manager).toContain("Accès aux évaluations");
    expect(manager).toContain("Ouvrir l’évaluation aux apprenants");
    expect(manager).toContain("évaluation verrouillée par défaut");
    expect(manager).toContain("isOpen: assessmentDraft.isOpen");
  });

  it("garde une déconnexion visible dans les espaces formateur et apprenant", () => {
    const home = readFileSync(resolve(projectPath, "client/src/pages/Home.tsx"), "utf8");
    const layout = readFileSync(resolve(projectPath, "client/src/components/DashboardLayout.tsx"), "utf8");
    expect(home).toContain('aria-label="Se déconnecter"');
    expect(home).toContain("onLogout={logout}");
    expect(layout).toContain("Se déconnecter");
  });

  it("offre un profil apprenant modifiable et un accueil personnalisé", () => {
    const home = readFileSync(resolve(projectPath, "client/src/pages/Home.tsx"), "utf8");
    expect(home).toContain("function StudentProfileDialog");
    expect(home).toContain("trpc.student.updateProfile");
    expect(home).toContain("Bonjour, ${profile.data.name.trim()}");
    expect(home).toContain("Ouvrir mon profil");
  });

  it("rend chaque notification actionnable vers la vue ou le module concerné", () => {
    const home = readFileSync(resolve(projectPath, "client/src/pages/Home.tsx"), "utf8");
    const db = readFileSync(resolve(projectPath, "server/db.ts"), "utf8");
    expect(home).toContain("onNotificationNavigate={navigateFromNotification}");
    expect(home).toContain("link?.match(/^module:(\\d+)$/)");
    expect(home).toContain("Touchez une notification pour ouvrir l’action concernée.");
    expect(db).toContain("link: `module:${submission.moduleId}`");
    expect(db).toContain("link: `module:${deliverable.moduleId}`");
  });

  it("réserve les indicateurs au volet Mes résultats et protège les titres mobiles du découpage", () => {
    const home = readFileSync(resolve(projectPath, "client/src/pages/Home.tsx"), "utf8");
    expect(home).toContain("{resultsOnly && <section");
    expect(home).toContain("Devoirs à reprendre");
    expect(home).not.toContain("label=\"Notes par module\"");
    expect(home).toContain("break-words text-sm font-bold leading-5");
  });
});
