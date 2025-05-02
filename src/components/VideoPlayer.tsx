import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  SkipBack,
  Maximize,
  Minimize,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [corsRetried, setCorsRetried] = useState(false);
  
  // Handle video source from URL parameter
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const urlParams = new URLSearchParams(location.search);
        const videoCode = urlParams.get("code");
        
        if (!videoCode) {
          setError("Kode video tidak ditemukan");
          toast.error("Kode video tidak ditemukan");
          setIsLoading(false);
          return;
        }
        
        // Set video ID for randomization
        setVideoId(videoCode);
        
        console.log("Fetching video with code:", videoCode);
        
        // Ambil informasi video dari Supabase berdasarkan short_code
        const { data, error: fetchError } = await supabase
          .from('video_links')
          .select('video_url, title, views')
          .eq('short_code', videoCode)
          .maybeSingle();
        
        if (fetchError) {
          console.error("Database error:", fetchError);
          setError("Error database: " + fetchError.message);
          toast.error("Error database");
          setIsLoading(false);
          return;
        }
        
        if (!data) {
          console.error("Video not found for code:", videoCode);
          setError("Video tidak ditemukan");
          toast.error("Video tidak ditemukan");
          setIsLoading(false);
          return;
        }
        
        console.log("Video data retrieved:", data);
        
        // Update view counter - menghindari error jika views tidak ada
        const updateResult = await supabase
          .from('video_links')
          .update({ views: (data.views || 0) + 1 })
          .eq('short_code', videoCode);
          
        if (updateResult.error) {
          console.warn("Failed to update view count:", updateResult.error);
        }
        
        setVideoTitle(data.title || "Untitled Video");
        
        // Add timestamp and random token to video URL to prevent caching
        const timestamp = Date.now();
        const randomToken = Math.random().toString(36).substring(2, 15);
        const originalUrl = data.video_url;
        
        // Check if URL already has parameters
        const separator = originalUrl.includes('?') ? '&' : '?';
        const obfuscatedUrl = `${originalUrl}${separator}t=${timestamp}&token=${randomToken}`;
        
        setVideoUrl(obfuscatedUrl);
        console.log("Setting video URL:", obfuscatedUrl);
        
        if (videoRef.current) {
          // Reset states when loading a new video
          setCurrentTime(0);
          setDuration(0);
          setIsPlaying(false);
          
          // Try to load video
          videoRef.current.src = obfuscatedUrl;
          videoRef.current.load();
          console.log("Loading video:", data.title);
        }
      } catch (err) {
        console.error("Failed to load video:", err);
        setError("Gagal memuat video: " + (err instanceof Error ? err.message : "Unknown error"));
        toast.error("Gagal memuat video");
        setIsLoading(false);
      }
    };
    
    fetchVideo();
  }, [location.search, retryCount]);

  // Try to load video when URL changes
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      try {
        console.log("Setting video source to:", videoUrl);
        videoRef.current.src = videoUrl;
        videoRef.current.load();
      } catch (err) {
        console.error("Error setting video source:", err);
        setError("Error saat memuat video: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    }
  }, [videoUrl]);

  // Add event listeners to video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded");
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleLoadedData = () => {
      console.log("Video data loaded, ready to play");
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      console.error("Video error event triggered");
      if (video.error) {
        console.error("Video error code:", video.error.code);
        console.error("Video error message:", video.error.message);
      }
      console.error("Network state:", video.networkState);
      console.error("Ready state:", video.readyState);
      
      // If this is a CORS error and we haven't tried the CORS fix yet
      if (!corsRetried) {
        console.log("Attempting CORS fix by reloading with crossOrigin attribute");
        setCorsRetried(true);
        
        // Try reloading with crossOrigin attribute
        video.crossOrigin = "anonymous";
        
        // Force reload the video
        if (videoUrl) {
          video.src = videoUrl;
          video.load();
          return; // Don't set error yet
        }
      }
      
      setError("Gagal memuat video. Coba periksa URL atau koneksi internet Anda.");
      setIsLoading(false);
      toast.error("Gagal memuat video");
    };

    const handlePlaying = () => {
      console.log("Video started playing");
      setIsPlaying(true);
      setIsLoading(false);
      setError(null); // Clear any previous errors when playback starts
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      console.log("Video can play now");
      setIsLoading(false);
    };

    // Add protection against right-click to prevent easy downloading
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Register all event listeners
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("contextmenu", handleContextMenu);

    // Check for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Auto-hide controls after 3 seconds of inactivity
    const timer = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);

    // Clean up all event listeners
    return () => {
      clearTimeout(timer);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isPlaying, videoUrl, corsRetried]);

  // Apply protection techniques and additional settings
  useEffect(() => {
    const video = videoRef.current;
    const container = videoContainerRef.current;
    
    if (!video || !container) return;
    
    // Modify video element to make it harder to extract source
    Object.defineProperty(video, 'src', {
      get: function() {
        return '';
      }
    });
    
    // Disable picture-in-picture
    video.disablePictureInPicture = true;
    
    // Add CSS to prevent selection
    const style = document.createElement('style');
    style.textContent = `
      video::-internal-media-controls-download-button {
        display: none !important;
      }
      video::-webkit-media-controls-enclosure {
        overflow: hidden !important;
      }
      video::-webkit-media-controls-panel {
        width: calc(100% + 30px) !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Setting crossOrigin attribute to handle CORS issues
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.crossOrigin = "anonymous";
      console.log("Set crossOrigin to anonymous");
    }
  }, []);

  const togglePlay = () => {
    if (!videoRef.current || error) return;
    
    try {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // Use the play() Promise API properly
        const playPromise = videoRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.error("Play failed:", err);
            setIsPlaying(false);
            setError("Gagal memutar video. Silahkan coba lagi.");
            toast.error("Gagal memutar video");
          });
        }
      }
    } catch (err) {
      console.error("Error toggling play:", err);
      toast.error("Gagal memutar video");
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    
    const newVolume = value[0];
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
      videoRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current || !duration) return;
    
    const seekTime = value[0];
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    
    videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
  };

  const skipBackward = () => {
    if (!videoRef.current) return;
    
    videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;

    if (!isFullscreen) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setCorsRetried(false);
    setRetryCount(prev => prev + 1);
    toast.info("Mencoba memuat ulang video...");
  };

  const checkVideoStatus = async () => {
    if (!videoUrl) return;
    
    try {
      const response = await fetch(videoUrl, { method: 'HEAD' });
      console.log("Video URL check status:", response.status, response.statusText);
      console.log("Video URL headers:", response.headers);
      
      if (!response.ok) {
        setError(`URL video tidak dapat diakses (${response.status}: ${response.statusText})`);
      } else {
        toast.success("URL video valid");
      }
    } catch (err) {
      console.error("Error checking video URL:", err);
      setError("URL video tidak dapat diakses secara langsung, mungkin karena kebijakan CORS");
    }
  };

  return (
    <div 
      ref={videoContainerRef}
      className="relative flex justify-center items-center w-full h-screen bg-black"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full max-w-full max-h-full"
        onClick={togglePlay}
        playsInline
        controlsList="nodownload"
        preload="auto"
      />
      
      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <div className="bg-red-900/90 text-white p-6 rounded-md text-center max-w-md">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-200" />
            <h3 className="text-2xl font-bold mb-3">Kesalahan Video</h3>
            <p className="text-lg mb-5">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 border-white/30 text-white flex items-center gap-2" 
                onClick={handleRetry}
              >
                <RefreshCw className="h-4 w-4" />
                Coba Lagi
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 border-white/30 text-white" 
                onClick={checkVideoStatus}
              >
                Periksa Status URL
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Play Button Overlay (when paused) */}
      {!isPlaying && !isLoading && !error && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-5"
          onClick={togglePlay}
        >
          <div className="rounded-full bg-white/30 p-6 backdrop-blur-sm">
            <Play className="h-12 w-12 text-white" />
          </div>
        </div>
      )}
      
      {/* Custom Video Controls */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 z-10",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}
        <div className="mb-2">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.01}
            onValueChange={handleSeek}
            className="h-1.5"
          />
          <div className="flex justify-between text-white text-xs mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20" 
              onClick={skipBackward}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20" 
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20" 
              onClick={skipForward}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20" 
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24 h-1.5"
            />
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20" 
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Toast notification for errors at the bottom */}
      {error && (
        <div className="absolute bottom-16 left-0 right-0 mx-auto w-full max-w-md p-2 flex items-center justify-center z-20">
          <div className="bg-black/75 text-white px-4 py-2 rounded-full flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-red-400" />
            <p>Gagal memuat video</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
