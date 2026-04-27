# F1 Strategy & Racing Line Intelligence 🏎️🏁

An advanced Formula 1 track analysis and strategy simulation tool built with **Next.js**, **React Three Fiber**, and **TailwindCSS**. This application provides precision racing-line intelligence, cinematic telemetry, and track-first analytics directly in your browser.

## 🌟 Key Features

- **Interactive 3D Track Maps:** Visualize iconic F1 tracks using Three.js, complete with panning, zooming, and dynamic data overlays.
- **Racing Line Intelligence:** View optimal racing lines, apex points, braking zones, throttle zones, and DRS zones.
- **Strategy Engine:** Simulate tire wear, pitstop strategies, and lap-by-lap progression across different tire compounds.
- **Live Telemetry Simulation:** Real-time feedback on car speed gradients and track positioning.
- **Multiple Tracks:** Currently supports legendary circuits like **Monza**, **Silverstone**, **Spa-Francorchamps**, and **Bahrain**.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI/Styling:** React, [TailwindCSS v4](https://tailwindcss.com/), Framer Motion
- **3D Rendering:** [Three.js](https://threejs.org/), [React Three Fiber](https://r3f.docs.pmnd.rs/), [Drei](https://github.com/pmndrs/drei)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons & Typography:** [Lucide React](https://lucide.dev/), Titillium Web, Geist

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js and a package manager (`npm`, `yarn`, `pnpm`, or `bun`) installed.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd f1
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application in action.

## 📂 Project Structure

- `src/app/` - Next.js App Router pages and layouts.
- `src/components/` - Reusable UI components including MapSection, StrategySection, Navbar, and Track3DScene.
- `src/lib/` - Core logic, state management (`store.ts`), strategy algorithms (`strategyEngine.ts`), and track data (`tracks.ts`, `racingLine.ts`).
- `src/styles/` - Global stylesheets.

## 🏎️ Available Tracks

- 🇲🇨 **Monza** (3.337 km, 19 Corners)
- 🇬🇧 **Silverstone** (5.891 km, 18 Corners)
- 🇧🇪 **Spa-Francorchamps** (7.004 km, 19 Corners)
- 🇧🇭 **Bahrain** (5.412 km, 15 Corners)

## 🤝 Contributing

Feedback and contributions are welcome! Feel free to open issues or submit pull requests to enhance the simulation capabilities or add new tracks.

---
*Built with passion for F1 and modern web technologies.*
