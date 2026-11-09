import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import ContentManager from "@/components/ContentManager";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import StudentActivityTimeline from "@/components/StudentActivityTimeline";
import StudentResourceShelf from "@/components/StudentResourceShelf";
import DeliverableReviewQueue from "@/components/DeliverableReviewQueue";
import { AdminSimulationConsole, StudentSimulation } from "@/components/FormativeSimulation";
import { getLessonTranscript } from "@/data/lessonTranscript";
import { getExactCourseSource } from "@/data/exactCourseSources";
import { getCourseTables, isRawCourseTableBlock, stripRawCourseTables } from "@/data/lessonTables";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Paperclip,
  Play,
  Plus,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  UsersRound,
  X,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

type ProgramModule = any;
type AnswerMap = Record<string, string | string[]>;

const statusStyle: Record<string, string> = {
  reviewed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  submitted: "bg-amber-50 text-amber-700 ring-amber-200",
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
};

const EXACT_COURSE_PDFS = {
  socialManual: "/manus-storage/manuel-gestion-medias-sociaux_6f97df33.pdf",
  socialPrecourse: "/manus-storage/precours-gestion-medias-sociaux_71be4e6a.pdf",
  businessManual: "/manus-storage/manuel-business-digital-sans-ecommerce_ae5ff2c3.pdf",
  businessPrecourse: "/manus-storage/precours-business-digital_e4555d7f.pdf",
};

const COURSE_PAGE_IMAGES = {
  social: {
    10: "/manus-storage/page-10-010_16321028.jpg", 11: "/manus-storage/page-11-011_4307a75c.jpg", 12: "/manus-storage/page-12-012_b00722c0.jpg", 13: "/manus-storage/page-13-013_6af8bf1e.jpg", 14: "/manus-storage/page-14-014_0ccd9b32.jpg",
    27: "/manus-storage/page-27-027_e65a71a9.jpg", 28: "/manus-storage/page-28-028_75ab708f.jpg", 29: "/manus-storage/page-29-029_21dfe3bd.jpg", 30: "/manus-storage/page-30-030_6492bdd6.jpg", 31: "/manus-storage/page-31-031_1d87aba9.jpg",
    39: "/manus-storage/page-39-039_b6cc02c8.jpg", 40: "/manus-storage/page-40-040_d7fff008.jpg", 41: "/manus-storage/page-41-041_72710acb.jpg", 42: "/manus-storage/page-42-042_279aa2d5.jpg",
    48: "/manus-storage/page-48-048_2b065310.jpg", 49: "/manus-storage/page-49-049_0b38ba49.jpg", 50: "/manus-storage/page-50-050_381ca832.jpg",
    54: "/manus-storage/page-54-054_2f8e1b1f.jpg", 55: "/manus-storage/page-55-055_7b35dc4d.jpg", 56: "/manus-storage/page-56-056_1d96b5a3.jpg", 57: "/manus-storage/page-57-057_497a435f.jpg",
    72: "/manus-storage/page-72-072_6a5f260d.jpg", 73: "/manus-storage/page-73-073_c1b35a18.jpg", 74: "/manus-storage/page-74-074_252c0dec.jpg", 75: "/manus-storage/page-75-075_5f5302ac.jpg",
    81: "/manus-storage/page-81-081_6f4f4ae4.jpg", 82: "/manus-storage/page-82-082_379b3614.jpg", 83: "/manus-storage/page-83-083_36192f78.jpg", 84: "/manus-storage/page-84-084_6ad7af16.jpg",
    89: "/manus-storage/page-89-089_ca3e54ba.jpg", 90: "/manus-storage/page-90-090_ef0cd90b.jpg", 91: "/manus-storage/page-91-091_e37cd0c2.jpg", 92: "/manus-storage/page-92-092_1cb42190.jpg",
  } as Record<number, string>,
  business: {
    2: "/manus-storage/page-2-02_32b34a76.jpg", 3: "/manus-storage/page-3-03_3e91569a.jpg", 4: "/manus-storage/page-4-04_e05bdf67.jpg", 5: "/manus-storage/page-5-05_c2eec5ed.jpg", 6: "/manus-storage/page-6-06_f8175e6e.jpg", 7: "/manus-storage/page-7-07_b6d29505.jpg", 8: "/manus-storage/page-8-08_5fa834a6.jpg", 9: "/manus-storage/page-9-09_6dde0ab0.jpg", 10: "/manus-storage/page-10-10_c8f9e2a0.jpg", 11: "/manus-storage/page-11-11_a004b329.jpg",
  } as Record<number, string>,
  socialPrecourse: {
    1: "/manus-storage/page-1-01_957d9220.jpg", 2: "/manus-storage/page-2-02_6484e967.jpg", 3: "/manus-storage/page-3-03_4f0acd45.jpg",
  } as Record<number, string>,
};

const COURSE_CASE_STUDIES: Record<string, string> = {
  PREC: "Situation : une petite entreprise locale reste peu visible en ligne malgré une offre utile. Sa dirigeante veut attirer des prospects sans multiplier les dépenses. Analysez ses leviers digitaux prioritaires : présentez au moins trois canaux complémentaires, leur rôle, un objectif mesurable pour chacun et une logique de suivi.",
  M1: "Situation — BijouxWax : cette jeune marque de bijoux artisanaux publie de manière irrégulière et reçoit peu d’interactions. Elle souhaite construire une communauté attentive avant sa prochaine collection. Définissez le rôle du Community Manager, deux objectifs SMART, un Buyer Persona détaillé et trois piliers éditoriaux illustrés par des exemples de publications.",
  M2: "Situation — Cotonou Immo : cette agence immobilière souhaite rassurer de jeunes actifs et se distinguer sur Instagram et LinkedIn. Concevez un brief complet de carrousel Instagram en cinq slides, le storyboard d’un Reel et un post LinkedIn mettant en valeur son expertise. Justifiez chaque choix de format, d’angle et d’appel à l’action.",
  M3: "Situation — EduDigital : un établissement de formation doit recruter 50 étudiants avec un budget de 300 000 FCFA en un mois. Proposez une stratégie publicitaire complète : objectif de campagne, audience, répartition budgétaire, deux annonces, indicateurs de pilotage et seuil d’arrêt. Expliquez vos arbitrages.",
  M4: "Situation — AfroFit : une salle de sport veut développer sa notoriété auprès de jeunes actifs et convertir les curieux en essais gratuits. Répartissez le budget, rédigez le concept d’un carrousel de cinq slides, deux Stories Ads et un plan de collaboration avec deux nano-influenceurs. Reliez chaque action à un indicateur de résultat.",
  M5: "Situation — BurgerBenin : une marque de restauration rapide veut relancer ses vidéos courtes auprès d’étudiants et de jeunes salariés. Imaginez trois concepts de vidéos virales, développez le storyboard de la meilleure idée et planifiez une campagne Spark Ads de 75 000 FCFA. Précisez le ciblage, le budget et les KPIs.",
  M6: "Situation : une boutique de vêtements reçoit de nombreux messages mais répond tardivement et perd des prospects. Concevez un parcours conversationnel respectueux : message publicitaire, message d’accueil, trois questions de qualification et règle de relance. Justifiez le ton, le rythme et les limites de la relance.",
  M7: "Situation : un centre de formation local lance un programme professionnel et souhaite apparaître quand des internautes recherchent une formation adaptée. Proposez cinq mots-clés, deux annonces Google Search et trois KPIs de suivi. Expliquez l’intention de recherche ciblée et les optimisations prévues.",
  M8: "Situation — Chez Awa : ce restaurant local dépend fortement du bouche-à-oreille et veut renforcer sa visibilité dans les recherches de proximité. Établissez dix mots-clés locaux, cinq recommandations techniques et un plan de configuration Google Business avec collecte d’avis. Priorisez les actions et justifiez-les.",
  M9: "Situation : une boutique locale collecte des adresses e-mail mais ne transforme pas ces contacts en clients fidèles. Rédigez le plan d’une séquence d’accueil de trois e-mails avec objectif, objet, appel à l’action et logique de personnalisation. Expliquez la progression de la relation.",
  M10: "Situation — Cas données : une marque dispose de résultats mensuels de septembre, octobre et novembre mais ne sait pas quelles décisions prendre pour décembre. Comparez les résultats, identifiez les tendances, calculez les KPIs utiles et proposez cinq actions priorisées pour décembre. Appuyez chaque recommandation sur les données observées.",
  BD1: "Situation : une entreprise de services dispose d’une présence digitale dispersée et ne parvient pas à expliquer clairement sa valeur. Réalisez un mini-audit : positionnement, avatar client, parcours client et trois actions digitales hiérarchisées. Justifiez chaque recommandation par un objectif SMART.",
  BD2: "Situation : une marque de services s’adresse à de jeunes professionnels mais publie le même contenu sur toutes les plateformes. Choisissez les plateformes adaptées, définissez trois piliers éditoriaux et proposez cinq idées de contenus avec leurs objectifs, formats et appels à l’action.",
  BD3: "Situation : un cabinet de consulting lance une nouvelle offre et souhaite accroître sa visibilité auprès de décideurs. Construisez un plan média : objectif, audience, créatif, mots-clés, budget, logique de retargeting et quatre KPIs. Expliquez les arbitrages Meta Ads et Google Search.",
  BD4: "Situation : une direction vous confie 500 000 FCFA pour soutenir une campagne digitale trimestrielle. Répartissez le budget entre trois leviers, justifiez vos choix, estimez les indicateurs CAC/LTV/ROAS pertinents et présentez un tableau de suivi hebdomadaire avec décisions d’ajustement.",
  BD5: "Situation : un cabinet de formation possède une base de contacts mais son taux de réengagement reste faible. Concevez une séquence de bienvenue de trois e-mails, une segmentation responsable et trois questions NPS. Expliquez la logique de nurturing, le consentement et les critères de succès.",
  BD6: "Situation : un client transmet un tableau de résultats digital mensuel et attend des recommandations concrètes. Identifiez trois tendances, sélectionnez cinq KPIs, interprétez les écarts et proposez cinq recommandations de consultance priorisées, chacune reliée à une donnée observée.",
};

function exactCoursePdf(module: any) {
  if (module.code === "PREC") return EXACT_COURSE_PDFS.socialPrecourse;
  if (String(module.code || "").startsWith("BD")) return EXACT_COURSE_PDFS.businessManual;
  return EXACT_COURSE_PDFS.socialManual;
}

function exactCoursePage(module: any, lessonSequence: number) {
  if (module.code === "PREC") return Math.max(1, lessonSequence);
  const businessStarts: Record<string, number> = { BD1: 2, BD2: 4, BD3: 5, BD4: 7, BD5: 8, BD6: 9 };
  const socialStarts: Record<string, number> = { M1: 10, M2: 27, M3: 39, M4: 48, M5: 54, M6: 72, M7: 81, M8: 89, M9: 89, M10: 89 };
  return (businessStarts[module.code] || socialStarts[module.code] || 1) + Math.max(0, lessonSequence - 1);
}

function exactCoursePreview(module: any, lessonSequence: number) {
  const page = exactCoursePage(module, lessonSequence);
  if (module.code === "PREC") return COURSE_PAGE_IMAGES.socialPrecourse[page] || COURSE_PAGE_IMAGES.socialPrecourse[1];
  if (String(module.code || "").startsWith("BD")) return COURSE_PAGE_IMAGES.business[page] || COURSE_PAGE_IMAGES.business[2];
  return COURSE_PAGE_IMAGES.social[page] || COURSE_PAGE_IMAGES.social[10];
}

function StatusPill({ status, approved }: { status?: string; approved?: boolean }) {
  if (!status) return <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">À faire</span>;
  const label = status === "reviewed" ? (approved ? "Validé" : "À reprendre") : status === "submitted" ? "En correction" : "Brouillon";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${statusStyle[status] ?? statusStyle.draft}`}>{label}</span>;
}

function ProgressRing({ value }: { value: number }) {
  return (
    <div className="relative grid h-16 w-16 place-items-center rounded-full bg-[conic-gradient(#204b45_calc(var(--progress)*1%),#e8efed_0)]" style={{ "--progress": value } as React.CSSProperties}>
      <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-sm font-bold text-[#17332f]">{value}%</div>
    </div>
  );
}

function BrandMark() {
  return <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e2a53f] text-[#17332f] shadow-[0_8px_18px_rgba(226,165,63,0.22)]"><GraduationCap className="h-5 w-5" strokeWidth={2.2} /></div>;
}

function LoadingScreen() {
  return <div className="grid min-h-screen place-items-center bg-[#f7f5ef]"><div className="flex items-center gap-3 text-sm font-semibold text-[#264b45]"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#e2a53f]" />Préparation de votre espace de formation</div></div>;
}

function PublicLanding() {
  const [modalOpen, setModalOpen] = useState(false);
  const utils = trpc.useUtils();
  const demoLogin = trpc.auth.demoLogin.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Connexion réussie.");
    },
    onError: error => toast.error(error.message || "Échec de connexion."),
  });

  const handleConnect = () => {
    if (import.meta.env.VITE_OAUTH_PORTAL_URL) {
      startLogin();
    } else {
      setModalOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f5ef] text-[#17332f]">
      <div className="pointer-events-none absolute -left-44 top-16 h-96 w-96 rounded-full bg-[#dce9e3] blur-3xl opacity-70" />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-[#f4dfb6] blur-3xl opacity-70" />
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-6 lg:px-8">
        <div className="flex items-center gap-3"><BrandMark /><div><p className="font-display text-lg leading-none">Campus Formation</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5d7771]">Médias sociaux & Business digital</p></div></div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setModalOpen(true)} className="rounded-full border-blue-200 bg-white px-4 text-xs font-bold text-blue-900 hover:bg-blue-50">Accès Démo Direct</Button>
          <Button onClick={handleConnect} className="rounded-full bg-[#17332f] px-5 text-white hover:bg-[#264b45]">Se connecter <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </header>
      <main className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-28 lg:pt-24">
        <section>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c9dad4] bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#35655d]"><ShieldCheck className="h-3.5 w-3.5" />Espace pédagogique privé</div>
          <h1 className="max-w-xl font-display text-5xl leading-[0.98] tracking-[-0.045em] md:text-6xl">Apprendre, pratiquer, <em className="font-normal text-[#35655d]">progresser.</em></h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-[#55706a]">Un environnement de formation structuré pour développer des compétences concrètes en gestion des médias sociaux et marketing digital.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button onClick={() => setModalOpen(true)} size="lg" className="rounded-full bg-[#e2a53f] px-6 font-bold text-[#17332f] hover:bg-[#d7972d]">Accéder à mon parcours <ChevronRight className="ml-1 h-4 w-4" /></Button>
            <div className="flex items-center gap-2 px-3 text-xs font-medium text-[#5d7771]"><LockKeyhole className="h-4 w-4" />Accès autorisé uniquement</div>
          </div>
        </section>
        <section className="relative rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-[0_30px_80px_rgba(42,70,62,0.12)] backdrop-blur-sm md:p-7">
          <div className="absolute -right-5 -top-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#17332f] text-[#f4dfb6] shadow-lg"><Sparkles className="h-6 w-6" /></div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#79938d]">Votre parcours</p>
          <h2 className="mt-2 font-display text-3xl">Une progression qui a du sens.</h2>
          <div className="mt-7 space-y-3">
            {["Cours et ateliers organisés par modules", "Évaluations pratiques et QCM", "Validation formateur avant l’étape suivante"].map((item, index) => <div className="flex items-center gap-4 rounded-2xl bg-[#f7f8f5] p-4" key={item}><span className="grid h-8 w-8 place-items-center rounded-full bg-white text-xs font-bold text-[#35655d] shadow-sm">0{index + 1}</span><span className="text-sm font-semibold text-[#35544e]">{item}</span></div>)}
          </div>
          <div className="mt-6 flex items-center gap-3 border-t border-[#e5ece8] pt-5 text-xs leading-5 text-[#718981]"><BookOpen className="h-5 w-5 shrink-0 text-[#e2a53f]" />Parcours dédiés aux filières Médias sociaux et Business digital.</div>
        </section>
      </main>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md border-blue-100 bg-white p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-slate-900">Accès direct à la plateforme</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-600">
              Sélectionnez le rôle avec lequel vous souhaitez tester la plateforme immédiatement :
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <button
              disabled={demoLogin.isPending}
              onClick={() => demoLogin.mutate({ role: "admin" })}
              className="flex w-full items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-left transition hover:bg-blue-100/70"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-700 text-white font-bold text-sm">F</div>
              <div>
                <p className="text-sm font-bold text-slate-900">Espace Formateur (Admin)</p>
                <p className="mt-0.5 text-xs text-slate-600">Corrections, copies sommatives, indicateurs et gestion des cohortes.</p>
              </div>
            </button>
            <button
              disabled={demoLogin.isPending}
              onClick={() => demoLogin.mutate({ role: "student_gms" })}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white font-bold text-sm">MS</div>
              <div>
                <p className="text-sm font-bold text-slate-900">Apprenant · Médias Sociaux</p>
                <p className="mt-0.5 text-xs text-slate-600">Parcours GMS et Épreuve sommative 2 h avec modération vocale.</p>
              </div>
            </button>
            <button
              disabled={demoLogin.isPending}
              onClick={() => demoLogin.mutate({ role: "student_bd" })}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white font-bold text-sm">BD</div>
              <div>
                <p className="text-sm font-bold text-slate-900">Apprenant · Business Digital</p>
                <p className="mt-0.5 text-xs text-slate-600">Parcours Business Digital et Épreuve pratique sommative 2 h.</p>
              </div>
            </button>
          </div>
          {demoLogin.isPending && (
            <p className="mt-3 text-center text-xs font-semibold text-blue-700 animate-pulse">Connexion en cours…</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Sidebar({ isAdmin, view, setView, onLogout, mobileOpen, setMobileOpen }: { isAdmin: boolean; view: string; setView: (view: string) => void; onLogout: () => void; mobileOpen: boolean; setMobileOpen: (value: boolean) => void }) {
  const studentProgram = trpc.student.program.useQuery(undefined, { enabled: !isAdmin, retry: false });
  const cohort = isAdmin ? "Gestion des médias sociaux & Business digital" : studentProgram.data?.[0]?.cohort || "Filière en attente";
  const links = isAdmin ? [
    { id: "admin", label: "Vue d’ensemble", icon: LayoutDashboard },
    { id: "content", label: "Contenus", icon: FolderOpen },
    { id: "assessments", label: "Évaluations", icon: BookOpen },
    { id: "reviews", label: "Corrections", icon: FileCheck2 },
    { id: "students", label: "Apprenants", icon: UsersRound },
    { id: "analytics", label: "Indicateurs", icon: BarChart3 },
    { id: "simulations", label: "Simulations", icon: Play },
  ] : [
    { id: "dashboard", label: "Mon parcours", icon: LayoutDashboard },
    { id: "simulation", label: "Épreuve sommative (2 h)", icon: Play },
    { id: "results", label: "Mes résultats", icon: FileCheck2 },
  ];
  return <aside className={`fixed inset-y-0 left-0 z-50 flex w-[278px] flex-col bg-[#17332f] px-4 pb-5 pt-6 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
    <div className="flex items-center gap-3 px-2"><BrandMark /><div className="min-w-0"><p className="font-display text-lg leading-none">Campus Formation</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#a9c3ba]">{cohort}</p></div><button onClick={() => setMobileOpen(false)} className="ml-auto rounded-lg p-1 text-[#b5cbc4] lg:hidden"><X className="h-5 w-5" /></button></div>
    <div className="mx-2 mt-8 border-t border-white/10" />
    <nav className="mt-5 space-y-1.5">{links.map(link => { const Icon = link.icon; const current = view === link.id || (view === "module" && link.id === "dashboard"); return <button key={link.id} onClick={() => { setView(link.id); setMobileOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${current ? "bg-white/12 text-white" : "text-[#b5cbc4] hover:bg-white/8 hover:text-white"}`}><Icon className="h-4 w-4" /><span>{link.label}</span></button>; })}</nav>
    <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9db8af]">Filière</p><p className="mt-1 text-sm font-semibold leading-5">{cohort}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-3/5 rounded-full bg-[#e2a53f]" /></div></div>
    <button onClick={onLogout} className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#b5cbc4] transition hover:bg-white/8 hover:text-white"><LogOut className="h-4 w-4" />Déconnexion</button>
  </aside>;
}

function StudentProfileDialog({ user }: { user: any }) {
  const utils = trpc.useUtils();
  const profile = trpc.student.profile.useQuery(undefined, { retry: false });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  useEffect(() => { if (open) { setName(profile.data?.name || user?.name || ""); setAge(profile.data?.age ? String(profile.data.age) : ""); } }, [open, profile.data?.name, profile.data?.age, user?.name]);
  const save = trpc.student.updateProfile.useMutation({ onSuccess: () => { utils.student.profile.invalidate(); toast.success("Votre profil a été enregistré."); setOpen(false); }, onError: error => toast.error(error.message || "Le profil n’a pas pu être enregistré.") });
  const initial = (profile.data?.name || user?.name || "E").slice(0, 1).toUpperCase();
  return <Dialog open={open} onOpenChange={setOpen}><button type="button" onClick={() => setOpen(true)} aria-label="Ouvrir mon profil" className="grid h-9 w-9 place-items-center rounded-full bg-[#dce9e3] text-sm font-bold text-[#244740] transition hover:scale-105 hover:bg-[#cce0d7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35655d] focus-visible:ring-offset-2">{initial}</button><DialogContent className="border-[#dbe7e1] bg-[#fcfdfb] p-5 sm:p-6"><DialogHeader><DialogTitle className="font-display text-2xl text-[#183933]">Mon profil</DialogTitle><DialogDescription className="leading-6 text-[#607a73]">Renseignez vos informations personnelles. Elles restent privées et servent uniquement à personnaliser votre espace.</DialogDescription></DialogHeader><form onSubmit={event => { event.preventDefault(); const parsedAge = age.trim() ? Number(age) : null; if (parsedAge !== null && (!Number.isInteger(parsedAge) || parsedAge < 13 || parsedAge > 120)) { toast.error("Indiquez un âge compris entre 13 et 120 ans."); return; } save.mutate({ name: name.trim(), age: parsedAge }); }} className="space-y-4"><label className="block text-sm font-bold text-[#294b43]">Nom et prénom<input required minLength={2} maxLength={120} value={name} onChange={event => setName(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#d7e4de] bg-white px-3 text-sm text-[#244740] outline-none transition focus:border-[#75a793] focus:ring-2 focus:ring-[#dcece4]" placeholder="Votre nom et prénom" /></label><label className="block text-sm font-bold text-[#294b43]">Âge <span className="font-medium text-[#7b948c]">(facultatif)</span><input type="number" inputMode="numeric" min={13} max={120} value={age} onChange={event => setAge(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#d7e4de] bg-white px-3 text-sm text-[#244740] outline-none transition focus:border-[#75a793] focus:ring-2 focus:ring-[#dcece4]" placeholder="Ex. 22" /></label><DialogFooter><Button type="submit" disabled={save.isPending} className="w-full rounded-xl bg-[#17332f] text-white hover:bg-[#264b45] sm:w-auto">{save.isPending ? "Enregistrement…" : "Enregistrer le profil"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

function AppHeader({ user, isAdmin, onMenu, onNotificationNavigate, onLogout }: { user: any; isAdmin: boolean; onMenu: () => void; onNotificationNavigate: (notification: any) => void; onLogout: () => void }) {
  return <header className="flex items-center justify-between border-b border-[#e3e9e6] bg-[#fbfbf8]/90 px-4 py-3 backdrop-blur-sm sm:px-5 sm:py-4 lg:px-9"><div className="flex min-w-0 items-center gap-2 sm:gap-3"><button onClick={onMenu} className="shrink-0 rounded-lg p-2 text-[#45665f] hover:bg-[#edf3ef] lg:hidden"><Menu className="h-5 w-5" /></button><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8aa099]">{isAdmin ? "Espace formateur" : "Espace apprenant"}</p><p className="mt-0.5 truncate text-sm font-semibold text-[#244740]">{isAdmin ? "Pilotage pédagogique" : "Mon espace de progression"}</p></div></div><div className="flex shrink-0 items-center gap-2 sm:gap-3">{!isAdmin && <NotificationCenter onNavigate={onNotificationNavigate} />}<div className="hidden text-right sm:block"><p className="text-sm font-bold text-[#244740]">{user?.name || "Compte apprenant"}</p><p className="text-xs text-[#78918a]">{isAdmin ? "Formateur" : "Élève"}</p></div>{isAdmin ? <div className="grid h-9 w-9 place-items-center rounded-full bg-[#dce9e3] text-sm font-bold text-[#244740]">{(user?.name || "A").slice(0, 1).toUpperCase()}</div> : <StudentProfileDialog user={user} />}<button type="button" onClick={onLogout} aria-label="Se déconnecter" title="Se déconnecter" className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#dbe7e1] bg-white px-3 text-xs font-bold text-[#42665e] transition hover:border-[#b9d0c6] hover:bg-[#f4f8f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35655d] focus-visible:ring-offset-2"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Se déconnecter</span></button></div></header>;
}

function NotificationCenter({ onNavigate }: { onNavigate: (notification: any) => void }) {
  const utils = trpc.useUtils();
  const notifications = trpc.student.notifications.useQuery(undefined, { refetchInterval: 60_000 });
  const markRead = trpc.student.markNotificationRead.useMutation({ onSuccess: () => utils.student.notifications.invalidate() });
  const [open, setOpen] = useState(false);
  const unread = notifications.data?.filter(item => !item.readAt).length ?? 0;
  const openNotification = (item: any) => { if (!item.readAt) markRead.mutate({ notificationId: item.id }); setOpen(false); onNavigate(item); };
  const panel = open && typeof document !== "undefined" ? createPortal(<><button type="button" aria-label="Fermer les notifications" onClick={() => setOpen(false)} className="fixed inset-0 z-[9998] cursor-default bg-slate-950/10" /><section role="dialog" aria-modal="true" aria-label="Notifications" className="fixed inset-x-3 top-[72px] z-[9999] overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_24px_60px_rgba(25,61,160,.28)] sm:right-5 sm:left-auto sm:w-80"><div className="border-b border-blue-100 bg-blue-50 px-4 py-3"><p className="text-sm font-bold text-slate-900">Notifications</p><p className="mt-1 text-xs text-slate-600">Touchez une notification pour ouvrir l’action concernée.</p></div><div className="max-h-[65vh] overflow-y-auto">{notifications.isLoading ? <p className="p-4 text-sm text-slate-600">Chargement…</p> : !notifications.data?.length ? <p className="p-5 text-sm text-slate-600">Aucune notification pour le moment.</p> : notifications.data.map(item => <button key={item.id} onClick={() => openNotification(item)} className={`w-full border-b border-blue-50 px-4 py-3 text-left transition hover:bg-blue-50 ${item.readAt ? "" : "bg-blue-50/70"}`}><p className="break-words text-sm font-bold text-slate-800">{item.title}</p><p className="mt-1 break-words text-xs leading-5 text-slate-600">{item.body}</p><p className="mt-1.5 text-[10px] font-semibold text-slate-400">{new Date(item.createdAt).toLocaleDateString("fr-FR")}</p></button>)}</div></section></>, document.body) : null;
  return <div className="relative"><button aria-label="Afficher les notifications" onClick={() => setOpen(!open)} className="relative rounded-xl p-2 text-blue-800 hover:bg-blue-50"><Bell className="h-5 w-5" />{unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">{unread}</span>}</button>{panel}</div>;
}

function StudentDashboard({ program, onSelectModule, resultsOnly }: { program: ProgramModule[]; onSelectModule: (moduleId: number) => void; resultsOnly: boolean }) {
  const profile = trpc.student.profile.useQuery(undefined, { retry: false });
  const greeting = profile.data?.name?.trim() ? `Bonjour, ${profile.data.name.trim()}` : "Bonjour";
  const completed = program.filter(module => module.submission?.status === "reviewed" && module.submission?.approved).length;
  const percentage = Math.round((completed / Math.max(program.length, 1)) * 100);
  const average = program.filter(module => module.submission?.manualScore !== null && module.submission?.manualScore !== undefined).map(module => module.submission.manualScore as number);
  const grade = average.length ? (average.reduce((sum, value) => sum + value, 0) / average.length).toFixed(1) : "—";
  const revisions = program.filter(module => module.submission?.returnRequestedAt || module.deliverables?.some((item: any) => item.returnRequestedAt)).length;
  const intake = program[0]?.intake;
  return <div className="mx-auto w-full max-w-7xl px-5 py-7 lg:px-9 lg:py-9">
    <section className="student-hero rounded-[1.75rem] p-5 sm:p-6 md:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.15em]">{resultsOnly ? "Mes résultats" : greeting}</p><h1 className="mt-2 font-display text-3xl leading-tight tracking-[-0.03em] sm:text-4xl">{resultsOnly ? "Des retours pour avancer." : "Chaque étape vous rapproche de la maîtrise."}</h1><p className="mt-3 max-w-2xl text-sm leading-6">Les modules se débloquent uniquement après soumission et validation par votre formateur. Vous conservez toujours une vision claire de vos résultats.</p></div><div className="self-start sm:self-auto"><ProgressRing value={percentage} /></div></div></section>
    {resultsOnly && <section className="mt-6 grid gap-4 sm:grid-cols-3"><Metric icon={RotateCcw} label="Devoirs à reprendre" value={String(revisions)} tone="mist" /><Metric icon={BookOpen} label="Modules validés" value={`${completed}/${program.length}`} tone="sage" /><Metric icon={FileCheck2} label="Moyenne actuelle" value={grade === "—" ? "—" : `${grade}/20`} tone="sand" /></section>}
    <section className="mt-9"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8aa099]">Programme certifiant</p><h2 className="mt-1 font-display text-3xl text-[#183933]">{resultsOnly ? "Vos évaluations" : "Votre parcours"}</h2>{intake && <p className="mt-2 text-xs font-bold text-blue-700">{intake}</p>}</div><span className="text-xs font-semibold text-[#6d8981]">{program.length} modules</span></div><div className="grid gap-3">{program.map((module, index) => <ModuleCard key={module.id} module={module} index={index} onClick={() => onSelectModule(module.id)} resultsOnly={resultsOnly} />)}</div></section>{!resultsOnly && <><StudentResourceShelf program={program} /><StudentActivityTimeline /></>}
  </div>;
}

function Metric({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) {
  const styles: Record<string, string> = { sage: "bg-[#e9f0eb] text-[#345f56]", sand: "bg-[#fbf1dc] text-[#966b26]", mist: "bg-[#edf1f0] text-[#4b6963]" };
  return <Card className="border-0 shadow-none"><CardContent className="flex items-center gap-4 p-4"><div className={`grid h-10 w-10 place-items-center rounded-xl ${styles[tone]}`}><Icon className="h-5 w-5" /></div><div><p className="text-xl font-bold tracking-tight text-[#22453e]">{value}</p><p className="text-xs font-medium text-[#78918a]">{label}</p></div></CardContent></Card>;
}

function ModuleCard({ module, index, onClick, resultsOnly }: { module: ProgramModule; index: number; onClick: () => void; resultsOnly: boolean }) {
  const isAvailable = module.isUnlocked;
  const score = module.submission?.manualScore;
  return <button disabled={!isAvailable} onClick={onClick} className={`group w-full overflow-hidden rounded-2xl border p-4 text-left transition md:p-5 ${isAvailable ? "border-[#e2eae6] bg-white hover:-translate-y-0.5 hover:border-[#b9d0c6] hover:shadow-[0_14px_32px_rgba(37,73,63,0.08)]" : "cursor-not-allowed border-[#e8ecea] bg-[#f7f8f6] opacity-75"}`}><div className="flex items-start gap-3 sm:gap-4"><div className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold ${isAvailable ? "bg-[#e9f0eb] text-[#35655d]" : "bg-[#e7ebea] text-[#8ea19b]"}`}>{isAvailable ? String(index + 1).padStart(2, "0") : <LockKeyhole className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start gap-2"><h3 className="min-w-0 flex-1 break-words text-sm font-bold leading-5 text-[#244740]">{module.title}</h3><StatusPill status={module.submission?.status} approved={module.submission?.approved} />{module.deliverables?.some((item: any) => item.isLate) && <span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700">Livrable en retard</span>}</div><p className="mt-1.5 break-words text-xs leading-5 text-[#78918a]">{module.summary}</p></div>{resultsOnly && score !== null && score !== undefined ? <div className="shrink-0 rounded-xl bg-[#f5f8f6] px-2.5 py-2 text-right"><p className="text-base font-bold text-[#244740]">{score}/20</p><p className="text-[10px] font-semibold text-[#7e968e]">NOTE</p></div> : isAvailable ? <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#a7b9b3] transition group-hover:translate-x-0.5 group-hover:text-[#35655d]" /> : null}</div>{!isAvailable && <p className="mt-3 border-t border-[#e7ece9] pt-3 text-xs leading-5 text-[#7d918b]">{module.override === "locked" ? "Accès bloqué manuellement par le formateur." : "Terminez et faites valider le module précédent pour ouvrir cette étape."}</p>}</button>;
}

function ExactCourseRenderer({ text }: { text: string }) {
  const metadata = text.match(/^\[\[course:([^:]+):(\d+)\]\]\n*/);
  const moduleCode = metadata?.[1];
  const lessonSequence = metadata ? Number(metadata[2]) : 0;
  const cleanText = moduleCode ? stripRawCourseTables(moduleCode, lessonSequence, text.replace(/^\[\[course:[^\]]+\]\]\n*/, "")) : text;
  const blocks = cleanText.split(/\n{2,}/).map(block => block.trim()).filter(Boolean).filter(block => !moduleCode || !isRawCourseTableBlock(moduleCode, lessonSequence, block));
  return <div className="space-y-5">{blocks.map((block, index) => {
    const lines = block.split("\n").map(line => line.trim()).filter(Boolean);
    const joined = lines.join(" ");
    const heading = /^(Cours|Module|[0-9]+\.[0-9]+|Objectifs|Compétences|CAS PRATIQUE|EXERCICE|À retenir|Tableau|Calendrier)/i.test(lines[0] || "");
    const callout = /^(CAS PRATIQUE|EXERCICE|À retenir)/i.test(lines[0] || "");
    const bulletLines = lines.length > 1 && lines.every(line => /^[-•■]|^\d+\./.test(line));
    if (bulletLines) return <ul key={index} className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/60 p-4">{lines.map(line => <li key={line} className="flex gap-2 text-sm leading-6 text-slate-700"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />{line.replace(/^[-•■]\s*|^\d+\.\s*/, "")}</li>)}</ul>;
    if (callout) return <aside key={index} className="rounded-xl border-l-4 border-blue-600 bg-blue-50 px-4 py-4 text-sm leading-7 text-slate-700"><p className="font-extrabold text-blue-900">{lines[0]}</p><p className="mt-2">{lines.slice(1).join(" ")}</p></aside>;
    if (heading) return <section key={index}><h3 className="text-lg font-extrabold leading-7 text-slate-900">{lines[0]}</h3>{lines.slice(1).map(line => <p key={line} className="mt-3 text-sm leading-7 text-slate-700">{line}</p>)}</section>;
    return <p key={index} className="text-sm leading-7 text-slate-700">{joined}</p>;
  })}{metadata && <CourseTables moduleCode={metadata[1]} lessonSequence={Number(metadata[2])} />}</div>;
}

function CourseTables({ moduleCode, lessonSequence }: { moduleCode: string; lessonSequence: number }) {
  const tables = getCourseTables(moduleCode, lessonSequence);
  if (!tables.length) return null;
  return <div className="mt-7 space-y-6">{tables.map(table => <section key={table.title}><h3 className="mb-3 text-base font-extrabold text-slate-900">{table.title}</h3><div className="overflow-x-auto rounded-xl border border-blue-200"><table className="min-w-[680px] border-collapse text-left text-xs"><thead className="bg-blue-700 text-white"><tr>{table.headers.map(header => <th key={header} scope="col" className="border-r border-blue-500 px-3 py-3 font-bold last:border-r-0">{header}</th>)}</tr></thead><tbody>{table.rows.map((row, rowIndex) => <tr key={rowIndex} className="border-t border-blue-100 even:bg-blue-50/60">{row.map((cell, cellIndex) => <td key={cellIndex} className="border-r border-blue-100 px-3 py-3 align-top leading-5 text-slate-700 last:border-r-0">{cell}</td>)}</tr>)}</tbody></table></div><p className="mt-2 text-xs text-slate-500 sm:hidden">Faites glisser le tableau horizontalement pour voir toutes les colonnes.</p></section>)}</div>;
}

function CourseLessonItem({ lesson, module }: { lesson: any; module: ProgramModule }) {
  const [open, setOpen] = useState(false);
  const [exactText, setExactText] = useState<string | null>(null);
  const [isLoadingExactText, setIsLoadingExactText] = useState(false);
  const transcript = getLessonTranscript(module.code, lesson.sequence, lesson);
  const source = getExactCourseSource(module.code, lesson.sequence, module.intake);
  useEffect(() => {
    if (!open || !source || exactText) return;
    let active = true; setIsLoadingExactText(true);
    fetch(source.url).then(response => response.ok ? response.text() : Promise.reject(new Error("support indisponible"))).then(raw => {
      if (!active) return;
      const normalized = raw.replace(/\f/g, "\n\n");
      setExactText(`[[course:${module.code}:${lesson.sequence}]]\n${normalized.trim()}`);
    }).catch(() => active && setExactText(null)).finally(() => active && setIsLoadingExactText(false));
    return () => { active = false; };
  }, [exactText, open, source]);
  return <><button type="button" onClick={() => setOpen(true)} className="group flex w-full items-start gap-3 rounded-xl py-4 text-left transition first:pt-0 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:gap-4 sm:px-2"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">{lesson.sequence}</div><div className="min-w-0 flex-1"><p className="break-words text-sm font-bold leading-5 text-slate-800">{lesson.title}</p><p className="mt-0.5 break-words text-xs leading-5 text-slate-500">{lesson.summary}</p><span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-700 underline decoration-blue-200 underline-offset-4">Lire le cours complet <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" /></span></div><ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" /></button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[94dvh] max-w-[calc(100%-1rem)] overflow-hidden border-blue-100 bg-white p-0 sm:max-w-3xl"><DialogHeader className="border-b border-blue-100 bg-gradient-to-br from-blue-50 to-white px-5 py-5 pr-12 text-left"><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-blue-600">Support de cours autorisé</p><DialogTitle className="mt-1 font-display text-2xl leading-tight text-slate-900">{lesson.title}</DialogTitle><DialogDescription className="mt-2 leading-5 text-slate-600">Retranscription textuelle mise en forme du support correspondant à cette leçon.</DialogDescription></DialogHeader><article className="max-h-[calc(94dvh-9rem)] overflow-y-auto p-5 sm:p-7">{isLoadingExactText ? <p className="py-10 text-center text-sm text-slate-500">Chargement du cours complet…</p> : exactText ? <ExactCourseRenderer text={exactText} /> : <><p className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 text-sm leading-7 text-slate-700">{transcript.introduction}</p>{transcript.sections.map(section => <section key={section.heading} className="mt-6"><h3 className="text-lg font-extrabold text-slate-900">{section.heading}</h3>{section.paragraphs.map(paragraph => <p key={paragraph} className="mt-3 text-sm leading-7 text-slate-700">{paragraph}</p>)}</section>)}</>}</article></DialogContent></Dialog></>;
}

function ModuleWorkspace({ moduleId, onBack }: { moduleId: number; onBack: () => void }) {
  const utils = trpc.useUtils();
  const detail = trpc.student.module.useQuery({ moduleId }, { retry: false });
  const saveAssessment = trpc.student.saveAssessment.useMutation({ onSuccess: (_, variables) => { toast.success(variables.submit ? "Évaluation transmise au formateur." : "Brouillon enregistré."); utils.student.program.invalidate(); utils.student.module.invalidate({ moduleId }); }, onError: error => toast.error(error.message || "L’enregistrement de l’évaluation a échoué.") });
  const upload = trpc.student.uploadDeliverable.useMutation({ onSuccess: () => { toast.success("Livrable déposé avec succès."); utils.student.program.invalidate(); utils.student.module.invalidate({ moduleId }); }, onError: error => toast.error(error.message || "Le dépôt du livrable a échoué. Vérifiez le fichier puis réessayez.") });
  const [answers, setAnswers] = useState<AnswerMap>({});
  useEffect(() => { if (detail.data?.submission?.answers) setAnswers(detail.data.submission.answers); }, [detail.data?.submission?.id]);
  if (detail.isLoading) return <LoadingScreen />;
  if (detail.error || !detail.data) return <div className="mx-auto max-w-3xl px-6 py-12"><Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" />Retour</Button><div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">{detail.error?.message || "Ce module n’est pas disponible."}</div></div>;
  const module = detail.data as ProgramModule;
  const answer = (questionId: number) => answers[String(questionId)];
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { const data = String(reader.result).split(",")[1]; if (!data) { toast.error("Le fichier n’a pas pu être lu. Veuillez le sélectionner à nouveau."); return; } upload.mutate({ moduleId, fileName: file.name, mimeType: file.type || "text/plain", dataBase64: data }); }; reader.onerror = () => toast.error("La lecture du fichier a échoué. Veuillez essayer un autre fichier."); reader.readAsDataURL(file); };
  return <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-5 sm:py-7 lg:px-9 lg:py-9"><Button variant="ghost" onClick={onBack} className="mb-4 -ml-3 text-[#55706a] hover:bg-[#eaf0ed] hover:text-[#244740]"><ArrowLeft className="mr-2 h-4 w-4" />Retour au parcours</Button><div className="grid gap-6 lg:grid-cols-[1fr_340px]"><main><section className="rounded-[1.75rem] bg-[#17332f] p-5 text-white sm:p-6 md:p-8"><div className="flex flex-wrap items-center gap-3"><Badge className="border-0 bg-[#e2a53f] text-[#17332f]">Module {module.sequence}</Badge><StatusPill status={module.submission?.status} approved={module.submission?.approved} /></div><h1 className="mt-4 font-display text-3xl tracking-[-0.03em] md:text-4xl">{module.title.replace(/^Module \d+ — /, "")}</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[#c4d8d1]">{module.summary}</p></section><section className="mt-6 rounded-2xl border border-[#e1e9e4] bg-white p-5 md:p-6"><SectionHeading icon={BookOpen} eyebrow="Cours inclus" title="Leçons du module" /><div className="mt-4 divide-y divide-[#edf1ef]">{module.lessons.map((lesson: any) => <CourseLessonItem key={lesson.id} lesson={lesson} module={module} />)}</div></section><section className="mt-6 rounded-2xl border border-[#e1e9e4] bg-white p-5 md:p-6"><SectionHeading icon={Paperclip} eyebrow="Livrable" title={module.assignment?.title || "Travail à remettre"} /><p className="mt-4 text-sm leading-6 text-[#5b746d]">{module.assignment?.instructions}</p><div className="mt-4 flex flex-col gap-3 rounded-xl bg-[#f5f8f6] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#809991]">Format attendu</p><p className="mt-1 text-sm font-semibold text-[#385b54]">{module.assignment?.expectedFormat}</p></div><label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#e2a53f] px-4 py-2.5 text-sm font-bold text-[#17332f] transition hover:bg-[#d7972d]"><Upload className="mr-2 h-4 w-4" />{upload.isPending ? "Envoi…" : "Déposer un fichier"}<input onChange={handleFile} type="file" accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className="sr-only" /></label></div>{module.deliverables?.length > 0 && <div className="mt-4 space-y-2">{module.deliverables.map((item: any) => <a className="flex items-center gap-3 rounded-xl border border-[#e4ebe7] px-3 py-2.5 text-sm font-semibold text-[#42665e] hover:bg-[#f7faf8]" href={item.url} key={item.id} target="_blank" rel="noreferrer"><FileText className="h-4 w-4 text-[#e2a53f]" />{item.fileName}<span className="ml-auto text-xs font-medium text-[#8aa099]">Voir</span></a>)}</div>}</section><AssessmentPanel module={module} answers={answers} setAnswers={setAnswers} onSave={() => saveAssessment.mutate({ moduleId, answers, submit: false })} onSubmit={() => saveAssessment.mutate({ moduleId, answers, submit: true })} isSaving={saveAssessment.isPending} /></main><aside className="space-y-4"><Card className="border-[#e1e9e4] shadow-none"><CardContent className="p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#829991]">Règle de progression</p><div className="mt-3 flex gap-3"><LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[#35655d]" /><p className="text-sm leading-6 text-[#58716a]">Le prochain module s’ouvrira après soumission <strong className="text-[#35574f]">et validation formateur</strong> de cette évaluation.</p></div></CardContent></Card>{module.submission?.status === "reviewed" && <Card className="border-[#cfe2d9] bg-[#f2f8f4] shadow-none"><CardContent className="p-5"><div className="flex items-center gap-2 text-[#2a6a4e]"><CheckCircle2 className="h-5 w-5" /><p className="text-sm font-bold">Retour du formateur</p></div><p className="mt-4 text-3xl font-bold text-[#244a3e]">{module.submission.manualScore}/20</p><p className="mt-3 text-sm leading-6 text-[#507167]">{module.submission.feedback || "Aucun commentaire ajouté."}</p></CardContent></Card>}</aside></div></div>;
}

function SectionHeading({ icon: Icon, eyebrow, title }: { icon: any; eyebrow: string; title: string }) { return <div className="flex items-start gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#eaf1ed] text-[#35655d]"><Icon className="h-4 w-4" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#839991]">{eyebrow}</p><h2 className="mt-0.5 font-display text-2xl text-[#244740]">{title}</h2></div></div>; }

export function AssessmentPanel({ module, answers, setAnswers, onSave, onSubmit, isSaving }: { module: ProgramModule; answers: AnswerMap; setAnswers: (answers: AnswerMap) => void; onSave: () => void; onSubmit: () => void; isSaving: boolean }) {
  const locked = module.submission?.status === "submitted" || module.submission?.status === "reviewed";
  const assessmentOpen = Boolean(module.assessment?.isOpen);
  const returnedDeliverables = module.deliverables?.filter((item: any) => item.returnRequestedAt) ?? [];
  const quizQuestions = module.questions.filter((question: any) => question.type !== "essay");
  const essayQuestions = module.questions.filter((question: any) => question.type === "essay");
  const caseStudy = COURSE_CASE_STUDIES[module.code] || module.assessment?.instructions || "";
  const handleChoice = (question: any, value: string) => {
    if (question.type === "multiple") {
      const current = Array.isArray(answers[String(question.id)]) ? answers[String(question.id)] as string[] : [];
      setAnswers({ ...answers, [String(question.id)]: current.includes(value) ? current.filter(item => item !== value) : [...current, value] });
    } else setAnswers({ ...answers, [String(question.id)]: value });
  };
  const renderQuestion = (question: any, number: number) => {
    const rawOptions: string[] = question.options || [];
    const seed = Number(question.id || number) * 37 + (module?.id || 1);
    const options = [...rawOptions].sort((a, b) => {
      const hA = (a.charCodeAt(0) * 19 + seed) % 101;
      const hB = (b.charCodeAt(0) * 19 + seed) % 101;
      return hA - hB;
    });
    return (
      <div key={question.id} className="rounded-xl border border-[#e4ebe7] p-4 md:p-5">
        <div className="flex gap-3">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#eaf1ed] text-xs font-bold text-[#37675e]">{number}</span>
          <div className="flex-1">
            <p className="text-sm font-bold leading-6 text-[#294b44]">{question.prompt}</p>
            <p className="mt-1 text-xs font-semibold text-[#879d96]">{question.maxPoints} point{question.maxPoints > 1 ? "s" : ""}</p>
            {question.type === "essay" ? (
              <Textarea value={(answers[String(question.id)] as string) || ""} onChange={event => setAnswers({ ...answers, [String(question.id)]: event.target.value })} placeholder="Rédigez votre réponse ici…" className="mt-4 min-h-32 border-[#dce7e1] bg-[#fbfcfb] focus-visible:ring-[#35655d]" />
            ) : (
              <div className="mt-4 space-y-2.5">
                {options.map((option: string) => {
                  const selected = Array.isArray(answers[String(question.id)]) ? (answers[String(question.id)] as string[]).includes(option) : answers[String(question.id)] === option;
                  return <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition ${selected ? "border-[#8bb3a5] bg-[#edf6f1] text-[#244c43]" : "border-[#e5ece8] text-[#607a73] hover:bg-[#f7faf8]"}`}><input type={question.type === "multiple" ? "checkbox" : "radio"} name={`q-${question.id}`} checked={selected} onChange={() => handleChoice(question, option)} className="accent-[#35655d]" />{option}</label>;
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  return <>
    {module.answerKey && <section className="mt-6 rounded-2xl border border-[#cfe2d9] bg-[#f2f8f4] p-5 md:p-6"><SectionHeading icon={FileCheck2} eyebrow="Résultats partagés" title="Corrigé type de l’évaluation" /><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#365f53]">{module.answerKey.content}</p></section>}
    {returnedDeliverables.length > 0 && <section className="mt-6 rounded-2xl border border-[#f0c8b8] bg-[#fff6f2] p-5"><SectionHeading icon={RotateCcw} eyebrow="Reprise de livrable" title="Une nouvelle version est attendue" /><div className="mt-4 space-y-3">{returnedDeliverables.map((item: any) => <div key={item.id} className="rounded-xl bg-white/75 p-4 text-sm text-[#8d4a39]"><strong>{item.fileName}</strong><p className="mt-2 leading-6">{item.returnNote || "Votre formateur vous demande de compléter puis déposer une nouvelle version."}</p></div>)}</div></section>}
    <section className="mt-6 rounded-2xl border border-[#e1e9e4] bg-white p-5 md:p-6"><SectionHeading icon={FileCheck2} eyebrow="Évaluation" title={module.assessment?.title || "Évaluation"} />
      {module.assessment?.dueAt && <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#fff8e7] px-3 py-2 text-xs font-bold text-[#916a25]"><CalendarDays className="h-3.5 w-3.5" />À remettre avant le {new Date(module.assessment.dueAt).toLocaleDateString("fr-FR")}</p>}
      {(module.code === "BD7" || module.code === "M11") && <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold"><span className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-blue-800"><Clock3 className="h-3.5 w-3.5" />Durée totale : 2 heures</span><span className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-indigo-800"><FileCheck2 className="h-3.5 w-3.5" />Théorie : 30 min · Pratique : 1 h 30</span><span className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-800">Théorie 10 points · Pratique 10 points</span></div>}
      {module.submission?.returnRequestedAt && <div className="mt-4 rounded-xl border border-[#f0c8b8] bg-[#fff6f2] p-4 text-sm text-[#8d4a39]"><RotateCcw className="mr-2 inline h-4 w-4" /><strong>Reprise demandée par le formateur.</strong><p className="mt-2 leading-6">{module.submission.returnNote || "Complétez votre travail puis soumettez une nouvelle version."}</p></div>}
      {!assessmentOpen ? <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900"><LockKeyhole className="mr-2 inline h-4 w-4" /><strong>Évaluation verrouillée.</strong><p className="mt-2">Les leçons du module restent disponibles. Votre formateur ouvrira l’évaluation lorsqu’il vous autorisera à la composer.</p></div> : locked ? <div className="mt-5 rounded-xl bg-[#f4f7f5] p-4 text-sm font-semibold text-[#56736a]"><CheckCircle2 className="mr-2 inline h-4 w-4 text-[#37755b]" />Cette évaluation est {module.submission.status === "submitted" ? "en attente de correction" : "corrigée"}.</div> : <div className="mt-6 space-y-8">
        {quizQuestions.length > 0 && <div><div className="rounded-xl bg-[#edf5f0] p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#63857a]">Partie 1 — Quiz</p><h3 className="mt-1 text-lg font-bold text-[#244b42]">Vérifiez vos connaissances</h3><p className="mt-1 text-sm text-[#5a766d]">Répondez aux {quizQuestions.length} questions à choix proposé avant de passer à la rédaction.</p></div><div className="mt-4 space-y-4">{quizQuestions.map((question: any, index: number) => renderQuestion(question, index + 1))}</div></div>}
        {essayQuestions.length > 0 && <div><div className="rounded-xl bg-[#fff8e9] p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#9a702c]">Partie 2 — Rédaction</p><h3 className="mt-1 text-lg font-bold text-[#5d481f]">Mise en situation complète</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#765f34]">{caseStudy}</p></div><div className="mt-4 space-y-4">{essayQuestions.map((question: any, index: number) => renderQuestion(question, quizQuestions.length + index + 1))}</div></div>}
      </div>}
      {assessmentOpen && !locked && <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#e7eeea] pt-5 sm:flex-row sm:justify-end"><Button variant="outline" onClick={onSave} disabled={isSaving} className="rounded-xl border-[#cfe0d8] text-[#385d54] hover:bg-[#f1f7f3]">Enregistrer le brouillon</Button><Button onClick={onSubmit} disabled={isSaving} className="rounded-xl bg-[#17332f] text-white hover:bg-[#264b45]">{isSaving ? "Transmission…" : "Soumettre au formateur"}<ArrowRight className="ml-2 h-4 w-4" /></Button></div>}
    </section>
  </>;
}

function AdminDashboard({ view }: { view: string }) {
  const utils = trpc.useUtils();
  const overview = trpc.admin.overview.useQuery(undefined, { refetchInterval: 15_000, refetchOnWindowFocus: true });
  const queue = trpc.admin.reviewQueue.useQuery(undefined, { refetchInterval: 15_000, refetchOnWindowFocus: true });
  const reviewHistory = trpc.admin.reviewHistory.useQuery(undefined, { refetchInterval: 15_000, refetchOnWindowFocus: true });
  const deliverableQueue = trpc.admin.deliverableQueue.useQuery(undefined, { refetchInterval: 15_000, refetchOnWindowFocus: true });
  const [cohort, setCohort] = useState<"all" | "Gestion des médias sociaux" | "Business digital">("all");
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const detail = trpc.admin.reviewDetail.useQuery({ submissionId: selectedReview ?? 0 }, { enabled: selectedReview !== null });
  const [score, setScore] = useState("0");
  const [feedback, setFeedback] = useState("");
  const [approved, setApproved] = useState(true);
  const [suggestion, setSuggestion] = useState<any>(null);
  const submitReview = trpc.admin.reviewSubmission.useMutation({ onSuccess: () => { toast.success("Correction enregistrée et apprenant notifié."); setSelectedReview(null); utils.admin.overview.invalidate(); utils.admin.reviewQueue.invalidate(); utils.admin.reviewHistory.invalidate(); }, onError: error => toast.error(error.message || "La correction n’a pas pu être enregistrée.") });
  const requestRevision = trpc.admin.requestRevision.useMutation({ onSuccess: () => { toast.success("Reprise demandée à l’élève."); setSelectedReview(null); utils.admin.overview.invalidate(); utils.admin.reviewQueue.invalidate(); }, onError: error => toast.error(error.message || "La demande de reprise a échoué.") });
  const requestDeliverableRevision = trpc.admin.requestDeliverableRevision.useMutation({ onSuccess: () => { toast.success("Reprise de livrable demandée."); utils.admin.deliverableQueue.invalidate(); }, onError: error => toast.error(error.message || "La demande de reprise a échoué.") });
  const suggest = trpc.admin.suggestCorrection.useMutation({ onSuccess: data => { setSuggestion(data); setScore(String(data.score)); setFeedback(`${data.feedback}\n\nPoints forts : ${data.strengths.join(" ; ")}\nÀ améliorer : ${data.improvements.join(" ; ")}`); toast.success("Suggestion de correction générée."); }, onError: error => toast.error(error.message || "La suggestion IA est indisponible. Vous pouvez corriger manuellement.") });
  const enrollment = trpc.admin.setEnrollment.useMutation({ onSuccess: () => { toast.success("Accès élève actualisé."); utils.admin.overview.invalidate(); }, onError: error => toast.error(error.message || "La mise à jour de l’accès a échoué.") });
  const override = trpc.admin.setOverride.useMutation({ onSuccess: () => { toast.success("Règle de progression actualisée."); utils.admin.overview.invalidate(); }, onError: error => toast.error(error.message || "La règle de progression n’a pas pu être modifiée.") });
  useEffect(() => { if (detail.data?.submission) { setScore(String(detail.data.submission.manualScore ?? detail.data.submission.autoScore ?? 0)); setFeedback(detail.data.submission.feedback ?? ""); setApproved(detail.data.submission.approved ?? true); setSuggestion(null); } }, [detail.data?.submission?.id]);
  if (overview.isLoading || queue.isLoading || reviewHistory.isLoading || deliverableQueue.isLoading) return <LoadingScreen />;
  if (overview.error || queue.error || reviewHistory.error || deliverableQueue.error) return <div className="mx-auto max-w-2xl px-5 py-10 lg:px-9"><div className="rounded-2xl border border-rose-200 bg-rose-50 p-6"><CircleAlert className="h-6 w-6 text-rose-700" /><h1 className="mt-3 font-display text-3xl text-rose-900">Données momentanément indisponibles</h1><p className="mt-2 text-sm leading-6 text-rose-800">{overview.error?.message || queue.error?.message || reviewHistory.error?.message || deliverableQueue.error?.message || "La vue formateur ne peut pas être chargée pour le moment."}</p><Button onClick={() => { overview.refetch(); queue.refetch(); reviewHistory.refetch(); deliverableQueue.refetch(); }} variant="outline" className="mt-5 border-rose-300 text-rose-800">Réessayer</Button></div></div>;
  const students = overview.data ?? [];
  const pending = queue.data ?? [];
  const reviewed = reviewHistory.data ?? [];
  const filteredStudents = students
    .filter((row: any) => cohort === "all" || row.enrollment?.cohort === cohort)
    .sort((left: any, right: any) => Number(left.enrollment?.status === "active") - Number(right.enrollment?.status === "active"));
  const filteredPending = pending.filter((row: any) => cohort === "all" || row.module?.cohort === cohort);
  const filteredReviewed = reviewed.filter((row: any) => cohort === "all" || row.module?.cohort === cohort);
  const filteredDeliverables = (deliverableQueue.data ?? []).filter((row: any) => cohort === "all" || row.module?.cohort === cohort);
  const active = filteredStudents.filter((row: any) => row.enrollment?.status === "active").length;
  const heading = view === "reviews" ? ["Espace de correction", "Des retours utiles, des progrès mesurables."] : view === "students" ? ["Gestion de la filière", "Maîtrisez les accès et la progression."] : view === "assessments" ? ["Composition pédagogique", "Construisez des évaluations claires et pertinentes."] : view === "content" ? ["Atelier des contenus", "Faites évoluer vos cours et exercices sans modifier le code."] : view === "analytics" ? ["Pilotage et alertes", "Repérez rapidement les retards, les résultats et les notions à renforcer."] : view === "simulations" ? ["Laboratoire de simulation", "Testez et suivez des décisions professionnelles en situation réelle."] : ["Vue d’ensemble", "Pilotez chaque progression avec clarté."];
  return <div className="mx-auto w-full max-w-7xl px-5 py-7 lg:px-9 lg:py-9"><section className="rounded-[1.75rem] bg-[#e9f0eb] p-6 md:p-8"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6b847d]">{heading[0]}</p><h1 className="mt-2 font-display text-3xl tracking-[-0.03em] text-[#183933] md:text-4xl">{heading[1]}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#55706a]">Le passage d’un module à l’autre reste sous votre contrôle : validation de la soumission, verrouillage ponctuel ou déblocage manuel par élève.</p></section>{view === "simulations" ? <AdminSimulationConsole /> : <><div className="mt-5 flex justify-end"><CohortTabs value={cohort} onChange={setCohort} /></div><section className="mt-3 grid gap-4 sm:grid-cols-3"><Metric icon={UsersRound} label="Élèves autorisés" value={String(active)} tone="sage" /><Metric icon={FileCheck2} label="À corriger" value={String(filteredPending.length)} tone="sand" /><Metric icon={GraduationCap} label="Élèves de la filière" value={String(filteredStudents.length)} tone="mist" /></section>{view === "reviews" ? <><ReviewQueue rows={filteredPending} onSelect={setSelectedReview} /><ReviewedQueue rows={filteredReviewed} onSelect={setSelectedReview} /><DeliverableReviewQueue rows={filteredDeliverables} onRequest={(deliverableId, note) => requestDeliverableRevision.mutate({ deliverableId, note })} /></> : view === "students" ? <><StudentsTable rows={filteredStudents} onEnrollment={(userId, status, selectedCohort) => enrollment.mutate({ userId, status, cohort: selectedCohort })} onOverride={(studentId, moduleId, state) => override.mutate({ studentId, moduleId, state })} /><StudentGradeBoard rows={filteredStudents} /></> : view === "assessments" ? <><AssessmentBuilder /><AnswerKeyManager /></> : view === "content" ? <ContentManager /> : view === "analytics" ? <AnalyticsPanel /> : <><ReviewQueue rows={filteredPending} onSelect={setSelectedReview} compact /><StudentsTable rows={filteredStudents.slice(0, 5)} onEnrollment={(userId, status, selectedCohort) => enrollment.mutate({ userId, status, cohort: selectedCohort })} onOverride={(studentId, moduleId, state) => override.mutate({ studentId, moduleId, state })} compact /></>}</>} {selectedReview && <ReviewModal detail={detail.data} loading={detail.isLoading} error={detail.error} onRetry={() => detail.refetch()} score={score} setScore={setScore} feedback={feedback} setFeedback={setFeedback} approved={approved} setApproved={setApproved} suggestion={suggestion} onClose={() => setSelectedReview(null)} onSuggest={() => suggest.mutate({ submissionId: selectedReview })} suggesting={suggest.isPending} onSubmit={() => submitReview.mutate({ submissionId: selectedReview, score: Number(score), feedback, approved })} submitting={submitReview.isPending} onRequestRevision={() => requestRevision.mutate({ submissionId: selectedReview, note: feedback })} requesting={requestRevision.isPending} />}</div>;
}

function AssessmentBuilder() {
  const utils = trpc.useUtils();
  const library = trpc.admin.assessmentLibrary.useQuery();
  const [assessmentId, setAssessmentId] = useState("");
  const [type, setType] = useState<"single" | "multiple" | "essay">("single");
  const [prompt, setPrompt] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [correctText, setCorrectText] = useState("");
  const [points, setPoints] = useState("2");
  const addQuestion = trpc.admin.addQuestion.useMutation({ onSuccess: () => { toast.success("Question ajoutée à l’évaluation."); setPrompt(""); setOptionsText(""); setCorrectText(""); utils.admin.assessmentLibrary.invalidate(); }, onError: error => toast.error(error.message || "La question n’a pas pu être ajoutée.") });
  useEffect(() => { if (!assessmentId && library.data?.[0]?.assessment?.id) setAssessmentId(String(library.data[0].assessment.id)); }, [assessmentId, library.data]);
  if (library.isLoading) return <div className="mt-8"><LoadingScreen /></div>;
  if (library.error) return <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6"><CircleAlert className="h-6 w-6 text-rose-700" /><p className="mt-3 text-sm text-rose-800">{library.error.message || "Les évaluations ne sont pas disponibles."}</p><Button onClick={() => library.refetch()} variant="outline" className="mt-4 border-rose-300 text-rose-800">Réessayer</Button></div>;
  const selected = library.data?.find((item: any) => String(item.assessment?.id) === assessmentId);
  const options = optionsText.split("\n").map(item => item.trim()).filter(Boolean);
  const correctAnswers = correctText.split("\n").map(item => item.trim()).filter(Boolean);
  const submit = () => {
    if (!assessmentId || prompt.trim().length < 10) return toast.error("Renseignez le module et une question d’au moins 10 caractères.");
    if (type !== "essay" && (options.length < 2 || correctAnswers.length === 0)) return toast.error("Ajoutez au moins deux propositions et indiquez la ou les bonnes réponses.");
    addQuestion.mutate({ assessmentId: Number(assessmentId), type, prompt: prompt.trim(), options: type === "essay" ? undefined : options, correctAnswers: type === "essay" ? undefined : correctAnswers, maxPoints: Number(points) || 1 });
  };
  return <section className="mt-9 grid gap-6 lg:grid-cols-[.88fr_1.12fr]"><Card className="border-[#e1e9e4] shadow-none"><CardContent className="p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#839991]">Questionnaire sélectionné</p><h2 className="mt-1 font-display text-3xl text-[#1e423a]">Composer une question</h2><label className="mt-6 block text-xs font-bold uppercase tracking-[0.12em] text-[#829891]">Module</label><select value={assessmentId} onChange={event => setAssessmentId(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d9e6df] bg-white px-3 py-3 text-sm font-semibold text-[#31564e] outline-none focus:ring-2 focus:ring-[#9fc2b4]"><option value="">Sélectionnez une évaluation</option>{library.data?.map((item: any) => <option value={item.assessment?.id} key={item.id}>{item.title}</option>)}</select><label className="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-[#829891]">Type de question</label><div className="mt-2 grid grid-cols-3 gap-2">{([ ["single", "Choix unique"], ["multiple", "Choix multiple"], ["essay", "Rédaction"] ] as const).map(([value, label]) => <button key={value} onClick={() => setType(value)} className={`rounded-xl border px-2 py-2.5 text-xs font-bold ${type === value ? "border-[#85ad9e] bg-[#eaf4ee] text-[#305e53]" : "border-[#e2eae6] text-[#78918a] hover:bg-[#f7faf8]"}`}>{label}</button>)}</div><label className="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-[#829891]">Énoncé</label><Textarea value={prompt} onChange={event => setPrompt(event.target.value)} className="mt-2 min-h-24 border-[#d9e6df] bg-white focus-visible:ring-[#9fc2b4]" placeholder="Écrivez la question destinée aux élèves…" />{type !== "essay" && <><label className="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-[#829891]">Propositions — une par ligne</label><Textarea value={optionsText} onChange={event => setOptionsText(event.target.value)} className="mt-2 min-h-24 border-[#d9e6df] bg-white focus-visible:ring-[#9fc2b4]" placeholder={"Option A\nOption B\nOption C"} /><label className="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-[#829891]">Bonne(s) réponse(s) — une par ligne</label><Textarea value={correctText} onChange={event => setCorrectText(event.target.value)} className="mt-2 min-h-20 border-[#d9e6df] bg-white focus-visible:ring-[#9fc2b4]" placeholder="Copiez exactement la ou les propositions correctes" /></>}<label className="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-[#829891]">Points</label><input value={points} onChange={event => setPoints(event.target.value)} type="number" min="1" max="50" className="mt-2 w-24 rounded-xl border border-[#d9e6df] bg-white px-3 py-2.5 text-sm font-bold text-[#31564e] outline-none focus:ring-2 focus:ring-[#9fc2b4]" /><Button onClick={submit} disabled={addQuestion.isPending} className="mt-6 w-full rounded-xl bg-[#17332f] text-white hover:bg-[#264b45]">{addQuestion.isPending ? "Ajout…" : "Ajouter à l’évaluation"}<ArrowRight className="ml-2 h-4 w-4" /></Button></CardContent></Card><Card className="border-[#e1e9e4] shadow-none"><CardContent className="p-5 md:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#839991]">Aperçu de l’évaluation</p><h2 className="mt-1 font-display text-3xl text-[#1e423a]">{selected?.assessment?.title || "Choisissez un module"}</h2></div><Badge className="bg-[#eaf1ed] text-[#35655d]">{selected?.questions?.length || 0} questions</Badge></div><p className="mt-3 text-sm leading-6 text-[#718b83]">{selected?.assessment?.instructions || "Les questions déjà créées dans le support de cours sont visibles ici."}</p><div className="mt-6 space-y-3">{selected?.questions?.map((question: any, index: number) => <div key={question.id} className="rounded-xl border border-[#e4ebe7] bg-[#fbfdfc] p-4"><div className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#eaf1ed] text-xs font-bold text-[#37675e]">{index + 1}</span><div><p className="text-sm font-bold leading-6 text-[#31544c]">{question.prompt}</p><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#79918a] ring-1 ring-[#e1e9e4]">{question.type === "essay" ? "Rédaction" : question.type === "multiple" ? "Choix multiple" : "Choix unique"}</span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#79918a] ring-1 ring-[#e1e9e4]">{question.maxPoints} pts</span></div></div></div></div>)}{selected && selected.questions.length === 0 && <Empty icon={FileText} text="Cette évaluation ne contient pas encore de question." />}</div></CardContent></Card></section>;
}

function AnswerKeyManager() {
  const utils = trpc.useUtils();
  const library = trpc.admin.assessmentLibrary.useQuery();
  const [assessmentId, setAssessmentId] = useState("");
  const [content, setContent] = useState("");
  const [guidance, setGuidance] = useState("");
  const [recipientIds, setRecipientIds] = useState<number[]>([]);
  const [history, setHistory] = useState<Array<{ id: string; content: string; confidence: number; createdAt: string }>>([]);
  const detail = trpc.admin.answerKeyDetail.useQuery({ assessmentId: Number(assessmentId) }, { enabled: Boolean(assessmentId) });
  const storageKey = `answer-key-suggestion-history:${assessmentId}`;
  const save = trpc.admin.saveAnswerKey.useMutation({ onSuccess: () => { toast.success("Corrigé type enregistré."); utils.admin.answerKeyDetail.invalidate({ assessmentId: Number(assessmentId) }); }, onError: error => toast.error(error.message || "Le corrigé type n’a pas pu être enregistré.") });
  const send = trpc.admin.sendAnswerKey.useMutation({ onSuccess: () => { toast.success("Corrigé type envoyé aux apprenants sélectionnés."); utils.admin.answerKeyDetail.invalidate({ assessmentId: Number(assessmentId) }); }, onError: error => toast.error(error.message || "L’envoi du corrigé type a échoué.") });
  const suggest = trpc.admin.suggestAnswerKey.useMutation({ onSuccess: data => {
    const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, content: data.content, confidence: data.confidence, createdAt: new Date().toISOString() };
    setContent(data.content);
    setHistory(current => { const next = [entry, ...current.filter(item => item.content !== data.content)].slice(0, 8); localStorage.setItem(storageKey, JSON.stringify(next)); return next; });
    toast.success(`Suggestion IA prête (${data.confidence}% de confiance).`);
  }, onError: error => toast.error(error.message || "La suggestion IA est indisponible. Vous pouvez rédiger le corrigé manuellement.") });
  useEffect(() => { if (!assessmentId && library.data?.[0]?.assessment?.id) setAssessmentId(String(library.data[0].assessment.id)); }, [assessmentId, library.data]);
  useEffect(() => { if (detail.data) { setContent(detail.data.answerKey?.content || ""); setRecipientIds(detail.data.recipients || []); } }, [detail.data?.answerKey?.id, detail.data?.answerKey?.updatedAt, detail.data?.recipients?.join(",")]);
  useEffect(() => { if (!assessmentId) return setHistory([]); try { setHistory(JSON.parse(localStorage.getItem(storageKey) || "[]")); } catch { setHistory([]); } }, [assessmentId, storageKey]);
  const toggleRecipient = (studentId: number) => setRecipientIds(current => current.includes(studentId) ? current.filter(id => id !== studentId) : [...current, studentId]);
  const cohorts = ["Gestion des médias sociaux", "Business digital"] as const;
  return <section className="mt-9 rounded-2xl border border-[#d7e5de] bg-[#f8fbf9] p-5 md:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#63857a]">Résultats et corrigé type</p><h2 className="mt-1 font-display text-3xl text-[#1e423a]">Préparer puis envoyer un corrigé type</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#617d74]">Le corrigé reste entièrement modifiable avant son enregistrement et son envoi aux apprenants choisis.</p></div><Badge className="w-fit bg-[#e7f2eb] text-[#2f6752]">Envoi sélectif</Badge></div><div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><div><label className="text-xs font-bold uppercase tracking-[0.12em] text-[#829891]">Évaluation par filière</label><select value={assessmentId} onChange={event => setAssessmentId(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d9e6df] bg-white px-3 py-3 text-sm font-semibold text-[#31564e] outline-none focus:ring-2 focus:ring-[#9fc2b4]"><option value="">Sélectionnez une évaluation</option>{cohorts.map(cohort => <optgroup label={cohort} key={cohort}>{library.data?.filter((item: any) => item.cohort === cohort).map((item: any) => <option value={item.assessment?.id} key={item.id}>{item.title}</option>)}</optgroup>)}</select><label className="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-[#829891]">Vos consignes pour la proposition IA <span className="normal-case font-normal">(facultatif)</span></label><Textarea value={guidance} onChange={event => setGuidance(event.target.value)} maxLength={3000} className="mt-2 min-h-24 border-[#d9e6df] bg-white text-sm leading-6 focus-visible:ring-[#9fc2b4]" placeholder="Ex. Structurez le corrigé par critères, expliquez le barème et ajoutez un exemple bref par question." /><div className="mt-3 flex flex-wrap gap-2"><Button onClick={() => assessmentId && suggest.mutate({ assessmentId: Number(assessmentId), guidance })} disabled={!assessmentId || suggest.isPending} variant="outline" className="rounded-xl border-[#e5c986] bg-[#fffaf0] text-[#936821] hover:bg-[#fff3d7]">{suggest.isPending ? "Génération…" : "Générer avec mes consignes"}<Sparkles className="ml-2 h-4 w-4" /></Button><span className="self-center text-xs text-[#718b83]">Les consignes sont limitées à 3 000 caractères.</span></div>{history.length > 0 && <div className="mt-4 rounded-xl border border-[#dce8e2] bg-[#f3f8f5] p-3"><p className="text-xs font-bold text-[#42685e]">Suggestions précédentes sur cet appareil</p><select defaultValue="" onChange={event => { const previous = history.find(item => item.id === event.target.value); if (previous) { setContent(previous.content); toast.success("Suggestion précédente restaurée dans l’éditeur."); event.currentTarget.value = ""; } }} className="mt-2 w-full rounded-lg border border-[#d9e6df] bg-white px-3 py-2 text-xs font-semibold text-[#31564e]"><option value="">Revenir à une suggestion précédente…</option>{history.map((item, index) => <option value={item.id} key={item.id}>Suggestion {history.length - index} — {new Date(item.createdAt).toLocaleString("fr-FR")} — confiance {item.confidence}%</option>)}</select></div>}<label className="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-[#829891]">Corrigé type proposé</label><Textarea value={content} onChange={event => setContent(event.target.value)} className="mt-2 min-h-64 border-[#d9e6df] bg-white text-sm leading-6 focus-visible:ring-[#9fc2b4]" placeholder="Présentez les réponses attendues, la méthode de raisonnement, les points essentiels et les erreurs fréquentes à éviter…" /><Button onClick={() => assessmentId && save.mutate({ assessmentId: Number(assessmentId), content })} disabled={!assessmentId || !content.trim() || save.isPending} className="mt-4 rounded-xl bg-[#17332f] text-white hover:bg-[#264b45]">{save.isPending ? "Enregistrement…" : "Enregistrer le corrigé type"}<Save className="ml-2 h-4 w-4" /></Button></div><div className="rounded-xl border border-[#dce8e2] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#829891]">Destinataires</p><h3 className="mt-1 text-lg font-bold text-[#294b44]">Apprenants corrigés</h3></div><span className="rounded-full bg-[#edf5f0] px-2.5 py-1 text-xs font-bold text-[#42685e]">{recipientIds.length} sélectionné{recipientIds.length > 1 ? "s" : ""}</span></div>{detail.isLoading ? <p className="mt-5 text-sm text-[#718b83]">Chargement des apprenants…</p> : detail.data?.candidates?.length ? <div className="mt-4 space-y-2">{detail.data.candidates.map((candidate: any) => <label key={candidate.student?.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e4ebe7] p-3 hover:bg-[#f7faf8]"><input type="checkbox" checked={recipientIds.includes(candidate.student?.id)} onChange={() => toggleRecipient(candidate.student?.id)} className="h-4 w-4 accent-[#35655d]" /><div className="min-w-0 flex-1"><p className="text-sm font-bold text-[#31564e]">{candidate.student?.name || "Apprenant"}</p><p className="mt-0.5 truncate text-xs text-[#78918a]">{candidate.student?.email || "Adresse non renseignée"}</p></div><span className="text-xs font-bold text-[#42685e]">{candidate.score ?? "—"}/20</span></label>)}</div> : <p className="mt-5 rounded-xl bg-[#f5f8f6] p-4 text-sm leading-6 text-[#718b83]">Les apprenants apparaîtront ici dès que leur évaluation aura été corrigée.</p>}<Button onClick={() => assessmentId && send.mutate({ assessmentId: Number(assessmentId), studentIds: recipientIds })} disabled={!assessmentId || recipientIds.length === 0 || send.isPending} className="mt-5 w-full rounded-xl bg-[#e2a53f] text-[#17332f] hover:bg-[#d7972d]">{send.isPending ? "Envoi…" : "Envoyer le corrigé aux apprenants sélectionnés"}<ArrowRight className="ml-2 h-4 w-4" /></Button></div></div></section>;
}

function CaseStudyBrief({ module }: { module: ProgramModule }) {
  void module;
  return null;
}

function CohortTabs({ value, onChange }: { value: "all" | "Gestion des médias sociaux" | "Business digital"; onChange: (value: "all" | "Gestion des médias sociaux" | "Business digital") => void }) { return <select value={value} onChange={event => onChange(event.target.value as "all" | "Gestion des médias sociaux" | "Business digital")} className="rounded-xl border border-[#d8e5df] bg-white px-3 py-2 text-xs font-bold text-[#46675e]"><option value="all">Toutes les filières</option><option value="Gestion des médias sociaux">Médias sociaux</option><option value="Business digital">Business digital</option></select>; }
function ReviewQueue({ rows, onSelect, compact = false }: { rows: any[]; onSelect: (id: number) => void; compact?: boolean }) { const [cohort, setCohort] = useState<"all" | "Gestion des médias sociaux" | "Business digital">("all"); const filtered = rows.filter((row: any) => cohort === "all" || row.module?.cohort === cohort); return <section className="mt-9"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8aa099]">Évaluations reçues</p><h2 className="mt-1 font-display text-3xl text-[#183933]">À corriger</h2></div><div className="flex items-center gap-3"><span className="text-xs font-semibold text-[#6d8981]">{filtered.length} soumission{filtered.length > 1 ? "s" : ""}</span><CohortTabs value={cohort} onChange={setCohort} /></div></div><div className="overflow-hidden rounded-2xl border border-[#e1e9e4] bg-white">{filtered.length === 0 ? <Empty icon={FileCheck2} text="Aucune évaluation n’attend actuellement votre correction dans cette filière." /> : filtered.slice(0, compact ? 4 : undefined).map((row: any) => <button className="flex w-full items-center gap-4 border-b border-[#edf1ef] p-4 text-left last:border-b-0 hover:bg-[#f8faf9]" onClick={() => onSelect(row.submission.id)} key={row.submission.id}><div className="grid h-10 w-10 place-items-center rounded-full bg-[#fbf1dc] text-sm font-bold text-[#9a702c]">{(row.student?.name || "E").slice(0, 1)}</div><div className="min-w-0 flex-1"><p className="text-sm font-bold text-[#284a43]">{row.student?.name || "Élève"}</p><p className="mt-0.5 truncate text-xs text-[#78918a]">{row.module?.title}</p></div><span className="hidden text-xs text-[#849992] sm:block">{row.submission.submittedAt ? new Date(row.submission.submittedAt).toLocaleDateString("fr-FR") : "Aujourd’hui"}</span><ChevronRight className="h-4 w-4 text-[#9fb2ac]" /></button>)}</div></section>; }
function ReviewedQueue({ rows, onSelect }: { rows: any[]; onSelect: (id: number) => void }) { return <section className="mt-7"><div className="mb-4"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6f8d84]">Corrections déjà envoyées</p><h2 className="mt-1 font-display text-3xl text-[#183933]">Rectifier une correction</h2><p className="mt-1 text-sm text-[#6d8981]">Rouvrez une évaluation pour modifier la note ou le commentaire, puis notifiez l’apprenant.</p></div><div className="overflow-hidden rounded-2xl border border-[#cfe2d9] bg-white">{rows.length === 0 ? <Empty icon={FileCheck2} text="Aucune évaluation corrigée à rectifier dans cette filière." /> : rows.map((row: any) => <button className="flex w-full items-center gap-4 border-b border-[#edf1ef] p-4 text-left last:border-b-0 hover:bg-[#f4f9f6]" onClick={() => onSelect(row.submission.id)} key={row.submission.id}><div className="grid h-10 w-10 place-items-center rounded-full bg-[#e9f4ed] text-sm font-bold text-[#317257]">{(row.student?.name || "E").slice(0, 1)}</div><div className="min-w-0 flex-1"><p className="text-sm font-bold text-[#284a43]">{row.student?.name || "Élève"}</p><p className="mt-0.5 truncate text-xs text-[#78918a]">{row.module?.title}</p></div><span className="hidden text-xs font-bold text-[#317257] sm:block">{row.submission.manualScore ?? "—"}/20</span><span className="hidden text-xs text-[#849992] md:block">{row.submission.reviewedAt ? new Date(row.submission.reviewedAt).toLocaleDateString("fr-FR") : "—"}</span><ChevronRight className="h-4 w-4 text-[#9fb2ac]" /></button>)}</div></section>; }
function StudentsTable({ rows, onEnrollment, onOverride, compact = false }: { rows: any[]; onEnrollment: (userId: number, status: "active" | "suspended", cohort?: "Gestion des médias sociaux" | "Business digital") => void; onOverride: (studentId: number, moduleId: number, state: "locked" | "unlocked") => void; compact?: boolean }) {
  const completeOverview = trpc.admin.overview.useQuery(undefined, { enabled: compact, refetchInterval: compact ? 15_000 : false });
  const sourceRows = compact && completeOverview.data ? completeOverview.data : rows;
  // Les actions de progression doivent rester accessibles après l’autorisation : aucune ligne n’est masquée.
  compact = false;
  const [cohort, setCohort] = useState<"all" | "Gestion des médias sociaux" | "Business digital">("all");
  const filtered = sourceRows.filter((row: any) => cohort === "all" || row.enrollment?.cohort === cohort);
  const pending = sourceRows.filter((row: any) => !row.enrollment || row.enrollment.status !== "active");
  return <section className="mt-9">
    {pending.length > 0 && <PendingEnrollmentPanel rows={pending} onEnrollment={onEnrollment} />}
    <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8aa099]">Suivi apprenants</p><h2 className="mt-1 font-display text-3xl text-[#183933]">Cohorte de la filière</h2></div><CohortTabs value={cohort} onChange={setCohort} /></div>
    <div className="overflow-x-auto rounded-2xl border border-[#e1e9e4] bg-white"><table className="w-full min-w-[740px] text-left"><thead className="bg-[#f7faf8] text-[10px] font-bold uppercase tracking-[0.12em] text-[#819891]"><tr><th className="px-5 py-3">Élève</th><th className="px-5 py-3">Accès</th><th className="px-5 py-3">Progression</th><th className="px-5 py-3">À corriger</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{filtered.length === 0 ? <tr><td colSpan={5}><Empty icon={UsersRound} text="Les élèves apparaîtront ici après leur première connexion." /></td></tr> : filtered.slice(0, compact ? 5 : undefined).map((row: any) => <tr className="border-t border-[#edf1ef]" key={row.student.id}><td className="px-5 py-4"><p className="text-sm font-bold text-[#294b44]">{row.student.name || "Élève sans nom"}</p><p className="mt-0.5 text-xs text-[#839991]">{row.student.email || "—"}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.08em] text-blue-700">{row.enrollment?.cohort || "Filière à choisir"} · {row.enrollment?.intake || "Rentrée à choisir"}</p></td><td className="px-5 py-4">{row.enrollment?.status === "active" ? <StatusPill status="reviewed" approved /> : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">En attente</span>}</td><td className="px-5 py-4"><div className="flex items-center gap-2"><Progress value={(row.completed / Math.max(row.total, 1)) * 100} className="h-2 w-24 bg-[#edf3ef]" /><span className="text-xs font-bold text-[#54726a]">{row.completed}/{row.total}</span></div></td><td className="px-5 py-4 text-sm font-bold text-[#4d6e65]">{row.waiting}</td><td className="px-5 py-4"><StudentActions row={row} onEnrollment={onEnrollment} onOverride={onOverride} /></td></tr>)}</tbody></table></div>
  </section>;
}

export function PendingEnrollmentPanel({ rows, onEnrollment }: { rows: any[]; onEnrollment: (userId: number, status: "active" | "suspended", cohort?: "Gestion des médias sociaux" | "Business digital") => void }) {
  return <section className="mb-7 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800"><UsersRound className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-[.14em] text-amber-800">Action requise</p><h3 className="mt-1 text-lg font-bold text-amber-950">{rows.length} élève{rows.length > 1 ? "s" : ""} en attente d’autorisation</h3><p className="mt-1 text-sm leading-5 text-amber-900">Choisissez une filière puis autorisez l’accès directement ici, sans devoir faire défiler le tableau.</p></div></div><div className="mt-4 grid gap-3 lg:grid-cols-2">{rows.map((row: any) => <PendingEnrollmentCard key={row.student.id} row={row} onEnrollment={onEnrollment} />)}</div></section>;
}

function PendingEnrollmentCard({ row, onEnrollment }: { row: any; onEnrollment: (userId: number, status: "active" | "suspended", cohort?: "Gestion des médias sociaux" | "Business digital") => void }) {
  const [cohort, setCohort] = useState<"" | "Gestion des médias sociaux" | "Business digital">(row.enrollment?.cohort || "");
  return <div className="rounded-xl border border-amber-200 bg-white p-4"><p className="font-bold text-[#294b44]">{row.student.name || "Élève sans nom"}</p><p className="mt-1 break-all text-xs text-[#6d837d]">{row.student.email || "Adresse non renseignée"}</p>{row.enrollment?.intake && <p className="mt-2 text-xs font-bold text-blue-700">Rentrée choisie : {row.enrollment.intake}</p>}<div className="mt-3 flex flex-col gap-2 sm:flex-row"><select aria-label={`Filière de ${row.student.name || "l’élève"}`} value={cohort} onChange={event => setCohort(event.target.value as "Gestion des médias sociaux" | "Business digital")} className="min-h-10 flex-1 rounded-lg border border-amber-300 bg-white px-3 text-sm font-semibold text-[#6f551b]"><option value="" disabled>Choisir la filière…</option><option value="Gestion des médias sociaux">Médias sociaux</option><option value="Business digital">Business digital</option></select><Button disabled={!cohort} onClick={() => onEnrollment(row.student.id, "active", cohort || undefined)} className="min-h-10 rounded-lg bg-[#17332f] text-white hover:bg-[#264b45]">Autoriser</Button></div></div>;
}

function StudentGradeBoard({ rows }: { rows: any[] }) { return <section className="mt-6"><div className="mb-4"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8aa099]">Résultats par module</p><h2 className="mt-1 font-display text-3xl text-[#183933]">Notes et moyenne générale</h2><p className="mt-2 text-sm text-[#6d8981]">La moyenne est calculée automatiquement à partir des évaluations corrigées.</p></div><div className="grid gap-4 lg:grid-cols-2">{rows.map((row: any) => <Card key={row.student.id} className="border-[#e1e9e4] shadow-none"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-base font-bold text-[#294b44]">{row.student.name || "Élève"}</p><p className="mt-1 text-xs text-[#839991]">{row.enrollment?.cohort || "Filière à affecter"} · {row.enrollment?.intake || "Rentrée non choisie"}</p></div><div className="rounded-xl bg-[#eaf3ed] px-3 py-2 text-right"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#66857c]">Moyenne</p><p className="mt-0.5 text-lg font-bold text-[#285148]">{row.averageScore ?? "—"}<span className="text-xs">/20</span></p></div></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{row.moduleScores?.map((module: any) => <div key={module.moduleId} className="rounded-lg bg-[#f6f9f7] px-3 py-2"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#78928a]">{module.code}</p><p className="mt-1 text-sm font-bold text-[#3d6259]">{module.score ?? "—"}<span className="text-[10px] font-medium">/20</span></p></div>)}</div></CardContent></Card>)}</div></section>; }

function StudentActions({ row, onEnrollment, onOverride }: { row: any; onEnrollment: (userId: number, status: "active" | "suspended", cohort?: "Gestion des médias sociaux" | "Business digital") => void; onOverride: (studentId: number, moduleId: number, state: "locked" | "unlocked") => void }) {
  const utils = trpc.useUtils();
  const [moduleId, setModuleId] = useState(String(row.modules?.[0]?.id || ""));
  const [cohort, setCohort] = useState<"" | "Gestion des médias sociaux" | "Business digital">(row.enrollment?.cohort || "");
  const assignCohort = trpc.admin.setEnrollment.useMutation({ onSuccess: () => { toast.success("Filière de l’élève actualisée."); utils.admin.overview.invalidate(); }, onError: error => toast.error(error.message || "La filière n’a pas pu être modifiée.") });
  const awaitingAssignment = !row.enrollment;
  return <div className="flex flex-wrap justify-end gap-2">{awaitingAssignment && <span className="inline-flex h-8 items-center rounded-lg bg-amber-50 px-2 text-[10px] font-bold text-amber-800 ring-1 ring-amber-200">À affecter</span>}<select aria-label="Filière de l’élève" value={cohort} onChange={event => { const next = event.target.value as "Gestion des médias sociaux" | "Business digital"; setCohort(next); assignCohort.mutate({ userId: row.student.id, status: row.enrollment?.status || "suspended", cohort: next }); }} className={`h-8 max-w-44 rounded-lg border bg-white px-1.5 text-[10px] font-semibold ${awaitingAssignment ? "border-amber-300 text-amber-800" : "border-[#d8e5df] text-[#53746b]"}`}><option value="" disabled>Choisir la filière…</option><option value="Gestion des médias sociaux">Médias sociaux</option><option value="Business digital">Business digital</option></select><Button variant="outline" size="sm" disabled={!cohort || assignCohort.isPending} onClick={() => onEnrollment(row.student.id, row.enrollment?.status === "active" ? "suspended" : "active", cohort || undefined)} className="h-8 rounded-lg border-[#d8e5df] text-xs text-[#385d54]">{row.enrollment?.status === "active" ? "Suspendre" : awaitingAssignment ? "Autoriser après choix" : "Autoriser"}</Button><select value={moduleId} onChange={event => setModuleId(event.target.value)} className="h-8 max-w-32 rounded-lg border border-[#d8e5df] bg-white px-1.5 text-[10px] font-semibold text-[#53746b]">{row.modules?.map((module: any) => <option value={module.id} key={module.id}>M{module.sequence}</option>)}</select><Button variant="ghost" size="sm" onClick={() => moduleId && onOverride(row.student.id, Number(moduleId), "unlocked")} className="h-8 rounded-lg px-2 text-xs text-[#53746b]">Ouvrir</Button><Button variant="ghost" size="sm" onClick={() => moduleId && onOverride(row.student.id, Number(moduleId), "locked")} className="h-8 rounded-lg px-2 text-xs text-[#a35343]">Bloquer</Button></div>;
}

function Empty({ icon: Icon, text }: { icon: any; text: string }) { return <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf3ef] text-[#66857c]"><Icon className="h-5 w-5" /></div><p className="max-w-sm text-sm text-[#78918a]">{text}</p></div>; }

function EnrollmentRequest({ enrollment }: { enrollment: any }) {
  const utils = trpc.useUtils();
  const [cohort, setCohort] = useState<"Gestion des médias sociaux" | "Business digital">(enrollment?.cohort || "Gestion des médias sociaux");
  const [intake, setIntake] = useState<"Rentrée 1 — Septembre 2026" | "Rentrée 2 — Novembre 2026">(enrollment?.intake || "Rentrée 2 — Novembre 2026");
  const request = trpc.student.requestEnrollment.useMutation({ onSuccess: data => { if (typeof window !== "undefined") window.localStorage.setItem("campus-intake", data?.intake || intake); utils.student.enrollment.invalidate(); toast.success("Votre demande a été enregistrée."); }, onError: error => toast.error(error.message || "La demande n’a pas pu être enregistrée.") });
  return <main className="mx-auto max-w-2xl px-5 py-10 lg:px-9"><div className="rounded-[1.75rem] border border-blue-100 bg-white p-6 shadow-[0_18px_50px_rgba(35,75,120,.08)] sm:p-8"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700"><GraduationCap className="h-6 w-6" /></div><p className="mt-6 text-xs font-extrabold uppercase tracking-[.16em] text-blue-600">Inscription Campus Formation</p><h1 className="mt-2 font-display text-3xl leading-tight text-slate-900">Choisissez votre filière et votre rentrée</h1><p className="mt-3 text-sm leading-6 text-slate-600">Cette sélection permet au formateur de vous affecter au bon groupe. Votre accès restera en attente jusqu’à sa validation.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700">Filière<select value={cohort} onChange={event => setCohort(event.target.value as typeof cohort)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800"><option>Gestion des médias sociaux</option><option>Business digital</option></select></label><label className="text-sm font-bold text-slate-700">Rentrée<select value={intake} onChange={event => setIntake(event.target.value as typeof intake)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800"><option>Rentrée 1 — Septembre 2026</option><option>Rentrée 2 — Novembre 2026</option></select></label></div>{enrollment && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">Demande actuelle : <strong>{enrollment.cohort}</strong>, <strong>{enrollment.intake}</strong>. Vous pouvez la modifier tant qu’elle n’est pas validée.</p>}<Button onClick={() => request.mutate({ cohort, intake })} disabled={request.isPending} className="mt-6 min-h-11 w-full rounded-xl bg-blue-700 text-white hover:bg-blue-800">{request.isPending ? "Enregistrement…" : enrollment ? "Mettre à jour ma demande" : "Envoyer ma demande"}</Button></div></main>;
}

function ReviewModal({ detail, loading, error, onRetry, score, setScore, feedback, setFeedback, approved, setApproved, suggestion, onClose, onSuggest, suggesting, onSubmit, submitting, onRequestRevision, requesting }: any) { if (error) return <div className="fixed inset-0 z-[60] grid place-items-center bg-[#17332f]/30 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><CircleAlert className="h-6 w-6 text-rose-700" /><h2 className="mt-3 font-display text-3xl text-rose-900">Soumission indisponible</h2><p className="mt-2 text-sm leading-6 text-rose-800">{error.message || "Le détail de cette soumission n’a pas pu être chargé."}</p><div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Fermer</Button><Button onClick={onRetry} className="bg-[#17332f] text-white hover:bg-[#264b45]">Réessayer</Button></div></div></div>; if (loading || !detail) return <div className="fixed inset-0 z-[60] grid place-items-center bg-[#17332f]/30 p-4"><div className="rounded-2xl bg-white p-6 text-sm text-[#4d6c64]">Chargement de la soumission…</div></div>; const answers = detail.submission.answers || {}; const isRectification = detail.submission.status === "reviewed"; return <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#17332f]/35 p-3 backdrop-blur-sm md:p-8"><div className="mx-auto max-w-4xl rounded-[1.5rem] bg-[#fcfdfb] shadow-2xl"><div className="flex items-start justify-between border-b border-[#e6ece9] p-5 md:p-6"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#839991]">{isRectification ? "Rectification de correction" : "Correction"}</p><h2 className="mt-1 font-display text-3xl text-[#1e423a]">{detail.student?.name || "Élève"}</h2><p className="mt-1 text-sm text-[#718b83]">{detail.module?.title}</p>{isRectification && <p className="mt-3 rounded-lg bg-[#edf7f0] px-3 py-2 text-xs font-semibold leading-5 text-[#2e6c50]">La note et le commentaire précédents sont chargés. Enregistrez la rectification pour en informer l’apprenant.</p>}</div><button onClick={onClose} className="rounded-xl p-2 text-[#6f8880] hover:bg-[#edf3ef]"><X className="h-5 w-5" /></button></div><div className="grid gap-6 p-5 md:grid-cols-[1fr_310px] md:p-6"><div className="space-y-4"><div className="rounded-xl border border-[#e2eae6] bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#829891]">Réponses de l’élève</p><div className="mt-4 space-y-4">{detail.questions.map((question: any, index: number) => <div key={question.id} className="border-b border-[#edf1ef] pb-4 last:border-0 last:pb-0"><p className="text-sm font-bold leading-6 text-[#2b4d45]">{index + 1}. {question.prompt}</p><p className="mt-2 rounded-lg bg-[#f5f8f6] p-3 text-sm leading-6 text-[#547069]">{Array.isArray(answers[String(question.id)]) ? answers[String(question.id)].join(", ") : answers[String(question.id)] || "Aucune réponse"}</p></div>)}</div></div></div><aside className="space-y-4"><Card className="border-[#dde8e2] shadow-none"><CardContent className="p-4"><div className="flex items-center gap-2"><Bot className="h-4 w-4 text-[#b67f22]" /><p className="text-sm font-bold text-[#31564e]">Assistant de correction</p></div><p className="mt-2 text-xs leading-5 text-[#718b83]">Suggestion facultative : le formateur décide toujours de la note et du retour final.</p><Button onClick={onSuggest} disabled={suggesting} variant="outline" className="mt-4 w-full rounded-xl border-[#e5c986] bg-[#fffaf0] text-[#936821] hover:bg-[#fff3d7]">{suggesting ? "Analyse en cours…" : "Générer une suggestion"}<Sparkles className="ml-2 h-4 w-4" /></Button>{suggestion && <p className="mt-3 rounded-lg bg-[#f7faf8] p-3 text-xs leading-5 text-[#5d776f]">Confiance de l’assistant : <strong>{suggestion.confidence}%</strong></p>}</CardContent></Card><Card className="border-[#dde8e2] shadow-none"><CardContent className="space-y-4 p-4"><div><label className="text-xs font-bold uppercase tracking-[0.12em] text-[#829891]">Note /20</label><input type="number" min="0" max="20" step="0.5" value={score} onChange={event => setScore(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d9e6df] bg-white px-3 py-2.5 text-lg font-bold text-[#294b44] outline-none focus:ring-2 focus:ring-[#9fc2b4]" /></div><div><label className="text-xs font-bold uppercase tracking-[0.12em] text-[#829891]">Commentaire</label><Textarea value={feedback} onChange={(event: any) => setFeedback(event.target.value)} className="mt-2 min-h-32 border-[#d9e6df] bg-white text-sm leading-6 focus-visible:ring-[#9fc2b4]" placeholder="Ajoutez un retour utile à l’élève…" /></div><label className="flex items-center gap-2 rounded-xl bg-[#f5f8f6] p-3 text-sm font-semibold text-[#45675e]"><input type="checkbox" checked={approved} onChange={event => setApproved(event.target.checked)} className="accent-[#35655d]" />Valider et débloquer la suite</label><Button onClick={onSubmit} disabled={submitting || Number.isNaN(Number(score))} className="w-full rounded-xl bg-[#17332f] text-white hover:bg-[#264b45]">{submitting ? "Enregistrement…" : isRectification ? "Enregistrer la rectification" : "Enregistrer la correction"}</Button><Button onClick={onRequestRevision} disabled={requesting} variant="outline" className="w-full border-[#d9b8ad] text-[#9b4f3e] hover:bg-[#fff5f1]">{requesting ? "Demande en cours…" : "Demander une reprise"}<RotateCcw className="ml-2 h-4 w-4" /></Button></CardContent></Card></aside></div></div></div>; }

function AppShell() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [view, setView] = useState("dashboard");
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const enrollment = trpc.student.enrollment.useQuery(undefined, { enabled: isAuthenticated && !isAdmin, retry: false });
  const program = trpc.student.program.useQuery(undefined, { enabled: isAuthenticated && !isAdmin, retry: false });
  useEffect(() => { if (enrollment.data?.intake) window.localStorage.setItem("campus-intake", enrollment.data.intake); }, [enrollment.data?.intake]);
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <PublicLanding />;
  const selectModule = (id: number) => { setActiveModuleId(id); setView("module"); };
  const navigateFromNotification = (notification: any) => {
    if (notification.link === "simulations") {
      setActiveModuleId(null); setView(isAdmin ? "simulations" : "simulation");
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
      return;
    }
    const moduleMatch = notification.link?.match(/^module:(\d+)$/);
    const message = `${notification.title || ""} ${notification.body || ""}`.toLocaleLowerCase("fr-FR");
    const inferredModule = program.data?.find(module => {
      const fullTitle = String(module.title || "").toLocaleLowerCase("fr-FR");
      const shortTitle = fullTitle.replace(/^module\s+\d+\s+—\s+/, "");
      return fullTitle.length > 5 && (message.includes(fullTitle) || message.includes(shortTitle));
    });
    if (moduleMatch || inferredModule) {
      selectModule(moduleMatch ? Number(moduleMatch[1]) : inferredModule!.id);
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
      return;
    }
    setActiveModuleId(null);
    setView(notification.type === "review" || notification.type === "revision" ? "results" : "dashboard");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };
  return <div className="min-h-screen bg-[#fbfbf8] text-[#284941]"><div className="flex min-h-screen"><Sidebar isAdmin={isAdmin} view={view} setView={setView} onLogout={logout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} /><div className="min-w-0 flex-1"><AppHeader user={user} isAdmin={isAdmin} onMenu={() => setMobileOpen(true)} onNotificationNavigate={navigateFromNotification} onLogout={logout} />{isAdmin ? <AdminDashboard view={view === "dashboard" ? "admin" : view} /> : view === "simulation" ? <StudentSimulation /> : program.isLoading || enrollment.isLoading ? <LoadingScreen /> : program.error ? <EnrollmentRequest enrollment={enrollment.data} /> : activeModuleId && view === "module" ? <ModuleWorkspace moduleId={activeModuleId} onBack={() => { setActiveModuleId(null); setView("dashboard"); }} /> : <StudentDashboard program={program.data || []} onSelectModule={selectModule} resultsOnly={view === "results"} />}</div></div>{mobileOpen && <button aria-label="Fermer le menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-[#17332f]/30 lg:hidden" />}</div>;
}

export default function Home() { return <AppShell />; }
