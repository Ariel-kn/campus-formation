import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  characterReaction,
  type DialogueTask,
  type PlacementTask,
  type VoiceTask,
  type WorkAnswer,
  type WorkDocument,
  type Workshop,
  wordCount,
} from "@shared/simulationWorkbench";
import { Mic, Square, Volume2, RotateCcw } from "lucide-react";

export type SimulationActivityEditorProps = {
  workshop: Workshop;
  answer: WorkAnswer;
  onChange: (answer: WorkAnswer) => void;
  disabled?: boolean;
};

type SelectedToken = { taskId: string; tokenId: string } | null;
type DragState = { taskId: string; tokenId: string };

const numberFormatter = new Intl.NumberFormat("fr-FR");

function setAnswerValue(answer: WorkAnswer, id: string, value: string) {
  return { ...answer, [id]: value };
}

function DocumentCard({ document }: { document: WorkDocument }) {
  const hasTable = Boolean(document.columns?.length || document.rows?.length);
  return (
    <article className="min-w-0 max-w-full rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-sm font-extrabold text-slate-950">
        {document.title}
      </h3>
      {document.text ? (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {document.text}
        </p>
      ) : null}
      {hasTable ? (
        <div
          className="mt-3 max-w-full overflow-x-auto rounded-xl border border-slate-200"
          tabIndex={0}
          aria-label={`Tableau : ${document.title}`}
        >
          <table className="min-w-[34rem] w-full border-collapse text-left text-xs">
            {document.columns?.length ? (
              <thead className="bg-blue-50 text-blue-950">
                <tr>
                  {document.columns.map(column => (
                    <th
                      key={column}
                      className="border-b border-blue-100 px-3 py-2 font-extrabold"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            {document.rows?.length ? (
              <tbody>
                {document.rows.map((row, rowIndex) => (
                  <tr
                    key={`${document.title}-${rowIndex}`}
                    className="border-b border-slate-100 last:border-0"
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`${rowIndex}-${cellIndex}`}
                        className="px-3 py-2.5 align-top leading-5 text-slate-700"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ) : null}
          </table>
        </div>
      ) : null}
      {hasTable ? (
        <p className="mt-2 text-[11px] text-blue-700 sm:hidden">
          Faites défiler le tableau horizontalement pour lire toutes les
          colonnes.
        </p>
      ) : null}
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-700">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}

function SlotButton({
  task,
  slot,
  value,
  tokenLabel,
  selected,
  disabled,
  onPlace,
  onRemove,
}: {
  task: PlacementTask;
  slot: PlacementTask["slots"][number];
  value?: string;
  tokenLabel?: string;
  selected: boolean;
  disabled: boolean;
  onPlace: (slotId: string) => void;
  onRemove: (slotId: string) => void;
}) {
  const activate = () => {
    if (!disabled) onPlace(slot.id);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === "Enter" || event.key === " ") && !disabled) {
      event.preventDefault();
      activate();
    }
  };
  return (
    <div
      data-slot={slot.id}
      data-task-id={task.id}
      className="flex min-w-0 items-center gap-2"
    >
      <button
        type="button"
        onClick={activate}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={`${slot.label}${tokenLabel ? ` : ${tokenLabel}` : " : case vide"}`}
        className={`min-h-12 min-w-0 flex-1 rounded-xl border-2 px-3 py-2 text-left text-sm font-bold transition ${
          tokenLabel
            ? "border-blue-300 bg-blue-50 text-blue-950"
            : selected
              ? "border-amber-400 bg-amber-50 text-amber-950 ring-2 ring-amber-100"
              : "border-dashed border-blue-200 bg-white text-slate-500 hover:border-blue-400 hover:bg-blue-50"
        } disabled:cursor-not-allowed disabled:opacity-70`}
      >
        <span className="block text-[10px] font-extrabold uppercase tracking-[0.1em] text-blue-600">
          {slot.label}
        </span>
        <span className="mt-1 block whitespace-normal break-words">
          {tokenLabel || (selected ? "Déposer la carte ici" : "Case vide")}
        </span>
      </button>
      {tokenLabel ? (
        <button
          type="button"
          onClick={() => onRemove(slot.id)}
          disabled={disabled}
          className="shrink-0 rounded-lg border border-slate-200 px-2 py-2 text-xs font-extrabold text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Retirer ${tokenLabel} de ${slot.label}`}
        >
          Retirer
        </button>
      ) : null}
    </div>
  );
}

function PassageWithSlots({
  task,
  values,
  labels,
  selected,
  disabled,
  onPlace,
  onRemove,
}: {
  task: PlacementTask;
  values: Record<string, string>;
  labels: Record<string, string>;
  selected: SelectedToken;
  disabled: boolean;
  onPlace: (slotId: string) => void;
  onRemove: (slotId: string) => void;
}) {
  const parts = (task.passage || "").split(/(\{[^}]+\})/g);
  return (
    <p className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm leading-8 text-slate-700">
      {parts.map((part, index) => {
        const match = /^\{([^}]+)\}$/.exec(part);
        if (!match) return <span key={`${part}-${index}`}>{part}</span>;
        const slotId = match[1];
        const slot = task.slots.find(item => item.id === slotId);
        if (!slot) return <span key={`${part}-${index}`}>{part}</span>;
        return (
          <span
            key={slotId}
            data-slot={slotId}
            data-task-id={task.id}
            className="mx-1 inline-flex align-middle"
          >
            <button
              type="button"
              onClick={() => !disabled && onPlace(slotId)}
              onKeyDown={event => {
                if ((event.key === "Enter" || event.key === " ") && !disabled) {
                  event.preventDefault();
                  onPlace(slotId);
                }
              }}
              disabled={disabled}
              aria-label={`${slot.label}${labels[values[slotId]] ? ` : ${labels[values[slotId]]}` : " : case vide"}`}
              className={`inline-flex min-h-9 min-w-24 max-w-48 items-center rounded-lg border-2 px-2.5 py-1 text-left align-middle text-xs font-extrabold leading-4 transition ${
                values[slotId]
                  ? "border-blue-300 bg-white text-blue-950"
                  : selected?.taskId === task.id
                    ? "border-amber-400 bg-amber-50 text-amber-950"
                    : "border-dashed border-blue-300 bg-white/80 text-blue-700"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {labels[values[slotId]] ||
                (selected?.taskId === task.id ? "Déposer ici" : slot.label)}
            </button>
            {values[slotId] && !disabled ? (
              <button
                type="button"
                onClick={() => onRemove(slotId)}
                aria-label={`Retirer ${labels[values[slotId]]}`}
                className="ml-1 rounded-lg px-2 text-xs font-bold text-blue-700"
              >
                ×
              </button>
            ) : null}
          </span>
        );
      })}
    </p>
  );
}

function PlacementActivity({
  task,
  answer,
  selected,
  dragging,
  disabled,
  onSelect,
  onPlace,
  onRemove,
  onDragStart,
}: {
  task: PlacementTask;
  answer: WorkAnswer;
  selected: SelectedToken;
  dragging: DragState | null;
  disabled: boolean;
  onSelect: (tokenId: string) => void;
  onPlace: (slotId: string) => void;
  onRemove: (slotId: string) => void;
  onDragStart: (
    event: ReactPointerEvent<HTMLButtonElement>,
    tokenId: string
  ) => void;
}) {
  const values = useMemo(
    () =>
      Object.fromEntries(
        task.slots.map(slot => [slot.id, answer[slot.id] || ""])
      ),
    [answer, task.slots]
  );
  const labels = useMemo(
    () => Object.fromEntries(task.tokens.map(token => [token.id, token.label])),
    [task.tokens]
  );
  const usedTokenIds = new Set(Object.values(values).filter(Boolean));
  const selectedForTask = selected?.taskId === task.id;
  const kindLabel =
    task.kind === "cloze"
      ? "Texte à trous"
      : task.kind === "ordering"
        ? "Ordre à construire"
        : "Placement";

  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,.75fr)]">
      <div className="min-w-0">
        {task.kind === "cloze" && task.passage ? (
          <PassageWithSlots
            task={task}
            values={values}
            labels={labels}
            selected={selected}
            disabled={disabled}
            onPlace={onPlace}
            onRemove={onRemove}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {task.slots.map((slot, index) => (
              <div key={slot.id} className="flex min-w-0 items-start gap-2">
                {task.kind === "ordering" ? (
                  <span className="mt-3 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-700 text-xs font-black text-white">
                    {index + 1}
                  </span>
                ) : null}
                <SlotButton
                  task={task}
                  slot={slot}
                  value={values[slot.id]}
                  tokenLabel={labels[values[slot.id]]}
                  selected={selectedForTask}
                  disabled={disabled}
                  onPlace={onPlace}
                  onRemove={onRemove}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <aside
        className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
        aria-label={`Banque de cartes — ${kindLabel}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-700">
              Banque de cartes
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {selectedForTask
                ? "Choisissez une case ou déposez la carte."
                : "Touchez une carte puis une case, ou faites-la glisser."}
            </p>
          </div>
          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-extrabold text-slate-500 ring-1 ring-slate-200">
            {task.tokens.length} cartes
          </span>
        </div>
        <div
          className="mt-3 grid max-h-none gap-2 overflow-y-auto xl:max-h-80 pr-1 sm:grid-cols-2 xl:grid-cols-1"
          style={{ touchAction: "pan-y" }}
        >
          {task.tokens.map(token => {
            const used = usedTokenIds.has(token.id);
            const isSelected =
              selected?.taskId === task.id && selected.tokenId === token.id;
            const isDragging =
              dragging?.taskId === task.id && dragging.tokenId === token.id;
            return (
              <button
                key={token.id}
                type="button"
                draggable={false}
                onClick={() => onSelect(token.id)}
                onPointerDown={event => onDragStart(event, token.id)}
                aria-pressed={isSelected}
                aria-grabbed={isDragging}
                aria-label={`${token.label}${used ? " — déjà utilisée, déplaçable" : ""}`}
                disabled={disabled}
                className={`min-h-11 rounded-xl border px-3 py-2 text-left text-xs font-extrabold transition ${isSelected ? "border-amber-400 bg-amber-50 text-amber-950 ring-2 ring-amber-100" : used ? "border-blue-200 bg-blue-100/60 text-blue-800" : "border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50"} ${isDragging ? "opacity-60" : ""} disabled:cursor-not-allowed disabled:opacity-60`}
                style={{ touchAction: "none" }}
              >
                <span
                  className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-500 align-middle"
                  aria-hidden="true"
                />
                {token.label}
                {used ? (
                  <span className="ml-1 text-[10px] font-semibold text-blue-600">
                    (utilisée)
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

function DialogueActivity({
  task,
  answer,
  disabled,
  onChange,
}: {
  task: DialogueTask;
  answer: WorkAnswer;
  disabled: boolean;
  onChange: (answer: WorkAnswer) => void;
}) {
  const [announcement, setAnnouncement] = useState("");
  const nextIndex = task.turns.findIndex(
    turn => answer[`_sent:${turn.id}`] !== "1"
  );
  const visibleCount =
    disabled || nextIndex < 0 ? task.turns.length : nextIndex + 1;
  const initial =
    task.character.trim().charAt(0).toLocaleUpperCase("fr-FR") || "P";

  const sendTurn = (turn: DialogueTask["turns"][number]) => {
    if (disabled) return;
    const text = (answer[turn.id] || "").trim();
    if (wordCount(text) < turn.minWords) {
      setAnnouncement(
        `Développez votre réponse : ${turn.minWords} mots minimum avant l’envoi.`
      );
      return;
    }
    onChange({
      ...answer,
      [turn.id]: answer[turn.id] || "",
      [`_sent:${turn.id}`]: "1",
    });
    setAnnouncement(`Réponse envoyée à ${task.character}.`);
  };

  return (
    <div className="mt-5 rounded-2xl border border-blue-100 bg-slate-50/70 p-3 sm:p-5">
      <div className="space-y-5">
        {task.turns.slice(0, visibleCount).map((turn, index) => {
          const sent = answer[`_sent:${turn.id}`] === "1";
          const text = answer[turn.id] || "";
          const isCurrent = !disabled && !sent && index === nextIndex;
          return (
            <div key={turn.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <div
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-black text-white"
                  aria-hidden="true"
                >
                  {initial}
                </div>
                <div className="min-w-0 max-w-2xl rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-blue-100">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-blue-700">
                    {task.character} · tour {index + 1}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {turn.message}
                  </p>
                </div>
              </div>
              {sent || disabled ? (
                <div className="ml-8 max-w-2xl sm:ml-12">
                  <div className="rounded-2xl rounded-tr-sm bg-blue-700 px-4 py-3 text-sm leading-6 text-white shadow-sm">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-blue-100">
                      Votre réponse
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">
                      {text || "Aucune réponse enregistrée."}
                    </p>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() =>
                          onChange({ ...answer, [`_sent:${turn.id}`]: "0" })
                        }
                        className="mt-3 rounded-lg border border-white/40 px-3 py-2 text-xs font-bold text-white"
                      >
                        Modifier ma réponse
                      </button>
                    )}
                  </div>
                  {sent && text ? (
                    <div className="mt-2 rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm leading-6 text-slate-700">
                      <span className="font-extrabold text-blue-700">
                        {task.character} :
                      </span>{" "}
                      {characterReaction(turn, text)}
                    </div>
                  ) : null}
                </div>
              ) : isCurrent ? (
                <div className="ml-8 max-w-2xl sm:ml-12">
                  <label
                    htmlFor={`dialogue-${task.id}-${turn.id}`}
                    className="sr-only"
                  >
                    Votre réponse au tour {index + 1}
                  </label>
                  <textarea
                    id={`dialogue-${task.id}-${turn.id}`}
                    value={text}
                    onChange={event =>
                      onChange(
                        setAnswerValue(answer, turn.id, event.target.value)
                      )
                    }
                    disabled={disabled}
                    placeholder="Écrivez votre réponse professionnelle…"
                    rows={4}
                    className="w-full resize-y rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none ring-blue-200 transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 disabled:bg-slate-100"
                  />
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Repère : {wordCount(text)} mots · minimum requis{" "}
                      {turn.minWords}
                    </p>
                    <button
                      type="button"
                      onClick={() => sendTurn(turn)}
                      disabled={disabled || wordCount(text) < turn.minWords}
                      className="rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Envoyer le tour
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      {!disabled && nextIndex < 0 ? (
        <p className="mt-5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800">
          Tous les tours ont été envoyés. Vous pouvez relire la conversation
          ci-dessus.
        </p>
      ) : null}
    </div>
  );
}

function VoiceActivity({
  task,
  answer,
  disabled,
  onChange,
}: {
  task: VoiceTask;
  answer: WorkAnswer;
  disabled?: boolean;
  onChange: (answer: WorkAnswer) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(answer[task.id] || null);
  const [seconds, setSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setSeconds(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setAudioUrl(base64data);
          onChange(setAnswerValue(answer, task.id, base64data));
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= (task.maxSeconds || 90)) {
            stopRecording();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      setMicError("Microphone inaccessible ou non autorisé. Vous pouvez saisir votre script oral dans le champ ci-dessous.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  return (
    <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-700 text-white shadow-sm">
          <Volume2 className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-slate-900">Consigne vocale</h4>
          <p className="mt-1 text-xs leading-5 text-slate-600">{task.prompt}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!recording ? (
          <button
            type="button"
            disabled={disabled}
            onClick={startRecording}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-800 disabled:opacity-50"
          >
            <Mic className="h-4 w-4" />
            {audioUrl ? "Réenregistrer mon audio" : "Démarrer l'enregistrement vocal"}
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={stopRecording}
            className="inline-flex animate-pulse items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-700"
          >
            <Square className="h-4 w-4" />
            Arrêter l'enregistrement ({seconds}s / {task.maxSeconds || 90}s)
          </button>
        )}

        {audioUrl && !recording && (
          <div className="flex items-center gap-2">
            <audio controls src={audioUrl} className="h-9 max-w-xs" />
            <span className="text-[11px] font-bold text-emerald-700">Audio enregistré</span>
          </div>
        )}
      </div>

      {micError && (
        <p className="mt-2 text-xs font-semibold text-amber-800 bg-amber-50 rounded-lg p-2.5 border border-amber-200">
          {micError}
        </p>
      )}

      <div className="mt-4">
        <label className="block text-xs font-bold text-slate-700">
          Script textuel de votre intervention orale (notes, arguments et préparation) :
          <textarea
            value={answer[`${task.id}-script`] || ""}
            onChange={(e) => onChange(setAnswerValue(answer, `${task.id}-script`, e.target.value))}
            disabled={disabled}
            placeholder="Exposez les points clés de votre argumentation orale ou transcrivez votre pitch…"
            rows={4}
            className="mt-1.5 w-full resize-y rounded-xl border border-blue-200 bg-white p-3 text-xs leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
          />
        </label>
      </div>
    </div>
  );
}

export default function SimulationActivityEditor({
  workshop,
  answer,
  onChange,
  disabled = false,
}: SimulationActivityEditorProps) {
  const [selectedToken, setSelectedToken] = useState<SelectedToken>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const draggingRef = useRef<DragState | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);
  const [announcement, setAnnouncement] = useState("");

  const placeToken = useCallback(
    (task: PlacementTask, slotId: string, tokenId: string) => {
      if (
        disabled ||
        !task.slots.some(slot => slot.id === slotId) ||
        !task.tokens.some(token => token.id === tokenId)
      )
        return;
      const sourceSlot = task.slots.find(
        slot => answer[slot.id] === tokenId
      )?.id;
      const targetToken = answer[slotId];
      const next = { ...answer };
      if (sourceSlot && sourceSlot !== slotId) {
        if (targetToken && targetToken !== tokenId)
          next[sourceSlot] = targetToken;
        else delete next[sourceSlot];
      }
      next[slotId] = tokenId;
      onChange(next);
      setSelectedToken(null);
      setAnnouncement(
        `${task.tokens.find(token => token.id === tokenId)?.label || "Carte"} placé dans ${task.slots.find(slot => slot.id === slotId)?.label || "la case"}.`
      );
    },
    [answer, disabled, onChange]
  );

  const removeToken = useCallback(
    (task: PlacementTask, slotId: string) => {
      if (disabled || !answer[slotId]) return;
      const label =
        task.tokens.find(token => token.id === answer[slotId])?.label ||
        "Carte";
      const next = { ...answer };
      delete next[slotId];
      onChange(next);
      setAnnouncement(
        `${label} retiré de ${task.slots.find(slot => slot.id === slotId)?.label || "la case"}.`
      );
    },
    [answer, disabled, onChange]
  );

  const startDrag = useCallback(
    (
      event: ReactPointerEvent<HTMLButtonElement>,
      taskId: string,
      tokenId: string
    ) => {
      if (disabled) return;
      event.preventDefault();
      suppressClickRef.current = false;
      const state = { taskId, tokenId };
      draggingRef.current = state;
      setSelectedToken(state);
      setPointer({ x: event.clientX, y: event.clientY });
      setDragging(state);
    },
    [disabled]
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      setPointer({ x: event.clientX, y: event.clientY });
      event.preventDefault();
    };
    const handlePointerUp = (event: PointerEvent) => {
      const state = draggingRef.current;
      if (!state) return;
      event.preventDefault();
      const element = document.elementFromPoint(event.clientX, event.clientY);
      const slotElement = element?.closest("[data-slot]") as HTMLElement | null;
      const task = workshop.tasks.find(
        (item): item is PlacementTask =>
          (item.kind === "placement" ||
            item.kind === "cloze" ||
            item.kind === "ordering") &&
          item.id === state.taskId
      );
      if (
        task &&
        slotElement?.dataset.taskId === task.id &&
        slotElement.dataset.slot
      ) {
        placeToken(task, slotElement.dataset.slot, state.tokenId);
        suppressClickRef.current = true;
      }
      draggingRef.current = null;
      setDragging(null);
      setPointer(null);
    };
    window.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    });
    window.addEventListener("pointerup", handlePointerUp, { passive: false });
    window.addEventListener("pointercancel", handlePointerUp, {
      passive: false,
    });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [placeToken, workshop.tasks]);

  const taskCount = workshop.tasks.length;
  const placementCount = workshop.tasks.filter(
    task =>
      task.kind === "placement" ||
      task.kind === "cloze" ||
      task.kind === "ordering"
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      {dragging && pointer && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            left: pointer.x + 12,
            top: pointer.y + 12,
            pointerEvents: "none",
            zIndex: 1000,
          }}
          className="max-w-64 rounded-xl border border-blue-300 bg-blue-700 px-4 py-3 text-xs font-bold text-white shadow-xl"
        >
          {
            workshop.tasks
              .flatMap(t => ("tokens" in t ? t.tokens : []))
              .find(t => t.id === dragging.tokenId)?.label
          }
        </div>
      )}
      <section className="student-hero overflow-hidden rounded-[2rem] px-5 py-7 text-white shadow-[0_24px_60px_rgba(47,45,114,.2)] sm:px-8 sm:py-9">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-blue-100">
          Section pratique · {workshop.sequence}
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0">
            <h1 className="max-w-4xl text-3xl font-black tracking-tight sm:text-4xl">
              {workshop.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-50">
              {workshop.brief}
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-blue-100">
              Repères
            </p>
            <p className="mt-1 text-lg font-black">{taskCount} activités</p>
            <p className="text-xs text-blue-100">
              {workshop.minutes} min · {placementCount} activité
              {placementCount > 1 ? "s" : ""} à cartes
            </p>
          </div>
        </div>
      </section>

      {workshop.documents.length ? (
        <section className="mt-7">
          <SectionHeading
            eyebrow="Dossier de travail"
            title="Documents et données"
            description="Consultez les éléments utiles avant de construire vos réponses."
          />
          <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
            {workshop.documents.map((document, index) => (
              <DocumentCard
                key={`${document.title}-${index}`}
                document={document}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <SectionHeading
          eyebrow="Votre production"
          title="Activités guidées"
          description="Construisez vos réponses à partir du dossier. En composition réelle, vos saisies sont enregistrées automatiquement."
        />
        <div className="mt-5 space-y-5">
          {workshop.tasks.map((task, index) => (
            <article
              key={task.id}
              className="rounded-[1.5rem] border border-blue-100 bg-white p-5 shadow-[0_14px_35px_rgba(47,75,160,.07)] sm:p-7"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-700">
                    Activité {index + 1} ·{" "}
                    {
                      {
                        placement: "Glisser-déposer",
                        cloze: "Texte à trous",
                        ordering: "Remise en ordre",
                        numeric: "Calculs et indicateurs",
                        budget: "Budget à construire",
                        writing: "Production écrite",
                        dialogue: "Échange avec le client",
                      }[task.kind]
                    }
                  </p>
                  <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                    {task.title}
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    {task.instructions}
                  </p>
                </div>
                {disabled ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
                    Lecture seule
                  </span>
                ) : null}
              </div>
              {"slots" in task ? (
                <PlacementActivity
                  task={task}
                  answer={answer}
                  selected={selectedToken}
                  dragging={dragging}
                  disabled={disabled}
                  onSelect={tokenId => {
                    if (disabled || suppressClickRef.current) {
                      suppressClickRef.current = false;
                      return;
                    }
                    setSelectedToken({ taskId: task.id, tokenId });
                    setAnnouncement(
                      `${task.tokens.find(token => token.id === tokenId)?.label || "Carte"} sélectionnée. Choisissez une case.`
                    );
                  }}
                  onPlace={slotId => {
                    if (selectedToken?.taskId === task.id)
                      placeToken(task, slotId, selectedToken.tokenId);
                  }}
                  onRemove={slotId => removeToken(task, slotId)}
                  onDragStart={(event, tokenId) =>
                    startDrag(event, task.id, tokenId)
                  }
                />
              ) : "fields" in task &&
                (task.kind === "numeric" || task.kind === "budget") ? (
                <div className="mt-5">
                  {task.kind === "budget" ? (
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-950">
                      <span className="font-bold">Total engagé en direct</span>
                      <strong>
                        {numberFormatter.format(
                          task.fields.reduce(
                            (sum, field) =>
                              sum +
                              (Number(
                                String(answer[field.id] || "").replace(",", ".")
                              ) || 0),
                            0
                          )
                        )}{" "}
                        / {numberFormatter.format(task.total ?? 600000)} FCFA
                      </strong>
                    </div>
                  ) : null}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {task.fields.map(field => (
                      <label key={field.id} className="block">
                        <span className="text-xs font-extrabold text-slate-700">
                          {field.label}
                        </span>
                        <span className="mt-2 flex items-center rounded-xl border border-blue-200 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                          <input
                            type="number"
                            inputMode="decimal"
                            value={answer[field.id] ?? ""}
                            onChange={event =>
                              onChange(
                                setAnswerValue(
                                  answer,
                                  field.id,
                                  event.target.value
                                )
                              )
                            }
                            disabled={disabled}
                            className="min-w-0 flex-1 rounded-xl border-0 bg-transparent px-3 py-3 text-sm font-bold text-slate-900 outline-none disabled:bg-slate-100"
                            aria-label={field.label}
                          />
                          <span className="px-3 text-xs font-extrabold text-blue-700">
                            {field.unit}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : task.kind === "writing" ? (
                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  {task.fields.map(field => {
                    const value = answer[field.id] || "";
                    return (
                      <label key={field.id} className="block">
                        <span className="text-sm font-extrabold text-slate-800">
                          {field.label}
                        </span>
                        <textarea
                          value={value}
                          onChange={event =>
                            onChange(
                              setAnswerValue(
                                answer,
                                field.id,
                                event.target.value
                              )
                            )
                          }
                          disabled={disabled}
                          placeholder={
                            field.placeholder || "Rédigez votre réponse…"
                          }
                          rows={6}
                          className="mt-2 w-full resize-y rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                        />
                        <span className="mt-2 block text-xs text-slate-500">
                          {wordCount(value)} mots · développement requis, sans
                          points attribués à la longueur
                          {field.minWords
                            ? ` · minimum ${field.minWords} mots`
                            : ""}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : task.kind === "dialogue" ? (
                <DialogueActivity
                  task={task}
                  answer={answer}
                  disabled={disabled}
                  onChange={onChange}
                />
              ) : task.kind === "voice" ? (
                <VoiceActivity
                  task={task}
                  answer={answer}
                  disabled={disabled}
                  onChange={onChange}
                />
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
