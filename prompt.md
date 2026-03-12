# F1 Strategy Predictor - Complete Documentation

## Project Overview

A modern Formula 1 Race Strategy Predictor Web App inspired by professional motorsport analytics dashboards. Helps users determine optimal race setup for F1 tracks based on tyre choice and track temperature conditions.

**Tech Stack:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

**Live at:** http://localhost:3000

---

## Features

### 1. Track Selection
- 4 F1 circuits with realistic data
- Each track has specific temperature ranges and lap times
- Track characteristics displayed in insights

| Track | Temperature Range | Lap Time | Track Length |
|-------|------------------|----------|--------------|
| Spa-Francorchamps | 14-32C | 1:44 - 1:50 | 7.004 km |
| Silverstone | 10-25C | 1:27 - 1:35 | 5.891 km |
| Bahrain | 25-42C | 1:28 - 1:35 | 5.412 km |
| Monza | 22-35C | 1:18 - 1:25 | 5.793 km |

### 2. Tyre Selection
Two dropdown categories with specific compounds:

**Dry Tyres:**
- Soft (Red) - Max grip, fastest wear (lap time modifier: 0.96x)
- Medium (Yellow) - Balanced performance (lap time modifier: 1.0x)
- Hard (White) - Max durability (lap time modifier: 1.04x)

**Wet Tyres:**
- Full Wet (Blue) - Heavy rain (lap time modifier: 1.15x)
- Intermediate (Green) - Light rain/drying (lap time modifier: 1.08x)

### 3. Temperature Control
- Dynamic slider based on selected track's temperature range
- Preset buttons: Cool, Mid, Hot
- Temperature affects lap times:
  - Too cold (< min): Tyres do not warm up = slower
  - Optimal: Best performance
  - Too hot (> max): Tyre degradation = slower

### 4. Simulation Results
- **Lap Time** - Calculated based on track, tyre, temperature
- **Race Time** - Full race duration (44-57 laps depending on track)
- **Top Speed** - Track and conditions specific (330-365 km/h)
- **Strategy Recommendation** - Detailed advice based on all factors

---

## Project Structure

```text
f1-strategy-predictor/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── predict/page.tsx
│   │   ├── about/page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── TrackSelector.tsx
│   │   ├── TyreSelector.tsx
│   │   ├── TemperatureToggle.tsx
│   │   ├── StrategyPanel.tsx
│   │   ├── PredictionResults.tsx
│   │   ├── TrackInsights.tsx
│   │   └── MetricCard.tsx
│   └── lib/
│       └── strategyEngine.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## Running the Project

```bash
npm install
npm run dev
npm run build
npm start
npm run lint
```

---

## Key Implementation Notes

- Uses App Router (Next.js 14+)
- Dark mode by default
- Responsive design with Tailwind CSS
- TypeScript for type safety
- Client components marked with 'use client'
- Temperature slider dynamically updates based on track selection
- Strategy engine uses pure functions with no API calls

---

*Last Updated: March 2026*
