/**
 * Studio → Design: presets, wallpaper, knoppen, typografie en footer/branding.
 * Alle wijzigingen gaan rechtstreeks naar de state van de ProfileEditor, zodat
 * het sticky voorbeeld live meebeweegt.
 */
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PROFILE_THEMES, themeOf } from "@/lib/profile";
import {
  BUTTON_RADII,
  BUTTON_VARIANTS,
  FONT_PAIRINGS,
  GRADIENT_PRESETS,
  ROUT_PRESETS,
  SOCIAL_POSITIONS,
  WALLPAPER_TYPES,
  fontPairingOf,
  gradientCss,
  type ProfileDisplayPrefs,
} from "@/lib/profile-display";

function ColorField({
  label,
  value,
  onChange,
  placeholder = "#0d0d0d",
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="input-label">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={value ?? "#111111"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-1"
        />
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder={placeholder}
          spellCheck={false}
          className="h-10 font-mono text-xs"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 shrink-0 text-xs"
            onClick={() => onChange(null)}
          >
            Wis
          </Button>
        )}
      </div>
    </div>
  );
}

const Pill = ({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "h-10 shrink-0 rounded-full border px-3 text-xs font-medium transition-colors",
      active ? "border-primary/50 bg-primary/10" : "border-border",
    )}
  >
    {children}
  </button>
);

export function DesignTabEditor({
  prefs,
  setPref,
  theme,
  setTheme,
  cardStyle,
  setCardStyle,
  verified,
}: {
  prefs: ProfileDisplayPrefs;
  setPref: <K extends keyof ProfileDisplayPrefs>(key: K, value: ProfileDisplayPrefs[K]) => void;
  theme: string;
  setTheme: (id: string) => void;
  cardStyle: string;
  setCardStyle: (id: string) => void;
  verified: boolean;
}) {
  const t = themeOf(theme);
  const custom = prefs.customDesign;

  const applyPreset = (id: string) => {
    const preset = ROUT_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setTheme(preset.themeId);
    setCardStyle(preset.cardStyle);
    for (const [key, value] of Object.entries(preset.design)) {
      setPref(key as keyof ProfileDisplayPrefs, value as never);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1 — Presets & custom mode */}
      <section className="space-y-3">
        <div>
          <p className="text-sm font-medium">Preset-thema&apos;s</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Eén klik zet kleuren, knoppen en typografie in één luxe ROUT-stijl.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ROUT_PRESETS.map((p) => {
            const pt = themeOf(p.themeId);
            const active = theme === p.themeId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={cn(
                  "flex flex-col gap-2 rounded-xl border p-2.5 text-left transition-colors",
                  active ? "border-primary ring-1 ring-primary" : "border-border",
                )}
              >
                <span
                  className="block h-10 w-full rounded-lg border border-border"
                  style={{
                    background: p.design.wallpaperGradient
                      ? gradientCss(p.design.wallpaperGradient)
                      : (p.design.wallpaperColor ?? pt.bg),
                  }}
                  aria-hidden
                />
                <span className="text-xs font-medium">{p.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">Custom mode</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ontgrendel wallpaper, knopstijl, typografie en footer-controle.
            </p>
          </div>
          <Switch
            aria-label="Custom mode"
            checked={custom}
            onCheckedChange={(v) => setPref("customDesign", v)}
          />
        </div>
      </section>

      <div
        className={cn(
          "space-y-8 transition-opacity",
          custom ? "opacity-100" : "pointer-events-none opacity-50",
        )}
        aria-disabled={!custom}
      >
        {/* 2 — Wallpaper */}
        <section className="space-y-3 border-t border-border pt-6">
          <p className="text-sm font-medium">🖼️ Wallpaper &amp; achtergrond</p>
          <div className="flex flex-wrap gap-2">
            {WALLPAPER_TYPES.map((o) => (
              <Pill
                key={o.id}
                active={prefs.wallpaperType === o.id}
                onClick={() => setPref("wallpaperType", o.id)}
              >
                {o.label}
              </Pill>
            ))}
          </div>

          {prefs.wallpaperType === "solid" && (
            <ColorField
              label="Achtergrondkleur"
              value={prefs.wallpaperColor}
              onChange={(v) => setPref("wallpaperColor", v)}
              placeholder={t.bg}
            />
          )}

          {prefs.wallpaperType === "gradient" && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {GRADIENT_PRESETS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setPref("wallpaperGradient", g.id)}
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border p-2.5 text-left transition-colors",
                    prefs.wallpaperGradient === g.id
                      ? "border-primary ring-1 ring-primary"
                      : "border-border",
                  )}
                >
                  <span
                    className="block h-10 w-full rounded-lg border border-border"
                    style={{ background: g.css }}
                    aria-hidden
                  />
                  <span className="text-xs font-medium">{g.label}</span>
                </button>
              ))}
            </div>
          )}

          {prefs.wallpaperType === "image" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <p className="input-label">Afbeeldings-URL (https)</p>
                <Input
                  value={prefs.wallpaperImageUrl ?? ""}
                  onChange={(e) => setPref("wallpaperImageUrl", e.target.value || null)}
                  placeholder="https://…/wallpaper.jpg"
                  spellCheck={false}
                  className="h-10 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <p className="input-label">Blur ({prefs.wallpaperBlur}px)</p>
                <Slider
                  value={[prefs.wallpaperBlur]}
                  min={0}
                  max={24}
                  step={1}
                  onValueChange={([v]) => setPref("wallpaperBlur", v ?? 0)}
                />
              </div>
              <div className="space-y-1.5">
                <p className="input-label">Donkere overlay ({prefs.wallpaperOverlay}%)</p>
                <Slider
                  value={[prefs.wallpaperOverlay]}
                  min={0}
                  max={90}
                  step={5}
                  onValueChange={([v]) => setPref("wallpaperOverlay", v ?? 0)}
                />
              </div>
            </div>
          )}
        </section>

        {/* 3 — Knoppen */}
        <section className="space-y-3 border-t border-border pt-6">
          <p className="text-sm font-medium">🔘 Knopstijl &amp; vorm</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {BUTTON_VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setPref("buttonVariant", v.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  prefs.buttonVariant === v.id
                    ? "border-primary ring-1 ring-primary"
                    : "border-border",
                )}
              >
                <p className="text-xs font-medium">{v.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{v.note}</p>
              </button>
            ))}
          </div>
          <p className="input-label pt-2">Hoekafronding</p>
          <div className="flex flex-wrap gap-2">
            {BUTTON_RADII.map((r) => (
              <Pill
                key={r.id}
                active={prefs.buttonRadius === r.id}
                onClick={() => setPref("buttonRadius", r.id)}
              >
                {r.label}
              </Pill>
            ))}
          </div>
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <ColorField
              label="Knopkleur"
              value={prefs.buttonColor}
              onChange={(v) => setPref("buttonColor", v)}
            />
            <ColorField
              label="Knoptekstkleur"
              value={prefs.buttonTextColor}
              onChange={(v) => setPref("buttonTextColor", v)}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Klassieke kaartstijl: {cardStyle} — wordt overschreven zolang custom mode aanstaat.
          </p>
        </section>

        {/* 4 — Typografie */}
        <section className="space-y-3 border-t border-border pt-6">
          <p className="text-sm font-medium">🔤 Typografie</p>
          <Select
            value={prefs.fontPairing}
            onValueChange={(v) => setPref("fontPairing", v as ProfileDisplayPrefs["fontPairing"])}
          >
            <SelectTrigger className="h-10 text-xs">
              <SelectValue placeholder="Kies een fontpaar" />
            </SelectTrigger>
            <SelectContent>
              {FONT_PAIRINGS.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.label} — {f.note}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="rounded-xl border border-border p-3">
            <p
              className="text-lg"
              style={{ fontFamily: fontPairingOf(prefs.fontPairing).heading }}
            >
              {fontPairingOf(prefs.fontPairing).label}
            </p>
            <p
              className="mt-1 text-xs text-muted-foreground"
              style={{ fontFamily: fontPairingOf(prefs.fontPairing).body }}
            >
              Zo leest je bio en je knoptekst op het publieke profiel.
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="input-label">Tekstgrootte ({prefs.fontScale}%)</p>
            <Slider
              value={[prefs.fontScale]}
              min={85}
              max={125}
              step={5}
              onValueChange={([v]) => setPref("fontScale", v ?? 100)}
            />
          </div>
          <ColorField
            label="Titelkleur"
            value={prefs.titleColor}
            onChange={(v) => setPref("titleColor", v)}
            placeholder={t.text}
          />
        </section>

        {/* 5 — Footer & branding */}
        <section className="space-y-3 border-t border-border pt-6">
          <p className="text-sm font-medium">🏷️ Footer &amp; branding</p>
          <div className="space-y-1.5">
            <p className="input-label">Footer-tagline</p>
            <Input
              value={prefs.footerTagline ?? ""}
              maxLength={80}
              onChange={(e) => setPref("footerTagline", e.target.value || null)}
              placeholder="Made in Brussels • 2026"
              className="h-10 text-xs"
            />
          </div>
          <div className="flex items-start justify-between gap-4 border-t border-border pt-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">Toon &ldquo;Powered by ROUT&rdquo;-badge</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {verified
                  ? "Als geverifieerd lid mag je de attributie uitzetten."
                  : "Gratis profielen tonen de badge altijd."}
              </p>
            </div>
            <Switch
              aria-label="Powered by ROUT tonen"
              disabled={!verified}
              checked={verified ? prefs.showRoutBadge : true}
              onCheckedChange={(v) => setPref("showRoutBadge", v)}
            />
          </div>
          <p className="input-label pt-2">Positie social-iconen</p>
          <div className="flex flex-wrap gap-2">
            {SOCIAL_POSITIONS.map((o) => (
              <Pill
                key={o.id}
                active={prefs.socialPosition === o.id}
                onClick={() => setPref("socialPosition", o.id)}
              >
                {o.label}
              </Pill>
            ))}
          </div>
        </section>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Basisthema: {PROFILE_THEMES.find((x) => x.id === theme)?.label ?? theme}
      </p>
    </div>
  );
}
