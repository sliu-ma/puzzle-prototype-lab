import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type StationItem = {
  stageNr: number;
  placeName: string;
  address: string;
  lat: number | null;
  lng: number | null;
  note: string;
  photoPath: string | null;
  mapUrl: string | null;
  photoUrl?: string | null;
};

export const teacherListStations = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ password: z.string().min(1).max(200), code: z.string().min(1).max(20) }).parse(d),
  )
  .handler(async ({ data }): Promise<StationItem[]> => {
    const { roundsDb, hashPassword } = await import("./rounds.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows, error } = await roundsDb().rpc("teacher_list_stations", {
      p_password_hash: hashPassword(data.password),
      p_code: data.code,
    });
    if (error) throw new Error(error.message);

    const stations: StationItem[] = (rows ?? []).map((r) => ({
      stageNr: r.stage_nr,
      placeName: r.place_name ?? "",
      address: r.address ?? "",
      lat: r.lat === null ? null : Number(r.lat),
      lng: r.lng === null ? null : Number(r.lng),
      note: r.note ?? "",
      photoPath: r.photo_path ?? null,
      mapUrl: r.map_url ?? null,
    }));

    // Für private Buckets: signierte URLs für die Fotos erzeugen (lange Gültigkeit).
    const signed = await Promise.all(
      stations.map(async (s) => {
        if (!s.photoPath) return s;
        const { data: signedData, error: signedError } = await supabaseAdmin.storage
          .from("station-photos")
          .createSignedUrl(s.photoPath, 60 * 60 * 24 * 365);
        if (signedError || !signedData) return s;
        return { ...s, photoUrl: signedData.signedUrl };
      }),
    );

    return signed;
  });

export const teacherUpsertStation = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        password: z.string().min(1).max(200),
        code: z.string().min(1).max(20),
        stageNr: z.number().int().min(1).max(5),
        placeName: z.string().min(1).max(80),
        address: z.string().min(0).max(200),
        note: z.string().max(200).default(""),
        lat: z.number().nullable().optional(),
        lng: z.number().nullable().optional(),
        mapUrl: z.string().nullable().optional(),
        photoPath: z.string().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { roundsDb, hashPassword } = await import("./rounds.server");
    const { geocodeAddress, mapUrlFromCoords } = await import("./stations.server");

    let lat = data.lat ?? null;
    let lng = data.lng ?? null;
    let mapUrl = data.mapUrl ?? null;

    // Wenn Koordinaten fehlen, aber Adresse vorhanden ist, versuche Geocoding.
    if ((!lat || !lng) && data.address.trim()) {
      const result = await geocodeAddress(data.address);
      if (result.found) {
        lat = result.lat;
        lng = result.lng;
      }
    }

    if (lat && lng) {
      mapUrl = mapUrlFromCoords(lat, lng);
    }

    const { data: rows, error } = await roundsDb().rpc("teacher_upsert_station", {
      p_password_hash: hashPassword(data.password),
      p_code: data.code,
      p_stage_nr: data.stageNr,
      p_place_name: data.placeName.trim(),
      p_address: data.address.trim(),
      p_lat: (lat ?? null) as unknown as number,
      p_lng: (lng ?? null) as unknown as number,
      p_note: data.note.trim(),
      p_photo_path: (data.photoPath ?? null) as unknown as string,
      p_map_url: (mapUrl ?? null) as unknown as string,
    });
    if (error) throw new Error(error.message);
    const row = rows?.[0];
    if (!row) throw new Error("Speichern fehlgeschlagen.");

    return {
      stageNr: row.stage_nr,
      placeName: row.place_name ?? "",
      address: row.address ?? "",
      lat: row.lat === null ? null : Number(row.lat),
      lng: row.lng === null ? null : Number(row.lng),
      note: row.note ?? "",
      photoPath: row.photo_path ?? null,
      mapUrl: row.map_url ?? null,
    };
  });

export const teacherUploadStationPhoto = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        password: z.string().min(1).max(200),
        code: z.string().min(1).max(20),
        stageNr: z.number().int().min(1).max(5),
        file: z.instanceof(File),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { hashPassword, assertTeacher } = await import("./rounds.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    assertTeacher(data.password);

    const ext = data.file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
    const path = `${hashPassword(data.password).slice(0, 16)}/${data.code.toUpperCase()}/${data.stageNr}.${safeExt}`;

    const arrayBuffer = await data.file.arrayBuffer();
    const { error } = await supabaseAdmin.storage
      .from("station-photos")
      .upload(path, new Uint8Array(arrayBuffer), {
        contentType: data.file.type || "image/jpeg",
        upsert: true,
      });
    if (error) throw new Error(error.message);

    return { path };
  });

export const teacherDeleteStation = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        password: z.string().min(1).max(200),
        code: z.string().min(1).max(20),
        stageNr: z.number().int().min(1).max(5),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { roundsDb, hashPassword } = await import("./rounds.server");
    const { error } = await roundsDb().rpc("teacher_delete_station", {
      p_password_hash: hashPassword(data.password),
      p_code: data.code,
      p_stage_nr: data.stageNr,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
