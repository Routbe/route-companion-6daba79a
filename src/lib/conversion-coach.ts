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
