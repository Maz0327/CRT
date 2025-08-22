# Content Radar – Chrome Extension (MV3)

## What it does
- User-drawn **region** capture (record/screenshot)
- Uploads to your backend `/api` (no Supabase in extension)
- Local queue with retry
- Pairs with web app using a short code

## Load in Chrome
1. `pnpm i` or `npm i` (no build needed)
2. Run `./scripts/zip-extension.sh` (optional)
3. `chrome://extensions` → Enable Developer Mode → Load unpacked → select `extension/`
4. Click the toolbar icon → paste pairing code from the web app → capture!

## Permissions
- `activeTab`, `scripting`, `storage`, `tabs`, `tabCapture`, `alarms`
- `host_permissions`: `*://*/api/*` (tighten to your prod origin before release)

## Notes
- Uses `CropTarget` if available for real-time cropping; falls back to canvas for screenshots.
- All uploads go to `/api/extension/uploads` then `/captures` + `/analysis/queue`.