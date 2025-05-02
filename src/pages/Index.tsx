
import React from 'react';
import EmbedGenerator from '@/components/EmbedGenerator';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Easy Video Embeds</h1>
          <p className="text-gray-600 mt-2">Embed MP4 videos dengan aman untuk website Anda</p>
          <p className="text-gray-500 mt-1">Tanpa watermark, perlindungan terbaik untuk konten video Anda</p>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertTitle>Informasi Penting</AlertTitle>
          <AlertDescription>
            Pastikan URL video Anda valid dan dapat diakses secara publik. Video dari sumber yang terproteksi mungkin tidak dapat diputar.
          </AlertDescription>
        </Alert>
        
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
