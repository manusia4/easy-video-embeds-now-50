
import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const videoSrc = urlParams.get("src");

    if (videoSrc && videoRef.current) {
      videoRef.current.src = videoSrc;
      videoRef.current.load();
    }
  }, [location.search]);

  return (
    <div className="flex justify-center items-center w-full h-screen bg-black">
      <video
        ref={videoRef}
        className="w-full h-full max-w-full max-h-full"
        controls
        autoPlay
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
