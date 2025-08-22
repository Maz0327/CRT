import { api } from "../lib/api";
import { toCamel, toSnake } from "../lib/shape";
import type { ID, Capture, Paginated } from "../types";

export function listCaptures(params?: { page?: number; pageSize?: number; q?: string; tags?: string[]; projectId?: ID; platform?: string }) {
  const qp: Record<string, any> = { ...params };
  if (params?.tags) qp.tags = params.tags.join(",");
  return api.get("/captures", qp).then(toCamel);
}

export function getCapture(id: ID) {
  return api.get(`/captures/${id}`).then(toCamel);
}

export function updateCapture(id: ID, patch: Partial<Capture>) {
  return api.patch(`/captures/${id}`, toSnake(patch)).then(toCamel);
}

// upload via form-data (server stores to Supabase storage)
export function uploadCapture(files: File[], meta?: { project_id?: ID | null; notes?: string }) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  if (meta?.project_id) form.set("project_id", meta.project_id);
  if (meta?.notes) form.set("notes", meta.notes);
  return api.post("/captures/upload", form).then(toCamel);
}

export async function deleteCapture(id: ID) {
  return api.del(`/captures/${id}`).then(toCamel);
}

/** Batch upload captures with optional notes/titles/tags (aligned arrays) */
export async function uploadCaptures(
  projectId: ID | null,
  items: { file: File; note?: string; title?: string; tags?: string[] }[]
) {
  const form = new FormData();
  for (const it of items) {
    form.append("files", it.file, it.file.name);
    if (it.note)   form.append("notes[]", it.note);
    if (it.title)  form.append("titles[]", it.title);
    if (it.tags?.length) form.append("tags[]", it.tags.join(","));
  }
  if (projectId) form.set("project_id", projectId);
  return api.post("/captures/upload", form).then(toCamel);
}