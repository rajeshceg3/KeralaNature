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