import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Trash2 } from 'lucide-react';

interface VoiceRecorderProps {
    onRecordingComplete: (audioBlob: Blob, duration: number) => void;
    maxDuration?: number; // seconds
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
    onRecordingComplete,
    maxDuration = 30
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setDuration(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setDuration(prev => {
                    const newDuration = prev + 1;
                    if (newDuration >= maxDuration) {
                        stopRecording();
                    }
                    return newDuration;
                });
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please grant permission.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const playRecording = () => {
        if (audioBlob) {
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => setIsPlaying(false);
            audio.play();
            setIsPlaying(true);
        }
    };

    const deleteRecording = () => {
        setAudioBlob(null);
        setDuration(0);
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleSave = () => {
        if (audioBlob) {
            onRecordingComplete(audioBlob, duration);
            setAudioBlob(null);
            setDuration(0);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-white rounded-xl p-6 border-2 border-agri-gray-200 shadow-soft">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-agri-gray-900">Voice Note</h3>
                <span className="text-sm text-agri-gray-500">Max {maxDuration}s</span>
            </div>

            {!audioBlob ? (
                <div className="text-center">
                    {!isRecording ? (
                        <button
                            onClick={startRecording}
                            className="w-full bg-agri-green-500 hover:bg-agri-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Mic className="h-6 w-6" />
                            Start Recording
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-2xl font-bold text-agri-gray-900">
                                    {formatTime(duration)}
                                </span>
                            </div>
                            <div className="w-full bg-agri-gray-200 h-2 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-agri-green-500 transition-all duration-1000"
                                    style={{ width: `${(duration / maxDuration) * 100}%` }}
                                ></div>
                            </div>
                            <button
                                onClick={stopRecording}
                                className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <Square className="h-5 w-5" />
                                Stop Recording
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-agri-green-50 p-4 rounded-xl border border-agri-green-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-agri-green-700">
                                Recording Ready
                            </span>
                            <span className="text-sm text-agri-gray-600">
                                {formatTime(duration)}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={playRecording}
                                disabled={isPlaying}
                                className="flex-1 bg-white border-2 border-agri-green-500 text-agri-green-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-agri-green-50 transition-all disabled:opacity-50"
                            >
                                <Play className="h-4 w-4" />
                                {isPlaying ? 'Playing...' : 'Play'}
                            </button>
                            <button
                                onClick={deleteRecording}
                                className="px-4 bg-white border-2 border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50 transition-all"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        className="w-full bg-agri-green-500 hover:bg-agri-green-600 text-white py-3 rounded-xl font-bold transition-all active:scale-95"
                    >
                        Save Voice Note
                    </button>
                </div>
            )}

            <p className="text-xs text-agri-gray-500 mt-4 text-center">
                Record a short description of the work needed
            </p>
        </div>
    );
};

export default VoiceRecorder;
