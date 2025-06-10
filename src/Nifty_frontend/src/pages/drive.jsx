import React, { useState, useEffect } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { createActor, canisterId } from "declarations/Nifty_backend";
import { Principal } from "@dfinity/principal"; // Import Principal untuk penanganan ID

const identityProvider = "https://identity.ic0.app";

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
  const [selectedUploadFolder, setSelectedUploadFolder] = useState("");

  // Inisialisasi AuthClient dan Actor
  useEffect(() => {
    const init = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      const identity = client.getIdentity();
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
  }, [folders, selectedUploadFolder]);

  const login = async () => {
    setIsLoading(true);
    setMessage("Redirecting...");
    try {
      await authClient.login({
        identityProvider,
        onSuccess: async () => {
          setIsAuthenticated(true);
          setMessage("Logged in!");
          // Setelah login, dapatkan identity baru dan perbarui actor
          const identity = authClient.getIdentity();
          setActor(createActor(canisterId, { agentOptions: { identity } }));
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
      if (actor) {
        // Asumsi actor.get_user_files() sekarang mengembalikan objek file yang berisi id (token ID NFT) dan owner (Principal)
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
      setFolderName("");
      await fetchFolders();
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
      await refreshAll();
      setMessage("Folder renamed");
    } catch (err) {
      console.error(err);
      setMessage("Rename failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async (name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete folder "${name}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    setIsLoading(true);
    try {
      await actor.delete_folder(name);
      await refreshAll();
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
      setMessage("Please create a folder first or select one.");
      return;
    }

    setIsLoading(true);
    setMessage("Uploading and minting NFT...");
    try {
      const buf = await selectedFile.arrayBuffer();
      const folderToUse =
        selectedUploadFolder ||
        (folders.length > 0 ? folders[0] : "default_folder");

      await actor.upload_and_mint_nft(
        Array.from(new Uint8Array(buf)),
        selectedFile.name,
        selectedFile.type,
        folderToUse
      );
      setSelectedFile(null);
      await fetchFiles();
      setMessage("File uploaded & NFT minted successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      setMessage(`Upload failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // FUNGSI BARU: Menangani transfer kepemilikan NFT
  const handleTransferNFT = async (tokenId, currentOwnerPrincipal) => {
    const recipientInput = prompt(
      `Enter the Principal ID of the new owner for NFT ID: ${tokenId}`
    );

    if (!recipientInput || !recipientInput.trim()) {
      setMessage("Recipient Principal ID cannot be empty.");
      return;
    }

    try {
      // Validasi format Principal ID
      const newOwnerPrincipal = Principal.fromText(recipientInput.trim());

      // Konfirmasi ulang
      if (
        !window.confirm(
          `Are you sure you want to transfer NFT ID ${tokenId} to ${newOwnerPrincipal.toText()}?`
        )
      ) {
        return;
      }

      setIsLoading(true);
      setMessage(
        `Transferring NFT ${tokenId} to ${newOwnerPrincipal.toText()}...`
      );

      // Panggil fungsi transfer di backend canister Anda
      // Asumsi ada fungsi `transfer_nft` di `actor` yang menerima token ID dan Principal tujuan
      const result = await actor.transfer_nft(tokenId, newOwnerPrincipal);

      // Periksa hasil dari transfer (sesuaikan dengan return type dari backend Anda)
      if (result && result.Ok) {
        // Asumsi backend mengembalikan { Ok: ... } atau { Err: ... }
        setMessage(`NFT ${tokenId} successfully transferred!`);
        await refreshAll(); // Perbarui daftar file untuk menampilkan pemilik baru
      } else if (result && result.Err) {
        // Ambil nama error dari Err variant (misal: { Unauthorized: null } -> 'Unauthorized')
        const errorType = Object.keys(result.Err)[0];
        setMessage(`Transfer failed: ${errorType}`);
      } else {
        setMessage("Transfer failed: Unknown error during transfer.");
      }
    } catch (err) {
      console.error("Transfer NFT failed:", err);
      if (err.message.includes("does not have the correct format")) {
        setMessage("Transfer failed: Invalid Principal ID format.");
      } else {
        setMessage(`Transfer failed: ${err.message || "Unknown error"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1>📁 Nifty Drive</h1>

      {!isAuthenticated ? (
        <button
          onClick={login}
          disabled={isLoading}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Login with Internet Identity"}
        </button>
      ) : (
        <button
          onClick={logout}
          disabled={isLoading}
          className="bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {isLoading ? "Logging out..." : "Logout"}
        </button>
      )}

      <p className="mt-4 text-lg text-gray-700">{message}</p>

      {isAuthenticated && (
        <>
          <section className="my-6 p-4 border rounded shadow-md bg-gray-50">
            <h2 className="text-xl font-semibold mb-3">Folders</h2>
            <div className="flex mb-4">
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="New folder name"
                className="flex-grow border p-2 mr-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={isLoading}
              />
              <button
                onClick={handleCreateFolder}
                disabled={isLoading || !folderName.trim()}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Create
              </button>
            </div>
            <ul className="list-disc ml-6 mt-2">
              {folders.length === 0 ? (
                <li className="text-gray-600">No folders created yet.</li>
              ) : (
                folders.map((f) => (
                  <li key={f} className="flex items-center my-1">
                    <span className="font-medium text-gray-800">{f}</span>
                    <button
                      onClick={() => handleEditFolder(f)}
                      disabled={isLoading}
                      className="ml-4 px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 disabled:opacity-50"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(f)}
                      disabled={isLoading}
                      className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:opacity-50"
                    >
                      🗑️ Delete
                    </button>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="my-6 p-4 border rounded shadow-md bg-gray-50">
            <h2 className="text-xl font-semibold mb-3">Upload File</h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-3">
              <label
                htmlFor="folder-select"
                className="font-semibold text-gray-700"
              >
                Select Folder:
              </label>
              <select
                id="folder-select"
                value={selectedUploadFolder}
                onChange={(e) => setSelectedUploadFolder(e.target.value)}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={isLoading || folders.length === 0}
              >
                {folders.length === 0 ? (
                  <option value="default_folder" disabled>
                    No folders available (create one first)
                  </option>
                ) : (
                  folders.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))
                )}
              </select>

              <label
                htmlFor="file-input"
                className="font-semibold text-gray-700 mt-2"
              >
                Choose File:
              </label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !selectedFile ||
                  (folders.length === 0 && !selectedUploadFolder)
                }
                className="bg-green-500 text-white p-2 rounded mt-2 hover:bg-green-600 disabled:opacity-50"
              >
                Upload & Mint NFT
              </button>
            </form>
          </section>

          <section className="my-6 p-4 border rounded shadow-md bg-gray-50">
            <h2 className="text-xl font-semibold mb-3">Your Files (NFTs)</h2>
            <ul className="list-disc ml-6 mt-2">
              {files.length === 0 ? (
                <li className="text-gray-600">No files uploaded yet.</li>
              ) : (
                files.map((f, i) => (
                  // Asumsi 'f' sekarang adalah objek yang mengandung id (token ID NFT), name, folder, dan owner (Principal)
                  <li
                    key={f.id || i}
                    className="my-2 p-2 border rounded bg-white flex flex-col sm:flex-row sm:items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-blue-700">{f.name}</span>
                      <p className="text-sm text-gray-600">
                        Folder: {f.folder || "No folder"}
                      </p>
                      <p className="text-sm text-gray-600">
                        NFT ID:{" "}
                        <span className="font-mono text-xs">{f.id}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Owner:{" "}
                        <span className="font-mono text-xs break-all">
                          {f.owner ? f.owner.toText() : "N/A"}
                        </span>
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      {/* Tombol Transfer Kepemilikan */}
                      <button
                        onClick={() => handleTransferNFT(f.id, f.owner)}
                        disabled={isLoading || !f.id || !f.owner}
                        className="ml-2 px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50"
                      >
                        Transfer NFT
                      </button>
                    </div>
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
