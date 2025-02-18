"use client";

import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between">
        <h1 className="text-white text-2xl">Image Processor</h1>
        <div>
          <Link href="/" className="text-white px-4">Home</Link>
          <Link href="/crop-resize" className="text-white px-4">Crop & Resize</Link>
          <Link href="/filters" className="text-white px-4">Filters</Link>
          <Link href="/compress" className="text-white px-4">Compress</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 