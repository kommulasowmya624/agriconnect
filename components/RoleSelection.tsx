
import React, { useState, useEffect } from 'react';
import { UserRole, Language, User } from '../types';
import { TRANSLATIONS } from '../constants';
import { storageService } from '../services/storageService';
import { otpService } from '../services/otpService';
import { Sprout, HardHat, Tractor, MapPin, Loader2, ArrowRight, X, ChevronRight, Check } from 'lucide-react';

interface RoleSelectionProps {
  language: Language;
  onSelectRole: (user: User) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ language, onSelectRole }) => {
  const t = TRANSLATIONS[language];
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  // 'login' or 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loginStep, setLoginStep] = useState<'details' | 'otp'>('details');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    name: string,
    phone: string,
    location: string,
    otp: string,
    coords: { lat: number, lng: number } | null
  }>({
    name: '',
    phone: '',
    location: '',
    otp: '',
    coords: null
  });

  // Initialize reCAPTCHA on mount
  useEffect(() => {
    try {
      otpService.initializeRecaptcha();
    } catch (error) {
      console.error('reCAPTCHA initialization error:', error);
    }
  }, []);

  const handleRoleClick = (role: UserRole) => {
    setSelectedRole(role);
    setLoginStep('details');
    setAuthMode('login'); // Default to login
    setFormData({ name: '', phone: '', location: '', otp: '', coords: null });
    setShowLogin(true);
  };

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Store Coords
          const coords = { lat: latitude, lng: longitude };

          try {
            // Real reverse geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            let locName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

            if (data && data.address) {
              locName = data.address.village || data.address.town || data.address.city || data.address.suburb || locName;
            }

            setFormData(prev => ({
              ...prev,
              location: locName,
              coords: coords
            }));
          } catch (e) {
            setFormData(prev => ({
              ...prev,
              location: `Lat: ${latitude.toFixed(2)}, Long: ${longitude.toFixed(2)}`,
              coords: coords
            }));
          }
          setLoading(false);
        },
        (error) => {
          alert('Unable to retrieve location. Please type manually.');
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const geocodeManualLocation = async (loc: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (e) {
      console.error("Geocoding failed", e);
    }
    return null;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || formData.phone.length !== 10) {
      alert(t.enterValidPhone);
      return;
    }

    if (authMode === 'signup' && (!formData.name || !formData.location)) {
      alert("Please fill all fields for signup");
      return;
    }

    setLoading(true);

    // If signing up with manual location and no coords yet, try to geocode
    if (authMode === 'signup' && formData.location && !formData.coords) {
      const coords = await geocodeManualLocation(formData.location);
      if (coords) {
        setFormData(prev => ({ ...prev, coords }));
      }
    }

    try {
      // Check if user exists (for login)
      if (authMode === 'login') {
        const existingUser = await storageService.getUserByPhone(formData.phone);
        if (!existingUser) {
          alert('Phone number not registered. Please sign up first.');
          setLoading(false);
          return;
        }
      }

      // DEMO MODE: Simulate OTP send (no real SMS)
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

      console.log(`📱 Demo OTP sent to ${formData.phone}`);
      console.log('💡 Use any 6-digit code (e.g., 123456)');

      setOtpSent(true);
      setLoginStep('otp');
      alert('✅ OTP sent! For demo, enter any 6-digit code (e.g., 123456)');
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    console.log('🚀 VERIFY BUTTON CLICKED!');
    // alert('Function is running!'); // Removed annoying alert
    if (!formData.otp || formData.otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // DEMO MODE: Accept any 6-digit code
      console.log('✅ Demo OTP verified:', formData.otp);

      // Get or create user
      let user: User;

      if (authMode === 'login') {
        // LOGIN: Get existing user
        const existingUser = await storageService.getUserByPhone(formData.phone);
        if (existingUser) {
          user = existingUser;
        } else {
          alert('User not found. Please sign up first.');
          setLoading(false);
          return;
        }
      } else {
        // SIGNUP: Create new user
        if (!selectedRole) {
          alert('Please select a role');
          setLoading(false);
          return;
        }

        const finalCoords = formData.coords || { lat: 20.5937, lng: 78.9629 };

        const newUser: User = {
          id: crypto.randomUUID(),
          name: formData.name || 'Agri User',
          phone: formData.phone,
          role: selectedRole,
          location: formData.location || 'Unknown',
          lat: finalCoords.lat,
          lng: finalCoords.lng
        };

        user = await storageService.saveUser(newUser);
      }

      // Success! Log user in
      onSelectRole(user);
      setShowLogin(false);
      setLoading(false);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Failed to verify OTP. Please try again.');
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'signup' : 'login');
    setLoginStep('details');
  };

  const RoleCard = ({ role, icon: Icon, title, desc, color }: { role: UserRole, icon: any, title: string, desc: string, color: string }) => (
    <button
      onClick={() => handleRoleClick(role)}
      className="group w-full bg-white p-6 rounded-2xl shadow-soft border-2 border-agri-gray-100 flex items-center space-x-5 hover:border-agri-green-500 hover:shadow-green transition-all duration-300 active:scale-[0.98]"
    >
      <div className={`p-4 rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
        <Icon className={`h-9 w-9 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className="flex-1 text-left">
        <h2 className="text-xl font-bold text-agri-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-agri-gray-500 font-medium leading-snug">{desc}</p>
      </div>
      <ChevronRight className="h-6 w-6 text-agri-gray-300 group-hover:text-agri-green-500 transition-colors duration-300" />
    </button>
  );

  return (
    <div className="px-6 py-12 max-w-lg mx-auto animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-agri-green-500 rounded-2xl mb-4 shadow-green">
          <Sprout className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-5xl font-extrabold text-agri-gray-900 mb-3 tracking-tight">
          AgriConnect
        </h1>
        <p className="text-agri-gray-600 font-semibold text-lg">{t.selectRole}</p>
      </div>

      <div className="space-y-5">
        <RoleCard
          role={UserRole.FARMER}
          icon={Sprout}
          title={t.farmer}
          desc={t.farmerDesc}
          color="bg-agri-green-500"
        />
        <RoleCard
          role={UserRole.WORKER}
          icon={HardHat}
          title={t.worker}
          desc={t.workerDesc}
          color="bg-agri-green-600"
        />
        <RoleCard
          role={UserRole.PROVIDER}
          icon={Tractor}
          title={t.provider}
          desc={t.providerDesc}
          color="bg-agri-green-700"
        />
      </div>

      {/* Login/Signup Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-agri-gray-100 flex justify-between items-center bg-gradient-to-r from-agri-green-50 to-white">
              <div>
                <h3 className="font-bold text-2xl text-agri-gray-900">
                  {authMode === 'login' ? t.welcomeBack : t.createAccount}
                </h3>
                <p className="text-sm text-agri-gray-600 font-medium mt-1">
                  {authMode === 'login' ? t.loginContinue : t.registeringAs}
                  <span className="text-agri-green-600 font-bold uppercase">{selectedRole}</span>
                </p>
              </div>
              <button onClick={() => setShowLogin(false)} className="p-2.5 bg-white rounded-full hover:bg-agri-gray-100 transition-all shadow-sm">
                <X className="h-5 w-5 text-agri-gray-600" />
              </button>
            </div>

            <div className="p-6 bg-white">
              {loginStep === 'details' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {authMode === 'signup' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-xs font-bold text-agri-gray-600 uppercase mb-2">{t.fullName}</label>
                      <input
                        required
                        type="text"
                        className="w-full bg-agri-gray-50 border-2 border-agri-gray-200 rounded-xl p-3.5 focus:ring-2 focus:ring-agri-green-500 focus:border-agri-green-500 outline-none font-medium transition-all"
                        placeholder={t.fullName}
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-agri-gray-600 uppercase mb-2">{t.phoneNum}</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-xl border-2 border-r-0 border-agri-gray-200 bg-agri-gray-100 text-agri-gray-700 font-bold text-sm">
                        +91
                      </span>
                      <input
                        required
                        type="tel"
                        maxLength={10}
                        className="flex-1 w-full bg-agri-gray-50 border-2 border-agri-gray-200 rounded-r-xl p-3.5 focus:ring-2 focus:ring-agri-green-500 focus:border-agri-green-500 outline-none font-medium transition-all"
                        placeholder={t.phoneNum}
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>

                  {authMode === 'signup' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 delay-100">
                      <label className="block text-xs font-bold text-agri-gray-600 uppercase mb-2">{t.location}</label>
                      <div className="relative">
                        <input
                          required
                          type="text"
                          className="w-full bg-agri-gray-50 border-2 border-agri-gray-200 rounded-xl p-3.5 pr-12 focus:ring-2 focus:ring-agri-green-500 focus:border-agri-green-500 outline-none font-medium transition-all"
                          placeholder={t.cityVillage}
                          value={formData.location}
                          onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          className="absolute right-2 top-2.5 p-2 text-agri-green-600 hover:bg-agri-green-50 rounded-lg flex items-center justify-center transition-all"
                          title={t.location}
                        >
                          {formData.coords ? <Check className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-agri-green-500 text-white py-4 rounded-xl font-bold shadow-green-lg hover:bg-agri-green-600 hover:shadow-green transition-all flex justify-center items-center mt-6 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <> {t.getOtp} <ArrowRight className="ml-2 h-5 w-5" /></>}
                  </button>

                  <div className="pt-4 text-center">
                    <button
                      type="button"
                      onClick={toggleAuthMode}
                      className="text-sm font-semibold text-agri-gray-600 hover:text-agri-green-600 transition-colors flex items-center justify-center w-full"
                    >
                      {authMode === 'login' ? (
                        <>{t.newUser} <span className="text-agri-green-600 ml-1">{t.signUpHere}</span></>
                      ) : (
                        <>{t.alreadyAccount} <span className="text-agri-green-600 ml-1">{t.login}</span></>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
                  <div>
                    <p className="text-sm text-gray-500 mb-6">
                      Code sent to <span className="font-bold text-gray-900">+91 {formData.phone}</span>
                    </p>

                    <div className="relative mb-2">
                      <div className="flex justify-center space-x-2">
                        {[0, 1, 2, 3, 4, 5].map((_, i) => (
                          <div key={i} className="w-12 h-14 border-2 border-gray-200 rounded-xl flex items-center justify-center text-2xl font-bold text-gray-800 bg-gray-50 focus-within:border-agri-green focus-within:ring-2 focus-within:ring-green-100 transition-all">
                            {formData.otp[i] || ""}
                          </div>
                        ))}
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        autoFocus
                        className="opacity-0 absolute inset-0 h-full w-full cursor-pointer z-10"
                        value={formData.otp}
                        onChange={e => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-agri-green-500 text-white py-4 rounded-xl font-bold shadow-green-lg hover:bg-agri-green-600 hover:shadow-green transition-all flex justify-center items-center active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t.verifyContinue}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginStep('details')}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600"
                  >
                    {t.changePhone}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelection;
