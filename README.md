# Nifty: Decentralized Drive on the Internet Computer

### Welcome to Nifty!
![Image](https://github.com/user-attachments/assets/223bc8fc-bdb6-4263-ad29-ce6420484806)
![Nifty Welcome Screen](https://github.com/user-attachments/assets/b4eb564b-eade-4c44-a2fa-e19b2618b3ec)

## Live Demo

Experience Nifty live on the Internet Computer: [https://4aqev-nqaaa-aaaai-atjda-cai.icp0.io/](https://4aqev-nqaaa-aaaai-atjda-cai.icp0.io/)

## About Nifty

Nifty is a decentralized drive application built on the Internet Computer Protocol (ICP) and leveraging the InterPlanetary File System (IPFS) via Pinata for file storage. Nifty aims to give users full control over their data, offering a secure, censorship-resistant, and distributed file storage solution, free from reliance on centralized servers.

With Nifty, users can manage folders, upload files, and access their data from anywhere on the decentralized web.

## Features

* **Secure User Authentication:** Decentralized login and authentication, typically via Internet Identity or a supported wallet (like Plug Wallet).
* **Intuitive Folder Management:** Create, view, and delete folders to organize your files.
* **Decentralized File Uploads:** Seamlessly upload files from your web browser directly to IPFS via Pinata.
* **On-Chain Metadata Storage:** All essential file information (excluding the content itself for scalability) is immutably stored on an Internet Computer canister.
* **Direct File Preview:** Easily access and preview your uploaded files via a dedicated Pinata IPFS gateway.
* **High Scalability & Resilience:** Built on the Internet Computer's robust infrastructure, providing a highly available and fault-tolerant decentralized experience.

## Technologies Used

### Backend (Internet Computer Canister)

* **Motoko:** The native programming language for building high-performance decentralized applications (dApps) on the Internet Computer.
* **DFINITY SDK:** The essential toolkit for developing, deploying, and managing canisters on ICP.

### Frontend (Web Application)

* **React.js:** A popular JavaScript library for crafting dynamic and interactive user interfaces.
* **Vite:** A lightning-fast build tool and development server, enhancing the frontend development experience.
* **Tailwind CSS:** A utility-first CSS framework used for rapid and responsive UI styling.
* **Pinata SDK:** The JavaScript client library used on the frontend to interact with the Pinata API for IPFS file uploads.

### Decentralized Storage

* **IPFS (InterPlanetary File System):** A peer-to-peer network and protocol for storing and sharing hypermedia in a distributed file system.
* **Pinata:** A specialized IPFS pinning service that ensures files uploaded to IPFS remain persistent and accessible, handling the complexities of IPFS nodes.

## Development Journey & Overcoming Content Security Policy (CSP) Challenges

The development of Nifty involved navigating common challenges in decentralized web development, particularly concerning **Content Security Policy (CSP)** when integrating third-party services like Pinata.

Initially, attempts to upload files directly from the frontend to IPFS (using various services) resulted in `Refused to connect` errors due to strict browser CSP rules. CSP is a crucial security layer that dictates which external resources (scripts, styles, images, and network connections) a web page is allowed to load or connect to.

Our journey to a functional file upload involved:

1.  **Initial Blocking by `default-src`:** The browser's default CSP (`default-src 'self'`) prevented any external network requests, including those to IPFS/Pinata APIs.
2.  **Iterative CSP Refinement:** To resolve this, we meticulously updated the `connect-src` directive within the `<meta http-equiv="Content-Security-Policy">` tag in `src/Nifty_frontend/index.html`. This directive explicitly lists the domains the frontend is allowed to establish connections with.
3.  **Discovering Pinata's Endpoints:** Pinata, like many cloud services, uses multiple subdomains for different API functionalities (e.g., general API, specific upload endpoints). We encountered and successively added the following Pinata domains to our `connect-src`:
    * `https://api.pinata.cloud` (for general API interactions)
    * `https://upload.pinata.cloud` (for some upload mechanisms)
    * `https://uploads.pinata.cloud` (specifically for `v3/files` uploads, which was a recurring blocker)
4.  **Internet Computer Endpoints:** Similarly, `connect-src` also had to include Internet Computer mainnet domains (`https://icp0.io`, `https://*.icp0.io`, `https://icp-api.io`) to allow the frontend to communicate with the deployed canisters.
5.  **Localhost for Development:** For local development, `http://localhost:*` was essential to permit connections to the local DFINITY replica.
6.  **Crucial Reloads:** A key lesson learned was the importance of performing a **hard browser reload** (clearing cache) after every CSP change, as browsers aggressively cache CSP headers. Regular refreshes are often insufficient.
7.  **Environment Variable Placement:** Another challenge involved correctly setting up environment variables (`.env.local` for `VITE_PINATA_JWT`, `VITE_PINATA_GATEWAY`) in the precise location (`src/Nifty_frontend/.env.local`) where Vite could pick them up.
8.  **Motoko Code Consistency:** Ensuring consistency between `main.mo` and `Drive.mo` (especially in `uploadFile` function signatures and `newId` management) was vital to avoid type errors during compilation.

This iterative process of debugging CSP errors and refining the configuration was a significant part of bringing Nifty's decentralized file upload to life.

## Getting Started

Follow these steps to get Nifty running in your local development environment.

### Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/en/download/) (LTS recommended)
* [npm](https://www.npmjs.com/get-npm) or [Yarn](https://yarnpkg.com/getting-started/install)
* [DFINITY SDK](https://internetcomputer.org/docs/current/developer-docs/getting-started/install/) (`dfx`)
* [Git](https://git-scm.com/downloads)

### Setup

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/dzakwannajmi/Nifty.git](https://github.com/dzakwannajmi/Nifty.git) # Replace with your repo URL
    cd Nifty
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    cd src/Nifty_frontend
    npm install # or yarn install
    cd ../../
    ```

3.  **Pinata API Key Setup:**
    Nifty uses Pinata for uploading files to IPFS. You will need an API key from Pinata.
    * Sign up or log in to [Pinata Cloud](https://www.pinata.cloud/dashboard).
    * In your dashboard, navigate to **API Keys** and click **"New Key"**.
    * Create a key with **Admin** permissions (for hackathon convenience) or at least **Write** permissions for **Files**.
    * Once created, you will be provided with a **JWT (JSON Web Token)**. Copy this JWT immediately, as it will only be shown once.
    * Create a file named `.env.local` inside your `src/Nifty_frontend/` directory.
    * Add the following variables to the `.env.local` file, replacing `YOUR_PINATA_JWT_HERE` and `YOUR_PINATA_GATEWAY_DOMAIN_HERE` with your actual values:
        ```
        VITE_PINATA_JWT="YOUR_PINATA_JWT_HERE"
        VITE_PINATA_GATEWAY="YOUR_PINATA_GATEWAY_DOMAIN_HERE" # Example: fun-llama-300.mypinata.cloud
        ```
    * ***Important: Ensure your `.env.local` file is not committed to your public Git repository by adding it to `.gitignore`!***

4.  **Content Security Policy (CSP) Configuration:**
    As detailed in the "Development Journey" section above, strict CSP rules are essential.
    * Open `src/Nifty_frontend/index.html`.
    * Locate the `<meta http-equiv="Content-Security-Policy" ...>` tag in the `<head>` section.
    * Ensure the `content` attribute has the exact value as shown below. **Crucially, remove any `/* ... */` comments or other non-standard whitespace within the `content` attribute.**

    ```html
    <meta http-equiv="Content-Security-Policy" content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: [https://ipfs.io](https://ipfs.io) https://*.mypinata.cloud;
        connect-src 'self' http://localhost:* [https://icp0.io](https://icp0.io) https://*.icp0.io [https://icp-api.io](https://icp-api.io) [https://api.pinata.cloud](https://api.pinata.cloud) [https://upload.pinata.cloud](https://upload.pinata.cloud) [https://uploads.pinata.cloud](https://uploads.pinata.cloud);
    ">
    ```
    * **Save** the changes to `index.html`.

### Running Locally

1.  **Start the DFINITY Replica:**
    Open a new terminal in your project's root directory (`/Nifty/`) and run:
    ```bash
    dfx start --clean --background
    ```
    The `--clean` command will remove any previous local canister state, and `--background` will run the replica in the background.

2.  **Deploy Canisters:**
    Once the replica is running, deploy your backend and frontend canisters to the local replica:
    ```bash
    dfx deploy
    ```

3.  **Access the Application:**
    After deployment is complete, your application will be available at the local URL provided by `dfx deploy` (usually `http://localhost:8080` or similar).
    * **Important: After opening the URL in your browser, perform a *hard reload* (force refresh with cache clearing) on the page.** In Chrome/Edge, open Developer Tools (F12), right-click the refresh button, and select "Empty Cache and Hard Reload". This ensures your browser loads the latest CSP and your frontend code.

## Usage

1.  **Login:** Click the login button (e.g., in the top-right corner) to authenticate yourself using Internet Identity or a supported wallet.
2.  **Manage Folders:** Create new folders by typing a name into the input box and clicking "Create Folder". Your folders will appear below.
3.  **Upload File:**
    * Click "Choose File" to select a file from your computer.
    * Select a destination folder from the "Select Destination Folder" dropdown.
    * Click "Upload File". The file will be uploaded to Pinata/IPFS, and its metadata will be stored on your Internet Computer backend.
4.  **View Files:** Your uploaded files will appear in the "Files in All Folders" section (or within the specific folder you are viewing).
5.  **Preview File:** Click the "Preview" button next to a file to open the file in a new tab via your Pinata IPFS gateway.

---
