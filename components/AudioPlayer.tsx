import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
    audioUrl: string;
    duration?: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, duration }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="bg-agri-green-50 border-2 border-agri-green-200 rounded-xl p-4">
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
            />

            <div className="flex items-center gap-3">
                <button
                    onClick={togglePlay}
                    className="w-12 h-12 bg-agri-green-500 hover:bg-agri-green-600 text-white rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md"
                >
                    {isPlaying ? (
                        <Pause className="h-5 w-5" fill="currentColor" />
                    ) : (
                        <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                    )}
                </button>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Volume2 className="h-4 w-4 text-agri-green-600" />
                        <span className="text-sm font-semibold text-agri-green-700">
                            Voice Description
                        </span>
                    </div>

                    <div className="relative w-full h-2 bg-agri-green-200 rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-agri-green-500 transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex justify-between mt-1">
                        <span className="text-xs text-agri-gray-600">
                            {formatTime(currentTime)}
                        </span>
                        {duration && (
                            <span className="text-xs text-agri-gray-600">
                                {formatTime(duration)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
