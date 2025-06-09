import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
// Ensure these paths are correct for your DFINITY project setup
import { createActor, canisterId } from 'declarations/Nifty_backend';

// Determine the identity provider based on the DFX network
const network = process.env.DFX_NETWORK;
const identityProvider =
  network === 'ic'
    ? 'https://identity.ic0.app' // Mainnet identity provider
    : 'http://ucwa4-rx777-77774-qaada-cai.localhost:4943'; // Local replica identity provider

function App() {
  // State variables for authentication, actor instance, files, and messages
  const [authClient, setAuthClient] = useState(null);
  const [actor, setActor] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator

  // useEffect hook to initialize AuthClient and check authentication status on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Create an AuthClient instance
        const client = await AuthClient.create();
        setAuthClient(client);

        // Get the identity from the client
        const identity = client.getIdentity();
        // Create an actor for interacting with the backend canister
        setActor(createActor(canisterId, { agentOptions: { identity } }));

        // Check if the user is already authenticated
        const authenticated = await client.isAuthenticated();
        setIsAuthenticated(authenticated);

        // If authenticated, fetch the user's files/NFTs
        if (authenticated) {
          fetchFiles();
        }
      } catch (error) {
        console.error("Failed to initialize AuthClient:", error);
        setMessage("Error initializing authentication.");
      }
    };
    initAuth();
  }, []); // Empty dependency array means this runs once on mount

  // Function to handle user login
  const login = async () => {
    setIsLoading(true); // Set loading state
    setMessage('Redirecting to Internet Identity...');
    try {
      await authClient.login({
        identityProvider,
        onSuccess: async () => {
          // On successful login, update identity and actor, set authenticated state
          const identity = authClient.getIdentity();
          setActor(createActor(canisterId, { agentOptions: { identity } }));
          setIsAuthenticated(true);
          setMessage('Logged in successfully!');
          // Fetch files after successful login
          fetchFiles();
        },
        onError: (error) => {
          console.error("Login failed:", error);
          setMessage("Login failed. Please try again.");
        }
      });
    } catch (error) {
      console.error("Error during login process:", error);
      setMessage("An unexpected error occurred during login.");
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Function to handle user logout
  const logout = async () => {
    setIsLoading(true); // Set loading state
    setMessage('Logging out...');
    try {
      await authClient.logout();
      // After logout, reset actor to anonymous and clear authenticated state and files
      setActor(createActor(canisterId));
      setIsAuthenticated(false);
      setFiles([]);
      setMessage('Logged out successfully!');
    } catch (error) {
      console.error("Logout failed:", error);
      setMessage("Logout failed. Please try again.");
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Function to handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage(''); // Clear any previous messages
  };

  // Function to handle file upload and NFT minting
  const handleUpload = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!selectedFile) {
      setMessage('Please select a file to upload.');
      return;
    }

    setIsLoading(true); // Set loading state
    setMessage('Uploading file and minting NFT...');

    try {
      // Convert file to ArrayBuffer
      const arrayBuffer = await selectedFile.arrayBuffer();
      // Call the backend method to upload and mint NFT
      // 'upload_and_mint_nft' is an assumed backend method that takes file bytes, name, and mime type
      await actor.upload_and_mint_nft(
        Array.from(new Uint8Array(arrayBuffer)), // Convert ArrayBuffer to Uint8Array and then to Array
        selectedFile.name,
        selectedFile.type
      );
      setMessage('File uploaded & NFT minted successfully!');
      setSelectedFile(null); // Clear selected file after upload
      fetchFiles(); // Refresh the list of files
    } catch (err) {
      console.error('Upload failed:', err);
      setMessage(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Function to fetch the user's list of files/NFTs
  const fetchFiles = async () => {
    if (!actor) return; // Ensure actor is initialized
    try {
      setMessage('Fetching your files...');
      // 'get_user_files' is an assumed backend method that returns a list of user files
      const userFiles = await actor.get_user_files();
      setFiles(userFiles);
      setMessage(userFiles.length > 0 ? 'Your files loaded.' : 'You have no files yet.');
    } catch (err) {
      console.error('Failed to fetch user files:', err);
      setMessage('Failed to load your files. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Nifty Drive 🚀
        </h1>

        {/* Authentication Section */}
        <div className="mb-8 text-center">
          {!isAuthenticated ? (
            <button
              onClick={login}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? 'Connecting...' : 'Login with Internet Identity'}
            </button>
          ) : (
            <button
              onClick={logout}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-lg shadow-md hover:from-red-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? 'Logging out...' : 'Logout'}
            </button>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <p className={`text-center mb-6 text-sm ${isLoading ? 'text-blue-600' : 'text-gray-700'}`}>
            {message}
          </p>
        )}

        {/* File Upload Section (visible only when authenticated) */}
        {isAuthenticated && (
          <div className="border-t border-gray-200 pt-8 mt-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Upload Your Files & Mint NFTs</h2>
            <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 mb-8 items-center">
              <label className="block w-full md:w-auto cursor-pointer bg-blue-100 text-blue-800 px-4 py-2 rounded-lg border border-blue-300 hover:bg-blue-200 transition-colors duration-200">
                <input type="file" onChange={handleFileChange} className="hidden" />
                {selectedFile ? selectedFile.name : 'Choose File'}
              </label>
              <button
                type="submit"
                disabled={isLoading || !selectedFile}
                className="w-full md:w-auto px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Uploading...' : 'Upload & Mint NFT'}
              </button>
            </form>

            {/* User Files/NFTs Display */}
            <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Your Digital Assets:</h3>
            {files.length === 0 && !isLoading && isAuthenticated ? (
                <p className="text-center text-gray-500">No files uploaded yet. Start by uploading one!</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {files.map((file, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col items-center text-center">
                    {/* Display image preview if it's an image */}
                    {file.mime_type.startsWith('image/') ? (
                        <img
                        src={file.download_url}
                        alt={file.name}
                        className="w-32 h-32 object-contain rounded-md mb-3 border border-gray-300"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/128x128/e0e0e0/555555?text=Image+Error'; }} // Fallback image on error
                        />
                    ) : (
                        // Placeholder for non-image files
                        <div className="w-32 h-32 flex items-center justify-center bg-gray-200 text-gray-600 rounded-md mb-3">
                        📄 {file.mime_type.split('/')[1] || 'File'}
                        </div>
                    )}
                    <p className="font-medium text-gray-800 break-words w-full">{file.name}</p>
                    <span className="text-sm text-gray-500 mb-2">({file.mime_type})</span>
                    <a
                        href={file.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm font-medium mt-auto"
                    >
                        Download / View
                    </a>
                    </div>
                ))}
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
