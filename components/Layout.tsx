
import React, { useEffect, useState } from 'react';
import { LogOut, MapPin, ChevronDown, Bell, User as UserIcon, X, Edit2 } from 'lucide-react';
import { UserRole, Language, Notification, User } from '../types';
import { TRANSLATIONS } from '../constants';
import { storageService } from '../services/storageService';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLogout: () => void;
  currentUser?: User | null; // Pass current user for notifications
  onUserUpdate?: (user: User) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, role, language, onLanguageChange, onLogout, currentUser, onUserUpdate }) => {
  const t = TRANSLATIONS[language];
  const [locationName, setLocationName] = useState<string>(t.detecting);
  const [isLocating, setIsLocating] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Edit Profile State
  const [editForm, setEditForm] = useState({ name: '', location: '' });

  useEffect(() => {
    // We always attempt to detect on first load if we don't have a reliable location name
    const savedLoc = localStorage.getItem('agri_location_name');
    if (savedLoc) {
      setLocationName(savedLoc);
    }

    // Even if location is saved, we re-detect to ensure the location name is fresh
    detectLocation();
  }, []);

  // Poll for notifications
  useEffect(() => {
    if (currentUser?.id) {
      const fetchNotifs = async () => {
        const data = await storageService.getNotifications(currentUser.id);
        setNotifications(data);
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Init Edit Form
  useEffect(() => {
    if (currentUser) {
      setEditForm({ name: currentUser.name, location: currentUser.location });
    }
  }, [currentUser]);

  const detectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            let locName = "Unknown Location";

            if (data && data.address) {
              locName = data.address.village || data.address.town || data.address.city || data.address.suburb || data.address.county || data.address.state_district || "Unknown Location";

              // --- ENHANCED LANGUAGE DETECTION LOGIC ---
              // Only automatically switch language if the user hasn't manually selected one yet
              const manuallySelected = localStorage.getItem('agri_language');

              if (!manuallySelected) {
                const state = (data.address.state || '').toLowerCase();
                const countryCode = (data.address.country_code || '').toLowerCase();

                let detectedLang: Language | null = null;

                // 1. Detect Spanish based on Country Code
                const spanishCountries = ['es', 'mx', 'ar', 'co', 'cl', 'pe', 've', 'ec', 'bo', 'uy', 'py', 'gt', 'hn', 'sv', 'ni', 'cr', 'pa', 'do', 'pr'];
                if (spanishCountries.includes(countryCode)) {
                  detectedLang = Language.ES;
                }
                // 2. Detect Indian Local Languages based on State
                else if (countryCode === 'in') {
                  // Telugu States
                  if (state.includes('andhra') || state.includes('telangana')) {
                    detectedLang = Language.TE;
                  }
                  // Hindi Belt States
                  else if ([
                    'delhi', 'uttar pradesh', 'madhya pradesh', 'rajasthan', 'haryana',
                    'bihar', 'jharkhand', 'chhattisgarh', 'himachal pradesh', 'uttarakhand',
                    'chandigarh'
                  ].some(s => state.includes(s))) {
                    detectedLang = Language.HI;
                  }
                }

                if (detectedLang && detectedLang !== language) {
                  onLanguageChange(detectedLang);
                }
              }
            }

            setLocationName(locName);
            localStorage.setItem('agri_location_name', locName);
          } catch (error) {
            console.error("Geocoding error", error);
            setLocationName(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          }
          setIsLocating(false);
        },
        (error) => {
          console.error("Geolocation error", error);
          setLocationName("Location Unavailable");
          setIsLocating(false);
        }
      );
    } else {
      setLocationName("Not Supported");
      setIsLocating(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updatedUser = await storageService.updateUser(currentUser.id, editForm);

    if (updatedUser && onUserUpdate) {
      onUserUpdate(updatedUser);
      setShowProfile(false);
      alert(t.profileUpdated);
    } else if (!updatedUser && onUserUpdate) {
      // Fallback for offline/demo mode where backend returns null
      onUserUpdate({ ...currentUser, ...editForm });
      setShowProfile(false);
      alert(t.profileUpdated);
    }
  };

  const getMainClass = () => {
    return "flex-grow w-full max-w-lg mx-auto pb-20";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* FIXED GLOBAL HEADER */}
      <header className="bg-white shadow-soft sticky top-0 z-50 px-5 py-4 flex justify-between items-center h-18 transition-all duration-300 border-b border-agri-gray-100">
        {/* Left: Location */}
        <div className="flex flex-col justify-center flex-1 cursor-pointer" onClick={detectLocation}>
          <div className="flex items-center text-agri-green-700 font-bold text-xs uppercase tracking-wider mb-0.5">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-agri-green-500" />
            {isLocating ? t.detecting : t.location}
          </div>
          <div className="flex items-center text-sm font-bold text-agri-gray-900 truncate max-w-[150px]">
            {locationName} <ChevronDown className="h-4 w-4 ml-1 text-agri-green-500" />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          {role !== UserRole.NONE && (
            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)} className="p-2.5 bg-agri-gray-50 rounded-full hover:bg-agri-green-50 hover:shadow-sm transition-all relative">
                <Bell className="h-5 w-5 text-agri-gray-700" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-agri-green-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Dropdown */}
              {showNotif && (
                <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-2xl border border-agri-gray-100 overflow-hidden z-[60]">
                  <div className="bg-gradient-to-r from-agri-green-50 to-white px-5 py-3 border-b border-agri-gray-100 font-bold text-sm text-agri-gray-900">{t.notifications}</div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-agri-gray-500">{t.noNotifications}</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 border-b border-agri-gray-50 hover:bg-agri-gray-50 transition-colors">
                          <p className="text-sm text-agri-gray-800 font-medium">{n.message}</p>
                          <p className="text-xs text-agri-gray-400 mt-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          {role !== UserRole.NONE && (
            <button onClick={() => setShowProfile(true)} className="p-2.5 bg-agri-gray-50 rounded-full hover:bg-agri-green-50 hover:shadow-sm transition-all">
              <UserIcon className="h-5 w-5 text-agri-gray-700" />
            </button>
          )}

          {/* Language */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-agri-gray-50 text-agri-gray-800 text-sm font-bold py-2 px-3.5 rounded-lg border border-agri-gray-200 focus:ring-2 focus:ring-agri-green-500 cursor-pointer outline-none appearance-none pr-9 hover:bg-agri-gray-100 transition-all"
            >
              <option value={Language.EN}>EN</option>
              <option value={Language.HI}>HI</option>
              <option value={Language.TE}>TE</option>
              <option value={Language.ES}>ES</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-agri-gray-600 pointer-events-none" />
          </div>

          {role !== UserRole.NONE && (
            <button onClick={onLogout} className="text-agri-gray-500 hover:text-red-500 bg-agri-gray-50 p-2 rounded-full hover:bg-red-50 transition-all">
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className={getMainClass()}>
        {children}
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-7 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center text-agri-gray-900"><Edit2 className="mr-2 h-6 w-6 text-agri-green-500" /> {t.editDetails}</h2>
              <button onClick={() => setShowProfile(false)} className="bg-agri-gray-100 p-2.5 rounded-full hover:bg-agri-gray-200 transition-all"><X className="h-5 w-5 text-agri-gray-700" /></button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-agri-gray-600 uppercase mb-2 block">{t.fullName}</label>
                <input type="text" className="w-full border-2 border-agri-gray-200 rounded-xl p-3.5 mt-1 bg-agri-gray-50 focus:ring-2 focus:ring-agri-green-500 focus:border-agri-green-500 outline-none transition-all font-medium"
                  value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-agri-gray-600 uppercase mb-2 block">{t.location}</label>
                <input type="text" className="w-full border-2 border-agri-gray-200 rounded-xl p-3.5 mt-1 bg-agri-gray-50 focus:ring-2 focus:ring-agri-green-500 focus:border-agri-green-500 outline-none transition-all font-medium"
                  value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>
              <button type="submit" className="w-full bg-agri-green-500 text-white py-4 rounded-xl font-bold shadow-green-lg hover:bg-agri-green-600 transition-all active:scale-95">{t.saveChanges}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
