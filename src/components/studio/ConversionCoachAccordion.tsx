/**
 * Conversie Coach & Optimalisatie — native Studio-paneel.
 *
 * A) conversiescore-gauge, B) dynamische quick-fix kaarten,
 * C) CTA highlight & animatiestudio (synct live met de preview),
 * D) WhatsApp / social share preview inspector met inline velden.
 */
import { useMemo, useState } from "react";
import { AlertTriangle, Lightbulb, MoveVertical, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  conversionTips,
  evaluateProfileHealth,
  type AuditCriterion,
} from "@/lib/conversion-coach";
import type { ProfileBlock } from "@/lib/profile";
import { HIGHLIGHT_STYLES, type ProfileDisplayPrefs } from "@/lib/profile-display";
import { cn } from "@/lib/utils";

const TIP_ICON = {
  warning: AlertTriangle,
  hint: Lightbulb,
  info: MoveVertical,
} as const;

const BAR_TONE = {
  low: "bg-red-500",
  mid: "bg-amber-500",
  high: "bg-emerald-500",
} as const;

const TEXT_TONE = {
  low: "text-red-600 dark:text-red-400",
  mid: "text-amber-600 dark:text-amber-400",
  high: "text-emerald-600 dark:text-emerald-400",
} as const;

export interface ConversionCoachAccordionProps {
  blocks: ProfileBlock[];
  prefs: ProfileDisplayPrefs;
  avatarUrl: string | null;
  bio: string | null;
  /** Publieke URL-weergave, bv. "rout.be/anna". */
  publicUrl: string;
  displayName: string;
  verified: boolean;
  alias: string | null;
  setPref: <K extends keyof ProfileDisplayPrefs>(key: K, value: ProfileDisplayPrefs[K]) => void;
  onUpdateBlock: (id: string, patch: Partial<ProfileBlock>) => void;
  /** Opent de component-kiezer (booking / vCard / contactformulier). */
  onAddConversionBlock: () => void;
  /** Springt naar de identiteitsinstellingen. */
  onOpenIdentity: () => void;
  /** Springt naar de avatar/bio-velden. */
  onOpenProfileBasics: () => void;
}

export function ConversionCoachAccordion({
  blocks,
  prefs,
  avatarUrl,
  bio,
  publicUrl,
  displayName,
  verified,
  alias,
  setPref,
  onUpdateBlock,
  onAddConversionBlock,
  onOpenIdentity,
  onOpenProfileBasics,
}: ConversionCoachAccordionProps) {
  const health = useMemo(
    () =>
      evaluateProfileHealth(
        {
          avatarUrl,
          bio,
          verified,
          alias,
          metaTitle: prefs.metaTitle,
          ogImageUrl: prefs.ogImageUrl,
          highlightStyle: prefs.highlightStyle,
          highlightBlockId: prefs.highlightBlockId,
        },
        blocks,
      ),
    [avatarUrl, bio, verified, alias, prefs, blocks],
  );
  const tips = useMemo(() => conversionTips(blocks), [blocks]);
  const [focus, setFocus] = useState<"highlight" | "share" | null>(null);

  const linkOptions = blocks.filter((b) => !b.hidden && b.kind !== "spacer" && b.kind !== "text");
  const target = linkOptions.find((b) => b.id === prefs.highlightBlockId) ?? null;

  const runAction = (c: AuditCriterion) => {
    switch (c.action) {
      case "conversion":
        onAddConversionBlock();
        break;
      case "identity":
        onOpenIdentity();
        break;
      case "avatar":
      case "bio":
        onOpenProfileBasics();
        break;
      case "highlight":
        setFocus("highlight");
        break;
      case "share":
        setFocus("share");
        break;
    }
  };

  const previewTitle = prefs.metaTitle?.trim() || displayName || publicUrl;
  const previewDesc =
    prefs.metaDescription?.trim() || bio?.trim() || "Alles van mij op één plek.";

  return (
    <div className="space-y-5">
      {/* A — score gauge */}
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
            className={cn("h-full rounded-full transition-all duration-500", BAR_TONE[health.tone])}
            style={{ width: `${health.score}%` }}
          />
        </div>
        <p className={cn("text-xs font-medium", TEXT_TONE[health.tone])}>{health.verdict}</p>
      </section>

      {/* B — quick fixes */}
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
                  <p className="text-xs text-muted-foreground">{c.rationale}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="shrink-0 rounded-xl"
                  onClick={() => runAction(c)}
                >
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

      {/* C — highlight & animatie */}
      <section
        aria-label="CTA highlight studio"
        className={cn(
          "space-y-3 rounded-2xl border bg-background p-4 transition-colors",
          focus === "highlight" ? "border-foreground" : "border-border",
        )}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" aria-hidden />
          <h3 className="text-sm font-medium">CTA highlight &amp; animatie</h3>
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
          <span className="input-label">Animatiestijl</span>
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
            {HIGHLIGHT_STYLES.find((s) => s.id === prefs.highlightStyle)?.note} De preview past dit
            direct toe.
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
            placeholder={target ? "🔥 Populairst · ⚡ Boek nu" : "Kies eerst een link"}
            onChange={(e) =>
              target && onUpdateBlock(target.id, { badge: e.target.value || undefined })
            }
            className="input-field h-11 rounded-xl"
          />
          <div className="flex flex-wrap gap-1.5">
            {["🔥 Populairst", "⚡ Boek nu", "Nieuw", "Tip"].map((b) => (
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

      {/* D — share preview inspector */}
      <section
        aria-label="Share preview inspector"
        className={cn(
          "space-y-3 rounded-2xl border bg-background p-4 transition-colors",
          focus === "share" ? "border-foreground" : "border-border",
        )}
      >
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4" aria-hidden />
          <h3 className="text-sm font-medium">WhatsApp &amp; social preview</h3>
        </div>

        {/* mockup */}
        <div className="rounded-2xl bg-muted/60 p-3">
          <div className="ml-auto max-w-[19rem] overflow-hidden rounded-xl rounded-br-sm border border-border bg-background shadow-sm">
            {prefs.ogImageUrl ? (
              <img
                src={prefs.ogImageUrl}
                alt="Voorbeeld van je deelafbeelding"
                className="aspect-[1.91/1] w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex aspect-[1.91/1] w-full items-center justify-center bg-secondary text-[11px] text-muted-foreground">
                Geen deelafbeelding
              </div>
            )}
            <div className="space-y-0.5 p-3">
              <p className="truncate text-xs font-semibold">{previewTitle}</p>
              <p className="line-clamp-2 text-[11px] text-muted-foreground">{previewDesc}</p>
              <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
                {publicUrl}
              </p>
            </div>
          </div>
          <p className="pt-2 text-center text-[11px] text-muted-foreground">
            Zo ziet je link eruit in WhatsApp, iMessage en LinkedIn.
          </p>
        </div>

        <div className="space-y-2">
          <label className="input-label" htmlFor="coach-meta-title">
            OpenGraph titel
          </label>
          <Input
            id="coach-meta-title"
            value={prefs.metaTitle ?? ""}
            maxLength={70}
            placeholder={displayName || "Jouw naam — alles op één plek"}
            onChange={(e) => setPref("metaTitle", e.target.value || null)}
            className="input-field h-11 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <label className="input-label" htmlFor="coach-meta-desc">
            OpenGraph beschrijving
          </label>
          <Textarea
            id="coach-meta-desc"
            value={prefs.metaDescription ?? ""}
            maxLength={200}
            rows={2}
            placeholder="Boek direct een afspraak of bekijk mijn werk."
            onChange={(e) => setPref("metaDescription", e.target.value || null)}
            className="input-field rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <label className="input-label" htmlFor="coach-og-image">
            Deelafbeelding (URL)
          </label>
          <Input
            id="coach-og-image"
            type="url"
            inputMode="url"
            value={prefs.ogImageUrl ?? ""}
            placeholder="https://…/preview.jpg"
            onChange={(e) => setPref("ogImageUrl", e.target.value.trim() || null)}
            className="input-field h-11 rounded-xl"
          />
          <p className="text-[11px] text-muted-foreground">Aanbevolen: 1200 × 630 px.</p>
        </div>
      </section>
    </div>
  );
}
