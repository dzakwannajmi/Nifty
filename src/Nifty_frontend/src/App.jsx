import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { createActor, canisterId } from 'declarations/Nifty_backend';

// Tentukan identity provider sesuai network
const network = process.env.DFX_NETWORK;
const identityProvider =
  network === 'ic'
    ? 'https://identity.ic0.app'
    : `http://ucwa4-rx777-77774-qaada-cai.localhost:4943`;

function App() {
  const [authClient, setAuthClient] = useState(null);
  const [actor, setActor] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // File & folder states
  const [selectedFile, setSelectedFile] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const init = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      const identity = client.getIdentity();
      setActor(createActor(canisterId, { agentOptions: { identity } }));
      const auth = await client.isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) await refreshAll();
    };
    init();
  }, []);

  const login = async () => {
    setIsLoading(true);
    setMessage('Redirecting...');
    try {
      await authClient.login({
        identityProvider,
        onSuccess: async () => {
          setIsAuthenticated(true);
          setMessage('Logged in!');
          await refreshAll();
        }
      });
    } catch (err) {
      console.error(err);
      setMessage('Login failed');
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
      setMessage('Logged out');
    } catch (err) {
      console.error(err);
      setMessage('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh both lists
  const refreshAll = async () => {
    await fetchFolders();
    await fetchFiles();
  };

  const fetchFolders = async () => {
    try {
      const fs = await actor.get_user_folders();
      setFolders(fs);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFiles = async () => {
    try {
      const fs = await actor.get_user_files();
      setFiles(fs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    setIsLoading(true);
    try {
      await actor.create_folder(folderName);
      setFolderName('');
      await fetchFolders();
      setMessage('Folder created');
    } catch (err) {
      console.error(err);
      setMessage('Create folder failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFolder = async (oldName) => {
    const newName = prompt("New name:", oldName);
    if (!newName) return;
    setIsLoading(true);
    try {
      await actor.edit_folder(oldName, newName);
      await refreshAll();
      setMessage('Folder renamed');
    } catch (err) {
      console.error(err);
      setMessage('Rename failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async (name) => {
    if (!window.confirm(`Delete folder "${name}"?`)) return;
    setIsLoading(true);
    try {
      await actor.delete_folder(name);
      await refreshAll();
      setMessage('Folder deleted');
    } catch (err) {
      console.error(err);
      setMessage('Delete failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);
  
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage('Pick a file');
      return;
    }
    setIsLoading(true);
    try {
      const buf = await selectedFile.arrayBuffer();
      await actor.upload_and_mint_nft(
        Array.from(new Uint8Array(buf)),
        selectedFile.name,
        selectedFile.type,
        selectedFile.folder || folders[0]
      );
      setSelectedFile(null);
      await fetchFiles();
      setMessage('Uploaded & minted');
    } catch (err) {
      console.error(err);
      setMessage('Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1>Nifty Drive with Folders</h1>
      
      {!isAuthenticated ? (
        <button onClick={login} disabled={isLoading}>{isLoading ? '...' : 'Login'}</button>
      ) : (
        <button onClick={logout} disabled={isLoading}>{isLoading ? '...' : 'Logout'}</button>
      )}
      
      <p>{message}</p>

      {isAuthenticated && (
        <section>
          <h2>Folders</h2>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="New folder name"
          />
          <button onClick={handleCreateFolder} disabled={isLoading}>Create</button>
          <ul>
            {folders.map(f => (
              <li key={f}>
                {f}
                <button onClick={() => handleEditFolder(f)}>✏️</button>
                <button onClick={() => handleDeleteFolder(f)}>🗑️</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isAuthenticated && (
        <section>
          <h2>Upload File</h2>
          <form onSubmit={handleUpload}>
            <select>
              {folders.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <input type="file" onChange={handleFileChange} />
            <button type="submit" disabled={isLoading}>Upload+Mint</button>
          </form>
        </section>
      )}

      {isAuthenticated && (
        <section>
          <h2>Your Files</h2>
          <ul>
            {files.map((f, i) => (
              <li key={i}>{f.name} ({f.folder})</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default App;
