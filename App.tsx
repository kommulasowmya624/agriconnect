
import React, { useState, useEffect } from 'react';
import { UserRole, Language, User } from './types';
import Layout from './components/Layout';
import RoleSelection from './components/RoleSelection';
import FarmerDashboard from './components/FarmerDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import ProviderDashboard from './components/ProviderDashboard';

const App: React.FC = () => {
  // Initialize currentUser from localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('agri_current_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Error parsing saved user:', e);
        return null;
      }
    }
    return null;
  });

  // Initialize Language from LocalStorage or Default to EN
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('agri_language');
    // Validate if savedLang is a valid Language enum
    if (savedLang && Object.values(Language).includes(savedLang as Language)) {
      return savedLang as Language;
    }
    return Language.EN;
  });

  // Wrapper to save language preference
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('agri_language', lang);
  };

  const handleUserLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('agri_current_user', JSON.stringify(user));
  };

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('agri_current_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('agri_current_user');
  };

  const renderDashboard = () => {
    if (!currentUser) {
      return <RoleSelection language={language} onSelectRole={handleUserLogin} />;
    }

    switch (currentUser.role) {
      case UserRole.FARMER:
        return <FarmerDashboard language={language} currentUser={currentUser} />;
      case UserRole.WORKER:
        return <WorkerDashboard language={language} currentUser={currentUser} onUpdateAvailability={handleUserUpdate} />;
      case UserRole.PROVIDER:
        return <ProviderDashboard language={language} currentUser={currentUser} />;
      default:
        return <RoleSelection language={language} onSelectRole={handleUserLogin} />;
    }
  };

  return (
    <div className="relative min-h-screen font-sans text-gray-900">
      {/* Fixed Background Animation - Covers full screen always */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-white">
        {/* Soft Green Orb - Top Left */}
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-agri-green-100/50 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>

        {/* Primary Green Orb - Top Right */}
        <div className="absolute top-[10%] right-[-15%] w-[500px] h-[500px] bg-agri-green-200/40 rounded-full mix-blend-multiply filter blur-[90px] animate-blob animation-delay-2000"></div>

        {/* Accent Green Orb - Bottom */}
        <div className="absolute bottom-[-20%] left-[15%] w-[700px] h-[700px] bg-agri-green-100/30 rounded-full mix-blend-multiply filter blur-[110px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Main App Layout - z-index ensures it sits on top of background */}
      <div className="relative z-10">
        <Layout
          role={currentUser?.role || UserRole.NONE}
          language={language}
          onLanguageChange={handleLanguageChange}
          onLogout={handleLogout}
          currentUser={currentUser}
          onUserUpdate={handleUserUpdate}
        >
          {renderDashboard()}
        </Layout>
      </div>
    </div>
  );
};

export default App;
