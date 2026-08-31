import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Download,
  HeartHandshake,
  Mail,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { AppLayout } from "@/components/layout/AppLayout";
import { BUNNY_PATH } from "@/lib/site";

/**
 * Publieke marketingpagina van ROUT.
 *
 * Alles is statisch en server-renderbaar: geen tracking, geen client-side
 * meting, geen cookiemuur. De enige interacties zijn het claimveld en de
 * vCard-download van het officiële @rout profiel.
 */

const HANDLE_RE = /[^a-z0-9._-]/g;

/** Eerlijke vergelijking met de klassieke link-in-bio-diensten. */
const COMPARISON = [
  {
    feature: "🔒 Privacy",
    others: "Trackers, cookies & cookiemuren",
    rout: "Nul trackers, nul cookiemuren",
  },
  {
    feature: "⚡ QR-codes",
    others: "Rasterafbeelding, vaak achter een betaalmuur",
    rout: "Vector SVG/PDF-export voor echte print",
  },
  {
    feature: "📊 Statistieken",
    others: "Bezoekersprofielen per persoon",
    rout: "Geaggregeerde tellingen zonder cookies",
  },
  {
    feature: "🌐 Eigen domein",
    others: "Enkel in dure plannen",
    rout: "CNAME naar links.jouwdomein.be",
  },
  {
    feature: "📦 Je data",
    others: "Export beperkt of onmogelijk",
    rout: "Volledige .json-export in één klik",
  },
] as const;

const FEATURES = [
  {
    icon: Sparkles,
    eyebrow: "Soevereine profielen",
    title: "Schone URL's, elf luxe thema's, nul rommel",
    body: "Geverifieerde leden krijgen rout.be/naam, iedereen anders rout.be/u/alias. Glassmorphism-kaarten, serif-typografie en rustige animaties — geen banners, geen aanbevolen accounts, geen algoritme.",
    points: ["rout.be/naam of rout.be/u/alias", "11 luxe thema's", "0 % visuele rommel"],
  },
  {
    icon: BadgeCheck,
    eyebrow: "Verificatie",
    title: "Blauw vinkje én privacyschild",
    body: "Het blauwe vinkje bevestigt je identiteit via een bankoverschrijving of eID. Het privacyschild bevestigt enkel dat je een mens bent — zonder dat we je documenten bewaren, je gedrag volgen of iets doorverkopen.",
    points: ["Bank- of eID-verificatie", "Menselijkheidscheck zonder tracking", "Geen datahandel"],
  },
  {
    icon: Mail,
    eyebrow: "SecureShield™",
    title: "Je echte e-mailadres blijft van jou",
    body: "Krijg een relayadres op @rout.be of @u.rout.be. Alles wordt doorgestuurd naar je echte mailbox, die nergens zichtbaar is. Je betaalt per maand een fractie van een euro uit je prepaid saldo — geen abonnement.",
    points: ["naam@rout.be voor geverifieerde leden", "alias@u.rout.be voor iedereen", "€0,09 per maand"],
  },
  {
    icon: HeartHandshake,
    eyebrow: "Creator support",
    title: "Donaties zonder platformcommissie",
    body: "Geverifieerde makers zetten een donatiepagina open op rout.be/naam/donate. Betalen kan met Bancontact, iDEAL, Apple Pay, kaart of overschrijving — en wat je krijgt, blijft van jou.",
    points: ["0 % platformcommissie", "Lokale betaalmethodes", "Directe uitbetaling"],
  },
] as const;

const ROUT_VCARD = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  "FN:ROUT",
  "ORG:ROUT Sovereign Identity",
  "EMAIL;TYPE=INTERNET,WORK:hallo@rout.be",
  "URL:https://rout.be",
  "ADR;TYPE=WORK:;;Brussels;;;Belgium",
  "NOTE:Sovereign QR & Identity Infrastructure",
  "END:VCARD",
].join("\r\n");

const PROFILE_LINKS = [
  { label: "💻 GitHub Repository", href: "https://github.com/Routbe" },
  { label: "💬 Matrix / Fediverse Channel", href: "https://matrix.to/#/#rout:matrix.org" },
  { label: "✉️ Contact Team", href: "mailto:hallo@rout.be" },
] as const;

function downloadVcard() {
  const blob = new Blob([ROUT_VCARD], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "rout-contact.vcf";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Authentiek, interactief @rout profiel — geen dummy-persoon. */
function RoutProfileCard() {
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-foreground/5 blur-2xl" />
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-sm backdrop-blur">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          <span className="ml-2 truncate font-mono text-[10px] text-muted-foreground">
            rout.be/rout
          </span>
        </div>
        <div className="flex flex-col items-center px-5 py-7 text-center sm:px-6">
          <div className="relative">
            <img
              src={BUNNY_PATH}
              alt="Het officiële ROUT-embleem met het witte konijn"
              className="h-20 w-20 rounded-full border border-border bg-background object-contain p-3"
              loading="lazy"
            />
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card">
              <BadgeCheck className="h-4 w-4 text-primary" aria-hidden />
            </span>
          </div>
          <p className="mt-4 inline-flex items-center gap-1.5 font-serif text-lg font-medium text-foreground">
            ROUT
            <BadgeCheck className="h-4 w-4 text-primary" aria-label="Geverifieerd" />
          </p>
          <a
            href="https://rout.be"
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            rout.be/rout
          </a>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Sovereign QR &amp; Identity Infrastructure • Brussels, Belgium
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {["Verified Pro", "Sovereign Core", "Open Source"].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] tracking-wide text-muted-foreground"
              >
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-5 w-full space-y-2">
            {PROFILE_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer noopener"
                className="block rounded-xl border border-border bg-background/70 px-4 py-2.5 text-left text-xs text-foreground transition-colors hover:bg-accent"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={downloadVcard}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-90"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              📇 Contactkaart opslaan (.vcf)
            </button>
          </div>
          <p className="mt-6 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Made with ROUT
          </p>
        </div>
      </div>
    </div>
  );
}

function ComparisonMatrix() {
  return (
    <>
      {/* Desktop: vaste 3-koloms tabel */}
      <div className="mt-8 hidden overflow-hidden rounded-xl border border-border md:block">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="w-1/3 p-4 font-semibold">Functie</th>
              <th className="w-1/3 p-4 font-semibold">Klassieke link-tools</th>
              <th className="w-1/3 p-4 font-semibold">ROUT</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map((row) => (
              <tr key={row.feature} className="border-t border-border align-top">
                <td className="w-1/3 p-4 font-medium text-foreground">{row.feature}</td>
                <td className="w-1/3 p-4 text-muted-foreground">{row.others}</td>
                <td className="w-1/3 p-4 text-foreground">{row.rout}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobiel: verticale vergelijkingskaarten */}
      <div className="mt-8 block md:hidden">
        {COMPARISON.map((row) => (
          <div
            key={row.feature}
            className="mb-3 space-y-2 rounded-2xl border border-border/80 bg-card p-4 shadow-sm"
          >
            <p className="text-sm font-medium text-foreground">{row.feature}</p>
            <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
              <span className="mb-1 block text-[10px] uppercase tracking-wide">
                Klassieke tools
              </span>
              {row.others}
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-900 dark:text-emerald-200">
              <span className="mb-1 block text-[10px] uppercase tracking-wide">ROUT</span>
              {row.rout}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function HandleClaim() {
  const [value, setValue] = useState("");
  const handle = useMemo(() => value.toLowerCase().replace(HANDLE_RE, "").slice(0, 30), [value]);
  const target = handle
    ? `/auth?redirect=${encodeURIComponent(`/dashboard/profile?handle=${handle}`)}`
    : "/auth";

  return (
    <form
      className="mt-8 w-full max-w-md"
      onSubmit={(event) => {
        event.preventDefault();
        window.location.assign(target);
      }}
    >
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm sm:flex-row sm:items-center">
        <label htmlFor="claim-handle" className="sr-only">
          Kies je handle
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-1 px-3">
          <span className="shrink-0 font-mono text-sm text-muted-foreground">rout.be/</span>
          <input
            id="claim-handle"
            value={handle}
            onChange={(event) => setValue(event.target.value)}
            placeholder="jouwnaam"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent py-2.5 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Claim handle
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <p className="mt-2 px-2 text-xs text-muted-foreground">
        Enkel kleine letters, cijfers, punt, streepje en liggend streepje. Nooit willekeurige
        cijfers achter je naam.
      </p>
    </form>
  );
}

const CARD = "rounded-3xl border border-border/80 bg-card/90 p-6 shadow-sm sm:p-8";

export default function About() {
  return (
    <AppLayout crumbs={[{ label: "Over ROUT" }]}>
      {/* pb-28 houdt de laatste CTA vrij van de footer en de zwevende knop */}
      <div className="mx-auto max-w-5xl px-4 py-12 pb-28 sm:px-6 sm:py-20">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="eyebrow">Soevereine digitale identiteit</span>
            <h1 className="mb-4 mt-2 font-serif text-2xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
              Het soevereine alternatief voor je digitale identiteit en link-in-bio.
            </h1>
            <p className="max-w-xl font-sans text-base text-muted-foreground sm:text-lg">
              Eén rustige pagina met je naam, je links, je verificatie en je donaties. Europese
              infrastructuur, geen advertenties, geen trackers, geen datahandel — en jij houdt de
              sleutels.
            </p>
            <HandleClaim />
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> 0 % data-oogst
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" aria-hidden /> 11 luxe thema's
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" aria-hidden /> SecureShield™ relay
              </span>
            </div>
          </div>
          <RoutProfileCard />
        </section>

        <section className="mt-20 grid gap-4 sm:mt-28 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, ...feature }) => (
            <article key={feature.title} className={CARD}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background">
                <Icon className="h-4 w-4 text-foreground" aria-hidden />
              </span>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {feature.eyebrow}
              </p>
              <h2 className="mt-1 font-serif text-xl font-semibold text-foreground sm:text-2xl">
                {feature.title}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
              <ul className="mt-4 space-y-1.5">
                {feature.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span
                      aria-hidden
                      className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-foreground/50"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className={`mt-16 ${CARD}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Onafhankelijk &amp; soeverein
          </p>
          <h2 className="mt-2 font-serif text-xl font-semibold text-foreground sm:text-2xl">
            Waarom we ROUT gebouwd hebben
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Je online identiteit hoort niet thuis bij een advertentiebedrijf. De meeste
              link-in-bio-diensten leven van meten, profileren en doorverkopen: elke klik wordt een
              datapunt, elk profiel een advertentieplaats. ROUT is het tegenovergestelde — geen
              trackers, geen cookiemuur, geen algoritme dat bepaalt wie jouw links te zien krijgt.
            </p>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              We draaien op eigen infrastructuur in Europa, bewaren enkel wat een profiel nodig
              heeft, en geven je alles terug wanneer je dat wil: één klik exporteert je volledige
              profiel als <code className="font-mono text-xs">.json</code>. Wil je weg? Je neemt je
              data, je QR-codes en je eigen domein gewoon mee.
            </p>
          </div>

          <ComparisonMatrix />
        </section>

        <section className="mt-10 rounded-3xl border border-border bg-foreground p-6 text-center text-background shadow-sm sm:p-8">
          <h2 className="font-serif text-xl font-semibold sm:text-2xl">
            Claim jouw soevereine handle
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm opacity-80">
            rout.be/jouwnaam — gratis, zonder tracking, met vector-QR en eigen domein wanneer je
            eraan toe bent.
          </p>
          <Link
            to="/auth"
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-background px-6 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
          >
            Claim je handle
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>

        <section className={`mt-10 text-center ${CARD}`}>
          <h2 className="font-serif text-xl font-semibold text-foreground sm:text-2xl">
            Klaar om je naam te claimen?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Gratis beginnen, later verifiëren. Je profiel blijft van jou — exporteerbaar,
            verwijderbaar en zonder platformcommissie op wat je verdient.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Maak je profiel
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/verify"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Hoe verificatie werkt
            </Link>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
