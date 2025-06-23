import React from 'react';

const Home = () => {
  return (
    <>
      {/* Konten Utama Halaman Home */}
      <main className="max-w-4xl mx-auto p-8 my-12 bg-neutral-900 rounded-xl border border-neutral-800 shadow-xl text-center transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-purple-800">
        <h1 className="text-4xl font-bold text-purple-400 mb-6 tracking-wide">
          Welcome to Nifty!
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed mb-8">
          Your decentralized file storage solution, secure and efficient, powered by the Internet Computer.
        </p>
        <p className="text-gray-400 text-md leading-relaxed">
          Log in to start managing your files and folders in Cloud3.0.
        </p>

        <div className="mt-10">
          <a
            href="/drive"
            className="inline-block bg-gradient-to-r from-purple-700 to-violet-800 hover:from-purple-800 hover:to-violet-900 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 ease-in-out shadow-md text-xl group"
          >
            Start Using Your Drive
          </a>
        </div>
      </main>
    </>
  );
};

export default Home;