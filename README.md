# Kerala's Pristine Beaches - Immersive Experience

This project is an immersive web experience that allows users to explore the beautiful beaches of Kerala, India. It features an interactive map with custom markers, detailed information about each beach, and a visually appealing design with smooth animations.

## Features

*   **Interactive Map**: An interactive map of Kerala with markers for over 15 pristine beaches.
*   **Detailed Beach Information**: Click on any marker to view a popup with details about the beach, including a description, features, rating, and number of reviews.
*   **Visually Appealing Design**: A modern and clean design with a color-shifting background gradient and blooming markers.
*   **Responsive Design**: The layout is fully responsive and works on all screen sizes, from mobile phones to desktops.
*   **Offline Access**: A service worker is used to cache all the necessary assets, allowing the page to be accessed even without an internet connection.
*   **Loading Screen**: A beautiful loading screen to entertain the user while the page is loading.

## Running Locally

To run this page locally, you need a simple HTTP server. You can use Python's built-in `http.server` module for this.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/kerala-beaches.git
    ```
2.  **Navigate to the project directory**:
    ```bash
    cd kerala-beaches
    ```
3.  **Start the HTTP server**:
    *   If you have Python 3, run:
        ```bash
        python -m http.server
        ```
    *   If you have Python 2, run:
        ```bash
        python -m SimpleHTTPServer
        ```
4.  **Open your browser**:
    Open your web browser and navigate to `http://localhost:8000`.

## Service Worker

This project uses a service worker to provide offline capabilities. The service worker caches all the static assets of the page, including the HTML, CSS, JavaScript, and images. This means that once you have visited the page, you can access it again even if you are offline.

To see the service worker in action, you can use the "Offline" option in the "Network" tab of your browser's developer tools.
## Mobile coastal controls (14 November 2026)

Beaches opens the coastal Explorer explicitly. Search, four filters, reset, optional location, the complete beach list and the device-local itinerary are in that panel. Mobile beach stories scroll independently with a reachable close button. Escape and focus return are supported; closed panels are inert. Map credits stay visible.

Location is never requested at startup. Use my location retains the existing location flight, and permission failures are explained within the panel without blocking the coast. The map style, coordinates, initial camera and flight parameters are unchanged.

Two reliability repairs are separate from layout: entrance animation now targets the inner marker artwork, so it cannot overwrite Leaflet's placement transform; denied/corrupt browser storage no longer prevents the app from booting. Existing marker pulse timing/appearance remains unchanged. The deterministic weather widget is marked illustrative, not live. Title-only placeholder images are not shown as beach photography.

Verification: `npm ci`, then `npx playwright install chromium` and `node verify-mobile.cjs`. Set `CHROME_PATH` to use a system browser. The suite checks all 15 beaches at 320/390/1280px, search/filters/reset, denied location, no startup location request, story bounds and close, keyboard Escape/focus, overflow and page errors. `REDUCED=1 node verify-mobile.cjs` repeats with reduced-motion preference. `URL=https://keralanature.pages.dev/ node verify-mobile.cjs` checks production. Screenshots go to `verification/` by default; `SCREENSHOT_DIR` overrides that. The pre-existing boot-only check remains in `.cursor/skills/verify-kerala-nature/`.

Remaining separate design debt: the large colorful pulsing map pins and unverified guide ratings/review counts are inherited data/presentation, not a new live travel-data claim. They were not redesigned in the controls lane.
