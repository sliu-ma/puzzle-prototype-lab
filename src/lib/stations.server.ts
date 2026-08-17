// Server-only Helfer für Postenkarten-Orte.
import { createHash } from "node:crypto";
import type { Database } from "@/integrations/supabase/types";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export const DEFAULT_PLACES = [
  { stage_nr: 1, place_name: "Bahnhof", default_address: "" },
  { stage_nr: 2, place_name: "Dorfladen", default_address: "" },
  { stage_nr: 3, place_name: "Wald-Lichtung", default_address: "" },
  { stage_nr: 4, place_name: "Jakobs Haus", default_address: "" },
  { stage_nr: 5, place_name: "Wasserkraftwerk", default_address: "" },
];

export type StationRow = {
  stage_nr: number;
  place_name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  note: string;
  photo_path: string | null;
  map_url: string | null;
};

export function mapUrlFromCoords(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`;
}

export function osmSearchUrl(address: string): string {
  return `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}&limit=1`;
}

export type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export async function geocodeAddress(address: string): Promise<{
  found: false;
} | {
  found: true;
  displayName: string;
  lat: number;
  lng: number;
}> {
  if (!address.trim()) return { found: false };
  const response = await fetch(osmSearchUrl(address), {
    headers: {
      "User-Agent": "MajasMissionPostenkarten/1.0 (https://majasmission.ch)",
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Geocoding fehlgeschlagen: ${response.status}`);
  }
  const results = (await response.json()) as NominatimResult[];
  if (!Array.isArray(results) || results.length === 0) {
    return { found: false };
  }
  const first = results[0]!;
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { found: false };
  }
  return { found: true, displayName: first.display_name, lat, lng };
}

export function stationToClient(
  row: Database["public"]["Functions"]["teacher_upsert_station"]["Returns"][number],
): StationRow {
  return {
    stage_nr: row.stage_nr,
    place_name: row.place_name ?? "",
    address: row.address ?? "",
    lat: row.lat === null ? null : Number(row.lat),
    lng: row.lng === null ? null : Number(row.lng),
    note: row.note ?? "",
    photo_path: row.photo_path ?? null,
    map_url: row.map_url ?? null,
  };
}
