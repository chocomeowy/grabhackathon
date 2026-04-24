# 🇸🇬 PulseMap SG: Neighbourhood Intelligence Engine

**PulseMap SG** is a premium, state-of-the-art neighbourhood intelligence dashboard built for the **GrabMaps API Hackathon 2026**. It transforms abstract user "vibes" into actionable urban explorations using real-time GrabMaps geospatial data.

![GrabMaps API Hackathon](https://img.shields.io/badge/Hackathon-GrabMaps%202026-00b14f?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=next.js)
![MapLibre](https://img.shields.io/badge/MapLibre-GL--JS-3bb2d0?style=for-the-badge)

---

## 🌟 The "Aha!" Moment
Navigation apps are built for *destinations*. But what if you don't have one? What if you just have a *feeling*? 
**PulseMap SG** bridges the gap between intent and action. It maps your **Vibe** (e.g., *"quiet afternoon with a book"*) to the **Pulse** of Singapore's neighbourhoods.

## ✨ Key Features

### 🕵️ Vibe Intelligence
*   **Vibe-to-POI Mapping**: Natural language search mapped to Grab POI categories via AI logic.
*   **Vibe Templates**: Quick-discovery buttons for *"Local Food"*, *"Trending Events"*, and *"Chill Cafes"* to eliminate search friction.

### 📊 Neighbourhood Intelligence
*   **Draggable Origin Anchor**: Move your "Home Base" (Blue Anchor) anywhere on the map to recalculate accessibility instantly.
*   **Dynamic Navigation Intel**: Real-time travel time and distance updates for every spot, relative to your custom anchor point.
*   **Hot Events Section**: Discovery of localized events (e.g., *Midnight Hawker Festival*) unique to the target area.
*   **Interactive Intel Cards**: Reveal **"Vibe"** and **"Details"**—AI-generated narratives explaining why a spot is trending.

### 💎 Midnight Premium Design
*   **Bento-Glass Layout**: A state-of-the-art interface featuring 40px blur glassmorphism and Grab Green accents.
*   **Cinematic Mapping**: High-fidelity dark theme with 3D 45° pitch and smooth "Fly-To" animations.
*   **Fully Responsive**: Seamless transition from desktop intelligence to mobile exploration.

---

## 🛠️ Technical Implementation

### 🗺️ High-Fidelity Mapping (Mode 2)
We utilize **MapLibre GL JS** for high-performance vector tile rendering, synchronized with the GrabMaps Style API.
*   **Secure Style Proxy**: Implemented `/api/map/style` to securely fetch Grab styles and bypass browser CORS/Referer restrictions.
*   **Authorization Hook**: Uses a `transformRequest` interceptor to inject Bearer tokens into every tile and glyph request.

### 🧠 Intelligence Layer
*   **AI Context**: OpenAI-powered mapping of natural language queries to high-density POI categories.
*   **Event Simulation**: A dedicated event engine that provides contextual "upcoming" events based on neighbourhood metadata.

### ⚡ GrabMaps API Proxies
*   **Search & Nearby**: Robust backend routes with regional bias (`country=SGP`) and optimized search parameters.
*   **Error Resilience**: Graceful fallbacks to ensure the UI remains interactive even under rate-limiting or regional lock conditions.

---

## 📦 Setup & Deployment

### 1. Environment Variables
Add to your `.env.local`:
```bash
NEXT_PUBLIC_GRABMAPS_API_KEY=bm_... # GrabMaps API Key
NEXT_PUBLIC_OPENAI_API_KEY=sk_...    # OpenAI API Key
```

### 2. Installation
```bash
npm install
npm run dev
```

### 3. Production Whitelisting
To see live map tiles in production, ensure your domain is whitelisted in the **Grab Developer Portal** for the provided API key.

## 🚀 Future Roadmap

*   **Live Transit Integration**: Connect to LTA DataMall for real-time bus and MRT arrival predictions.
*   **Vibe Heatmaps**: Visual overlays showing the "Pulse" of the city based on social media sentiment and Grab traffic density.
*   **Collaborative Vibes**: Share a "Vibe Anchor" with friends to coordinate where to meet based on everyone's travel distance.
*   **Native Grab Integration**: A "Book Now" button to trigger the Grab app directly with the destination pre-filled.

---

## 🛡️ License
Exclusively created for the **GrabMaps API Hackathon 2026**. Designed for the future of urban mobility.
