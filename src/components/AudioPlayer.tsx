import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

interface AudioPlayerProps {
  audioUrl: string;
  duration: number; // in seconds
}

export function AudioPlayer({ audioUrl, duration }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [actualDuration, setActualDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Construct Supabase Storage URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mltoqwqobwbzgqutvclv.supabase.co';
  const fullAudioUrl = audioUrl && supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/audio-files/${audioUrl}`
    : '';

  // Debug logging
  useEffect(() => {
    console.log('AudioPlayer Debug:', {
      audioUrl,
      supabaseUrl,
      fullAudioUrl,
      env: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasEnv: !!process.env.NEXT_PUBLIC_SUPABASE_URL
    });
  }, [audioUrl, supabaseUrl, fullAudioUrl]);

  useEffect(() => {
    if (!fullAudioUrl) {
      console.error('No audio URL provided');
      return;
    }

    const audio = new Audio(fullAudioUrl);
    audio.loop = isLooping;

    const handleLoadedMetadata = () => {
      console.log('Audio loaded successfully:', fullAudioUrl);
      setActualDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (!isLooping) {
        setCurrentTime(0);
      }
    };

    const handleError = (e: ErrorEvent) => {
      console.error('Audio loading error:', {
        url: fullAudioUrl,
        error: e,
        audioError: audio.error,
        readyState: audio.readyState,
        networkState: audio.networkState
      });
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Test if URL is accessible
    fetch(fullAudioUrl, { method: 'HEAD' })
      .then(response => {
        console.log('Audio URL test:', {
          url: fullAudioUrl,
          status: response.status,
          contentType: response.headers.get('content-type')
        });
      })
      .catch(err => {
        console.error('Audio URL not accessible:', err);
      });

    audioRef.current = audio;

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [fullAudioUrl, isLooping]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
    }
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = (value[0] / 100) * actualDuration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / actualDuration) * 100;

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlay}
        className="p-2"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>
      
      <div className="flex-1 flex items-center space-x-2">
        <Slider
          value={[progress]}
          onValueChange={handleSeek}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="text-xs text-gray-600 min-w-fit">
          {formatTime(currentTime)}
        </span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLoop}
        className={`p-2 ${isLooping ? 'text-blue-500' : 'text-gray-500'}`}
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
}