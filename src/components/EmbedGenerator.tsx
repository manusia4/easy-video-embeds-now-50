
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const EmbedGenerator: React.FC = () => {
  const [mp4Link, setMp4Link] = useState<string>("");
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [embedCode, setEmbedCode] = useState<string>("");
  const [directLink, setDirectLink] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateEmbed = async () => {
    if (!mp4Link) {
      toast.error("Masukkan link MP4 terlebih dahulu");
      return;
    }

    if (!videoTitle) {
      toast.error("Masukkan judul video terlebih dahulu");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Simpan video ke database Supabase
      const { data, error } = await supabase
        .from('video_links')
        .insert([
          { title: videoTitle, video_url: mp4Link }
        ])
        .select('id, short_code')
        .single();
      
      if (error) {
        console.error("Error menyimpan video:", error);
        toast.error("Gagal menyimpan video");
        return;
      }
      
      const baseUrl = window.location.origin;
      
      // Gunakan short_code untuk URL yang lebih pendek dan aman
      const shortCode = data.short_code;
      
      // Generate embed code
      const embedCode = `<iframe src="${baseUrl}/player?code=${shortCode}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
      setEmbedCode(embedCode);
      
      // Generate direct link
      const directLink = `${baseUrl}/player?code=${shortCode}`;
      setDirectLink(directLink);
      
      toast.success("Kode embed dan link langsung berhasil dibuat");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan saat membuat embed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  return (
    <div className="container mx-auto max-w-3xl py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Embed Link Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="videoTitle" className="text-lg font-medium">
              Judul Video:
            </label>
            <Input
              id="videoTitle"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Masukkan judul video"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="mp4Link" className="text-lg font-medium">
              Masukkan link MP4:
            </label>
            <Input
              id="mp4Link"
              value={mp4Link}
              onChange={(e) => setMp4Link(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="w-full"
            />
          </div>
          
          <Button 
            onClick={generateEmbed} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Menyimpan..." : "Generate Embed"}
          </Button>

          {/* Embed Code Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Embed Code:</h3>
            <Textarea
              id="embedCode"
              value={embedCode}
              readOnly
              rows={4}
              className="w-full"
            />
            {embedCode && (
              <Button 
                onClick={() => handleCopy(embedCode, "Kode embed berhasil disalin!")} 
                variant="outline" 
                className="w-full"
              >
                Salin Kode Embed
              </Button>
            )}
          </div>
          
          {/* Direct Link Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Link Langsung:</h3>
            <Input
              id="directLink"
              value={directLink}
              readOnly
              className="w-full"
            />
            {directLink && (
              <Button 
                onClick={() => handleCopy(directLink, "Link langsung berhasil disalin!")} 
                variant="outline" 
                className="w-full"
              >
                Salin Link Langsung
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmbedGenerator;
