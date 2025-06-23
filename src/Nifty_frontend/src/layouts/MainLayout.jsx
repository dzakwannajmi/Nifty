// src/layouts/MainLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { AuthClient } from "@dfinity/auth-client";
import { createActor, canisterId } from "../../../declarations/Nifty_backend"; // Adjusted path
import { Principal } from "@dfinity/principal";

const identityProvider = "https://identity.ic0.app";

const MainLayout = () => {
  const location = useLocation();

  const [authClient, setAuthClient] = useState(null);
  const [actor, setActor] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPrincipal, setUserPrincipal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(""); // For global messages, if any

  useEffect(() => {
    (async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      const identity = client.getIdentity();
      setActor(createActor(canisterId, { agentOptions: { identity } }));
      if (await client.isAuthenticated()) {
        setIsAuthenticated(true);
        const p = identity.getPrincipal().toText();
        setUserPrincipal(p);
      }
    })();
  }, []);

  const login = async () => {
    setIsLoading(true);
    try {
      await authClient.login({
        identityProvider,
        onSuccess: async () => {
          setIsAuthenticated(true);
          const identity = authClient.getIdentity();
          setActor(createActor(canisterId, { agentOptions: { identity } }));
          const p = identity.getPrincipal().toText();
          setUserPrincipal(p);
          setMessage("Logged in successfully!");
        },
      });
    } catch (error) {
      console.error("Login failed:", error);
      setMessage("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authClient.logout();
      setIsAuthenticated(false);
      setUserPrincipal("");
      setMessage("Logged out successfully.");
    } catch (error) {
      console.error("Logout failed:", error);
      setMessage("Logout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getNavLinkClass = (path) => {
    return `text-lg font-medium py-2 px-4 rounded-lg transition-all duration-300 ease-in-out relative group
            ${
              location.pathname === path
                ? "bg-purple-800/20 text-purple-400 shadow-sm" // Active state for dark theme
                : "text-gray-300 hover:bg-neutral-800 hover:text-white" // Inactive state for dark theme
            }`;
  };

  return (
    <div className="min-h-screen font-sans bg-dark-gradient-bg text-gray-300 antialiased flex flex-col">
      <header className="bg-neutral-900 border-b border-purple-800 shadow-xl py-4 px-6 flex items-center justify-between">
        {/* Logo di Pojok Kiri (Link ke Home) */}
        <Link to="/" className="flex items-center flex-shrink-0">
          <img src="/Nifty.png" alt="Nifty Logo" className="h-14 w-auto" />
        </Link>

        {/* Navigasi Utama di Tengah Header */}
        <nav className="flex-grow flex justify-center items-center">
          <div className="flex gap-6">
            <Link to="/" className={getNavLinkClass("/")}>
              Home
            </Link>
            <Link to="/about" className={getNavLinkClass("/about")}>
              About
            </Link>
            <Link to="/pricing" className={getNavLinkClass("/pricing")}>
              Pricing
            </Link>
            <Link to="/drive" className={getNavLinkClass("/drive")}>
              Nifty {/* Diubah dari Nifty Drive menjadi Nifty */}
            </Link>
          </div>
        </nav>

        {/* Authentication Button di pojok kanan atas */}
        <div className="flex-shrink-0">
          {!isAuthenticated ? (
            <button
              onClick={login}
              className="bg-gradient-to-r from-purple-700 to-violet-800 hover:from-purple-800 hover:to-violet-900 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50 text-base"
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Login"}
            </button>
          ) : (
            <button
              onClick={logout}
              className="bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-800 hover:to-rose-900 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-50 text-base"
              disabled={isLoading}
            >
              {isLoading ? "Logging out..." : "Logout"}
            </button>
          )}
        </div>
      </header>

      {/* Global message display */}
      {message && (
        <div className="bg-blue-900 text-blue-300 p-4 rounded-lg border border-blue-700 flex justify-between items-center animate-fade-in mx-auto mt-4 max-w-7xl">
          <span className="font-medium">{message}</span>
          <button
            onClick={() => setMessage("")}
            className="text-blue-400 hover:text-blue-100 text-xl ml-4 transition-colors"
          >
            &times;
          </button>
        </div>
      )}

      {/* Konten utama halaman akan dirender di sini. */}
      <div className="flex-grow">
        {/* Pass authentication state and functions to Outlet */}
        <Outlet
          context={{
            isAuthenticated,
            userPrincipal,
            actor,
            isLoading,
            setMessage,
          }}
        />
      </div>

      {/* Footer Global */}
      <footer className="text-center text-gray-500 text-sm py-5 border-t border-neutral-800 bg-neutral-900 mt-12 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center px-4">
          <div className="flex gap-4 mb-3 sm:mb-0">
            <Link
              to="/"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              About
            </Link>
            <Link
              to="/drive"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              Drive
            </Link>
          </div>

          <p className="order-first sm:order-none mb-3 sm:mb-0 text-gray-500">
            &copy; 2025 Nifty. Powered by ICP.
          </p>

          <div className="flex gap-4">
            <a
              href="https://instagram.com/your_nifty_account"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
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
                className="feather feather-instagram"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a
              href="https://x.com/your_nifty_account"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
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
                className="feather feather-twitter"
              >
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
