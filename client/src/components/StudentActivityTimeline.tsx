import { trpc } from "@/lib/trpc";

export default function StudentActivityTimeline() {
  const history = trpc.student.history.useQuery();
  const labels: Record<string, string> = {
    deliverable_submitted: "Livrable déposé",
    assessment_submitted: "Évaluation soumise",
    assessment_reviewed: "Évaluation corrigée",
    revision_requested: "Reprise demandée",
    override_changed: "Accès au module modifié",
  };
  if (history.isLoading || !history.data?.length) return null;
  return <section className="mt-9 rounded-2xl border border-[#e1e9e4] bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#829991]">Historique</p><h2 className="mt-1 font-display text-3xl text-[#1f443b]">Vos dernières actions</h2><div className="mt-4 divide-y divide-[#edf1ef]">{history.data.slice(0, 6).map(item => <div key={item.id} className="flex items-center justify-between gap-4 py-3"><p className="text-sm font-semibold text-[#496b62]">{labels[item.action] || "Mise à jour pédagogique"}</p><p className="shrink-0 text-xs text-[#8aa099]">{new Date(item.createdAt).toLocaleDateString("fr-FR")}</p></div>)}</div></section>;
}
