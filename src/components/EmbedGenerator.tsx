
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const EmbedGenerator: React.FC = () => {
  const [mp4Link, setMp4Link] = useState<string>("");
  const [embedCode, setEmbedCode] = useState<string>("");
  const [directLink, setDirectLink] = useState<string>("");

  const generateEmbed = () => {
    if (!mp4Link) {
      toast.error("Masukkan link MP4 terlebih dahulu");
      return;
    }
    
    const mp4Url = encodeURIComponent(mp4Link);
    const baseUrl = window.location.origin;
    
    // Generate embed code
    const embedCode = `<iframe src="${baseUrl}/player?src=${mp4Url}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
    setEmbedCode(embedCode);
    
    // Generate direct link
    const directLink = `${baseUrl}/player?src=${mp4Url}`;
    setDirectLink(directLink);
    
    toast.success("Kode embed dan link langsung berhasil dibuat");
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
          
          <Button onClick={generateEmbed} className="w-full">
            Generate Embed
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
