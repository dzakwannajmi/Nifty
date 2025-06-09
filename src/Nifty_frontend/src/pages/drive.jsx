import React, { useState, useEffect } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { createActor, canisterId } from "declarations/Nifty_backend"; // PERHATIKAN: canisterId ini mungkin perlu disesuaikan dengan nama canister backend baru

const localIIcanisterId = process.env.CANISTER_ID_INTERNET_IDENTITY;
const network = process.env.DFX_NETWORK;
const identityProvider =
  network === "ic"
    ? "https://identity.ic0.app"
    : `http://${localIIcanisterId}.localhost:4943`;

function Drive() {
  const [authClient, setAuthClient] = useState(null);
  const [actor, setActor] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedUploadFolder, setSelectedUploadFolder] = useState(""); // <-- STATE BARU UNTUK FOLDER UPLOAD

  // Inisialisasi AuthClient dan Actor
  useEffect(() => {
    const init = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      const identity = client.getIdentity();
      // !!! PERHATIKAN: canisterId ini mungkin perlu disesuaikan !!!
      // Jika nama canister backend baru Anda bukan 'Nifty_backend',
      // Anda mungkin perlu mengubah 'declarations/Nifty_backend' dan 'canisterId'
      // menjadi 'declarations/nifty_new_backend' dan nama canister yang benar.
      // Biasanya dfx generate akan membuat `declarations/<nama_canister_backend_baru>`.
      setActor(createActor(canisterId, { agentOptions: { identity } }));
      const auth = await client.isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        await refreshAll();
      }
    };
    init();
  }, []);

  // Mengatur folder terpilih untuk upload setelah folders di-fetch
  useEffect(() => {
    if (folders.length > 0 && !selectedUploadFolder) {
      setSelectedUploadFolder(folders[0]); // Mengatur default ke folder pertama
    }
  }, [folders, selectedUploadFolder]); // Dependensi pada 'folders' dan 'selectedUploadFolder'

  const login = async () => {
    setIsLoading(true);
    setMessage("Redirecting...");
    try {
      await authClient.login({
        identityProvider,
        onSuccess: async () => {
          setIsAuthenticated(true);
          setMessage("Logged in!");
          await refreshAll();
        },
      });
    } catch (err) {
      console.error(err);
      setMessage("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authClient.logout();
      setIsAuthenticated(false);
      setFolders([]);
      setFiles([]);
      setMessage("Logged out");
    } catch (err) {
      console.error(err);
      setMessage("Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAll = async () => {
    await fetchFolders();
    await fetchFiles();
  };

  const fetchFolders = async () => {
    try {
      // Pastikan actor ada sebelum memanggil fungsinya
      if (actor) {
        const fs = await actor.get_user_folders();
        setFolders(fs);
      }
    } catch (err) {
      console.error("Failed to fetch folders:", err);
      setMessage("Failed to load folders.");
    }
  };

  const fetchFiles = async () => {
    try {
      // Pastikan actor ada sebelum memanggil fungsinya
      if (actor) {
        const fs = await actor.get_user_files();
        setFiles(fs);
      }
    } catch (err) {
      console.error("Failed to fetch files:", err);
      setMessage("Failed to load files.");
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setMessage("Folder name cannot be empty.");
      return;
    }
    setIsLoading(true);
    try {
      await actor.create_folder(folderName);
      setFolderName(""); // Bersihkan input setelah membuat folder
      await fetchFolders(); // Perbarui daftar folder
      setMessage("Folder created");
    } catch (err) {
      console.error(err);
      setMessage("Create folder failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFolder = async (oldName) => {
    const newName = prompt("Enter new name for folder:", oldName);
    if (!newName || !newName.trim()) {
      setMessage("New name cannot be empty.");
      return;
    }
    setIsLoading(true);
    try {
      await actor.edit_folder(oldName, newName);
      await refreshAll(); // Perbarui semua data setelah perubahan nama
      setMessage("Folder renamed");
    } catch (err) {
      console.error(err);
      setMessage("Rename failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async (name) => {
    if (!window.confirm(`Are you sure you want to delete folder "${name}"? This action cannot be undone.`)) {
      return;
    }
    setIsLoading(true);
    try {
      await actor.delete_folder(name);
      await refreshAll(); // Perbarui semua data setelah penghapusan
      setMessage("Folder deleted");
    } catch (err) {
      console.error(err);
      setMessage("Delete failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage("Please select a file to upload.");
      return;
    }
    if (!selectedUploadFolder && folders.length === 0) {
        // Jika belum ada folder dan tidak ada yang dipilih, minta user membuat folder
        setMessage("Please create a folder first or select one.");
        return;
    }

    setIsLoading(true);
    setMessage("Uploading and minting NFT...");
    try {
      const buf = await selectedFile.arrayBuffer();
      const folderToUse = selectedUploadFolder || (folders.length > 0 ? folders[0] : "default_folder"); // Fallback jika tidak ada folder dipilih

      await actor.upload_and_mint_nft(
        Array.from(new Uint8Array(buf)),
        selectedFile.name,
        selectedFile.type,
        folderToUse // <-- MENGGUNAKAN FOLDER YANG DIPILIH DARI DROPDOWN
      );
      setSelectedFile(null); // Reset input file
      await fetchFiles(); // Perbarui daftar file
      setMessage("File uploaded & NFT minted successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      setMessage(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1>📁 Nifty Drive</h1>

      {!isAuthenticated ? (
        <button onClick={login} disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login with Internet Identity"}
        </button>
      ) : (
        <button onClick={logout} disabled={isLoading}>
          {isLoading ? "Logging out..." : "Logout"}
        </button>
      )}

      <p>{message}</p>

      {isAuthenticated && (
        <>
          <section className="my-4 p-4 border rounded">
            <h2>Folders</h2>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="New folder name"
              className="border p-2 mr-2"
              disabled={isLoading}
            />
            <button
              onClick={handleCreateFolder}
              disabled={isLoading || !folderName.trim()}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Create
            </button>
            <ul className="list-disc ml-6 mt-2">
              {folders.length === 0 ? (
                <li>No folders created yet.</li>
              ) : (
                folders.map((f) => (
                  <li key={f} className="flex items-center my-1">
                    {f}
                    <button
                      onClick={() => handleEditFolder(f)}
                      disabled={isLoading}
                      className="ml-2 px-2 py-1 bg-yellow-500 text-white rounded text-xs"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(f)}
                      disabled={isLoading}
                      className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs"
                    >
                      🗑️ Delete
                    </button>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="my-4 p-4 border rounded">
            <h2>Upload File</h2>
          <form onSubmit={handleUpload} className="flex flex-col gap-2">
              <label htmlFor="folder-select" className="font-semibold">Select Folder:</label>
              <select
                id="folder-select"
                value={selectedUploadFolder}
                onChange={(e) => setSelectedUploadFolder(e.target.value)}
                className="border p-2"
                disabled={isLoading || folders.length === 0}
              >
                {folders.length === 0 ? (
                  <option value="default_folder" disabled>No folders available</option>
                ) : (
                  folders.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))
                )}
              </select>

              <label htmlFor="file-input" className="font-semibold mt-2">Choose File:</label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="border p-2"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !selectedFile || folders.length === 0 && !selectedUploadFolder}
                className="bg-green-500 text-white p-2 rounded mt-2"
              >
                Upload & Mint NFT
              </button>
            </form>
          </section>

          <section className="my-4 p-4 border rounded">
            <h2>Your Files</h2>
            <ul className="list-disc ml-6 mt-2">
              {files.length === 0 ? (
                <li>No files uploaded yet.</li>
              ) : (
                files.map((f, i) => (
                  <li key={i} className="my-1">
                    {f.name} ({f.folder || 'No folder'}) {/* Menampilkan folder atau 'No folder' jika undefined */}
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

export default Drive;