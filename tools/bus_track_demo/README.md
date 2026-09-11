# Bus Track — Inauguration Sequence

A standalone, browser-based launch animation for the SCET Smart Transport System.
Darkness → bus silhouette → headlight ignition → road → GPS lock → live route dashboard →
destination reached → hero return → "BUS TRACK · INAUGURATED" title card → Enter System.

Runtime: ~28 s. Built with HTML, CSS, GSAP 3 (+ MotionPathPlugin). No build step.

## Files

| File | What it holds |
|---|---|
| `index.html` | Markup: launch gate, hero bus (inline SVG), road stage, dashboard, title card |
| `style.css` | Palette, layout, static styling |
| `script.js` | `CONFIG` + the GSAP master timeline and helper timelines |

## Setup

1. Keep the three files in one folder.
2. Open `index.html` in Chrome or Edge (the internet is needed once for GSAP and the Inter font from CDNs).
3. Press **F11** for full screen on the presentation laptop, then click **BEGIN INAUGURATION** (or press Enter).

Controls during the show: **Esc** or the SKIP button jumps to the final card; **Enter** on the final card opens the system.

Preview any moment while editing: `index.html?t=12.5` freezes the show at 12.5 seconds.

## Customisation (all in `script.js` → `CONFIG`)

| Setting | Purpose |
|---|---|
| `redirectUrl` | Where **ENTER SYSTEM** (and auto-redirect) goes |
| `autoRedirect`, `redirectDelay` | Countdown and automatic redirect after the final hold |
| `requireStart` | Show the launch gate (recommended; it also enables audio) |
| `audio` | Synthesised hum / ignition / stop chimes (no audio files needed) |
| `stops[]` | Stop names, position along the route (`at`), label offsets, lat/lng for the readout |
| `clockStart`, `clockRate` | Dashboard clock start time and speed |
| `legDuration`, `stopDwell` | Pace of the live-tracking scene |

Where to change the rest:

- **Logo**: two slots in `index.html` marked `LOGO SLOT #1` (gate) and `LOGO SLOT #2` (top-left brand). Replace the inline `<svg>` with `<img src="assets/logo.svg" alt="">`.
- **Bus photo (recommended)**: see "Using your real bus" below. The built-in fallback is a stylised front-3/4 SVG in Sahrdaya yellow (`BUS ART SLOT` in `index.html`; its sign text says SAHRDAYA).
- **Title text**: `#init-eyebrow`, `#init-title`, `#title-kicker`, `#title-main`, `#title-sub`, `#title-badge`, `#title-meta` in `index.html`. The launch date and department line are in `#title-meta`.
- **Route shape**: the three `<path d="…">` elements in the map SVG share one path string. Change all three identically; stops are placed automatically along it via `stops[].at`.
- **Scene timing**: the `T` object inside `buildTimeline()` holds each scene's start second.

## The opening clip (video mode)

The opening is played straight from `assets/intro.mp4`: the first 4.75 s of your reference clip with its own soundtrack. Darkness, the headlight strike, the bus pulling away down the road, and the clip's own "SCET SMART TRANSPORT SYSTEM / INITIALIZING LIVE TRACKING" text and satellite rings. From 3.25 s the clip runs at half speed (smooth, motion-interpolated frames baked into `intro.mp4` with ffmpeg's `minterpolate`) so the title and "initializing" text stay up longer while the bus drifts away. It is cut just before the clip's tablet UI rises, and a soft flash cross-dissolves into the Bus Track dashboard. `assets/bus-lit.jpg` (a clean lit frame) returns, dimmed, behind the final title, and the clip's closing boom (`assets/title-hit.mp3`) fires on the title reveal.

Settings live in `CONFIG.busVideo` (`ignitionAt` = second the lamps strike inside the clip, `endAt` = where to cut to the dashboard). Set `src: ''` to fall back to the photo bus described below. To use a different clip, export its first seconds with ffmpeg:

```
ffmpeg -ss 0 -t 6.25 -i clip.mp4 -vf scale=1920:1080 -c:a aac assets/intro.mp4   # then set endAt to the clip length
ffmpeg -ss 2.65 -i clip.mp4 -frames:v 1 -vf scale=1920:1080 assets/bus-lit.jpg
ffmpeg -ss 0 -i clip.mp4 -frames:v 1 -vf scale=1920:1080 assets/bus-dark.jpg
```

## Using your real bus (photo fallback)

1. Take the front-3/4 poster shot (or any front-facing photo) and remove the background so only the bus remains, saved as a transparent PNG at `assets/bus.png` (1600 px+ wide; remove.bg, Photoshop or Canva "background remover" all work). Crop tightly around the bus.
2. In `script.js` set `busImage.src: 'assets/bus.png'` (already set; the shipped file is a Sahrdaya fleet bus, see Credits). Also set `width` and `offsetX` there to taste.
3. Open `index.html?calibrate`, click the **left headlamp**, the **right headlamp**, then the **ground line under the tyres**. Copy the printed `lampL / lampR / groundY` values into `CONFIG.busImage`.
4. For a 3/4 angle, adjust `beamRot` (degrees of splay per lamp) so the beams fan out in the direction the bus faces.

The rim-light silhouette, headlamp bloom, beams, wet-road reflections and title dimming all attach to those coordinates, so the photo gets the full cinematic treatment.

## Sound design

Everything is synthesised in the browser through the Web Audio API and mixed through a reverb and a limiter, so no files are required:

| Moment | Cue |
|---|---|
| Darkness → ignition | The reference clip's own soundtrack (video mode), over a sub drone + engine-idle rumble |
| 0.9 s before the lamps | Rising electrical charge |
| Headlight strike | Sub impact, bright noise burst, metallic ring |
| Bus pulls away (video mode) | The clip's own soundtrack; photo mode uses a climbing engine rev |
| GPS lock | Two-note ping with hall echo |
| Road → dashboard | Data sweep + soft chord bloom |
| Between stops | Old diesel bus: knocking idle that revs up, cruises and settles (or `CONFIG.sounds.engine`) |
| Each stop | Confirmation tick |
| Destination | Rising four-note resolve with a long tail |
| Before the title | 2.6 s riser |
| Title reveal | The clip's closing boom (`assets/title-hit.mp3`) + warm pad |

To use real recordings instead, drop files into `assets/` and set their paths in `CONFIG.sounds` (any cue left `''` stays synthesised). Overall level: `CONFIG.audioVolume`.

## Credits

- Bus photo: cut from the Sahrdaya fleet panorama published on the college's own site ([sahrdayacas.ac.in/transportation](https://sahrdayacas.ac.in/transportation/)). Background removed; the bus itself is unmodified. It is the college's own image, so no external licence applies.

## Asset recommendations

- Bus: a cut-out photo on a transparent background, ≥ 1600 px wide. The front-3/4 poster shot of the Sahrdaya bus is ideal.
- Logo: monochrome SVG (white or cyan) at 24–34 px.
- Fonts: Inter is loaded from Google Fonts; for an offline venue, download Inter and swap the `<link>` for a local `@font-face`.

## Notes

- Designed for 16:9 presentation screens (1366×768 to 4K). Layout degrades gracefully to phones but the dashboard is meant for a projector.
- Audio starts only after the gate click, per browser autoplay rules. Set `audio: false` to run silent.
- To run fully offline, download `gsap.min.js` and `MotionPathPlugin.min.js` (v3.13) and point the two `<script>` tags at local copies.
