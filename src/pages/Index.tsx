
import React from 'react';
import EmbedGenerator from '@/components/EmbedGenerator';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Easy Video Embeds</h1>
          <p className="text-gray-600 mt-2">Embed MP4 videos dengan aman untuk website Anda</p>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <EmbedGenerator />
      </main>
      
      <footer className="bg-white border-t mt-10 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500">
          &copy; {new Date().getFullYear()} Easy Video Embeds - Aman & Terproteksi
        </div>
      </footer>
    </div>
  );
};

export default Index;
