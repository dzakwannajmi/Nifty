import React, { useState, useEffect } from "react";
// Hapus import NFTStorage
// import { NFTStorage } from "nft.storage"; // <-- Hapus ini
import { useOutletContext } from "react-router-dom";
import { PinataSDK } from "pinata"; // <-- Tambahkan import PinataSDK

// Dapatkan JWT Pinata dan domain gateway dari variabel lingkungan
// Pastikan file .env.local Anda memiliki VITE_PINATA_JWT dan VITE_PINATA_GATEWAY
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY; // e.g., "fun-llama-300.mypinata.cloud"

// Inisialisasi Pinata SDK di sini. Ini akan dibuat satu kali saat komponen dimuat.
// Penting: Pastikan PINATA_JWT dan PINATA_GATEWAY memiliki nilai yang benar.
// Anda mungkin ingin menambahkan pengecekan di sini jika nilai env kosong
const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  // pinataGateway bersifat opsional untuk inisialisasi SDK, tetapi berguna jika Anda ingin SDK mengelola URL gateway
  // Untuk keperluan upload, hanya JWT yang benar-benar dibutuhkan oleh SDK.
  // Gateway akan kita gunakan secara manual di handlePreview.
  // Jika PinataSDK akan mengelola URL API untuk upload: pinataApiUrl: "https://api.pinata.cloud"
});

export default function Drive() {
  const { isAuthenticated, userPrincipal, actor, isLoading, setMessage } =
    useOutletContext();

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentViewedFolder, setCurrentViewedFolder] = useState(null);
  const [selectedUploadFolder, setSelectedUploadFolder] = useState("");
  const [folderName, setFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (isAuthenticated && actor) {
      refreshAll();
    } else {
      setFolders([]);
      setFiles([]);
      setCurrentViewedFolder(null);
      setSelectedUploadFolder("");
      setFolderName("");
      setSelectedFile(null);
    }
  }, [isAuthenticated, actor]);

  const refreshAll = async () => {
    if (actor) {
      try {
        await Promise.all([fetchFolders(), fetchFiles()]);
      } catch (error) {
        console.error("Failed to refresh all drive data:", error);
        setMessage("Failed to load drive data.");
      }
    }
  };

  const fetchFolders = async () => {
    try {
      const fs = await actor.get_user_folders();
      setFolders(fs);
      if (!selectedUploadFolder && fs.length > 0) {
        setSelectedUploadFolder(fs[0]);
      } else if (fs.length === 0) {
        setSelectedUploadFolder("");
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      setMessage("Failed to load folders");
    }
  };

  const fetchFiles = async () => {
    try {
      const fs = await actor.get_user_files();
      setFiles(fs);
    } catch (error) {
      console.error("Failed to fetch files:", error);
      setMessage("Failed to load files");
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      return setMessage("Folder name cannot be empty.");
    }
    setMessage("Creating folder...");
    try {
      await actor.create_folder(folderName.trim());
      setFolderName("");
      await fetchFolders();
      setMessage("Folder created successfully!");
    } catch (error) {
      console.error("Failed to create folder:", error);
      setMessage(
        "Failed to create folder. Name might already exist or another error occurred."
      );
    }
  };

  const handleDeleteFolder = async (name) => {
    if (
      !confirm(
        `Are you sure you want to delete folder "${name}"? This will also delete all files within it.`
      )
    ) {
      return;
    }
    setMessage(`Deleting folder "${name}"...`);
    try {
      await actor.delete_folder(name);
      await refreshAll();
      if (currentViewedFolder === name) {
        setCurrentViewedFolder(null);
      }
      setMessage("Folder deleted successfully.");
    } catch (error) {
      console.error("Failed to delete folder:", error);
      setMessage(
        "Failed to delete folder. Make sure the folder is empty or another error occurred."
      );
    }
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return setMessage("Please select a file to upload.");
    if (!selectedUploadFolder)
      return setMessage("Please select a destination folder for your file.");
    // Periksa JWT Pinata, bukan NFT_STORAGE_TOKEN
    if (!PINATA_JWT)
      return setMessage(
        "Pinata JWT not found. Please set VITE_PINATA_JWT in your .env file."
      );

    setMessage("Initiating upload...");
    try {
      setMessage("Uploading to Pinata IPFS...");

      // Mengunggah file menggunakan Pinata SDK
      // Pinata SDK menerima objek File langsung
      const uploadResponse = await pinata.upload.public.file(selectedFile);

      if (!uploadResponse || !uploadResponse.cid) {
        throw new Error("Pinata upload failed: No CID returned.");
      }

      const cid = uploadResponse.cid; // Pinata SDK mengembalikan CID di properti 'cid'
      setMessage(`Uploading metadata to blockchain (CID: ${cid})...`);

      const res = await actor.upload_file(
        cid,
        selectedFile.name,
        selectedFile.type,
        selectedUploadFolder
      );

      // Penanganan error dari backend
      // `res` adalah Result.Result<FileMeta, Text> dari Motoko
      if (res && typeof res === "object" && "Err" in res) {
        // Jika res.Err adalah record (misal { InvalidMetadata = null }), Object.values(res.Err)[0] bisa bekerja
        // Jika res.Err adalah string langsung, maka res.Err
        throw new Error(res.Err.toString() || "Unknown backend error");
      }
      if (!res || !res.ok) {
        // Jika res bukan objek Result yang diharapkan
        throw new Error("Backend did not return a successful 'Ok' response.");
      }

      setSelectedFile(null); // Reset input file setelah upload
      await fetchFiles(); // Refresh daftar file
      setMessage(
        "Upload successful! Your file is now available in your drive."
      );
    } catch (e) {
      console.error("Upload failed:", e);
      setMessage("Upload failed: " + (e.message || e.toString()));
    }
  };

  const handlePreview = (f) => {
    if (f.cid && PINATA_GATEWAY) {
      // Gunakan gateway Pinata Anda untuk preview
      window.open(`https://${PINATA_GATEWAY}/ipfs/${f.cid}`, "_blank");
      // Alternatif (fallback) jika gateway Pinata tidak disetel atau bermasalah:
      // window.open(`https://ipfs.io/ipfs/${f.cid}`, "_blank");
    } else {
      setMessage("File CID or Pinata Gateway is missing, cannot preview.");
    }
  };

  const filteredFiles = currentViewedFolder
    ? files.filter((f) => f.folder === currentViewedFolder)
    : files;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-8 max-w-7xl mx-auto">
        <main className="md:col-span-3 space-y-8">
          <section className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-purple-800">
            <h2 className="text-2xl font-bold text-white mb-6">
              Access Your Nifty
            </h2>
            {!isAuthenticated ? (
              <p className="text-gray-400 text-lg">
                Please log in to access your Nifty. The login button is in the
                top-right corner.
              </p>
            ) : (
              <p className="text-gray-400 text-lg">
                Welcome,{" "}
                {userPrincipal
                  ? userPrincipal.substring(0, 10) + "..."
                  : "user"}
                ! Manage your Nifty below.
              </p>
            )}
          </section>

          {isAuthenticated && (
            <>
              <section className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-purple-800">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-folder mr-3"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Manage Folders
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="New folder name..."
                    className="flex-grow bg-neutral-800 border border-neutral-700 rounded-lg px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400 text-lg"
                  />
                  <button
                    onClick={handleCreateFolder}
                    className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 px-8 py-3 rounded-lg text-white font-semibold transition-all duration-300 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50 text-lg group"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Folder"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  {folders.length === 0 ? (
                    <p className="text-gray-500 text-lg">
                      No folders yet. Create your first folder!
                    </p>
                  ) : (
                    <>
                      <div
                        onClick={() => setCurrentViewedFolder(null)}
                        className={`cursor-pointer px-5 py-2 rounded-full border transition-all duration-200 ease-in-out text-lg
                          ${
                            currentViewedFolder === null
                              ? "bg-purple-800/30 border-purple-500 text-purple-200 shadow-inner"
                              : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-gray-300 hover:text-white"
                          }`}
                      >
                        All Files
                      </div>
                      {folders.map((f, i) => (
                        <div
                          key={i}
                          onClick={() => setCurrentViewedFolder(f)}
                          className={`flex items-center gap-2 cursor-pointer px-5 py-2 rounded-full border transition-all duration-200 ease-in-out text-lg
                                ${
                                  currentViewedFolder === f
                                    ? "bg-purple-800/30 border-purple-500 text-purple-200 shadow-inner"
                                    : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-gray-300 hover:text-white"
                                }`}
                        >
                          {f}{" "}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(f);
                            }}
                            className="ml-2 text-red-500 hover:text-red-400 transition-colors text-xl leading-none"
                            title={`Delete folder "${f}"`}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </section>

              <section className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-purple-800">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-upload mr-3"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  Upload File
                </h2>
                <form onSubmit={handleUpload} className="space-y-6">
                  <div>
                    <input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-all duration-200 text-base shadow-md"
                    >
                      {/* ICON FILE PLUS */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="feather feather-file-plus"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                      </svg>
                      {selectedFile ? selectedFile.name : "Choose File"}
                    </label>
                  </div>
                  <div>
                    <label
                      htmlFor="folder-select"
                      className="block text-base font-medium text-gray-400 mb-3"
                    >
                      Select Destination Folder:
                    </label>
                    <select
                      id="folder-select"
                      value={selectedUploadFolder}
                      onChange={(e) => setSelectedUploadFolder(e.target.value)}
                      className="block w-full bg-neutral-800 text-white border border-neutral-700 px-5 py-3 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 text-lg"
                      disabled={folders.length === 0 || isLoading}
                    >
                      {folders.length === 0 ? (
                        <option value="">Create a folder first</option>
                      ) : (
                        folders.map((f, i) => (
                          <option key={i} value={f}>
                            {f}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-white font-bold transition-all duration-300 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 text-lg group"
                    disabled={
                      isLoading || !selectedFile || folders.length === 0
                    }
                  >
                    {isLoading ? "Uploading..." : "Upload File"}
                  </button>
                </form>
              </section>

              <section className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-purple-800">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-file-text mr-3"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Files in {currentViewedFolder || "All Folders"}
                </h2>
                {filteredFiles.length === 0 ? (
                  <p className="text-gray-500 mt-4 text-lg text-center py-6">
                    No files in{" "}
                    {currentViewedFolder
                      ? `folder "${currentViewedFolder}"`
                      : "your Nifty"}{" "}
                    yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-neutral-800 mt-4">
                    {filteredFiles.map((f, i) => (
                      <li
                        key={i}
                        className="py-4 flex justify-between items-center hover:bg-neutral-800 transition-colors duration-200 rounded-md px-4 -mx-4"
                      >
                        <div>
                          <p className="font-medium text-white text-lg">
                            {f.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {f.mime_type} – Folder:{" "}
                            <span className="text-purple-300 font-semibold">
                              {f.folder}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => handlePreview(f)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-base px-5 py-2 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 group"
                        >
                          Preview
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </main>

        <aside className="col-span-1 bg-neutral-900 rounded-xl p-6 text-base text-gray-300 border border-neutral-800 shadow-xl h-fit sticky top-8 transition-all duration-300 ease-in-out">
          <h3 className="font-semibold text-xl mb-4 text-purple-400">
            Session Information
          </h3>
          {isAuthenticated ? (
            <>
              <p className="mb-2 text-gray-400">You are logged in as:</p>
              <p className="flex items-center break-all text-sm font-mono text-purple-300 bg-neutral-800 p-3 rounded-lg border border-purple-700 shadow-inner">
                {/* ICON USER */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-user mr-2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {userPrincipal}
              </p>
              <p className="mt-4 text-gray-400">
                Welcome to Nifty! You can manage your files and folders here.
              </p>
            </>
          ) : (
            <p className="text-gray-400 text-lg">
              Please log in to access your Nifty.
            </p>
          )}
        </aside>
      </div>
    </>
  );
}
