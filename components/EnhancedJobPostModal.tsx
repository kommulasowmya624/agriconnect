import React, { useState } from 'react';
import { X, Tractor, Scissors, Sprout, Wheat, Droplets, Package } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';
import { Job } from '../types';

interface EnhancedJobPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (job: Partial<Job>, audioBlob?: Blob, audioDuration?: number) => void;
    currentUser: any;
    language: string;
}

const WORK_TYPES = [
    { id: 'harvesting', label: 'Harvesting', icon: Scissors, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { id: 'sowing', label: 'Sowing', icon: Sprout, color: 'bg-green-100 text-green-700 border-green-300' },
    { id: 'plowing', label: 'Plowing', icon: Tractor, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { id: 'irrigation', label: 'Irrigation', icon: Droplets, color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { id: 'threshing', label: 'Threshing', icon: Wheat, color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { id: 'packaging', label: 'Packaging', icon: Package, color: 'bg-purple-100 text-purple-700 border-purple-300' },
];

const EnhancedJobPostModal: React.FC<EnhancedJobPostModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    currentUser,
}) => {
    const [step, setStep] = useState(1); // 1: Work Type, 2: Details, 3: Voice
    const [selectedWorkType, setSelectedWorkType] = useState('');
    const [wage, setWage] = useState('');
    const [description, setDescription] = useState('');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioDuration, setAudioDuration] = useState(0);

    if (!isOpen) return null;

    const handleWorkTypeSelect = (type: string) => {
        setSelectedWorkType(type);
        setStep(2);
    };

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(3);
    };

    const handleVoiceComplete = (blob: Blob, duration: number) => {
        setAudioBlob(blob);
        setAudioDuration(duration);
    };

    const handleFinalSubmit = () => {
        const jobData: Partial<Job> = {
            workType: selectedWorkType,
            wage: parseInt(wage),
            description,
            date: new Date().toLocaleDateString(),
            location: currentUser.location,
            lat: currentUser.lat,
            lng: currentUser.lng,
        };

        onSubmit(jobData, audioBlob || undefined, audioDuration);

        // Reset form
        setStep(1);
        setSelectedWorkType('');
        setWage('');
        setDescription('');
        setAudioBlob(null);
        setAudioDuration(0);
    };

    const handleSkipVoice = () => {
        handleFinalSubmit();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-agri-green-50 to-white p-5 border-b border-agri-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-agri-gray-900">Post a Job</h3>
                        <p className="text-sm text-agri-gray-600">Step {step} of 3</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-agri-gray-100 rounded-full hover:bg-agri-gray-200 transition"
                    >
                        <X className="h-5 w-5 text-agri-gray-600" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-agri-gray-100">
                    <div
                        className="h-full bg-agri-green-500 transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-6">
                    {/* Step 1: Work Type Selection */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg text-agri-gray-800 mb-4">
                                Select Work Type
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {WORK_TYPES.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => handleWorkTypeSelect(type.label)}
                                            className={`${type.color} border-2 rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-all active:scale-95 shadow-sm`}
                                        >
                                            <Icon className="h-10 w-10" />
                                            <span className="font-bold text-sm">{type.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Job Details */}
                    {step === 2 && (
                        <form onSubmit={handleDetailsSubmit} className="space-y-4">
                            <div className="bg-agri-green-50 border-2 border-agri-green-200 rounded-xl p-4 mb-4">
                                <p className="text-sm font-semibold text-agri-green-700">
                                    Work Type: <span className="text-agri-green-900">{selectedWorkType}</span>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-agri-gray-700 mb-2">
                                    Daily Wage (₹) *
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="100"
                                    max="5000"
                                    step="50"
                                    value={wage}
                                    onChange={(e) => setWage(e.target.value)}
                                    className="w-full bg-agri-gray-50 border-2 border-agri-gray-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-agri-green-500 focus:border-agri-green-500 font-semibold text-lg"
                                    placeholder="e.g. 500"
                                />
                                <p className="text-xs text-agri-gray-500 mt-1">Recommended: ₹300-800/day</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-agri-gray-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-agri-gray-50 border-2 border-agri-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-agri-green-500 focus:border-agri-green-500"
                                    rows={3}
                                    placeholder="Additional details about the work..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-agri-gray-100 text-agri-gray-700 py-3 rounded-xl font-bold hover:bg-agri-gray-200 transition"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-agri-green-500 text-white py-3 rounded-xl font-bold hover:bg-agri-green-600 transition shadow-green-lg"
                                >
                                    Next
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Voice Note */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="text-center mb-4">
                                <h4 className="font-bold text-lg text-agri-gray-900 mb-2">
                                    Add Voice Description (Optional)
                                </h4>
                                <p className="text-sm text-agri-gray-600">
                                    Record a short message explaining the work requirements
                                </p>
                            </div>

                            <VoiceRecorder
                                onRecordingComplete={handleVoiceComplete}
                                maxDuration={30}
                            />

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="flex-1 bg-agri-gray-100 text-agri-gray-700 py-3 rounded-xl font-bold hover:bg-agri-gray-200 transition"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSkipVoice}
                                    className="flex-1 bg-agri-gray-300 text-agri-gray-700 py-3 rounded-xl font-bold hover:bg-agri-gray-400 transition"
                                >
                                    Skip
                                </button>
                                {audioBlob && (
                                    <button
                                        type="button"
                                        onClick={handleFinalSubmit}
                                        className="flex-1 bg-agri-green-500 text-white py-3 rounded-xl font-bold hover:bg-agri-green-600 transition shadow-green-lg"
                                    >
                                        Post Job
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnhancedJobPostModal;
