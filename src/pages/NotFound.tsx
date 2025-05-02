
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md w-full">
        <div className="flex justify-center mb-4">
          <div className="bg-red-50 p-3 rounded-full">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">404</h1>
        <p className="text-xl text-gray-600 mb-4">Halaman Tidak Ditemukan</p>
        <p className="text-gray-500 mb-6">
          Maaf, halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
        </p>
        <Button asChild className="w-full">
          <Link to="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
