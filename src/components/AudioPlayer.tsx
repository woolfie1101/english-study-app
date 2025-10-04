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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Mock audio element since we don't have real audio files
    const mockAudio = {
      play: () => Promise.resolve(),
      pause: () => {},
      currentTime: 0,
      duration: duration,
      loop: false,
      addEventListener: () => {},
      removeEventListener: () => {}
    };
    
    audioRef.current = mockAudio as any;
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= duration) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return duration;
            }
          }
          return newTime;
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration, isLooping]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / duration) * 100;

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