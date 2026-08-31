import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Coins,
  Download,
  FileJson,
  Fingerprint,
  HeartHandshake,
  Mail,
  MapPin,
  Palette,
  QrCode,
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
 * meting, geen cookiemuur. De enige interacties zijn het claimveld, de
 * FAQ-accordeon en de vCard-download van het officiële @rout profiel.
 *
 * Opbouw: belofte → bewijs → werking → capaciteiten → overtuiging →
 * vergelijking → prijs → twijfels wegnemen → één afsluitende CTA.
 */

const HANDLE_RE = /[^a-z0-9._-]/g;

/** Harde, controleerbare cijfers direct onder de hero. */
const PROOF_POINTS = [
  { icon: ShieldCheck, value: "0", label: "trackers & cookiemuren" },
  { icon: Coins, value: "0 %", label: "commissie op donaties" },
  { icon: MapPin, value: "EU", label: "eigen infrastructuur" },
  { icon: FileJson, value: "1 klik", label: "volledige data-export" },
] as const;

/** Van niets naar een live profiel — bewust maar drie stappen. */
const STEPS = [
  {
    n: "01",
    icon: Fingerprint,
    title: "Claim je naam",
    body: "Kies rout.be/u/alias en begin gratis. Geen creditcard, geen willekeurige cijfers achter je naam, geen wachtlijst.",
  },
  {
    n: "02",
    icon: Palette,
    title: "Bouw je pagina",
    body: "Links, socials, boekingen, vCard en donaties in de Studio. Elf luxe thema's, live preview, alles versleepbaar.",
  },
  {
    n: "03",
    icon: QrCode,
    title: "Deel & verifieer",
    body: "Exporteer je QR als vector, koppel je eigen domein en haal het blauwe vinkje via bank of eID wanneer je klaar bent.",
  },
] as const;

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

/** Prijstransparantie — geen verborgen abonnementstrap. */
const PRICING = [
  {
    title: "Altijd gratis",
    body: "Je profiel, je links, onbeperkte QR-codes, thema's en de volledige data-export.",
  },
  {
    title: "Betaal per gebruik",
    body: "SecureShield™ relay vanaf €0,09 per maand uit je prepaid saldo. Stop wanneer je wil.",
  },
  {
    title: "Nooit commissie",
    body: "Donaties en tips gaan rechtstreeks naar jou. ROUT houdt niets in op wat je verdient.",
  },
] as const;

const FAQ = [
  {
    q: "Is ROUT echt gratis?",
    a: "Ja. Een profiel, je links en je QR-codes kosten niets en blijven gratis. Enkel extra's zoals de SecureShield™ mailrelay betaal je per maand uit een prepaid saldo — nooit via een automatisch abonnement.",
  },
  {
    q: "Wat gebeurt er met mijn gegevens?",
    a: "We bewaren enkel wat een profiel nodig heeft en verkopen niets door. Er staan geen trackers of advertentiescripts op je pagina en bezoekersstatistieken zijn geaggregeerd, zonder cookies of individuele profielen.",
  },
  {
    q: "Kan ik mijn profiel meenemen als ik stop?",
    a: "Altijd. Eén klik exporteert je volledige profiel als .json, je QR-codes blijven werken zolang je eigen domein bestaat, en verwijderen doe je zelf zonder mailtjes of wachttijd.",
  },
  {
    q: "Waarom rout.be/u/alias en niet meteen mijn naam?",
    a: "Directe rout.be/naam-adressen zijn gereserveerd voor geverifieerde leden. Zo blijft een schone naam een echt signaal en kan niemand zich zomaar als jou voordoen.",
  },
  {
    q: "Waar draait ROUT?",
    a: "Op eigen infrastructuur in Europa, gebouwd en beheerd vanuit Brussel. Geen doorverkoop aan advertentienetwerken, geen data die zonder reden de EU verlaat.",
  },
] as const;

/** Verdiepende pagina's — houdt de about-pagina kort maar volledig. */
const FURTHER_READING = [
  { to: "/manifesto", title: "Het manifest", body: "Waar we voor staan, in vijf principes." },
  { to: "/sovereignty", title: "Soevereiniteit", body: "Hoe eigenaarschap technisch is geregeld." },
  { to: "/self-hosting", title: "Self-hosting", body: "ROUT op je eigen server draaien." },
  { to: "/privacy", title: "Privacybeleid", body: "Wat we bewaren en wat juist niet." },
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
          <caption className="sr-only">
            Vergelijking tussen klassieke link-in-bio-tools en ROUT
          </caption>
          <thead>
            <tr className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="w-1/3 p-4 font-semibold">
                Functie
              </th>
              <th scope="col" className="w-1/3 p-4 font-semibold">
                Klassieke link-tools
              </th>
              <th scope="col" className="w-1/3 p-4 font-semibold text-foreground">
                ROUT
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map((row) => (
              <tr key={row.feature} className="border-t border-border align-top">
                <th scope="row" className="w-1/3 p-4 text-left font-medium text-foreground">
                  {row.feature}
                </th>
                <td className="w-1/3 p-4 text-muted-foreground">{row.others}</td>
                <td className="w-1/3 bg-emerald-500/5 p-4 font-medium text-foreground">
                  {row.rout}
                </td>
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
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm transition-shadow focus-within:shadow-md sm:flex-row sm:items-center">
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
            aria-describedby="claim-handle-hint"
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
      <p id="claim-handle-hint" className="mt-2 px-2 text-xs text-muted-foreground">
        Enkel kleine letters, cijfers, punt, streepje en liggend streepje. Nooit willekeurige
        cijfers achter je naam.
      </p>
    </form>
  );
}

const CARD = "rounded-3xl border border-border/80 bg-card/90 p-6 shadow-sm sm:p-8";
const SECTION = "mt-16 sm:mt-24 scroll-mt-24";

export default function About() {
  return (
    <AppLayout crumbs={[{ label: "Over ROUT" }]}>
      {/* pb-28 houdt de laatste CTA vrij van de footer en de zwevende knop */}
      <div className="mx-auto max-w-5xl px-4 py-12 pb-28 sm:px-6 sm:py-20">
        {/* ---------------------------------------------------- hero */}
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-in-up">
            <span className="eyebrow">Soevereine digitale identiteit</span>
            <h1 className="mb-4 mt-2 font-serif text-3xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Het soevereine alternatief voor je digitale identiteit en link-in-bio.
            </h1>
            <p className="max-w-xl text-balance font-sans text-base leading-relaxed text-muted-foreground sm:text-lg">
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

        {/* ------------------------------------------------ bewijs */}
        <section aria-label="Kerncijfers" className="mt-14 sm:mt-20">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border/80 bg-border/60 sm:grid-cols-4">
            {PROOF_POINTS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-card px-4 py-6 text-center sm:px-5">
                <Icon className="mx-auto h-4 w-4 text-muted-foreground" aria-hidden />
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="mt-3 block font-serif text-2xl font-medium text-foreground sm:text-3xl">
                    {value}
                  </span>
                  <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                    {label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* -------------------------------------------- hoe het werkt */}
        <section className={SECTION} aria-labelledby="about-steps">
          <span className="eyebrow">In drie stappen</span>
          <h2
            id="about-steps"
            className="mt-2 font-serif text-2xl font-semibold text-foreground sm:text-3xl"
          >
            Van naam naar live profiel in enkele minuten
          </h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, ...step }) => (
              <li
                key={step.n}
                className="group relative rounded-3xl border border-border/80 bg-card/90 p-6 shadow-sm transition-colors hover:border-foreground/30"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background">
                    <Icon className="h-4 w-4 text-foreground" aria-hidden />
                  </span>
                  <span aria-hidden className="font-mono text-xs text-muted-foreground/70">
                    {step.n}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* --------------------------------------------- capaciteiten */}
        <section className={SECTION} aria-labelledby="about-features">
          <span className="eyebrow">Wat je krijgt</span>
          <h2
            id="about-features"
            className="mt-2 font-serif text-2xl font-semibold text-foreground sm:text-3xl"
          >
            Alles wat een profiel nodig heeft — en niets wat je tegen je gebruikt
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, ...feature }) => (
              <article key={feature.title} className={CARD}>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background">
                  <Icon className="h-4 w-4 text-foreground" aria-hidden />
                </span>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {feature.eyebrow}
                </p>
                <h3 className="mt-1 font-serif text-xl font-semibold text-foreground sm:text-2xl">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {feature.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
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
          </div>
        </section>

        {/* ------------------------------------- overtuiging + matrix */}
        <section className={`${SECTION} ${CARD}`} aria-labelledby="about-why">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Onafhankelijk &amp; soeverein
          </p>
          <h2
            id="about-why"
            className="mt-2 font-serif text-2xl font-semibold text-foreground sm:text-3xl"
          >
            Waarom we ROUT gebouwd hebben
          </h2>
          <blockquote className="mt-5 border-l-2 border-foreground/20 pl-4 font-serif text-lg leading-snug text-foreground sm:text-xl">
            “Je online identiteit hoort niet thuis bij een advertentiebedrijf.”
          </blockquote>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              De meeste link-in-bio-diensten leven van meten, profileren en doorverkopen: elke klik
              wordt een datapunt, elk profiel een advertentieplaats. ROUT is het tegenovergestelde —
              geen trackers, geen cookiemuur, geen algoritme dat bepaalt wie jouw links te zien
              krijgt.
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

        {/* ---------------------------------------------------- prijs */}
        <section className={SECTION} aria-labelledby="about-pricing">
          <span className="eyebrow">Transparante prijs</span>
          <h2
            id="about-pricing"
            className="mt-2 font-serif text-2xl font-semibold text-foreground sm:text-3xl"
          >
            Geen abonnementstrap, geen verrassingen
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {PRICING.map((tier) => (
              <div
                key={tier.title}
                className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-sm"
              >
                <h3 className="font-serif text-lg font-semibold text-foreground">{tier.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tier.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------ faq */}
        <section className={SECTION} aria-labelledby="about-faq">
          <span className="eyebrow">Veelgestelde vragen</span>
          <h2
            id="about-faq"
            className="mt-2 font-serif text-2xl font-semibold text-foreground sm:text-3xl"
          >
            Nog twijfels? Terecht.
          </h2>
          <div className="mt-8 overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-sm">
            {FAQ.map((item, i) => (
              <details
                key={item.q}
                className={`group px-5 py-4 sm:px-6 ${i > 0 ? "border-t border-border" : ""}`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-[15px] font-medium text-foreground marker:hidden">
                  {item.q}
                  <span
                    aria-hidden
                    className="shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* --------------------------------------------- verder lezen */}
        <section className={SECTION} aria-labelledby="about-more">
          <h2 id="about-more" className="eyebrow">
            Verder lezen
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FURTHER_READING.map((page) => (
              <Link
                key={page.to}
                to={page.to}
                className="group rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm transition-colors hover:border-foreground/30 hover:bg-accent"
              >
                <p className="flex items-center justify-between gap-2 text-sm font-medium text-foreground">
                  {page.title}
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{page.body}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ------------------------------------------ afsluitende CTA */}
        <section
          className={`${SECTION} rounded-3xl border border-border bg-foreground p-8 text-center text-background shadow-sm sm:p-12`}
          aria-labelledby="about-cta"
        >
          <h2 id="about-cta" className="font-serif text-2xl font-semibold sm:text-3xl">
            Claim jouw soevereine handle
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed opacity-80">
            rout.be/jouwnaam — gratis beginnen, later verifiëren. Vector-QR, eigen domein en 0 %
            commissie op wat je verdient. Je profiel blijft van jou: exporteerbaar en verwijderbaar.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-background px-6 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
            >
              Maak je profiel
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/verify"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-background/30 px-6 text-sm font-medium text-background transition-colors hover:bg-background/10"
            >
              Hoe verificatie werkt
            </Link>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
