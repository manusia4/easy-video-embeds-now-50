
import React, { useEffect, useState } from 'react';
import EmbedGenerator from '@/components/EmbedGenerator';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'online' | 'error'>('checking');

  // Check Supabase connection on load
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        // Try to query a simple health check - FIXED: removed count() function that was causing error
        const { data, error } = await supabase
          .from('video_links')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error("Supabase connection error:", error);
          setSupabaseStatus('error');
          toast.error("Koneksi ke database gagal");
        } else {
          setSupabaseStatus('online');
          toast.success("Koneksi ke database berhasil");
        }
      } catch (err) {
        console.error("Error checking Supabase:", err);
        setSupabaseStatus('error');
        toast.error("Koneksi ke database gagal");
      }
    };

    checkSupabaseConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Easy Video Embeds</h1>
          <p className="text-gray-600 mt-2">Embed MP4 videos dengan aman untuk website Anda</p>
          <p className="text-gray-500 mt-1">Tanpa watermark, perlindungan terbaik untuk konten video Anda</p>
          
          {/* Supabase connection status */}
          <div className="mt-2 text-sm">
            <span className="flex items-center">
              Status database: 
              {supabaseStatus === 'checking' && <span className="text-yellow-500 ml-2">Memeriksa koneksi...</span>}
              {supabaseStatus === 'online' && (
                <span className="flex items-center text-green-500 ml-2">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Terhubung
                </span>
              )}
              {supabaseStatus === 'error' && (
                <span className="flex items-center text-red-500 ml-2">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Gagal terhubung
                </span>
              )}
            </span>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 mr-2 text-blue-500" />
          <AlertTitle>Informasi Pemain Video</AlertTitle>
          <AlertDescription>
            <p>Jika video player menampilkan error <strong>"Cannot set property src of #&lt;HTMLVideoElement&gt; which has only a getter"</strong>, hal ini mungkin karena:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>URL video diproteksi oleh kebijakan CORS server</li>
              <li>Format video tidak didukung oleh browser</li>
              <li>Video terlalu besar dan tidak dapat dimuat</li>
              <li>Coba gunakan browser berbeda atau sumber video yang berbeda</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertTitle>Informasi Penting</AlertTitle>
          <AlertDescription>
            <p>Pastikan URL video Anda valid dan dapat diakses secara publik. Video dari sumber yang terproteksi mungkin tidak dapat diputar.</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Pastikan URL langsung ke file video (biasanya berakhir dengan .mp4, .webm, dll)</li>
              <li>Pastikan server video mengaktifkan CORS (Cross-Origin Resource Sharing)</li>
              <li>Jika terjadi error, coba gunakan URL video yang berbeda</li>
            </ul>
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
