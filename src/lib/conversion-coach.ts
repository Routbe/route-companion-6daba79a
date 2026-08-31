/**
 * Conversie-coach: kleine, deterministische regels die de Studio inline toont
 * bij de linklijst. Client-safe en puur, zodat het ook testbaar blijft.
 */
import type { ProfileBlock } from "./profile";

export interface ConversionTip {
  id: string;
  tone: "warning" | "hint" | "info";
  message: string;
}

/** Titels die niets beloven — bezoekers klikken hier zelden op. */
const GENERIC_TITLES = [
  "blog",
  "website",
  "shop",
  "link",
  "eigen link",
  "instagram",
  "info",
  "hier",
  "klik hier",
  "meer",
];

export const IDEAL_LINK_MAX = 6;

export function isGenericTitle(label: string): boolean {
  const clean = label.trim().toLowerCase();
  if (!clean) return true;
  return GENERIC_TITLES.includes(clean);
}

export function conversionTips(blocks: ProfileBlock[]): ConversionTip[] {
  const active = blocks.filter((block) => !block.hidden);
  const tips: ConversionTip[] = [];

  if (active.length > IDEAL_LINK_MAX) {
    tips.push({
      id: "link-count",
      tone: "warning",
      message: `⚠️ Tip: je hebt ${active.length} actieve links. Beperk je tot 3–6 links voor maximale conversie.`,
    });
  }

  const generic = active.filter((block) => isGenericTitle(block.label));
  if (generic.length > 0) {
    const names = generic
      .slice(0, 3)
      .map((block) => `“${block.label.trim() || "zonder titel"}”`)
      .join(", ");
    tips.push({
      id: "copy-quality",
      tone: "hint",
      message: `💡 Schrijf actiegerichter bij ${names}: bijv. “Bekijk mijn nieuwste aanbod”.`,
    });
  }

  if (active.length > 1) {
    tips.push({
      id: "drag-hint",
      tone: "info",
      message:
        "↕️ Sleep je belangrijkste link naar boven — de bovenste link krijgt tot 70% van alle kliks.",
    });
  }

  return tips;
}

/* ------------------------------------------------------------------ */
/* Profielaudit — conversiescore (0–100) + concrete actiepunten        */
/* ------------------------------------------------------------------ */

/** Directe actie die een quick-fix kaart triggert in de Studio. */
export type CoachAction =
  | "avatar"
  | "bio"
  | "identity"
  | "conversion"
  | "highlight"
  | "share";

export interface ProfileHealthInput {
  avatarUrl?: string | null;
  bio?: string | null;
  /** Geverifieerde handle of actieve privé-alias. */
  verified?: boolean;
  alias?: string | null;
  metaTitle?: string | null;
  ogImageUrl?: string | null;
  highlightStyle?: string | null;
  highlightBlockId?: string | null;
}

export interface AuditCriterion {
  id: string;
  points: number;
  passed: boolean;
  title: string;
  rationale: string;
  actionLabel: string;
  action: CoachAction;
}

export interface ProfileHealth {
  score: number;
  tone: "low" | "mid" | "high";
  verdict: string;
  criteria: AuditCriterion[];
  failed: AuditCriterion[];
}

/** Blokken die als hoogwaardig conversiecomponent tellen. */
export const CONVERSION_KINDS = [
  "booking",
  "booking_request",
  "vcard",
  "contact_form",
  "shop",
] as const;

/**
 * Pure audit van een profiel. `links` zijn de zichtbare linkblokken,
 * `components` de blokken waarin conversiecomponenten gezocht worden
 * (standaard dezelfde lijst).
 */
export function evaluateProfileHealth(
  profile: ProfileHealthInput,
  links: ProfileBlock[],
  components: ProfileBlock[] = links,
): ProfileHealth {
  const active = links.filter((b) => !b.hidden);
  const activeComponents = components.filter((b) => !b.hidden);
  const conversionKinds = new Set<string>(CONVERSION_KINDS);

  const criteria: AuditCriterion[] = [
    {
      id: "avatar",
      points: 15,
      passed: Boolean(profile.avatarUrl && profile.avatarUrl.trim()),
      title: "🖼️ Geen profielfoto",
      rationale:
        "Een gezicht of logo maakt je profiel herkenbaar en verhoogt het vertrouwen meteen.",
      actionLabel: "📸 Avatar Toevoegen",
      action: "avatar",
    },
    {
      id: "bio",
      points: 10,
      passed: (profile.bio ?? "").trim().length > 20,
      title: "✍️ Je bio is te kort",
      rationale:
        "Vertel in één zin wie je bent en wat bezoekers hier vinden — minimaal 20 tekens.",
      actionLabel: "📝 Bio Schrijven",
      action: "bio",
    },
    {
      id: "identity",
      points: 15,
      passed: Boolean(profile.verified) || Boolean((profile.alias ?? "").trim()),
      title: "🪪 Geen geverifieerde identiteit of alias",
      rationale:
        "Een geverifieerde handle of actieve alias laat bezoekers zien dat de link echt van jou is.",
      actionLabel: "✅ Identiteit Instellen",
      action: "identity",
    },
    {
      id: "conversion",
      points: 25,
      passed: activeComponents.some((b) => conversionKinds.has(b.kind)),
      title: "🔥 Geen hoofddoel ingesteld",
      rationale:
        "Bezoekers weten niet wat ze moeten doen. Voeg een Boekings-, vCard- of Contactformulier toe.",
      actionLabel: "⚡ Boeking Component Toevoegen",
      action: "conversion",
    },
    {
      id: "highlight",
      points: 15,
      passed:
        Boolean(profile.highlightStyle) &&
        profile.highlightStyle !== "none" &&
        Boolean(profile.highlightBlockId) &&
        active.some((b) => b.id === profile.highlightBlockId),
      title: "✨ Geen primaire CTA uitgelicht",
      rationale:
        "Geef je belangrijkste knop een glow of pulse zodat het oog er direct naartoe gaat.",
      actionLabel: "🎯 Highlight Kiezen",
      action: "highlight",
    },
    {
      id: "share",
      points: 20,
      passed:
        Boolean((profile.metaTitle ?? "").trim()) &&
        Boolean((profile.ogImageUrl ?? "").trim()),
      title: "💬 WhatsApp share preview mist",
      rationale:
        "Zonder eigen titel en afbeelding ziet je link er kaal uit wanneer hij gedeeld wordt.",
      actionLabel: "📝 Meta Gegevens Invullen",
      action: "share",
    },
  ];

  const score = criteria.reduce((sum, c) => sum + (c.passed ? c.points : 0), 0);
  const tone = score >= 80 ? "high" : score >= 50 ? "mid" : "low";
  const verdict =
    tone === "high"
      ? "Conversie-Magneet — Maximale impact!"
      : tone === "mid"
        ? "Groeiprofiel — Bijna optimaal!"
        : "Passief profiel — Voeg conversietriggers toe";

  return { score, tone, verdict, criteria, failed: criteria.filter((c) => !c.passed) };
}
