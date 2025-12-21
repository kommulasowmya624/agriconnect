
import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Phone, Star, Filter, ToggleLeft, ToggleRight, Map, Users, TrendingUp, Volume2 } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { TRANSLATIONS } from '../constants';
import { storageService } from '../services/storageService';
import { Language, User, Job } from '../types';

interface DashboardProps {
    language: Language;
    currentUser: User;
    onUpdateAvailability?: (user: User) => void;
}

const WorkerDashboard: React.FC<DashboardProps> = ({ language, currentUser, onUpdateAvailability }) => {
    const t = TRANSLATIONS[language];
    const [radius, setRadius] = useState<number>(10); // Default 10km for workers
    const [sortBy, setSortBy] = useState<'nearest' | 'wage' | 'rating'>('nearest');
    const [realJobs, setRealJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean>(currentUser.available ?? true);
    const [selectedJob, setSelectedJob] = useState<string | null>(null);
    const [groupSize, setGroupSize] = useState<number>(1);

    useEffect(() => {
        let isMounted = true;

        const fetchJobs = async (isInitial = false) => {
            if (isInitial) setLoading(true);
            try {
                const jobs = await storageService.getJobs(currentUser.lat, currentUser.lng, radius);
                if (isMounted) setRealJobs(jobs);
            } catch (e) {
                console.error("Error fetching jobs", e);
            } finally {
                if (isInitial && isMounted) setLoading(false);
            }
        };

        fetchJobs(true);

        const intervalId = setInterval(() => {
            fetchJobs(false);
        }, 5000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [currentUser, radius]);

    const handleToggleAvailability = async () => {
        const newState = !isAvailable;
        setIsAvailable(newState);
        const updatedUser = await storageService.updateUser(currentUser.id, { available: newState });
        if (updatedUser && onUpdateAvailability) {
            onUpdateAvailability(updatedUser);
        }
    };

    const handleApply = (jobId: string) => {
        const job = realJobs.find(j => j.id === jobId);
        if (job) {
            const message = groupSize > 1
                ? `Applied for ${job.workType} with ${groupSize} workers!`
                : `Applied for ${job.workType}!`;
            alert(message);
            setSelectedJob(null);
            setGroupSize(1);
        }
    };

    const handleCallFarmer = (farmerName: string) => {
        alert(`Calling Farmer: ${farmerName}`);
    };

    const handleOpenMap = (lat: number, lng: number) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    };

    // Enhanced sorting with wage
    const jobs = [...realJobs].sort((a, b) => {
        if (sortBy === 'nearest') return a.distance - b.distance;
        if (sortBy === 'wage') return b.wage - a.wage; // Highest wage first
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
    });

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm px-5 py-4 shadow-soft border-b border-agri-gray-100 flex justify-between items-center sticky top-16 z-30">
                <h1 className="font-bold text-xl text-agri-gray-900 flex items-center">
                    <Briefcase className="mr-2 text-agri-green-500 h-6 w-6" /> Find Jobs
                </h1>

                {/* Availability Toggle */}
                <button
                    onClick={handleToggleAvailability}
                    className={`flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${isAvailable ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'bg-red-100 text-red-700 border-2 border-red-300'}`}
                >
                    {isAvailable ? 'Available' : 'Not Available'}
                    {isAvailable ? <ToggleRight className="ml-2 h-5 w-5" /> : <ToggleLeft className="ml-2 h-5 w-5" />}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-sm px-4 py-4 mb-2 shadow-sm border-b border-agri-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-agri-gray-800">Sort By:</h3>
                    <span className="text-xs text-agri-gray-500">{jobs.length} jobs found</span>
                </div>

                <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSortBy('nearest')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${sortBy === 'nearest' ? 'bg-agri-green-500 text-white shadow-green' : 'bg-agri-gray-100 text-agri-gray-600 hover:bg-agri-gray-200'}`}
                    >
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Nearest
                    </button>
                    <button
                        onClick={() => setSortBy('wage')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${sortBy === 'wage' ? 'bg-agri-green-500 text-white shadow-green' : 'bg-agri-gray-100 text-agri-gray-600 hover:bg-agri-gray-200'}`}
                    >
                        <TrendingUp className="h-4 w-4 inline mr-1" />
                        Highest Wage
                    </button>
                    <button
                        onClick={() => setSortBy('rating')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${sortBy === 'rating' ? 'bg-agri-green-500 text-white shadow-green' : 'bg-agri-gray-100 text-agri-gray-600 hover:bg-agri-gray-200'}`}
                    >
                        <Star className="h-4 w-4 inline mr-1" />
                        Top Rated
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-agri-gray-600">Radius:</span>
                    <div className="flex space-x-2 flex-1 overflow-x-auto">
                        {[5, 10, 25, 50].map(r => (
                            <button
                                key={r}
                                onClick={() => setRadius(r)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all whitespace-nowrap ${radius === r ? 'bg-agri-green-500 border-agri-green-500 text-white shadow-md' : 'bg-white border-agri-gray-200 text-agri-gray-600 hover:border-agri-green-300'}`}
                            >
                                {r} km
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Job Feed */}
            <div className="px-4 space-y-4 mt-4">
                {loading ? (
                    <div className="text-center py-10 text-agri-gray-500">Loading jobs...</div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-agri-gray-200">
                        <Filter className="h-12 w-12 text-agri-gray-300 mx-auto mb-3" />
                        <p className="text-agri-gray-600 font-medium">No jobs found in this area</p>
                        <p className="text-sm text-agri-gray-500 mt-1">Try increasing the search radius</p>
                    </div>
                ) : (
                    jobs.map(job => (
                        <div key={job.id} className="bg-white rounded-2xl shadow-soft border-2 border-agri-gray-100 hover:border-agri-green-300 transition-all overflow-hidden">
                            {/* Job Header */}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-agri-gray-900 text-lg leading-tight">{job.workType}</h3>
                                        <p className="text-agri-green-600 font-semibold text-sm mt-1">{job.farmerName}</p>
                                    </div>
                                    <div className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 px-4 py-2 rounded-xl text-base font-bold shadow-sm border-2 border-green-200">
                                        ₹{job.wage}/day
                                    </div>
                                </div>

                                <div className="flex items-center flex-wrap gap-3 text-sm text-agri-gray-600 mb-4">
                                    <div className="flex items-center bg-agri-gray-50 px-3 py-1.5 rounded-lg">
                                        <MapPin className="h-4 w-4 mr-1.5 text-agri-green-500" />
                                        <span className="font-semibold">{job.distance} km away</span>
                                    </div>
                                    <div className="flex items-center bg-agri-gray-50 px-3 py-1.5 rounded-lg">
                                        <Star className="h-4 w-4 mr-1.5 text-yellow-400 fill-current" />
                                        <span className="font-semibold">{job.rating || 'New'}</span>
                                    </div>
                                    <div className="text-xs bg-agri-gray-100 px-3 py-1 rounded-lg text-agri-gray-600 border border-agri-gray-200 font-medium">
                                        {job.date}
                                    </div>
                                </div>

                                {job.description && (
                                    <p className="text-sm text-agri-gray-700 mb-4 bg-agri-gray-50 p-3 rounded-xl border border-agri-gray-100">
                                        {job.description}
                                    </p>
                                )}

                                {/* Voice Note Player */}
                                {job.voiceNoteBlob && (
                                    <div className="mb-4">
                                        <AudioPlayer
                                            audioUrl={job.voiceNoteBlob}
                                            duration={job.voiceNoteDuration}
                                        />
                                    </div>
                                )}

                                {/* Group Application */}
                                {selectedJob === job.id && (
                                    <div className="mb-4 bg-agri-green-50 border-2 border-agri-green-200 rounded-xl p-4 animate-in slide-in-from-top duration-200">
                                        <label className="block text-sm font-bold text-agri-green-700 mb-2 flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            Applying with a group?
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                min="1"
                                                max="20"
                                                value={groupSize}
                                                onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
                                                className="w-20 bg-white border-2 border-agri-green-300 rounded-lg p-2 text-center font-bold text-lg outline-none focus:ring-2 focus:ring-agri-green-500"
                                            />
                                            <span className="text-sm text-agri-gray-700 font-medium">
                                                {groupSize === 1 ? 'worker' : 'workers'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    {selectedJob === job.id ? (
                                        <>
                                            <button
                                                onClick={() => handleApply(job.id)}
                                                className="flex-1 bg-agri-green-500 hover:bg-agri-green-600 text-white font-bold py-4 rounded-xl shadow-green-lg flex items-center justify-center transition-all active:scale-95"
                                            >
                                                <Users className="h-5 w-5 mr-2" />
                                                Apply with {groupSize} {groupSize === 1 ? 'Worker' : 'Workers'}
                                            </button>
                                            <button
                                                onClick={() => setSelectedJob(null)}
                                                className="px-4 bg-agri-gray-200 hover:bg-agri-gray-300 text-agri-gray-700 font-bold rounded-xl transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setSelectedJob(job.id)}
                                                className="flex-1 bg-agri-green-500 hover:bg-agri-green-600 text-white font-bold py-4 rounded-xl shadow-green-lg flex items-center justify-center transition-all active:scale-95"
                                            >
                                                Apply Now
                                            </button>
                                            <button
                                                onClick={() => handleCallFarmer(job.farmerName)}
                                                className="w-14 bg-agri-gray-100 hover:bg-agri-green-50 text-agri-green-600 font-bold rounded-xl flex items-center justify-center transition-colors border-2 border-agri-gray-200 hover:border-agri-green-300"
                                                title="Call Farmer"
                                            >
                                                <Phone className="h-6 w-6" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenMap(job.lat, job.lng)}
                                                className="w-14 bg-agri-gray-100 hover:bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center justify-center transition-colors border-2 border-agri-gray-200 hover:border-blue-300"
                                                title="View on Map"
                                            >
                                                <Map className="h-6 w-6" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WorkerDashboard;
