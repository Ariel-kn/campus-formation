import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import SimulationActivityEditor from "./SimulationActivityEditor";
import {
  PRACTICE_SECONDS,
  completeness,
  INITIAL_WORK_METRICS,
  type Workshop,
  type WorkAnswer,
} from "@shared/simulationWorkbench";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Grip,
  Loader2,
  MessageSquare,
  Play,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

type RecordView = {
  answer: WorkAnswer;
  committed: boolean;
  consequence: string;
};
type Session = {
  simulation?: { id: number; title: string };
  workshops: Workshop[];
  attempt: {
    id: number;
    status: string;
    currentStep: number;
    startedAt: number | null;
    deadlineAt: number | null;
    records: Record<string, RecordView>;
    review: { score: number; feedback: string } | null;
    metrics: typeof INITIAL_WORK_METRICS;
  } | null;
  serverNow: number;
  remainingSeconds: number;
};
export function formatPracticeTime(seconds: number) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
const HERO = "/manus-storage/naya-mission-hero_0a10ec02.webp";
function ErrorBox({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="m-5 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
      <AlertTriangle className="h-6 w-6" />
      <p className="mt-3 text-sm leading-6">{message}</p>
      {onRetry && (
        <Button className="mt-3" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}
function Intro({
  workshops,
  onStart,
  test,
}: {
  workshops: Workshop[];
  onStart: () => void;
  test: boolean;
}) {
  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-8">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_220px]">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
            Épreuve sommative pratique · 2 heures
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">
            Produire, argumenter, adapter.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Vous devez examiner des documents, manipuler des éléments interactifs,
            calculer des indicateurs et formuler des réponses professionnelles adaptées
            aux situations concrètes.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            <strong>2 heures maximum (120 minutes)</strong>. Le compte à rebours se
            lance dès votre première consigne ou manipulation effectuée. À la fin du
            temps imparti, la copie est transmise automatiquement au formateur.
          </p>
        </div>
        <img
          src={HERO}
          width={220}
          height={138}
          loading="lazy"
          decoding="async"
          alt="Équipe de la mission Naya Conseil"
          className="hidden w-full rounded-2xl object-cover md:block"
        />
      </div>
      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {workshops.map(w => (
          <div key={w.id} className="rounded-xl bg-blue-50/70 p-3">
            <p className="text-xs font-bold text-blue-800">
              Section {w.sequence} · repère {w.minutes} min
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {w.title}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          onClick={onStart}
          className="min-h-12 bg-blue-700 text-white hover:bg-blue-800"
        >
          <Play className="mr-2 h-4 w-4" />
          {test
            ? "Entrer dans le test complet"
            : "Ouvrir le dossier de composition"}
        </Button>
        <p className="text-xs text-slate-500">
          Le chrono démarre à votre première saisie ou manipulation, pas à la
          lecture de cette page.
        </p>
      </div>
    </div>
  );
}
export function WorkbenchRunner({
  initial,
  test = false,
  onClose,
}: {
  initial: Session;
  test?: boolean;
  onClose?: () => void;
}) {
  const [data, setData] = useState<Session>(initial);
  const dataRef = useRef(data);
  dataRef.current = data;
  const index = data.attempt?.currentStep ?? 0;
  const workshop = data.workshops[index];
  const [answer, setAnswer] = useState<WorkAnswer>(() =>
    workshop ? initial.attempt?.records[workshop.id]?.answer || {} : {}
  );
  const answerRef = useRef(answer);
  answerRef.current = answer;
  const [ready, setReady] = useState(Boolean(initial.attempt));
  const [now, setNow] = useState(Date.now());
  const [deadline, setDeadline] = useState<number | null>(
    initial.attempt?.deadlineAt
      ? Date.now() + initial.remainingSeconds * 1000
      : null
  );
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [saveState, setSaveState] = useState("À commencer");
  const [errors, setErrors] = useState<string[]>([]);
  const [consequence, setConsequence] = useState<string | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [finishedTest, setFinishedTest] = useState(false);
  const [frozenRemaining, setFrozenRemaining] = useState<number | null>(
    initial.attempt && initial.attempt.status !== "draft"
      ? initial.remainingSeconds
      : null
  );
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const dirty = useRef(false);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSave = useRef<(() => void) | null>(null);
  const started = useRef(Boolean(initial.attempt?.startedAt));
  const finishing = useRef(false);
  const live = useRef(true);
  const start = trpc.student.startFormativeSimulation.useMutation();
  const save = trpc.student.saveFormativeWorkshop.useMutation();
  const finish = trpc.student.finalizeFormativeSimulation.useMutation();
  const preview = trpc.admin.testFormativeWorkshop.useMutation();
  const complete =
    finishedTest || Boolean(data.attempt && data.attempt.status !== "draft");
  const remaining =
    frozenRemaining ??
    (deadline
      ? Math.max(0, Math.ceil((deadline - now) / 1000))
      : PRACTICE_SECONDS);
  const receive = (next: Session, resetAnswer = false) => {
    if (!live.current) return;
    dataRef.current = next;
    setData(next);
    if (next.attempt && next.attempt.status !== "draft")
      setFrozenRemaining(next.remainingSeconds);
    if (next.attempt?.deadlineAt)
      setDeadline(
        test
          ? next.attempt.deadlineAt
          : Date.now() + next.attempt.deadlineAt - next.serverNow
      );
    if (resetAnswer) {
      const w = next.workshops[next.attempt?.currentStep ?? 0];
      const a = w ? next.attempt?.records[w.id]?.answer || {} : {};
      answerRef.current = a;
      setAnswer(a);
    }
  };
  useEffect(() => {
    live.current = true;
    const tick = window.setInterval(() => setNow(Date.now()), 500);
    return () => {
      live.current = false;
      window.clearInterval(tick);
      if (debounce.current) clearTimeout(debounce.current);
      pendingSave.current?.();
    };
  }, []);
  useEffect(() => {
    if (initial.attempt && initial.attempt.status !== "draft") {
      setData(initial);
      setFrozenRemaining(initial.remainingSeconds);
      setSaveState("Copie verrouillée et disponible au formateur");
    }
  }, [initial.attempt?.status]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  const begin = () => {
    if (started.current) return;
    started.current = true;
    setDeadline(Date.now() + PRACTICE_SECONDS * 1000);
    if (test) return;
    queue.current = queue.current
      .catch(() => {})
      .then(async () => {
        const next = await start.mutateAsync();
        receive(next);
      });
  };
  const persist = (snapshot: WorkAnswer, commit: boolean) => {
    if (!workshop) return Promise.resolve();
    const id = workshop.id;
    if (commit) setValidating(true);
    const operation = queue.current
      .catch(() => {})
      .then(async () => {
        setSaving(true);
        setSaveState(commit ? "Validation en cours…" : "Enregistrement…");
        try {
          if (test) {
            if (commit) {
              const previous = Object.fromEntries(
                Object.entries(dataRef.current.attempt?.records || {})
                  .filter(([, r]) => r.committed)
                  .map(([k, r]) => [k, r.answer])
              );
              const r = await preview.mutateAsync({
                answers: { ...previous, [id]: snapshot },
              });
              const next: Session = {
                ...dataRef.current,
                workshops: r.workshops,
                attempt: {
                  id: 0,
                  status: "draft",
                  currentStep: r.currentStep,
                  startedAt: Date.now(),
                  deadlineAt: deadline,
                  records: r.records,
                  metrics: r.metrics,
                  review: null,
                },
              };
              receive(next, true);
              setConsequence(r.records[id]?.consequence || "Section validée.");
            }
          } else {
            const next = await save.mutateAsync({
              workshopId: id,
              answer: snapshot,
              commit,
            });
            receive(next, commit);
            if (commit)
              setConsequence(
                next.attempt?.records[id]?.consequence || "Section validée."
              );
          }
          if (commit || answerRef.current === snapshot) dirty.current = false;
          setSaveState(
            test
              ? "Brouillon de test local — aucune copie élève"
              : "Enregistré sur le serveur"
          );
          setErrors([]);
        } catch (e) {
          setSaveState(
            "Échec d’enregistrement — vos réponses restent à l’écran"
          );
          setErrors([(e as Error).message]);
          throw e;
        } finally {
          if (live.current) {
            setSaving(false);
            if (commit) setValidating(false);
          }
        }
      });
    queue.current = operation;
    return operation;
  };
  const change = (next: WorkAnswer) => {
    if (complete || remaining === 0) return;
    begin();
    dirty.current = true;
    answerRef.current = next;
    setAnswer(next);
    setSaveState(
      test ? "Test local modifié" : "Modifications non encore enregistrées"
    );
    if (debounce.current) clearTimeout(debounce.current);
    if (!test) {
      pendingSave.current = () => {
        persist(next, false).catch(() => {});
      };
      debounce.current = setTimeout(() => {
        pendingSave.current?.();
        pendingSave.current = null;
      }, 650);
    }
  };
  const validate = () => {
    if (!workshop) return;
    const failures = completeness(workshop, answer);
    if (failures.length) {
      setErrors(failures);
      return;
    }
    if (debounce.current) clearTimeout(debounce.current);
    pendingSave.current = null;
    persist(answer, true).catch(() => {});
  };
  const submit = async (expired = false) => {
    if (finishing.current) return;
    finishing.current = true;
    setSaving(true);
    setValidating(true);
    if (debounce.current) clearTimeout(debounce.current);
    pendingSave.current = null;
    try {
      await queue.current.catch(() => {});
      if (!expired && workshop && !test)
        await persist(answerRef.current, false);
      if (test) {
        setFrozenRemaining(remaining);
        setFinishedTest(true);
        dirty.current = false;
      } else {
        const next = await finish.mutateAsync();
        receive(next);
        dirty.current = false;
      }
      setConfirmSubmit(false);
      setSaveState("Copie remise");
    } catch (e) {
      setErrors([(e as Error).message]);
    } finally {
      setSaving(false);
      setValidating(false);
      finishing.current = false;
    }
  };
  useEffect(() => {
    if (remaining === 0 && started.current && !complete && !finishing.current)
      void submit(true);
  }, [remaining, complete]);
  const shown = reviewIndex === null ? workshop : data.workshops[reviewIndex];
  const shownAnswer =
    reviewIndex === null
      ? answer
      : data.attempt?.records[shown?.id]?.answer || {};
  return (
    <div className="w-full min-w-0">
      <div className="sticky top-0 z-20 rounded-2xl border border-blue-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700">
              {test
                ? "Test formateur · aucune copie élève"
                : data.simulation?.title || "Épreuve pratique sommative (2 h)"}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">
              {Math.min(index, data.workshops.length)} / {data.workshops.length}{" "}
              sections validées
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="hidden max-w-56 text-xs text-slate-500 sm:block"
              role="status"
            >
              {saveState}
            </span>
            <div
              role="timer"
              aria-label="Temps de composition restant"
              className={`rounded-xl px-3 py-2 font-mono text-2xl font-black tabular-nums ${remaining <= 600 ? "bg-rose-50 text-rose-800" : "bg-blue-50 text-blue-900"}`}
            >
              <Clock3 className="mr-2 inline h-4 w-4" />
              {formatPracticeTime(remaining)}
            </div>
            {test && onClose && (
              <Button variant="outline" onClick={onClose}>
                Quitter le test
              </Button>
            )}
          </div>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 sm:hidden">{saveState}</p>
      </div>
      {!ready ? (
        <div className="mt-5">
          <Intro
            workshops={data.workshops}
            test={test}
            onStart={() => setReady(true)}
          />
        </div>
      ) : (
        <>
          <div
            className="mt-4 flex gap-2 overflow-x-auto pb-2"
            aria-label="Navigation de relecture"
          >
            {data.workshops.map((w, i) => (
              <button
                key={w.id}
                disabled={i > index && !complete}
                onClick={() =>
                  setReviewIndex(i === index && !complete ? null : i)
                }
                className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold ${i === (reviewIndex ?? index) ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 bg-white text-slate-700"} disabled:opacity-35`}
              >
                {i < index ? (
                  <CheckCircle2 className="mr-1 inline h-3 w-3" />
                ) : null}
                {i + 1} · {w.minutes} min
              </button>
            ))}
          </div>
          {complete && (
            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <ShieldCheck className="h-7 w-7 text-blue-700" />
              <h2 className="mt-3 text-2xl font-black text-slate-950">
                {test
                  ? "Test clôturé — aucune remise réelle"
                  : "Copie verrouillée et transmise au formateur"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {remaining === 0 || data.attempt?.status === "expired"
                  ? "L’échéance est atteinte : seuls les travaux enregistrés avant la fin sont conservés."
                  : "Votre dossier comprend les réponses, les calculs, les échanges et les incidents rencontrés."}{" "}
                Les productions écrites seront examinées par le formateur.
              </p>
              {data.attempt?.review && (
                <div className="mt-4 rounded-xl bg-white p-4">
                  <strong>Note finale : {data.attempt.review.score}/20</strong>
                  <p className="mt-2 whitespace-pre-wrap text-sm">
                    {data.attempt.review.feedback}
                  </p>
                </div>
              )}
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setReviewIndex(0)}
              >
                Relire ma copie
              </Button>
            </div>
          )}
          {shown && (!complete || reviewIndex !== null) && (
            <SimulationActivityEditor
              key={shown.id}
              workshop={shown}
              answer={shownAnswer}
              onChange={change}
              disabled={
                complete ||
                reviewIndex !== null ||
                validating ||
                remaining === 0
              }
            />
          )}
          {reviewIndex !== null && !complete && (
            <Button
              variant="outline"
              className="my-4"
              onClick={() => setReviewIndex(null)}
            >
              Revenir à la section en cours
            </Button>
          )}
          {errors.length > 0 && (
            <div
              role="alert"
              className="m-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
            >
              <strong>À vérifier avant de poursuivre</strong>
              {errors.slice(0, 8).map((e, i) => (
                <p className="mt-2" key={i}>
                  {e}
                </p>
              ))}
            </div>
          )}
          {!complete && (
            <div className="m-4 rounded-2xl border border-blue-100 bg-white p-4">
              <div className="flex flex-wrap gap-3">
                {workshop && reviewIndex === null && (
                  <>
                    <Button
                      onClick={validate}
                      disabled={saving || remaining === 0}
                      className="min-h-12 bg-blue-700 text-white hover:bg-blue-800"
                    >
                      {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="mr-2 h-4 w-4" />
                      )}
                      Valider la section et découvrir la suite
                    </Button>
                    <Button
                      variant="outline"
                      disabled={saving || !started.current}
                      onClick={() => {
                        if (debounce.current) clearTimeout(debounce.current);
                        pendingSave.current = null;
                        persist(answer, false).catch(() => {});
                      }}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer maintenant
                    </Button>
                  </>
                )}
                <Button
                  variant={workshop ? "outline" : "default"}
                  disabled={saving || !started.current}
                  onClick={() => setConfirmSubmit(true)}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {workshop
                    ? "Remettre une copie incomplète"
                    : "Vérifier et remettre mon dossier"}
                </Button>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Une réponse incorrecte n’empêche pas la suite. La validation
                exige une production complète, pas une réponse juste. Les
                textes, choix et chiffres restent relisibles après validation.
              </p>
            </div>
          )}
          {!workshop && !complete && (
            <div className="m-4 rounded-2xl bg-blue-50 p-6">
              <FileCheck2 className="h-7 w-7 text-blue-700" />
              <h2 className="mt-3 text-2xl font-black">Dossier constitué</h2>
              <p className="mt-2 text-sm leading-7">
                Relisez vos sections avec les onglets, puis remettez votre
                évaluation. Le chronomètre continue jusqu’à la remise ou à
                l’échéance.
              </p>
            </div>
          )}
        </>
      )}
      <Dialog
        open={Boolean(consequence)}
        onOpenChange={open => !open && setConsequence(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>La situation évolue</DialogTitle>
            <DialogDescription>
              Les conséquences sont intégrées dans le dossier suivant. Il n’y a
              pas d’élimination.
            </DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-wrap rounded-xl bg-blue-50 p-4 text-sm leading-7 text-blue-950">
            {consequence}
          </p>
          <DialogFooter>
            <Button onClick={() => setConsequence(null)}>
              Poursuivre la mission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {test ? "Terminer ce test ?" : "Remettre votre évaluation ?"}
            </DialogTitle>
            <DialogDescription>
              {index < data.workshops.length
                ? `Attention : ${data.workshops.length - index} section(s) ne sont pas validées. Votre brouillon actuel sera inclus, mais les activités non traitées resteront sans réponse.`
                : "Toutes les sections sont validées. La remise verrouille définitivement vos réponses."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSubmit(false)}>
              Continuer à composer
            </Button>
            <Button disabled={saving} onClick={() => void submit()}>
              {test ? "Terminer sans envoi" : "Confirmer la remise"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export function StudentSimulation() {
  const q = trpc.student.formativeSimulation.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 lg:px-9">
      {q.isLoading ? (
        <p className="p-8 text-sm text-blue-700">Ouverture du dossier…</p>
      ) : q.error || !q.data ? (
        <ErrorBox
          message={q.error?.message || "Dossier indisponible"}
          onRetry={() => void q.refetch()}
        />
      ) : (
        <WorkbenchRunner initial={q.data} />
      )}
    </div>
  );
}

export function AdminSimulationConsole() {
  const q = trpc.admin.formativeSimulation.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const [exploring, setExploring] = useState(false);
  const [exploreIndex, setExploreIndex] = useState(0);
  const [exploreAnswers, setExploreAnswers] = useState<
    Record<string, WorkAnswer>
  >({});
  const [testing, setTesting] = useState(false);
  const [testId, setTestId] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [detailIndex, setDetailIndex] = useState(0);
  const utils = trpc.useUtils();
  const published = trpc.admin.setSimulationPublished.useMutation({
    onSuccess: () => utils.admin.formativeSimulation.invalidate(),
    onError: e => toast.error(e.message),
  });
  const closure = trpc.admin.enableSimulationClosure.useMutation({
    onSuccess: () => {
      toast.success("Clôture hors connexion activée, contrôle chaque minute.");
      utils.admin.formativeSimulation.invalidate();
    },
    onError: e => toast.error(e.message),
  });
  const review = trpc.admin.reviewFormativeWorkshop.useMutation({
    onSuccess: () => {
      toast.success("Correction transmise à l’apprenant.");
      utils.admin.formativeSimulation.invalidate();
    },
    onError: e => toast.error(e.message),
  });
  if (q.isLoading)
    return (
      <p className="mt-8 p-6 text-sm text-blue-700">
        Chargement des sections et des copies…
      </p>
    );
  if (q.error || !q.data)
    return (
      <ErrorBox
        message={q.error?.message || "Console indisponible"}
        onRetry={() => void q.refetch()}
      />
    );
  const data = q.data;
  const copy = data.attempts.find(a => a.id === selected);
  const w = copy?.receivedWorkshops[detailIndex] || data.workshops[detailIndex];
  return (
    <section className="mt-6 min-w-0">
      <div className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
          Laboratoire pratique · nouvelle version 4
        </p>
        <h1 className="mt-3 text-3xl font-black">
          Un dossier à résoudre. Pas un QCM à parcourir.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">
          6 sections · glisser-déposer · texte à trous · remise en ordre ·
          calculs · budget contraint · conversations scénarisées · écrits
          professionnels. Plan de charge estimé : 90 minutes. Les anciennes
          tentatives restent conservées et ne sont pas réutilisées.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            onClick={() => {
              setExploring(false);
              setTestId(v => v + 1);
              setTesting(true);
            }}
            className="bg-white text-blue-900 hover:bg-blue-50"
          >
            <Play className="mr-2 h-4 w-4" />
            Tester toute l’épreuve comme une apprenante
          </Button>
          <Button
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10"
            onClick={() => {
              setTesting(false);
              setExploring(v => !v);
            }}
          >
            Inspecter directement un atelier
          </Button>
          <Button
            disabled={published.isPending}
            onClick={() =>
              published.mutate({ isPublished: !data.simulation.isPublished })
            }
            className="border border-white/30 bg-transparent text-white hover:bg-white/10"
          >
            {data.simulation.isPublished
              ? "Verrouiller l’accès élèves"
              : "Ouvrir l’épreuve aux élèves"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-blue-100">
          Accès apprenants :{" "}
          {data.simulation.isPublished ? "ouvert" : "verrouillé"}. Le test ne
          crée ni copie élève, ni note, ni notification.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <ShieldCheck className="h-5 w-5 shrink-0 text-blue-700" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-blue-950">
            Échéance serveur fixe : 1 h 30 dès la première saisie
          </p>
          <p className="mt-1 text-xs leading-5 text-blue-800">
            {data.simulation.scheduleCronTaskUid
              ? "Clôture hors connexion configurée : contrôle chaque minute. Aucun enregistrement après l’échéance n’est accepté."
              : "La clôture est contrôlée pendant la composition et à chaque accès. Après publication de cette version, activez le contrôle chaque minute pour traiter aussi les copies dont le navigateur est fermé."}
          </p>
        </div>
        <Button
          variant="outline"
          disabled={
            closure.isPending || Boolean(data.simulation.scheduleCronTaskUid)
          }
          onClick={() => closure.mutate()}
        >
          {closure.isPending
            ? "Activation…"
            : data.simulation.scheduleCronTaskUid
              ? "Contrôle configuré"
              : "Activer la clôture hors connexion"}
        </Button>
      </div>
      {exploring && (
        <div className="mt-5 rounded-2xl border border-blue-200 bg-white p-3 sm:p-5">
          <h2 className="text-xl font-black text-blue-950">
            Inspection libre — sans chrono ni remise
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Essayez un format en particulier. Les données sont des exemples :
            seul le test complet restitue les conséquences du parcours. Aucune
            réponse n’est enregistrée dans une copie élève.
          </p>
          <select
            aria-label="Section à inspecter"
            value={exploreIndex}
            onChange={e => setExploreIndex(Number(e.target.value))}
            className="mt-4 min-h-12 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm"
          >
            {data.workshops.map((w, i) => (
              <option key={w.id} value={i}>
                {i + 1}. {w.title}
              </option>
            ))}
          </select>
          <SimulationActivityEditor
            key={data.workshops[exploreIndex].id}
            workshop={data.workshops[exploreIndex]}
            answer={exploreAnswers[data.workshops[exploreIndex].id] || {}}
            onChange={answer =>
              setExploreAnswers(previous => ({
                ...previous,
                [data.workshops[exploreIndex].id]: answer,
              }))
            }
          />
        </div>
      )}
      {testing && (
        <div className="mt-5">
          <WorkbenchRunner
            key={testId}
            test
            initial={{
              workshops: data.workshops,
              attempt: null,
              serverNow: Date.now(),
              remainingSeconds: PRACTICE_SECONDS,
            }}
            onClose={() => setTesting(false)}
          />
        </div>
      )}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-xl font-black text-slate-950">
            Copies pratiques à examiner
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Le score objectif est partiel. Les dialogues et recommandations
            nécessitent une correction humaine avant la note /20.
          </p>
        </div>
        {!data.attempts.length ? (
          <p className="p-6 text-sm text-slate-500">
            Aucune copie de la version 4. Votre mode test reste entièrement
            séparé.
          </p>
        ) : (
          data.attempts.map(a => (
            <button
              key={a.id}
              onClick={() => {
                setSelected(a.id);
                setDetailIndex(0);
                setScore(a.state.review ? String(a.state.review.score) : "");
                setFeedback(a.state.review?.feedback || "");
              }}
              className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 text-left hover:bg-blue-50"
            >
              <div>
                <p className="font-bold text-slate-900">
                  {a.student?.name || "Apprenant"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {a.student?.email}
                </p>
              </div>
              <div className="text-sm text-slate-700">
                {a.currentStep}/6 sections ·{" "}
                {a.status === "draft"
                  ? formatPracticeTime(a.remainingSeconds)
                  : a.status === "expired"
                    ? "Clôturée à l’échéance"
                    : "Remise"}
                {a.state.review ? ` · ${a.state.review.score}/20` : ""}
              </div>
            </button>
          ))
        )}
      </div>
      {copy && (
        <div className="mt-5 rounded-2xl border border-blue-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">
                Copie de {copy.student?.name || "l’apprenant"}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Éléments objectifs : {copy.score}/{data.objectiveMax}. Les
                champs rédigés ne sont pas notés automatiquement.
              </p>
            </div>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Fermer la copie
            </Button>
          </div>
          <select
            aria-label="Section à corriger"
            value={detailIndex}
            onChange={e => setDetailIndex(Number(e.target.value))}
            className="mt-4 min-h-11 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm"
          >
            {data.workshops.map((w, i) => (
              <option key={w.id} value={i}>
                {i + 1}. {w.title}{" "}
                {copy.state.records[w.id]?.committed
                  ? "— validé"
                  : "— incomplet"}
              </option>
            ))}
          </select>
          {w && (
            <>
              <div className="mt-4 rounded-xl bg-blue-50 p-4">
                <h3 className="font-bold text-blue-950">
                  Critères de correction
                </h3>
                {w.rubric.map((r, i) => (
                  <p key={i} className="mt-2 text-sm leading-6 text-blue-900">
                    {r}
                  </p>
                ))}
                <p className="mt-3 text-sm font-semibold">
                  {copy.state.records[w.id]?.consequence}
                </p>
              </div>
              <SimulationActivityEditor
                workshop={w}
                answer={copy.state.records[w.id]?.answer || {}}
                onChange={() => {}}
                disabled
              />
            </>
          )}
          {copy.status !== "draft" && (
            <div className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-5">
              <label className="text-sm font-bold">
                Note finale sur 20
                <input
                  aria-label="Note pratique sur 20"
                  type="number"
                  min={0}
                  max={20}
                  step={0.5}
                  value={score}
                  onChange={e => setScore(e.target.value)}
                  className="ml-3 w-24 rounded-lg border bg-white p-2"
                />
              </label>
              <label className="text-sm font-bold">
                Commentaire et conseils
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  className="mt-2 min-h-32 w-full rounded-xl border bg-white p-3 text-sm font-normal"
                />
              </label>
              <Button
                disabled={
                  review.isPending ||
                  !score.trim() ||
                  !Number.isFinite(Number(score)) ||
                  Number(score) < 0 ||
                  Number(score) > 20 ||
                  feedback.trim().length < 5
                }
                onClick={() =>
                  review.mutate({
                    attemptId: copy.id,
                    score: Number(score),
                    feedback,
                  })
                }
              >
                Enregistrer la correction et prévenir l’apprenant
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
