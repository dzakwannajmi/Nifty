import React from 'react';

const Pricing = () => {
  return (
    <>
      {/* Konten Utama Halaman Pricing */}
      <main className="max-w-6xl mx-auto p-8 my-12 text-center">
        <h1 className="text-4xl font-bold text-purple-400 mb-6 tracking-wide">
          Choose the Right Plan for You
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed mb-12">
          Get unlimited access to decentralized storage with flexible and affordable plans.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Basic Plan */}
          <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 shadow-xl flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-purple-800">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Basic</h2>
              <p className="text-gray-400 text-lg mb-6">Perfect for personal use</p>
              <p className="text-5xl font-extrabold text-purple-400 mb-6">Free</p>
              <ul className="text-gray-300 text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  1 GB Storage
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Basic Access
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Community Support
                </li>
              </ul>
            </div>
            <button className="w-full bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-md text-lg group">
              Start for Free
            </button>
          </div>

          {/* Premium Plan - Highlighted */}
          <div className="bg-gradient-to-br from-purple-900 to-violet-950 p-10 rounded-2xl border-4 border-purple-400 shadow-2xl flex flex-col justify-between transform scale-105 transition-all duration-300 ease-in-out hover:scale-100 hover:shadow-3xl">
            <div>
              <p className="text-purple-300 font-semibold mb-3 text-lg">Most Popular</p>
              <h2 className="text-4xl font-bold text-white mb-4">Premium</h2>
              <p className="text-gray-300 text-xl mb-6">For power users and professionals</p>
              <p className="text-6xl font-extrabold text-purple-400 mb-6">$9<span className="text-2xl font-normal text-gray-400">/month</span></p>
              <ul className="text-gray-300 text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  100 GB Storage
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Advanced Features
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Priority Support
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Usage Analytics
                </li>
              </ul>
            </div>
            <button className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-md text-xl group">
              Choose Premium Plan
            </button>
          </div>

          {/* Business Plan */}
          <div className="bg-neutral-900 p-8 rounded-xl border border-neutral-800 shadow-xl flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-purple-800">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Business</h2>
              <p className="text-gray-400 text-lg mb-6">For teams and enterprises</p>
              <p className="text-5xl font-extrabold text-purple-400 mb-6">$29<span className="text-2xl font-normal text-gray-400">/month</span></p>
              <ul className="text-gray-300 text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  1 TB Storage
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  User Management
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  24/7 Dedicated Support
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  API Integration
                </li>
              </ul>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-md text-lg group">
              Contact Sales
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default Pricing;