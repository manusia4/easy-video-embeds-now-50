
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EmbedGenerator: React.FC = () => {
  const [mp4Link, setMp4Link] = useState<string>("");
  const [embedCode, setEmbedCode] = useState<string>("");

  const generateEmbed = () => {
    if (!mp4Link) return;
    const mp4Url = encodeURIComponent(mp4Link);
    const baseUrl = window.location.origin;
    const embedCode = `<iframe src="${baseUrl}/player?src=${mp4Url}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
    setEmbedCode(embedCode);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    alert("Kode embed berhasil disalin!");
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
              <Button onClick={handleCopy} variant="outline" className="w-full">
                Salin Kode Embed
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmbedGenerator;
