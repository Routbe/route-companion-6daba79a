import { sql } from "@/lib/neon";
import { normalizeHandle, isReservedHandle } from "@/lib/profile";

/**
 * Neon-datalaag voor de interactieve builder op `/start`.
 *
 * Een bezoeker bouwt zijn aliasprofiel zonder account. Bij de activatiestap
 * wordt de payload hier bewaard (24 uur, gesleuteld op e-mailadres) en na het
 * volgen van de magic link vastgelegd in `public.alias_profiles`. Daardoor kan
 * de tour op het ene toestel starten en op het andere afgerond worden.
 */

type Row = Record<string, unknown>;

export type StartDraftLink = { url: string; label: string };

export type StartDraftPayload = {
  aliasHandle: string;
  displayName: string | null;
  bio: string | null;
  themeId: string;
  avatarUrl: string | null;
  links: StartDraftLink[];
  wantVcard: boolean;
};

let tableReady: Promise<void> | null = null;

/** Maakt de brontabel aan wanneer migratie 39 nog niet is uitgevoerd. */
async function ensureDraftTable(): Promise<void> {
  tableReady ??= (async () => {
    await sql`
      create table if not exists public.pending_profile_drafts (
        email         text primary key,
        alias_handle  text not null,
        display_name  text,
        bio           text,
        theme_id      text not null default 'noir',
        avatar_url    text,
        links         jsonb not null default '[]'::jsonb,
        want_vcard    boolean not null default false,
        created_at    timestamptz not null default now(),
        expires_at    timestamptz not null default (now() + interval '24 hours')
      )
    `;
    await sql`
      create index if not exists pending_profile_drafts_expires_idx
        on public.pending_profile_drafts (expires_at)
    `;
  })().catch((error) => {
    tableReady = null;
    throw error;
  });
  return tableReady;
}

const normalizeEmail = (value: string) => value.trim().toLowerCase();

function sanitizeLinks(links: StartDraftLink[]): StartDraftLink[] {
  return links
    .map((link) => ({
      url: String(link?.url ?? "").trim().slice(0, 400),
      label: String(link?.label ?? "").trim().slice(0, 60),
    }))
    .filter((link) => link.url.length > 0)
    .slice(0, 6);
}

/** Bewaart (of vervangt) de concept-payload voor dit e-mailadres. */
export async function saveDraft(rawEmail: string, payload: StartDraftPayload): Promise<void> {
  await ensureDraftTable();
  const email = normalizeEmail(rawEmail);
  const handle = normalizeHandle(payload.aliasHandle);
  if (!handle || isReservedHandle(handle)) throw new Error("handle_invalid");

  await sql`
    insert into public.pending_profile_drafts (
      email, alias_handle, display_name, bio, theme_id, avatar_url, links, want_vcard,
      created_at, expires_at
    ) values (
      ${email}, ${handle}, ${payload.displayName?.slice(0, 80) ?? null},
      ${payload.bio?.slice(0, 160) ?? null}, ${payload.themeId || "noir"},
      ${payload.avatarUrl ?? null}, ${JSON.stringify(sanitizeLinks(payload.links))}::jsonb,
      ${payload.wantVcard}, now(), now() + interval '24 hours'
    )
    on conflict (email) do update set
      alias_handle = excluded.alias_handle,
      display_name = excluded.display_name,
      bio = excluded.bio,
      theme_id = excluded.theme_id,
      avatar_url = excluded.avatar_url,
      links = excluded.links,
      want_vcard = excluded.want_vcard,
      created_at = now(),
      expires_at = now() + interval '24 hours'
  `;
}

async function readDraft(email: string): Promise<StartDraftPayload | null> {
  await ensureDraftTable();
  const rows = (await sql`
    select alias_handle, display_name, bio, theme_id, avatar_url, links, want_vcard
      from public.pending_profile_drafts
     where email = ${email}
       and expires_at > now()
     limit 1
  `) as Row[];
  const row = rows[0];
  if (!row) return null;
  return {
    aliasHandle: String(row["alias_handle"] ?? ""),
    displayName: (row["display_name"] as string | null) ?? null,
    bio: (row["bio"] as string | null) ?? null,
    themeId: (row["theme_id"] as string | null) ?? "noir",
    avatarUrl: (row["avatar_url"] as string | null) ?? null,
    links: Array.isArray(row["links"]) ? (row["links"] as StartDraftLink[]) : [],
    wantVcard: row["want_vcard"] === true,
  };
}

/**
 * Zorgt dat er een account bestaat voor dit adres en stuurt de magic link.
 * Nieuwe adressen krijgen een wachtwoordloos account, zodat dezelfde
 * e-mailinlog (Brevo authblok, template #93) werkt voor nieuw én bestaand.
 */
export async function requestStartMagicLink(rawEmail: string, origin: string): Promise<boolean> {
  const email = normalizeEmail(rawEmail);
  const users = await import("@/lib/auth/users.server");
  const existing = await users.findUserByEmail(email).catch(() => null);
  if (!existing) {
    await users.createUser({ email, password: null, metadata: { source: "start_tour" } });
  }
  const result = await users.requestEmailCode(email, origin);
  return result.sent;
}

/**
 * Legt een wachtend concept vast op het account dat zojuist inlogde.
 * Geeft de handle terug wanneer er echt iets is vastgelegd.
 */
export async function commitDraftForUser(
  userId: string,
  rawEmail: string | null,
): Promise<{ committed: boolean; handle: string | null }> {
  if (!rawEmail) return { committed: false, handle: null };
  const email = normalizeEmail(rawEmail);
  const draft = await readDraft(email);
  if (!draft) return { committed: false, handle: null };

  // Aliasprofielen hangen aan `public.profiles`; die rij bestaat nog niet voor
  // een account dat via de tour is aangemaakt.
  await sql`
    insert into public.profiles (id, email)
    values (${userId}, ${email})
    on conflict (id) do nothing
  `;

  const { writeAliasProfile } = await import("./alias-profile.server");
  const blocks = draft.links.map((link, index) => ({
    id: `start-${index + 1}`,
    kind: "link",
    label: link.label || `Link ${index + 1}`,
    value: link.url,
  }));

  const base = normalizeHandle(draft.aliasHandle);
  const candidates = [base, `${base}0`, `${base}${Math.floor(Math.random() * 90 + 10)}`];
  let handle: string | null = null;
  let lastError: unknown = null;

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const saved = await writeAliasProfile(userId, {
        username: candidate,
        displayName: draft.displayName,
        tagline: draft.bio,
        avatarUrl: draft.avatarUrl,
        theme: draft.themeId,
        cardStyle: "bordered",
        blocks,
        displayPrefs: draft.wantVcard ? { showVcardButton: true } : {},
      });
      handle = saved.username ?? candidate;
      break;
    } catch (error) {
      lastError = error;
    }
  }

  // Het concept wordt altijd opgeruimd zodra het is verwerkt of definitief faalt.
  await sql`delete from public.pending_profile_drafts where email = ${email}`;
  await sql`delete from public.pending_profile_drafts where expires_at <= now()`;

  if (!handle) {
    console.error(
      "[start] draft commit failed:",
      lastError instanceof Error ? lastError.message : lastError,
    );
    return { committed: false, handle: null };
  }
  return { committed: true, handle };
}
