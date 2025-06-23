import React from 'react';

const About = () => {
  return (
    <>
      {/* Konten Utama Halaman About */}
      <main className="max-w-4xl mx-auto p-8 my-12 bg-neutral-900 rounded-xl border border-neutral-800 shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-purple-800">
        <h1 className="text-4xl font-bold text-purple-400 mb-6 tracking-wide text-center">
          Our Vision: Revolutionary Digital Storage
        </h1>

        <section className="space-y-6 text-gray-300 text-lg leading-relaxed">
          <p>
            Nifty is a pioneer in decentralized cloud storage solutions, built on the robust foundation of the Internet Computer (ICP). We believe that the future of data storage is decentralized, where users have full control over their digital assets, free from the limitations of centralized servers.
          </p>
          <p>
            Our vision is to provide a platform that is not only secure and private, but also highly efficient and easily accessible to anyone, anywhere. With Nifty, we are transforming the paradigm of traditional storage, offering unparalleled reliability and transparency in this digital era.
          </p>
          <p>
            We are committed to continuous innovation, constantly developing new features that empower users, from individuals to large enterprises. We envision a world where your data truly belongs to you, protected by the power of blockchain and accessible whenever you need it.
          </p>
          <p className="text-purple-400 font-semibold mt-8 text-xl text-center">
            Nifty: Your Storage, Your Control.
          </p>
        </section>

        {/* Optional Section: Mission or Values */}
        <section className="mt-12 pt-8 border-t border-neutral-800 text-left">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">Our Mission</h2>
            <p className="text-gray-400 leading-relaxed">
                Nifty's mission is to democratize data storage by offering an inviolable, transparent, and scalable cloud infrastructure. We are determined to empower individuals and businesses with the tools they need to store, manage, and share data with full confidence in security and privacy.
            </p>
            <h2 className="text-2xl font-bold text-purple-400 mb-4 mt-8">Our Values</h2>
            <ul className="text-gray-400 space-y-2">
                <li className="flex items-start">
                    <span className="text-purple-400 font-bold mr-3 text-xl">&bull;</span>
                    <strong>Innovation:</strong> We continuously push the boundaries of technology to create the best solutions.
                </li>
                <li className="flex items-start">
                    <span className="text-purple-400 font-bold mr-3 text-xl">&bull;</span>
                    <strong>Security:</strong> User data privacy and security are our top priorities.
                </li>
                <li className="flex items-start">
                    <span className="text-purple-400 font-bold mr-3 text-xl">&bull;</span>
                    <strong>Transparency:</strong> We are committed to open and honest operations.
                </li>
                <li className="flex items-start">
                    <span className="text-purple-400 font-bold mr-3 text-xl">&bull;</span>
                    <strong>User Empowerment:</strong> We believe in full user control over their data.
                </li>
            </ul>
        </section>

      </main>
    </>
  );
};

export default About;