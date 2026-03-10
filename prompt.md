# RACELINE IQ — FRONTEND ENGINEERING BRIEF
**Classification: Internal Engineering • Version 2.0.0**
**Prepared by: CTO Office**
**Changelog v2.0.0: Added PAGE 3 (Custom Track), PAGE 4 (Track Intelligence), Track Filter System, Image Upload Pipeline**

---

## EXECUTIVE MANDATE

You are building a **route intelligence platform** that looks and feels like it was built by the Formula 1 Technology Division. Not inspired by F1. Not "F1-like." It IS F1. Every pixel, every number, every transition must feel like it belongs on a pitwall monitor at Interlagos.

There is **zero tolerance** for:
- Generic layouts
- Default Tailwind component patterns
- Rounded-corner card soup
- Purple gradients
- Soft shadows
- Inter / Roboto / system fonts
- Any element that looks like it belongs on a SaaS landing page

This brief is **non-negotiable**. If a decision is not specified here, default to: *"What would the F1 broadcast team do?"*

---

## TECH STACK — LOCKED. DO NOT DEVIATE.

```
Framework:        React 18 + TypeScript (strict mode)
Styling:          Tailwind CSS + CSS custom properties
Animation:        Framer Motion 11
3D Rendering:     @react-three/fiber + @react-three/drei + three.js
Routing:          React Router v6
Font loading:     @fontsource/titillium-web
State:            Zustand
Build:            Vite
Image Processing: Canvas API (native browser — no OpenCV, no deps)
```

---

## DESIGN TOKENS — SINGLE SOURCE OF TRUTH

Paste this into `src/styles/tokens.css`. Every color, spacing, and shadow in the app must reference these variables. No hardcoded hex values anywhere in component files.

```css
:root {
  /* Core Palette */
  --color-bg:            #0A0A0A;
  --color-bg-elevated:   #111111;
  --color-bg-card:       rgba(255, 255, 255, 0.035);
  --color-bg-card-hover: rgba(255, 255, 255, 0.06);
  --color-surface:       #1A1A1A;

  /* Accent — F1 Official Red */
  --color-red:           #E8002D;
  --color-red-dim:       rgba(232, 0, 45, 0.15);
  --color-red-glow:      rgba(232, 0, 45, 0.35);
  --color-red-border:    rgba(232, 0, 45, 0.45);

  /* Text */
  --color-text-primary:  #FFFFFF;
  --color-text-secondary:#AAAAAA;
  --color-text-muted:    #555555;
  --color-text-data:     #F0F0F0;

  /* Borders */
  --color-border:        rgba(255, 255, 255, 0.07);
  --color-border-strong: rgba(255, 255, 255, 0.14);

  /* Status */
  --color-green:         #39FF14;
  --color-yellow:        #FFD700;
  --color-blue:          #00D2FF;

  /* Track Analysis Colors — used in filter overlays */
  --color-speed-max:     #FF1E00;   /* fastest zones */
  --color-speed-high:    #FFD700;   /* high speed */
  --color-speed-mid:     #00FF87;   /* medium speed */
  --color-speed-low:     #00D2FF;   /* slow zones */
  --color-speed-min:     #3050FF;   /* minimum speed / hairpins */
  --color-brake-zone:    rgba(255, 30, 0, 0.75);
  --color-drs-zone:      rgba(0, 210, 255, 0.75);
  --color-apex:          #FFD700;
  --color-racing-line:   #E8002D;

  /* Typography */
  --font-display:        'Titillium Web', sans-serif;
  --font-data:           'Titillium Web', monospace;

  /* Spacing Scale (8pt grid) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Transitions */
  --transition-fast:   120ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-medium: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow:   500ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Shadows */
  --shadow-red-sm:  0 0 12px rgba(232, 0, 45, 0.25);
  --shadow-red-md:  0 0 30px rgba(232, 0, 45, 0.40);
  --shadow-red-lg:  0 0 60px rgba(232, 0, 45, 0.30);
  --shadow-card:    0 4px 24px rgba(0, 0, 0, 0.6);
}
```

---

## TYPOGRAPHY RULES — ABSOLUTE

```
Font family:      Titillium Web ONLY. Load weights: 300, 400, 600, 700, 900
Font rendering:   -webkit-font-smoothing: antialiased on <html>

Hero H1:          96px / weight 900 / line-height 0.88 / letter-spacing -0.02em
Section headers:  48px / weight 700 / line-height 1.0
Card headers:     11px / weight 600 / letter-spacing 0.18em / UPPERCASE / color: muted
Stat values:      64px / weight 700 / font-variant-numeric: tabular-nums
Body text:        14px / weight 400 / line-height 1.6
Labels:           11px / weight 600 / letter-spacing 0.15em / UPPERCASE
Delta values:     14px / weight 600 / tabular-nums (+ prefix green, - prefix red)
```

**RULE:** Stat numbers must NEVER reflow or resize. Set explicit `min-width` using `ch` units based on character count. A lap time that changes from `1:09.419` to `1:11.310` must not shift surrounding layout by a single pixel.

---

## GLOBAL RULES — ENFORCED EVERYWHERE

1. **No border-radius above 2px** on any structural element. Cards, buttons, panels — all sharp corners or max 2px.
2. **No box shadows** except the predefined `--shadow-*` tokens. No `shadow-lg` from Tailwind.
3. **All interactive elements** must have a `var(--transition-fast)` transition on hover/focus.
4. **Never use `0` for empty data.** Use `—·—·—` in muted color.
5. **Video elements:** always `muted autoplay loop playsInline`. Never show native controls.
6. **All animations** must respect `@media (prefers-reduced-motion: reduce)`.
7. **Custom scrollbar** globally:
```css
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: var(--color-bg); }
::-webkit-scrollbar-thumb { background: var(--color-red); }
```
8. **Loading state** for any async operation: top-of-page thin red progress bar (like NProgress), not a spinner.
9. **Focus states:** `outline: 1px solid var(--color-red)` at 2px offset. Never remove focus ring.

---

## REUSABLE COMPONENT SPECS

### `<TelemetryCard />`
```
Background:     var(--color-bg-card)
Border:         1px solid var(--color-border)
Border-left:    3px solid var(--color-red)
Padding:        16px 20px
Hover:          background → var(--color-bg-card-hover)
                border-left glow → box-shadow: var(--shadow-red-sm) on left edge
Transition:     var(--transition-fast)

Internal layout:
  - Top: LABEL (11px uppercase muted) + optional icon (16px, muted)
  - Bottom: VALUE (48–64px bold tabular) + optional unit (14px muted, aligned baseline)
  - Optional: delta row below value
```

### `<GlowButton />`
```
Background:     var(--color-red)
Color:          #FFFFFF
Padding:        12px 32px
Font:           11px / weight 700 / letter-spacing 0.2em / UPPERCASE
Border-radius:  2px MAX
Border:         none
Hover:          box-shadow: var(--shadow-red-md), brightness(1.1)
Active:         scale(0.98)
Transition:     var(--transition-fast)
```

### `<GhostButton />`
```
Background:     transparent
Color:          var(--color-text-secondary)
Border:         1px solid var(--color-border-strong)
Hover:          border-color → var(--color-red-border), color → white
```

### `<PilotBadge />`
```
Layout:         horizontal flex, gap 10px, align-center
Photo:          32x32px, grayscale(30%), object-fit cover, sharp corners
Position tag:   [P1] — 10px bold uppercase, bg: var(--color-red), padding 2px 6px
Name:           14px / weight 600 / uppercase / letter-spacing 0.1em
Delta:          small delta below name, color green/red
Active state:   left 3px red border, background elevated
```

### `<SectorBadge />`
```
S1 / S2 / S3 labels:
  Default:  dim background, muted text
  Active:   var(--color-red) background, white text
  Best:     var(--color-green) background, black text
  Shape:    0px border-radius, 8px 12px padding
```

### `<RedDivider />`
```html
<div style="height:1px; background: linear-gradient(
  90deg, var(--color-red) 0%, rgba(232,0,45,0.2) 60%, transparent 100%
)" />
```

### `<LiveIndicator />`
```
● LIVE
Red blinking dot (CSS keyframe: opacity 1 → 0.2 → 1, 1.4s infinite)
Label: 10px uppercase tracking-widest muted
```

### `<TrackFilterToggle />` ← NEW
```
A pill-shaped toggle button for each track analysis layer.
Shape:      0px border-radius, 28px height, min-width 80px
Padding:    0 12px
Font:       10px / weight 700 / uppercase / letter-spacing 0.15em

States:
  OFF:  background transparent, border 1px solid var(--color-border),
        color var(--color-text-muted)
  ON:   background uses layer accent color (see filter definitions),
        color #000 (dark text on colored bg) OR #fff for dark accents,
        box-shadow: 0 0 10px [layer color at 40% opacity]

Left dot indicator: 6px circle, color = layer accent color
Transition: var(--transition-fast)

Usage: rendered in a horizontal scrollable strip — never wraps to 2 lines
```

### `<CornerCallout />` ← NEW
```
Appears on click/zoom into a corner section in 3D view.
Position: absolute, anchored to screen position of clicked corner

Container:
  background: rgba(10,10,10,0.92)
  border: 1px solid var(--color-border-strong)
  border-top: 2px solid var(--color-red)
  padding: 12px 16px
  width: 160px

Content rows:
  CORNER NAME     — 10px uppercase muted
  [value]         — 20px weight-700 white

  SPEED           — 10px uppercase muted
  [X] km/h        — 16px weight-600 white

  CURVATURE       — 10px uppercase muted
  [X.XXX] rad/m   — 16px weight-600 color based on severity:
                    < 0.02 → green (fast)
                    0.02–0.06 → yellow (medium)
                    > 0.06 → red (slow)

  BRAKING ZONE    — 10px uppercase muted
  YES / NO        — 10px weight-700, red if YES

Animation: fadeIn + translateY(-4px), 150ms
Dismiss: click anywhere else
```

---

## PAGE 1: HOMEPAGE `/`

### NAV (fixed, full-width)
```
Height:           52px
Background:       transparent → rgba(10,10,10,0.95) + backdrop-blur(12px) on scroll
Border-bottom:    1px solid var(--color-border) — appears on scroll only
Padding:          0 48px
Z-index:          100

Left:   Logo — "RACELINE" white bold 900 + "IQ" in --color-red + 4px red dot •
Center: Links — DASHBOARD / ROUTE / TRACKS / UPLOAD
        Style: 11px uppercase tracking-widest, muted → white on hover
        Active: white + 2px bottom border red
Right:  PilotBadge (user avatar) + session timer
```

### HERO SECTION (100vh, overflow hidden)
```
Layer 1 — Video:
  Element: <video> tag, src="/assets/hero.mp4"
  Style: position absolute, inset 0, width 100%, height 100%, object-fit cover
  Filter: brightness(0.45) saturate(0.8)
  Fallback bg: #0A0A0A with track noise texture

Layer 2 — Gradient Overlay:
  background: linear-gradient(
    180deg,
    rgba(10,10,10,0.1) 0%,
    rgba(10,10,10,0.4) 50%,
    rgba(10,10,10,1) 100%
  )

Layer 3 — Scan Line (CSS animation):
  Thin 1px horizontal red line, opacity 0.15
  Keyframe: translateY(-100vh) → translateY(100vh), duration 4s, infinite, linear

Layer 4 — Content (position relative, z-index 10):
  Placement: center-left, padding-left 10vw, padding-top 0

  Eyebrow row (flex, gap 8px):
    [ FORMULA 1 ]  [ ROUTE INTELLIGENCE ]
    Style: 10px uppercase tracking-widest, border 1px solid red-border,
           padding 4px 10px, color red, bg red-dim

  H1 (two lines):
    Line 1: "FIND THE"        — white, 96px weight-900
    Line 2: "FASTEST ROUTE"   — var(--color-red), 96px weight-900
    Animation: each word fades up with 80ms stagger on mount

  Subheading:
    "Precision-engineered navigation. Race-grade intelligence."
    14px / muted / weight 400 / max-width 420px

  Button row (flex, gap 12px, margin-top 40px):
    Primary: <GlowButton> "PREDICT MY ROUTE →"
    Secondary: <GhostButton> "UPLOAD TRACK IMAGE"

  Racing line decoration:
    Animated SVG line extending from bottom-left of hero
    Curves like an F1 circuit section, color red, opacity 0.4
    Stroke-dashoffset draw-in animation on mount
```

### BOTTOM HUD BAR (fixed to bottom of hero)
```
Position:       absolute bottom-0, full-width
Height:         72px
Background:     rgba(10,10,10,0.85) + backdrop-blur(16px)
Border-top:     1px solid var(--color-border)
Top-accent:     2px solid var(--color-red) at very top edge
Padding:        0 48px

Layout: flex space-between, align-center

Left:   <LiveIndicator /> + "SÃO PAULO GRAND PRIX 2026"

Center: 4 <StatBlock> items separated by 1px vertical dividers
        MAX SPEED: 372.5 km/h
        BEST LAP: 1:09.419
        CURRENT LAP: 12 / 58
        ROUTE EFFICIENCY: 98.3%

Right:  Session clock counting up: 1:23:47.2
        Format: monospace, 18px, tabular-nums, weight 600
        Updates every 100ms
```

---

## PAGE 2: ROUTE PREDICTION `/predict`

### LAYOUT
```
Full viewport height, no vertical scroll on outer container
Two columns: LEFT 62% | RIGHT 38%
No gap between columns — hard edge
```

### LEFT PANEL — COCKPIT PREVIEW
```
Background: #000000
Position: relative, overflow hidden
Height: 100vh

LAYER 1 — VIDEO FEED:
  <video> cockpit POV, src="/assets/cockpit.mp4"
  Width: 100%, height: 100%, object-fit: cover
  Filter: brightness(0.85) contrast(1.1)
  Transform: scale(1.05)
  On route change: animate scale 1.0 → 1.08 over 800ms ease-out

LAYER 2 — RACING LINE SVG OVERLAY:
  Position: absolute inset-0
  Primary line:   stroke="#E8002D" strokeWidth="3" opacity="0.9"
  Glow layer:     stroke="#E8002D" strokeWidth="12" opacity="0.15" blur(8px)
  Animation: stroke-dashoffset draw-in, 1200ms ease-out

LAYER 3 — TOP-LEFT HUD:
  GEAR / SPEED / THROTTLE BAR / BRAKE INDICATOR

LAYER 4 — BOTTOM SECTOR STRIP:
  Route name + <SectorBadge> row
```

### RIGHT PANEL — TELEMETRY DATA
```
SECTION 1 — TOP NAV
SECTION 2 — ROUTE LEADERBOARD
SECTION 3 — PRIMARY STAT
SECTION 4 — TELEMETRY GRID
SECTION 5 — ROUTE SEGMENTS
SECTION 6 — LAUNCH BUTTON: <GlowButton> "LAUNCH NAVIGATION ↗"
```

---

## PAGE 3: CUSTOM TRACK — IMAGE UPLOAD & 3D VISUALIZATION `/track/custom` ← NEW

This is the most technically complex page. It has three sequential modes that the user flows through.

```
MODE A: UPLOAD     → user uploads an image of a track
MODE B: PROCESSING → image pipeline extracts centerline + computes racing line
MODE C: VISUALIZE  → 3D track renders with animated car + filters + zoom
```

### LAYOUT (all three modes share this shell)
```
Full viewport. No scroll.
Background: var(--color-bg) — pure black feels right here.

Top bar (52px):
  Left:  ← BACK  |  CUSTOM TRACK ANALYZER
  Right: mode indicator — [UPLOAD] → [PROCESSING] → [VISUALIZE]
         Active step: red background. Complete step: green dot + label.
         Incomplete: muted border.

Main content area: 100vh - 52px (fills everything below top bar)
```

---

### MODE A — UPLOAD SCREEN

```
LAYOUT: centered vertically and horizontally, max-width 560px

UPLOAD ZONE:
  Border:     2px dashed var(--color-border-strong)
  Background: var(--color-bg-card)
  Padding:    64px 48px
  Width:      100%
  Cursor:     pointer

  Center content (flex column, gap 16px, align-center):

    Icon: SVG of a racing circuit outline — simple, minimal
          Width 64px, color var(--color-text-muted)
          On drag-over: color → var(--color-red), scale(1.05), 150ms

    Label: "DROP TRACK IMAGE HERE"
           14px / weight 600 / uppercase / letter-spacing 0.15em / white

    Sublabel: "PNG, JPG, SVG · Max 10MB"
              11px / muted

    Divider: "—— OR ——" (muted, 11px, letter-spacing 0.2em)

    <GlowButton> "BROWSE FILES"
      onClick: triggers hidden <input type="file" accept="image/*,.svg">

  Drag-over state:
    Border color → var(--color-red)
    Background  → var(--color-red-dim)
    Scan line animation activates (same as hero)
    Transition: var(--transition-fast)

ACCEPTED FORMAT NOTE (below upload zone):
  Two info rows:
  ✓  SVG files — fastest processing, most accurate
  ✓  PNG/JPG — auto-processed via canvas pixel analysis

  Style: 11px muted, left-aligned, gap 6px between rows

EXAMPLE IMAGES ROW (below format note):
  Label: "EXAMPLE INPUTS" — 10px uppercase muted
  3 small track thumbnails (80x60px)
    border: 1px solid var(--color-border)
    Hover: border-color → red
    Label below each: "MONACO" / "SILVERSTONE" / "SPA"
    Clicking loads a sample track directly into processing mode
```

---

### MODE B — PROCESSING SCREEN

```
This screen is shown while the image pipeline runs.
Target duration: 800ms–2000ms (real processing — not fake delay).

LAYOUT: centered, max-width 480px

TOP: Track image preview
  The uploaded image, shown at 320px wide
  Border: 1px solid var(--color-border)
  Filter: brightness(0.7) — dimmed while processing

PROGRESS LOG (below image):
  A terminal-style scrolling log of processing steps.
  Background: #000, border: 1px solid var(--color-border)
  Font: monospace 11px, color: var(--color-green), padding 16px
  Line-height: 1.8

  Lines appear sequentially as each step completes:
    >  READING IMAGE DATA...           [DONE]  42ms
    >  THRESHOLD DETECTION...          [DONE]  88ms
    >  EDGE EXTRACTION...              [DONE] 124ms
    >  CENTERLINE SKELETONIZATION...   [DONE] 310ms
    >  POINT SAMPLING (n=22)...        [DONE]  18ms
    >  CATMULL-ROM INTERPOLATION...    [DONE]   8ms
    >  GRADIENT DESCENT OPTIMIZER...   [DONE] 340ms
    >  SPEED PROFILE COMPUTATION...    [DONE]  12ms
    >  BUILDING 3D GEOMETRY...         COMPUTING...

  Current active line: color white, blinking cursor ▮ at end
  Completed lines: color var(--color-green)
  Time values: color var(--color-yellow), right-aligned with tabular-nums

PROGRESS BAR:
  Full-width, height 2px, below the log
  Background: var(--color-surface)
  Fill: var(--color-red), animates left to right via CSS width transition
  Percentage fills as each step completes

  Below bar: "STEP 7 OF 9 — OPTIMIZING RACING LINE"
  11px / muted / tabular-nums
```

---

### MODE C — VISUALIZE SCREEN

This is the final output. A full 3D interactive track with filter controls and an animated car.

```
LAYOUT: full viewport
  3D canvas fills entire screen
  All UI elements float over it as absolute positioned overlays
```

#### 3D SCENE (React Three Fiber)

```
Camera setup:
  Default: perspective camera, 60° FOV, position above track
           OrbitControls enabled — user can rotate, zoom, pan freely
  Zoom mode: see INTERACTION section below

Scene contents:

  1. TRACK SURFACE
     Three.js ExtrudeGeometry or ShapeGeometry
     Material: MeshStandardMaterial
       color: #1c1c30
       roughness: 0.9
       metalness: 0.1
     Slight vertical extrusion (2–4 units) gives the track a 3D slab look

  2. INNER WALL (thin raised border)
     TubeGeometry along inner wall points
     Material: MeshStandardMaterial, color: #ffffff, roughness: 0.4
     Radius: small (0.5–1 unit)

  3. OUTER WALL
     Same as inner wall

  4. RACING LINE
     TubeGeometry along racing line points
     Radius: slightly smaller than walls
     Material: MeshBasicMaterial — color driven by active filters
     Default: var(--color-racing-line) red
     When SPEED GRADIENT filter is ON: vertex colors (blue→green→yellow→red)

  5. ANIMATED CAR
     Simple geometry: BoxGeometry (4×2×1 units) — no complex model needed
     Material: MeshStandardMaterial, color: #E8002D
     Headlight glow: PointLight attached to car position, color white, intensity 2
     Tail glow: PointLight, color red, intensity 1.5

     Animation (useFrame loop):
       t increments by: baseSpeed / totalPathLength / 60fps
         baseSpeed is driven by speedProfile[currentIndex]
         Fast sections: t increments quickly
         Slow corners: t increments slowly (car visibly decelerates)
       position = racingLineCurve3D.getPoint(t)
       rotation: car faces forward using .lookAt(tangent point ahead)
       t wraps: 0 → 1 → 0 (infinite loop, never stops)

  6. APEX MARKERS (when APEX filter is ON)
     Icosahedron geometry at slowest points on racing line
     Color: var(--color-apex) gold
     Slight Y-axis rotation animation (0.5 rpm)
     PointLight glow: color gold, intensity 0.8

  7. BRAKING ZONE OVERLAY (when BRAKE ZONES filter is ON)
     Flat PlaneGeometry sections over braking approach areas
     Material: MeshBasicMaterial, color: #FF1E00, transparent: true, opacity: 0.18
     Pulsing opacity animation: 0.12 → 0.22 → 0.12, 1.5s infinite

  8. DRS ZONE MARKER (when DRS filter is ON)
     Flat colored strip over DRS detection zones
     Color: var(--color-blue) #00D2FF, opacity 0.2
     Label (HTML overlay, not 3D text): "DRS" in blue

  9. SCENE LIGHTING
     AmbientLight: color #ffffff, intensity 0.3
     DirectionalLight: color #ffffff, intensity 1.2, position [10, 20, 10]
     Hemisphere light: skyColor #1a1a3a, groundColor #0a0a0a, intensity 0.5
```

#### INTERACTION — ZOOM BEHAVIOR

```
DEFAULT STATE:
  Camera: bird's eye, shows full track
  OrbitControls: fully enabled
  Car: animating on loop, visible as small red dot

CLICK ON TRACK SECTION:
  Raycast detects intersection with track mesh
  Find nearest point on racing line to click position
  
  Camera transition:
    Framer Motion animateCamera (or gsap-style lerp in useFrame):
    - Position lerps from current → [cornerX, cornerY+6, cornerZ+8]
    - Target lerps to car position
    - Duration: 600ms, easing: cubicBezier(0.25, 0.46, 0.45, 0.94)
    - OrbitControls temporarily disabled during transition
  
  Zoomed state:
    Camera follows car from close-behind angle
    Camera position = car.position + (-tangent * 8) + (up * 4)
    Camera looks at car.position + (tangent * 4) — slightly ahead of car
    Updates every frame (feels like a chase cam)
    
    <CornerCallout /> overlay appears (see component spec above)
    Shows: corner name, speed at this point, curvature value, braking zone Y/N
  
  EXIT ZOOM:
    Press ESC key, OR
    Click anywhere outside track, OR
    Click "EXIT ZOOM" button overlay (top-right, <GhostButton>)
    
    Camera lerps back to default bird's eye position over 500ms
    CornerCallout dismisses
    OrbitControls re-enabled
    Car continues animation uninterrupted throughout (never pauses)
```

#### FILTER CONTROL STRIP — OVERLAY

```
Position: absolute, bottom 24px, left 50%, transform translateX(-50%)
Layout: horizontal flex, gap 6px
Background: rgba(10,10,10,0.85)
Border: 1px solid var(--color-border)
Border-top: 2px solid var(--color-red)
Padding: 10px 16px

Contains 7 <TrackFilterToggle /> buttons:

  1. RACING LINE
     Accent color: var(--color-red)
     Default: ON
     Effect: shows/hides the racing line tube geometry

  2. SPEED GRADIENT
     Accent color: linear (can't do gradient on button — use yellow #FFD700)
     Default: OFF
     Effect: when ON, racing line tube switches from solid red to
             vertex-colored gradient (blue=slow → red=fast)
             Legend appears bottom-right when active (see SPEED LEGEND)

  3. BRAKE ZONES
     Accent color: #FF1E00
     Default: OFF
     Effect: shows red translucent planes on braking approach areas
             + red dashed line 60–80m before each apex

  4. APEX POINTS
     Accent color: var(--color-yellow)
     Default: OFF
     Effect: shows gold icosahedron markers at slowest curve points

  5. DRS ZONES
     Accent color: var(--color-blue)
     Default: OFF
     Effect: shows blue translucent strips on DRS activation zones

  6. FAST ZONES
     Accent color: var(--color-green)
     Default: OFF
     Effect: highlights top 20% speed sections with green glow overlay
             on the racing line tube + PointLight tint

  7. SLOW ZONES
     Accent color: #3050FF (deep blue)
     Default: OFF
     Effect: highlights bottom 20% speed sections with blue glow

Filter toggles animate:
  OFF → ON: background fills left to right in 120ms
  ON → OFF: background drains right to left in 120ms
  All geometry changes: 200ms opacity transition (never instant pop)
```

#### SPEED GRADIENT LEGEND (appears when SPEED GRADIENT filter is ON)

```
Position: absolute, bottom 80px, right 24px
Width: 140px

Container:
  background: rgba(10,10,10,0.85)
  border: 1px solid var(--color-border)
  padding: 10px 12px

Title: "SPEED" — 10px uppercase muted, margin-bottom 8px

Gradient bar:
  Height: 8px, width: 100%
  background: linear-gradient(to right, #3050FF, #00D2FF, #00FF87, #FFD700, #FF1E00)

Labels below bar (flex space-between):
  "[minSpeed] km/h"  —  "[maxSpeed] km/h"
  10px / muted / tabular-nums

Appear animation: fadeIn 200ms when filter activates
```

#### INFO PANEL — TOP LEFT OVERLAY

```
Position: absolute, top 24px, left 24px
Width: 200px

Container:
  background: rgba(10,10,10,0.88)
  border: 1px solid var(--color-border)
  border-left: 3px solid var(--color-red)
  padding: 14px 16px

Content rows:
  TRACK NAME        — 10px uppercase muted
  [name or CUSTOM]  — 16px weight-700 white

  ——— (RedDivider)

  RACING LINE PTS   — 10px uppercase muted
  [n] GATES         — 14px weight-600 green

  COMPUTE TIME      — 10px uppercase muted
  [X]ms             — 14px weight-600 yellow

  TOP SPEED         — 10px uppercase muted
  [X] km/h          — 14px weight-600 red

  MIN SPEED         — 10px uppercase muted
  [X] km/h          — 14px weight-600 blue

  ——— (RedDivider)

  EST. LAP TIME     — 10px uppercase muted
  [M:SS.mmm]        — 18px weight-700 white
```

#### CONTROLS HINT — BOTTOM RIGHT OVERLAY

```
Position: absolute, bottom 80px, right 24px  (above legend if legend visible)

Container:
  background: rgba(10,10,10,0.7)
  border: 1px solid var(--color-border)
  padding: 8px 12px

Rows (10px muted, gap 4px):
  CLICK TRACK   →  zoom to corner
  SCROLL        →  zoom in/out
  DRAG          →  rotate view
  ESC           →  exit zoom
```

---

### IMAGE PROCESSING PIPELINE (TypeScript — no external libs)

Implement in `src/lib/trackExtraction.ts`

```typescript
// Full pipeline. All processing done via Canvas API in the browser.
// No OpenCV. No server. No external deps.

export async function extractTrackFromImage(file: File): Promise<ExtractedTrack>

// Step 1: loadImageToCanvas(file) → ImageData
//   Create offscreen canvas, draw image, getImageData()
//   Resize to max 800x800 while maintaining aspect ratio before getImageData

// Step 2: detectTrackPixels(imageData) → boolean[][]
//   For each pixel:
//     Convert RGB → HSV
//     A "track pixel" is any pixel significantly different from the background
//     Background detection: sample corners of image, average their colors
//     Threshold: if pixel color distance from background > 40 (euclidean RGB) → track
//   Output: 2D boolean grid, true = track pixel

// Step 3: skeletonize(grid) → boolean[][]
//   Zhang-Suen thinning algorithm (pure JS, ~60 lines)
//   Reduces the track band to a single-pixel-wide centerline
//   Input: filled boolean grid from step 2
//   Output: thinned boolean grid

// Step 4: extractOrderedPoints(skeleton) → [x,y][]
//   Find a start pixel (topmost true pixel)
//   Trace the skeleton by always moving to the nearest unvisited neighbor
//   8-connected neighbor search
//   Output: ordered array of pixel coordinates tracing the circuit

// Step 5: simplifyPath(points, epsilon) → [x,y][]
//   Ramer-Douglas-Peucker algorithm
//   epsilon = 8.0 (tune: higher = fewer points, lower = more detail)
//   Target output: 16–28 waypoints representing track shape

// Step 6: normalizeTo01(points) → [x,y][]
//   Map all x,y from pixel space to 0–1 coordinate space

// Step 7: ensureClockwise(points) → [x,y][]
//   Calculate signed area (shoelace formula)
//   If negative → reverse array (ensures consistent direction for optimizer)

// Step 8: Pass normalized points to existing racingLine algorithm
//   interpolateWaypoints(points, resolution=8) → centerline
//   buildGates(centerline, hw=0.025) → gates
//   optimizeRacingLine(gates, 700) → racingLine
//   computeSpeedProfile(racingLine, compound, weather) → speeds

// Progress callback:
//   Each step emits: onProgress(stepIndex: number, stepName: string, durationMs: number)
//   Used to drive the terminal log in MODE B

export interface ExtractedTrack {
  waypoints:    [number, number][]
  centerline:   [number, number][]
  gates:        Gate[]
  racingLine:   [number, number][]
  speeds:       number[]
  computeMs:    number
  pointCount:   number
}
```

---

## PAGE 4: TRACK INTELLIGENCE `/tracks` ← NEW

Pre-loaded F1 tracks with the same 3D visualization and filter system.

### LAYOUT
```
Left panel (320px): track selector list
Right panel (flex-1): 3D visualization (same Track3DScene component as PAGE 3)
```

### LEFT PANEL
```
Background: var(--color-bg-elevated)
Border-right: 1px solid var(--color-border)
Padding: 0

Header (52px):
  "SELECT CIRCUIT" — 11px uppercase muted, padding 0 20px
  Search input: dark bg, red focus border, 11px font

Track list:
  Each row (64px height):
    Left: country flag emoji (20px) + track name (12px weight-700 uppercase)
    Right: lap record time (12px tabular-nums muted)
    Below name: circuit length + corner count (10px muted)
    Hover: background → var(--color-bg-card-hover)
    Active: border-left 3px red, background elevated, name → white

  Available tracks:
    🇲🇨 MONACO          · 3.337 km · 19 corners · 1:12.909
    🇬🇧 SILVERSTONE      · 5.891 km · 18 corners · 1:27.097
    🇧🇪 SPA              · 7.004 km · 19 corners · 1:41.252
    🇮🇹 MONZA            · 5.793 km · 11 corners · 1:21.046

  Bottom of list:
    <GhostButton> full-width "UPLOAD CUSTOM TRACK +"
    → navigates to /track/custom
```

### RIGHT PANEL
```
Same 3D scene as PAGE 3 MODE C.
Same filter strip.
Same zoom behavior.
Same info panel overlay.

Difference: track is loaded from pre-defined waypoints in /lib/data/tracks.ts
            instead of extracted from uploaded image.

Track switch animation:
  Old track: opacity → 0, scale → 0.95, 200ms
  New track: opacity → 1, scale → 1, 200ms (after old fades out)
  Car resets to t=0 on track switch
```

---

## ANIMATIONS — MASTER REFERENCE

```
PAGE LOAD SEQUENCE (staggered, total duration 800ms):
  0ms:    Nav fades in
  100ms:  Hero eyebrow badges slide up
  200ms:  H1 Line 1 slides up + fades in
  280ms:  H1 Line 2 slides up + fades in
  360ms:  Subheading fades in
  440ms:  Buttons fade up
  600ms:  HUD bar slides up from bottom
  700ms:  HUD stats count up from 0

STAT COUNT-UP:
  Duration: 800ms / Easing: easeOut
  Decimals: preserve throughout animation
  Never animate text containing letters

RACING LINE DRAW-IN (3D scene on load):
  Car starts invisible
  Racing line tube: opacity 0 → 1 over 600ms after scene loads
  Car: appears at t=0 after tube is visible, fades in 200ms
  Filter toggles: slide up from bottom, 40ms stagger each

NUMBER UPDATE FLASH:
  color → var(--color-red) 80ms → var(--color-text-data) 300ms

CAMERA ZOOM TRANSITION:
  Duration: 600ms
  Easing: cubicBezier(0.25, 0.46, 0.45, 0.94)
  Never snap — always lerp

FILTER TOGGLE:
  ON:  geometry fades in 200ms, button fills left-to-right 120ms
  OFF: geometry fades out 200ms, button drains right-to-left 120ms
```

---

## RESPONSIVE BEHAVIOR

```
≥1440px:  Full experience as specified.
1024–1439px: Right panel increases to 44%, fonts scale down 10%
768–1023px:  Stack vertically. 3D view 55vh, panels below.
<768px:   3D view full screen. Filter strip becomes scrollable.
          Info overlay collapses to icon-only, expands on tap.
          CornerCallout appears at bottom of screen instead of anchored.
```

---

## PERFORMANCE REQUIREMENTS

```
LCP:                        < 2.0s
CLS:                        < 0.05
3D scene initial render:    < 1.0s after data ready
Image processing pipeline:  < 2.5s for 800x800px input
Racing line optimizer:      < 400ms for 700 iterations
Camera transitions:         60fps locked (transform only, no layout thrash)
Filter toggle latency:      < 16ms (one frame) — geometry already in scene,
                            just opacity/visibility change
Video:                      Preload metadata only.
Fonts:                      font-display: swap. Preload weight 700 + 900.
All 3D animations:          requestAnimationFrame via useFrame — no setInterval
```

---

## WHAT THIS IS NOT

```
✗ Rounded cards with shadow-lg
✗ Gradient from purple to pink anything
✗ Skeleton loaders that are rounded rectangles
✗ "Dashboard" layouts with left sidebar nav
✗ Toast notifications (use inline HUD alerts)
✗ Modal dialogs (use panel slides)
✗ Any animation using spring physics that wobbles
✗ Emojis in UI copy (flags are data, not decoration — exception)
✗ Tooltips with rounded corners
✗ Tables with zebra striping
✗ Any color other than those in the design token file
✗ 3D text rendered in Three.js (use HTML overlays instead — sharper)
✗ Spinning loading spinners (use the red progress bar)
✗ Alert/confirm dialogs (never)
```

---

## FINAL STANDARD

When you look at the finished screen, you should feel like you are in the McLaren Technology Centre looking at a pit wall monitor during qualifying at Interlagos.

If it doesn't feel like that — it's not done.

---
*RACELINE IQ • Frontend Engineering Brief v2.0.0 • CTO Office*
*Changes: +PAGE 3 Custom Track (Upload → Process → Visualize), +PAGE 4 Track Intelligence, +TrackFilterToggle component, +CornerCallout component, +7-filter system, +Image Processing Pipeline spec, +3D scene full spec, +Camera zoom interaction, +Speed gradient legend*
