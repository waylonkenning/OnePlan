# OnePlan: Strategic Roadmap & Visualiser

OnePlan is a powerful, interactive visualiser designed for IT strategic planning. It allows teams to map out initiatives across different IT assets, track dependencies, and identify scheduling conflicts in a clean, timeline-based interface.

## 🚀 Key Features

- **Interactive Timeline:** Drag the edges of initiative bars to change their duration directly in the visualiser.
- **Asset Organisation:** Group initiatives by IT Asset and categorise assets. Drag and drop asset categories to reorder your view.
- **Dependency Tracking:** Visualise relationships between initiatives with dynamic SVG-based dependency arrows.
- **Conflict Detection:** Automatically identifies overlapping initiatives on the same asset and highlights them.
- **Real-time Persistence:** All changes are saved instantly to your browser's IndexedDB, ensuring your data remains across sessions.
- **Data Management:** Full CRUD operations for Assets, Initiatives, Milestones, and more, including Excel import/export capabilities.

## 🛠 Tech Stack

- **Frontend:** React 18 with TypeScript
- **Styling:** Tailwind CSS for modern, responsive design
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Build Tool:** Vite
- **Storage:** IndexedDB (via the `idb` library) for robust client-side data persistence.

## 🏗 Architecture

### Visualiser View (`src/components/Timeline.tsx`)
The core of the application. It uses a custom layout engine to position initiatives without overlapping within an asset's row. It employs a high-performance SVG layer for rendering dependency arrows that stay connected even as you move or resize initiatives.

### Data Management (`src/components/DataManager.tsx`)
A secondary view that allows for bulk editing of the underlying data in a table format.

### Persistence Layer (`src/lib/db.ts`)
Manages the connection to IndexedDB, providing a local-first experience that works without a complex backend while still being more robust than `localStorage`.

## 🚢 Deployment

OnePlan is containerised using Docker and deployed to **Google Cloud Run** via **Google Cloud Build**.

### Continuous Deployment
The deployment pipeline is defined in `cloudbuild.yaml`:
1.  **Build:** A multi-stage Docker build is triggered.
2.  **Push:** The resulting image is pushed to the Google Container Registry.
3.  **Deploy:** The image is deployed to Google Cloud Run, automatically serving the application over HTTPS.

### Container Configuration
The `Dockerfile` uses a two-stage process:
-   **Stage 1 (Build):** Installs dependencies and builds the production-ready static files.
-   **Stage 2 (Production):** Serves the static files using a lightweight Nginx server configured for single-page application (SPA) routing.

## 💻 Local Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start the development server:**
    ```bash
    npm run dev
    ```
3.  **Build for production:**
    ```bash
    npm run build
    ```
