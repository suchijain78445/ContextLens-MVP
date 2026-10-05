# ContextLens MVP 📸

ContextLens is a high-fidelity, mobile-first Google Photos clone built with React and Vite. It serves as a proof-of-concept for intelligent photo categorization, offering a strict, offline-first timeline gallery.

## ✨ Key Features

* **Authentic Mobile UI**: Faithfully recreates the Google Photos mobile experience within a constrained 390px viewport, complete with status bar, horizontal category chips, and bottom navigation.
* **Smart Offline Categorization**: Automatically maps local directory structures (e.g., `PICS/bills`, `PICS/clothing`) directly to UI category chips without cross-leakage.
* **Chronological Timeline**: Groups hundreds of photos into a seamless chronological feed with authentic date headers (e.g., "October 2026", "September 2025").
* **Zero Runtime API Dependency**: Ships with a massive, pre-generated hardcoded CDN image library covering 21 unique categories (Gym, Goa, Prescription, Bills, Pets, etc.) ensuring no category ever renders blank, all while remaining 100% offline.
* **AI Vision Uploads**: Integrates with Groq's `llama-3.2-11b-vision` API to intelligently and automatically categorize new user uploads based on image pixel analysis.
* **Unified Search**: Instantly filters the global photo pool across titles and strict category tags.

## 🛠️ Tech Stack
* **Frontend**: React, Vite
* **Styling**: Tailwind CSS, Lucide React (Icons)
* **AI Integration**: Groq Vision API (Llama 3.2 11B)
* **Data Layer**: Node.js automated static-generation scripts

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 📁 Local Photo Mapping
To populate the app with your own local files, organize them into subfolders inside `public/PICS/` (e.g., `public/PICS/goa/`, `public/PICS/bills/`), and run the included mapping script to regenerate the strict data structure.
