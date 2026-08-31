import { sql } from "@/lib/neon";
import { isReservedHandle, normalizeHandle } from "@/lib/profile";
import { normalizeHandleForStorage } from "@/lib/handle-rules";
import { isHandleBlock, normalizeSocialHandle } from "./social-handles";

/**
 * Neon-datalaag voor het gratis aliasprofiel (`rout.be/u/<handle>`).
 *
 * Dit profiel staat volledig los van het geverifieerde rootprofiel in
 * `public.profiles`: eigen handle, naam, thema, blokken en voorkeuren, zodat
 * een gebruiker beide profielen apart kan beheren.
 */

type Row = Record<string, unknown>;

export type AliasProfile = {
  username: string | null;
  displayName: string | null;
  tagline: string | null;
  avatarUrl: string | null;
  faviconUrl: string | null;
  theme: string;
  cardStyle: string;
  blocks: unknown[];
  /** Aliasprofielen zijn nooit geverifieerd — het vinkje hangt aan de rootnamespace. */
  verified: boolean;
  status: string;
  verifiedLegalName: string | null;
  displayPrefs: Record<string, unknown>;
};

function toAliasProfile(row: Row): AliasProfile {
  return {
    username: (row["handle"] as string | null) ?? null,
    displayName: (row["display_name"] as string | null) ?? null,
    tagline: (row["tagline"] as string | null) ?? null,
    avatarUrl: (row["avatar_url"] as string | null) ?? null,
    faviconUrl: (row["favicon_url"] as string | null) ?? null,
    theme: (row["theme"] as string | null) ?? "noir",
    cardStyle: (row["card_style"] as string | null) ?? "bordered",
    blocks: Array.isArray(row["blocks"]) ? (row["blocks"] as unknown[]) : [],
    verified: false,
    status: row["enabled"] === false ? "disabled" : "active",
    verifiedLegalName: null,
    displayPrefs:
      row["display_prefs"] && typeof row["display_prefs"] === "object"
        ? (row["display_prefs"] as Record<string, unknown>)
        : {},
  };
}

/**
 * Zorgt dat `public.alias_profiles` bestaat (migratie 38). Zo lukt het aanmaken
 * van een eigen profielpagina ook op databases waar de migratie nog niet is
 * uitgevoerd — anders faalde het opslaan met "relation does not exist".
 */
let tableReady: Promise<void> | null = null;
async function ensureAliasTable(): Promise<void> {
  tableReady ??= (async () => {
    await sql`
      create table if not exists public.alias_profiles (
        user_id        uuid primary key references public.profiles(id) on delete cascade,
        handle         text not null,
        display_name   text,
        tagline        text,
        bio            text,
        avatar_url     text,
        favicon_url    text,
        theme          text not null default 'noir',
        card_style     text not null default 'bordered',
        blocks         jsonb not null default '[]'::jsonb,
        display_prefs  jsonb not null default '{}'::jsonb,
        enabled        boolean not null default true,
        created_at     timestamptz not null default now(),
        updated_at     timestamptz not null default now()
      )
    `;
    await sql`
      create unique index if not exists alias_profiles_handle_ci_key
        on public.alias_profiles (lower(handle))
    `;
  })().catch((error) => {
    tableReady = null;
    throw error;
  });
  return tableReady;
}

export async function readAliasProfile(userId: string): Promise<AliasProfile | null> {
  await ensureAliasTable();
  const rows = (await sql`
    select handle, display_name, tagline, avatar_url, favicon_url, theme, card_style,
           blocks, display_prefs, enabled
      from public.alias_profiles
     where user_id = ${userId}
     limit 1
  `) as Row[];
  const row = rows[0];
  return row ? toAliasProfile(row) : null;
}

export type AliasProfileInput = {
  username: string;
  displayName?: string | null;
  tagline?: string | null;
  avatarUrl?: string | null;
  faviconUrl?: string | null;
  theme?: string | null;
  cardStyle?: string | null;
  blocks?: unknown[];
  displayPrefs?: Record<string, unknown> | null;
};

function normalizeBlockHandles(blocks: unknown[]): unknown[] {
  return blocks.map((block) => {
    if (!block || typeof block !== "object") return block;
    const b = block as Record<string, unknown>;
    const kind = typeof b["kind"] === "string" ? (b["kind"] as string) : "";
    const value = typeof b["value"] === "string" ? (b["value"] as string) : "";
    if (!kind || !value || !isHandleBlock(kind)) return block;
    return { ...b, value: normalizeSocialHandle(value) };
  });
}

/** Is deze aliashandle vrij? Botst niet met rootprofielen én niet met andere aliassen. */
export async function isAliasHandleFree(rawHandle: string, userId: string | null) {
  const handle = normalizeHandle(rawHandle);
  if (!handle) return { ok: false, reason: "invalid" as const };
  if (isReservedHandle(handle)) return { ok: false, reason: "reserved" as const };
  await ensureAliasTable();


  const rootRows = (await sql`
    select id from public.profiles where lower(username) = ${handle} limit 1
  `) as Row[];
  const rootOwner = rootRows[0]?.["id"] as string | undefined;
  if (rootOwner && (!userId || rootOwner !== userId)) return { ok: false, reason: "taken" as const };

  const aliasRows = (await sql`
    select user_id from public.alias_profiles where lower(handle) = ${handle} limit 1
  `) as Row[];
  const aliasOwner = aliasRows[0]?.["user_id"] as string | undefined;
  if (aliasOwner && (!userId || aliasOwner !== userId)) return { ok: false, reason: "taken" as const };

  return { ok: true, reason: null };
}

export async function writeAliasProfile(userId: string, input: AliasProfileInput) {
  await ensureAliasTable();
  const handle = normalizeHandleForStorage(input.username);
  if (!handle) throw new Error("handle_invalid");
  if (isReservedHandle(handle)) throw new Error("handle_reserved");

  const free = await isAliasHandleFree(handle, userId);
  if (!free.ok) throw new Error(free.reason === "reserved" ? "handle_reserved" : "handle_taken");

  const blocks = normalizeBlockHandles(input.blocks ?? []);

  const rows = (await sql`
    insert into public.alias_profiles (
      user_id, handle, display_name, tagline, avatar_url, favicon_url,
      theme, card_style, blocks, display_prefs, updated_at
    ) values (
      ${userId}, ${handle}, ${input.displayName ?? null}, ${input.tagline ?? null},
      ${input.avatarUrl ?? null}, ${input.faviconUrl ?? null},
      ${input.theme ?? "noir"}, ${input.cardStyle ?? "bordered"},
      ${JSON.stringify(blocks)}::jsonb,
      ${JSON.stringify(input.displayPrefs ?? {})}::jsonb, now()
    )
    on conflict (user_id) do update set
      handle = excluded.handle,
      display_name = excluded.display_name,
      tagline = excluded.tagline,
      avatar_url = excluded.avatar_url,
      favicon_url = excluded.favicon_url,
      theme = excluded.theme,
      card_style = excluded.card_style,
      blocks = excluded.blocks,
      display_prefs = excluded.display_prefs,
      updated_at = now()
    returning handle, display_name, tagline, avatar_url, favicon_url, theme, card_style,
              blocks, display_prefs, enabled
  `) as Row[];

  return toAliasProfile(rows[0]!);
}

/**
 * Publieke lookup voor `/u/<handle>`. Levert een rij in hetzelfde formaat als
 * `readPublicProfile`, maar altijd als niet-geverifieerd gratis profiel.
 */
export async function readPublicAliasProfile(rawHandle: string) {
  const handle = normalizeHandle(rawHandle);
  if (!handle) return null;
  await ensureAliasTable();
  const rows = (await sql`
    select a.user_id as id, a.handle as username, a.display_name, a.tagline, a.bio,
           a.avatar_url, a.favicon_url, a.theme, a.card_style, a.blocks,
           a.display_prefs, a.created_at,
           coalesce(p.is_banned, false) as is_banned,
           coalesce(p.is_suspended, false) as is_suspended
      from public.alias_profiles a
      join public.profiles p on p.id = a.user_id
     where lower(a.handle) = ${handle}
       and a.enabled = true
       and coalesce(p.is_banned, false) = false
     limit 1
  `) as Row[];
  const row = rows[0];
  if (!row) return null;
  return {
    ...row,
    verified: false,
    verified_at: null,
    verified_legal_name: null,
    is_early_believer: false,
    status: "active",
    url_style: "u",
    show_total_reach: false,
    total_reach_count: 0,
    social_links: [],
  } as Row;
}
