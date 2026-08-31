/**
 * ROUT Design Studio — thema-presets, wallpapers, knopstijlen, typografie en
 * footer/branding. Alles leeft als extra velden binnen `profiles.display_prefs`
 * (zie `profile-display.ts`), zodat er geen migratie nodig is per knopje.
 */

export type WallpaperType = "theme" | "solid" | "gradient" | "image";
export type ButtonVariant = "fill" | "outline" | "glass" | "hard";
export type ButtonRadius = "pill" | "rounded" | "sharp";
export type FontPairing = "modern" | "serif" | "mono" | "display";
export type SocialPosition = "top" | "bottom" | "footer";

export interface ProfileDesignPrefs {
  /** Custom mode: pas als dit aanstaat overschrijven de knoppen hieronder het preset. */
  customDesign: boolean;
  wallpaperType: WallpaperType;
  wallpaperColor: string | null;
  /** Id uit `GRADIENT_PRESETS`. */
  wallpaperGradient: string;
  wallpaperImageUrl: string | null;
  /** 0–24 px blur over de achtergrondafbeelding. */
  wallpaperBlur: number;
  /** 0–90 % zwarte overlay over de achtergrondafbeelding. */
  wallpaperOverlay: number;
  buttonVariant: ButtonVariant;
  buttonRadius: ButtonRadius;
  buttonColor: string | null;
  buttonTextColor: string | null;
  fontPairing: FontPairing;
  /** Basis-lettergrootte in procenten (85–125). */
  fontScale: number;
  titleColor: string | null;
  footerTagline: string | null;
  /** "Powered by ROUT"-badge tonen (Pro-leden mogen dit uitzetten). */
  showRoutBadge: boolean;
  socialPosition: SocialPosition;
}

export const DEFAULT_DESIGN_PREFS: ProfileDesignPrefs = {
  customDesign: false,
  wallpaperType: "theme",
  wallpaperColor: null,
  wallpaperGradient: "obsidian",
  wallpaperImageUrl: null,
  wallpaperBlur: 0,
  wallpaperOverlay: 40,
  buttonVariant: "fill",
  buttonRadius: "rounded",
  buttonColor: null,
  buttonTextColor: null,
  fontPairing: "modern",
  fontScale: 100,
  titleColor: null,
  footerTagline: null,
  showRoutBadge: true,
  socialPosition: "top",
};

/* ------------------------------------------------------------ presets */

/** Curated ROUT luxury themes — een klik zet thema + knoppen + typografie. */
export const ROUT_PRESETS: {
  id: string;
  label: string;
  themeId: string;
  cardStyle: string;
  design: Partial<ProfileDesignPrefs>;
}[] = [
  {
    id: "noir",
    label: "Noir",
    themeId: "noir",
    cardStyle: "bordered",
    design: { wallpaperType: "solid", wallpaperColor: "#0d0d0d", buttonVariant: "outline", buttonRadius: "sharp", fontPairing: "modern" },
  },
  {
    id: "paper",
    label: "Paper",
    themeId: "papier",
    cardStyle: "solid",
    design: { wallpaperType: "solid", wallpaperColor: "#f7f4ef", buttonVariant: "fill", buttonRadius: "rounded", fontPairing: "serif" },
  },
  {
    id: "serene",
    label: "Serene Glass",
    themeId: "arctic",
    cardStyle: "glass",
    design: { wallpaperType: "gradient", wallpaperGradient: "nordic", buttonVariant: "glass", buttonRadius: "pill", fontPairing: "modern" },
  },
  {
    id: "emerald",
    label: "Emerald Core",
    themeId: "emerald",
    cardStyle: "neon",
    design: { wallpaperType: "gradient", wallpaperGradient: "emerald", buttonVariant: "glass", buttonRadius: "rounded", fontPairing: "display" },
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    themeId: "cyberpunk",
    cardStyle: "neon",
    design: { wallpaperType: "gradient", wallpaperGradient: "cyber", buttonVariant: "hard", buttonRadius: "sharp", fontPairing: "mono" },
  },
  {
    id: "velvet",
    label: "Velvet",
    themeId: "mocha",
    cardStyle: "pill",
    design: { wallpaperType: "gradient", wallpaperGradient: "velvet", buttonVariant: "fill", buttonRadius: "pill", fontPairing: "serif" },
  },
];

/** Kant-en-klare lineaire/mesh gradients voor de achtergrond. */
export const GRADIENT_PRESETS: { id: string; label: string; css: string }[] = [
  {
    id: "obsidian",
    label: "Dark Obsidian",
    css: "radial-gradient(60rem 40rem at 20% 0%, #1f2937 0%, transparent 60%), linear-gradient(180deg, #0b0b0f 0%, #05050a 100%)",
  },
  {
    id: "sunrise",
    label: "Sunrise",
    css: "linear-gradient(160deg, #ff9a5a 0%, #ff5f6d 45%, #3b1c4a 100%)",
  },
  {
    id: "nordic",
    label: "Nordic Mist",
    css: "radial-gradient(50rem 30rem at 10% 10%, #dbeafe 0%, transparent 60%), linear-gradient(180deg, #f8fbff 0%, #e6eef7 100%)",
  },
  {
    id: "emerald",
    label: "Emerald Depth",
    css: "radial-gradient(45rem 30rem at 80% 0%, #10b98155 0%, transparent 60%), linear-gradient(180deg, #04211a 0%, #021410 100%)",
  },
  {
    id: "cyber",
    label: "Cyber Violet",
    css: "radial-gradient(40rem 28rem at 15% 5%, #a855f766 0%, transparent 60%), radial-gradient(38rem 26rem at 85% 30%, #22d3ee44 0%, transparent 62%), #08060f",
  },
  {
    id: "velvet",
    label: "Velvet Mocha",
    css: "radial-gradient(45rem 30rem at 50% 0%, #c0845766 0%, transparent 60%), linear-gradient(180deg, #1b1310 0%, #0d0806 100%)",
  },
];

export const gradientCss = (id: string) =>
  (GRADIENT_PRESETS.find((g) => g.id === id) ?? GRADIENT_PRESETS[0]!).css;

/* -------------------------------------------------------- typography */

export const FONT_PAIRINGS: {
  id: FontPairing;
  label: string;
  note: string;
  heading: string;
  body: string;
}[] = [
  {
    id: "modern",
    label: "Modern Sans",
    note: "Inter + DM Sans",
    heading: "'Inter', ui-sans-serif, system-ui, sans-serif",
    body: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
  },
  {
    id: "serif",
    label: "Elegant Serif",
    note: "Playfair Display + Lora",
    heading: "'Playfair Display', ui-serif, Georgia, serif",
    body: "'Lora', ui-serif, Georgia, serif",
  },
  {
    id: "mono",
    label: "Monospace Tech",
    note: "JetBrains Mono + Geist Mono",
    heading: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
    body: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace",
  },
  {
    id: "display",
    label: "Display Bold",
    note: "Cabinet Grotesk + Plus Jakarta Sans",
    heading: "'Cabinet Grotesk', 'Space Grotesk', ui-sans-serif, sans-serif",
    body: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  },
];

export const fontPairingOf = (id: FontPairing) =>
  FONT_PAIRINGS.find((f) => f.id === id) ?? FONT_PAIRINGS[0]!;

export const BUTTON_VARIANTS: { id: ButtonVariant; label: string; note: string }[] = [
  { id: "fill", label: "Fill", note: "Effen vlak met contrasterende tekst" },
  { id: "outline", label: "Outline", note: "Transparant met randlijn" },
  { id: "glass", label: "Glassmorphism", note: "Doorschijnend met blur" },
  { id: "hard", label: "Hard Shadow", note: "Retro slagschaduw" },
];

export const BUTTON_RADII: { id: ButtonRadius; label: string; px: number }[] = [
  { id: "pill", label: "Pill", px: 999 },
  { id: "rounded", label: "Rounded", px: 14 },
  { id: "sharp", label: "Sharp", px: 0 },
];

export const SOCIAL_POSITIONS: { id: SocialPosition; label: string }[] = [
  { id: "top", label: "Bovenaan profiel" },
  { id: "bottom", label: "Onderaan profiel" },
  { id: "footer", label: "In de voettekst" },
];

export const WALLPAPER_TYPES: { id: WallpaperType; label: string }[] = [
  { id: "theme", label: "Volg thema" },
  { id: "solid", label: "Effen kleur" },
  { id: "gradient", label: "Gradient" },
  { id: "image", label: "Eigen afbeelding" },
];

/* ------------------------------------------------------------- styles */

/** Achtergrondlagen voor de gekozen wallpaper. `null` = val terug op het thema. */
export function wallpaperStyle(
  d: ProfileDesignPrefs,
  theme: { bg: string },
): Record<string, string> | null {
  if (!d.customDesign || d.wallpaperType === "theme") return null;
  if (d.wallpaperType === "solid") return { background: d.wallpaperColor ?? theme.bg };
  if (d.wallpaperType === "gradient") return { background: gradientCss(d.wallpaperGradient) };
  if (d.wallpaperType === "image" && d.wallpaperImageUrl) {
    return {
      backgroundImage: `url("${d.wallpaperImageUrl}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    };
  }
  return null;
}

/** Overlay (blur + verduistering) bovenop een achtergrondafbeelding. */
export function wallpaperOverlayStyle(d: ProfileDesignPrefs): Record<string, string> | null {
  if (!d.customDesign || d.wallpaperType !== "image" || !d.wallpaperImageUrl) return null;
  return {
    backdropFilter: `blur(${d.wallpaperBlur}px)`,
    background: `rgba(0,0,0,${(d.wallpaperOverlay / 100).toFixed(2)})`,
  };
}

/** Knopstijl uit de custom designinstellingen. `null` = val terug op het thema. */
export function designButtonStyle(
  d: ProfileDesignPrefs,
  theme: { bg: string; card: string; text: string; border: string; accent?: string },
): Record<string, string | number> | null {
  if (!d.customDesign) return null;
  const radius = (BUTTON_RADII.find((r) => r.id === d.buttonRadius) ?? BUTTON_RADII[1]!).px;
  const accent = d.buttonColor ?? theme.accent ?? theme.card;
  const text = d.buttonTextColor ?? theme.text;
  const base: Record<string, string | number> = { borderRadius: radius };
  switch (d.buttonVariant) {
    case "outline":
      return { ...base, background: "transparent", color: text, border: `1px solid ${accent}` };
    case "glass":
      return {
        ...base,
        background: `color-mix(in oklab, ${accent} 18%, transparent)`,
        color: text,
        border: `1px solid color-mix(in oklab, ${text} 20%, transparent)`,
        backdropFilter: "blur(14px) saturate(140%)",
      };
    case "hard":
      return {
        ...base,
        background: accent,
        color: d.buttonTextColor ?? theme.bg,
        border: `2px solid ${theme.text}`,
        boxShadow: `4px 4px 0px ${theme.text}`,
      };
    default:
      return {
        ...base,
        background: accent,
        color: d.buttonTextColor ?? theme.bg,
        border: "1px solid transparent",
      };
  }
}

/* --------------------------------------------------------- normalizer */

const num = (value: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
};

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

const hex = (value: unknown): string | null =>
  typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value.trim()) ? value.trim() : null;

const text = (value: unknown, max: number): string | null => {
  if (typeof value !== "string") return null;
  const clean = value.trim().slice(0, max);
  return clean || null;
};

const httpsUrl = (value: unknown): string | null =>
  typeof value === "string" && /^https?:\/\//.test(value.trim()) ? value.trim() : null;

/** Leest de designvelden veilig uit een (mogelijk oude) display_prefs-blob. */
export function normalizeDesignPrefs(r: Record<string, unknown>): ProfileDesignPrefs {
  return {
    customDesign: Boolean(r["customDesign"]),
    wallpaperType: pick(r["wallpaperType"], ["theme", "solid", "gradient", "image"] as const, "theme"),
    wallpaperColor: hex(r["wallpaperColor"]),
    wallpaperGradient: GRADIENT_PRESETS.some((g) => g.id === r["wallpaperGradient"])
      ? (r["wallpaperGradient"] as string)
      : "obsidian",
    wallpaperImageUrl: httpsUrl(r["wallpaperImageUrl"]),
    wallpaperBlur: num(r["wallpaperBlur"], 0, 24, 0),
    wallpaperOverlay: num(r["wallpaperOverlay"], 0, 90, 40),
    buttonVariant: pick(r["buttonVariant"], ["fill", "outline", "glass", "hard"] as const, "fill"),
    buttonRadius: pick(r["buttonRadius"], ["pill", "rounded", "sharp"] as const, "rounded"),
    buttonColor: hex(r["buttonColor"]),
    buttonTextColor: hex(r["buttonTextColor"]),
    fontPairing: pick(r["fontPairing"], ["modern", "serif", "mono", "display"] as const, "modern"),
    fontScale: num(r["fontScale"], 85, 125, 100),
    titleColor: hex(r["titleColor"]),
    footerTagline: text(r["footerTagline"], 80),
    showRoutBadge: r["showRoutBadge"] === undefined ? true : Boolean(r["showRoutBadge"]),
    socialPosition: pick(r["socialPosition"], ["top", "bottom", "footer"] as const, "top"),
  };
}
