/**
 * Conversie Coach & Optimalisatie — native Studio-paneel.
 *
 * Drie secties: (1) live conversiescore, (2) actiegerichte quick fixes voor elk
 * gezakt auditpunt en (3) highlight/animatie-controls voor de primaire CTA.
 * De audit is puur en deterministisch zodat hij testbaar blijft.
 */
import { useMemo, useState } from "react";
import { AlertTriangle, Lightbulb, MoveVertical, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { conversionTips } from "@/lib/conversion-coach";
import { BLOCK_KINDS, type ProfileBlock } from "@/lib/profile";
import {
  HIGHLIGHT_STYLES,
  type HighlightStyle,
  type ProfileDisplayPrefs,
} from "@/lib/profile-display";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------- audit */

export interface ProfileHealthInput {
  avatarUrl: string | null | undefined;
  bio: string | null | undefined;
  metaTitle: string | null | undefined;
  metaDescription: string | null | undefined;
  highlightStyle: HighlightStyle;
  highlightBlockId: string | null | undefined;
}

export interface AuditCriterion {
  id: string;
  points: number;
  passed: boolean;
  title: string;
  description: string;
  actionLabel: string;
  action: "avatar" | "bio" | "social" | "conversion" | "highlight" | "seo";
}

export interface ProfileHealth {
  score: number;
  criteria: AuditCriterion[];
  failed: AuditCriterion[];
}

/** Blokken die als "sociale handle" tellen. */
const SOCIAL_CATEGORIES = new Set(["socials", "featured"]);

/** Componenten die een bezoeker echt laten converteren. */
const CONVERSION_KINDS = new Set([
  "booking",
  "booking_request",
  "vcard",
  "contact_form",
  "shop",
]);

const categoryOf = (kind: string) => BLOCK_KINDS.find((k) => k.kind === kind)?.category;

/** Berekent de conversiescore (0–100) op basis van zes auditregels. */
export function evaluateProfileHealth(
  profile: ProfileHealthInput,
  links: ProfileBlock[],
  components: ProfileBlock[] = links,
): ProfileHealth {
  const active = links.filter((b) => !b.hidden);
  const activeComponents = components.filter((b) => !b.hidden);

  const criteria: AuditCriterion[] = [
    {
      id: "avatar",
      points: 15,
      passed: Boolean(profile.avatarUrl && profile.avatarUrl.trim()),
      title: "🖼️ Geen profielfoto",
      description:
        "Profielen met een gezicht of logo worden merkbaar vaker aangeklikt. Upload een avatar.",
      actionLabel: "📸 Avatar toevoegen",
      action: "avatar",
    },
    {
      id: "bio",
      points: 15,
      passed: (profile.bio ?? "").trim().length > 20,
      title: "✍️ Je bio is te kort",
      description:
        "Vertel in één zin wie je bent en wat bezoekers hier vinden (minimaal 20 tekens).",
      actionLabel: "📝 Bio schrijven",
      action: "bio",
    },
    {
      id: "social",
      points: 15,
      passed: active.some((b) => SOCIAL_CATEGORIES.has(categoryOf(b.kind) ?? "")),
      title: "🔗 Geen sociale handle gekoppeld",
      description:
        "Koppel minstens één sociaal account zodat bezoekers je elders kunnen volgen.",
      actionLabel: "➕ Social toevoegen",
      action: "social",
    },
    {
      id: "conversion",
      points: 25,
      passed: activeComponents.some((b) => CONVERSION_KINDS.has(b.kind)),
      title: "🔥 Geen hoofddoel ingesteld",
      description:
        "Bezoekers weten niet wat ze moeten doen. Voeg een Boekings- of Contactformulier toe.",
      actionLabel: "⚡ Direct toevoegen",
      action: "conversion",
    },
    {
      id: "highlight",
      points: 15,
      passed:
        profile.highlightStyle !== "none" &&
        Boolean(profile.highlightBlockId) &&
        active.some((b) => b.id === profile.highlightBlockId),
      title: "✨ Geen link uitgelicht",
      description:
        "Geef je belangrijkste knop een gloed of pulse zodat het oog er meteen naartoe gaat.",
      actionLabel: "🎯 Highlight kiezen",
      action: "highlight",
    },
    {
      id: "seo",
      points: 15,
      passed:
        Boolean((profile.metaTitle ?? "").trim()) &&
        Boolean((profile.metaDescription ?? "").trim()),
      title: "💬 WhatsApp / Social share preview mist",
      description:
        "Voeg een pakkende titel en beschrijving toe voor wanneer je link op WhatsApp wordt gedeeld.",
      actionLabel: "📝 Vul in",
      action: "seo",
    },
  ];

  const score = criteria.reduce((sum, c) => sum + (c.passed ? c.points : 0), 0);
  return { score, criteria, failed: criteria.filter((c) => !c.passed) };
}

function scoreVerdict(score: number): string {
  if (score >= 90) return "Uitstekend — je profiel is klaar om te converteren.";
  if (score >= 70) return "Sterk profiel, maar er is ruimte voor meer conversie!";
  if (score >= 40) return "Goed begin. Werk de quick fixes hieronder af.";
  return "Er valt nog veel te winnen — begin bij je hoofddoel.";
}

/* -------------------------------------------------------------------- ui */

const TIP_ICON = {
  warning: AlertTriangle,
  hint: Lightbulb,
  info: MoveVertical,
} as const;

export interface ConversionCoachAccordionProps {
  blocks: ProfileBlock[];
  prefs: ProfileDisplayPrefs;
  avatarUrl: string | null;
  bio: string | null;
  setPref: <K extends keyof ProfileDisplayPrefs>(key: K, value: ProfileDisplayPrefs[K]) => void;
  onUpdateBlock: (id: string, patch: Partial<ProfileBlock>) => void;
  /** Opent de component-kiezer (booking / contactformulier) . */
  onAddConversionBlock: () => void;
  /** Springt naar het Social Sharing & SEO-paneel. */
  onOpenSeo: () => void;
  /** Springt naar de avatar/bio-velden in de designtab. */
  onOpenProfileBasics: () => void;
}

export function ConversionCoachAccordion({
  blocks,
  prefs,
  avatarUrl,
  bio,
  setPref,
  onUpdateBlock,
  onAddConversionBlock,
  onOpenSeo,
  onOpenProfileBasics,
}: ConversionCoachAccordionProps) {
  const health = useMemo(
    () =>
      evaluateProfileHealth(
        {
          avatarUrl,
          bio,
          metaTitle: prefs.metaTitle,
          metaDescription: prefs.metaDescription,
          highlightStyle: prefs.highlightStyle,
          highlightBlockId: prefs.highlightBlockId,
        },
        blocks,
      ),
    [avatarUrl, bio, prefs, blocks],
  );
  const tips = useMemo(() => conversionTips(blocks), [blocks]);
  const [focusHighlight, setFocusHighlight] = useState(false);

  const linkOptions = blocks.filter((b) => !b.hidden && b.kind !== "spacer" && b.kind !== "text");
  const target = linkOptions.find((b) => b.id === prefs.highlightBlockId) ?? null;

  const runAction = (criterion: AuditCriterion) => {
    switch (criterion.action) {
      case "conversion":
      case "social":
        onAddConversionBlock();
        break;
      case "seo":
        onOpenSeo();
        break;
      case "avatar":
      case "bio":
        onOpenProfileBasics();
        break;
      case "highlight":
        setFocusHighlight(true);
        break;
    }
  };

  return (
    <div className="space-y-5">
      {/* 1 — score */}
      <section
        aria-label="Conversiescore"
        className="space-y-3 rounded-2xl border border-border bg-background p-4"
      >
        <div className="flex items-end justify-between gap-3">
          <h3 className="text-sm font-medium">Conversiescore</h3>
          <p className="font-mono text-2xl font-semibold leading-none">
            {health.score}
            <span className="text-sm text-muted-foreground">/100</span>
          </p>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={health.score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Conversiescore"
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              health.score >= 70
                ? "bg-emerald-500"
                : health.score >= 40
                  ? "bg-amber-500"
                  : "bg-red-500",
            )}
            style={{ width: `${health.score}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{scoreVerdict(health.score)}</p>
      </section>

      {/* 2 — quick fixes */}
      <section aria-label="Quick fixes" className="space-y-2">
        <h3 className="text-sm font-medium">Quick fixes</h3>
        {health.failed.length === 0 ? (
          <p className="rounded-xl border border-border bg-background px-3 py-3 text-xs text-muted-foreground">
            ✅ Alle auditpunten zijn in orde. Mooi werk!
          </p>
        ) : (
          <ul className="space-y-2">
            {health.failed.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="shrink-0 gap-1.5 rounded-xl"
                  onClick={() => runAction(c)}
                >
                  <Zap className="h-3.5 w-3.5" aria-hidden />
                  {c.actionLabel}
                </Button>
              </li>
            ))}
          </ul>
        )}

        {tips.length > 0 && (
          <ul className="space-y-1.5 pt-1">
            {tips.map((tip) => {
              const Icon = TIP_ICON[tip.tone];
              return (
                <li
                  key={tip.id}
                  className="flex items-start gap-2 rounded-xl border border-border/60 bg-background px-3 py-2 text-xs text-muted-foreground"
                >
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>{tip.message}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 3 — highlight & animatie */}
      <section
        aria-label="Link highlight"
        className={cn(
          "space-y-3 rounded-2xl border bg-background p-4 transition-colors",
          focusHighlight ? "border-foreground" : "border-border",
        )}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" aria-hidden />
          <h3 className="text-sm font-medium">Highlight &amp; animatie</h3>
        </div>

        <div className="space-y-2">
          <label className="input-label" htmlFor="coach-target">
            Primaire CTA
          </label>
          <Select
            value={prefs.highlightBlockId ?? "none"}
            onValueChange={(v) => setPref("highlightBlockId", v === "none" ? null : v)}
          >
            <SelectTrigger id="coach-target" className="h-11 rounded-xl">
              <SelectValue placeholder="Kies een link" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Geen link uitgelicht</SelectItem>
              {linkOptions.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.label || b.kind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <span className="input-label">Highlight-stijl</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {HIGHLIGHT_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                title={s.note}
                onClick={() => setPref("highlightStyle", s.id)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-xs transition-colors",
                  prefs.highlightStyle === s.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:bg-secondary",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {HIGHLIGHT_STYLES.find((s) => s.id === prefs.highlightStyle)?.note}
          </p>
        </div>

        <div className="space-y-2">
          <label className="input-label" htmlFor="coach-badge">
            Badge op de knop
          </label>
          <Input
            id="coach-badge"
            value={target?.badge ?? ""}
            maxLength={20}
            disabled={!target}
            placeholder={target ? "Nieuw · Populairst · Tip" : "Kies eerst een link"}
            onChange={(e) => target && onUpdateBlock(target.id, { badge: e.target.value || undefined })}
            className="input-field h-11 rounded-xl"
          />
          <div className="flex flex-wrap gap-1.5">
            {["Nieuw", "Populairst", "Tip"].map((b) => (
              <button
                key={b}
                type="button"
                disabled={!target}
                onClick={() => target && onUpdateBlock(target.id, { badge: b })}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] transition-colors hover:bg-secondary disabled:opacity-40"
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
