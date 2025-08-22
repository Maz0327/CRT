# Part 4 System Audit (Scope Model)
_Run at: $(date -u)_

## Client Scoping
- API sets X-Project-ID:
43:  if (__scopedProjectId) h.set("X-Project-ID", __scopedProjectId);
- ProjectProvider sets scoped project + invalidates queries:
3:import { IS_MOCK_MODE, setScopedProjectId } from "../lib/api";
30:    setScopedProjectId(currentProjectId);

## Hooks default projectId
Checking useCaptures.ts...
6:export function useCaptures(params?: { page?: number; pageSize?: number; q?: string; tags?: string[]; projectId?: ID; platform?: string }) {
8:  const withScope = { ...(params || {}), projectId: (params?.projectId ?? currentProjectId) || undefined };
Checking useMoments.ts...
8:  const withScope = { ...(params || {}), projectId: (params?.projectId ?? currentProjectId) || undefined };
Checking useBriefs.ts...
6:type BriefsListParams = { projectId?: string; q?: string; tags?: string[]; page?: number; pageSize?: number };
10:  const withScope = { ...(params || {}), projectId: (params?.projectId ?? currentProjectId) || undefined };
Checking useFeeds.ts...
6:export function useFeeds(params?: { projectId?: string; active?: boolean }) {
8:  const withScope = { ...(params || {}), projectId: (params?.projectId ?? currentProjectId) || undefined };

## Server Project Middleware
- project-scope middleware present and wired:
server/index.ts:17:import { projectScope } from "./middleware/project-scope";
9: *   1) header: X-Project-ID
14:  const hdr = req.get("X-Project-ID");

## Daily Briefing Route
server/routes/daily.ts:13:  app.get("/api/daily-briefing", async (req, res) => {
server/routes/daily.ts:69:      console.error("daily-briefing error:", err);
server/routes/daily.ts:70:      return res.status(500).json({ error: "daily-briefing failed" });
client/src/ui-v2/services/daily.ts:11:  return api.get<DailyBriefing>("/daily-briefing");

## Build Check
Testing TypeScript compilation...
Typecheck completed with status: 2

Last 10 lines of typecheck:
  Property 'data' does not exist on type 'Promise<GaxiosResponseWithHTTP2<Readable>> & void'.
server/services/google/slides.ts(64,9): error TS2353: Object literal may only specify known properties, and 'requestBody' does not exist in type 'BodyResponseCallback<Schema$Presentation>'.
server/services/google/slides.ts(69,43): error TS2339: Property 'data' does not exist on type '{ data: { presentationId: string; title: any; }; } | (Promise<GaxiosResponseWithHTTP2<Readable>> & void) | (Promise<{ data: { presentationId: string; title: any; }; }> & void) | (GaxiosResponseWithHTTP2<...> & { ...; })'.
  Property 'data' does not exist on type 'Promise<GaxiosResponseWithHTTP2<Readable>> & void'.
server/services/google/slides.ts(75,9): error TS2353: Object literal may only specify known properties, and 'fileId' does not exist in type 'BodyResponseCallback<Schema$File>'.
server/services/google/slides.ts(88,11): error TS2353: Object literal may only specify known properties, and 'presentationId' does not exist in type 'BodyResponseCallback<Schema$Presentation>'.
server/services/google/slides.ts(91,49): error TS2339: Property 'data' does not exist on type '{ data: { presentationId: any; slides: { objectId: string; }[]; }; } | (Promise<GaxiosResponseWithHTTP2<Readable>> & void) | (Promise<{ data: { presentationId: any; slides: { ...; }[]; }; }> & void) | (GaxiosResponseWithHTTP2<...> & { ...; })'.
  Property 'data' does not exist on type 'Promise<GaxiosResponseWithHTTP2<Readable>> & void'.
server/services/google/slides.ts(220,11): error TS2353: Object literal may only specify known properties, and 'presentationId' does not exist in type 'BodyResponseCallback<Schema$BatchUpdatePresentationResponse>'.
server/workers/analysis/pipeline.ts(90,7): error TS2322: Type 'string' is not assignable to type '"google" | "openai" | "mock"'.

## API Testing
Testing daily-briefing endpoint...
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <meta http-equiv="Content-Secur

Testing project scoping with X-Project-ID header...
{"error":"Invalid token"}