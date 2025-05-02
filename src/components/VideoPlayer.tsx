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
  Minimize
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
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
        
        // Ambil informasi video dari Supabase berdasarkan short_code
        const { data, error: fetchError } = await supabase
          .from('video_links')
          .select('video_url, title')
          .eq('short_code', videoCode)
          .single();
        
        if (fetchError || !data) {
          console.error("Error mengambil video:", fetchError);
          setError("Video tidak ditemukan");
          toast.error("Video tidak ditemukan");
          setIsLoading(false);
          return;
        }
        
        // Update view counter
        await supabase
          .from('video_links')
          .update({ views: data.views ? data.views + 1 : 1 })
          .eq('short_code', videoCode);
        
        setVideoTitle(data.title);
        
        if (videoRef.current) {
          // Reset states when loading a new video
          setCurrentTime(0);
          setDuration(0);
          setIsPlaying(false);
          
          videoRef.current.src = data.video_url;
          videoRef.current.load();
          console.log("Loading video:", data.title);
        }
      } catch (err) {
        console.error("Failed to load video:", err);
        setError("Failed to load video");
        toast.error("Gagal memuat video");
      }
    };
    
    fetchVideo();
  }, [location.search]);

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

    const handleError = () => {
      console.error("Video error:", video.error);
      setError("Failed to play video");
      setIsLoading(false);
      toast.error("Gagal memutar video");
    };

    const handlePlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
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
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isPlaying]);

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
            setError("Failed to play video");
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

  return (
    <div 
      ref={videoContainerRef}
      className="relative flex justify-center items-center w-full h-screen bg-black"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Title */}
      {videoTitle && (
        <div className="absolute top-4 left-0 right-0 z-20 text-center">
          <h1 className="text-white text-xl font-bold bg-black/50 inline-block px-4 py-2 rounded-md">
            {videoTitle}
          </h1>
        </div>
      )}
      
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full max-w-full max-h-full"
        onClick={togglePlay}
        playsInline
      />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <div className="bg-red-900/80 text-white p-4 rounded-md text-center max-w-md">
            <h3 className="text-xl font-bold mb-2">Kesalahan Video</h3>
            <p>{error}</p>
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
    </div>
  );
};

export default VideoPlayer;
