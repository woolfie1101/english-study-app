import { useState } from "react";
import { HomeScreen } from "./components/HomeScreen";
import { CategoryScreen } from "./components/CategoryScreen";
import { SessionDetailScreen } from "./components/SessionDetailScreen";
import { CalendarScreen } from "./components/CalendarScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { BottomNavigation } from "./components/BottomNavigation";

type Screen = 'home' | 'categories' | 'category' | 'session-detail' | 'calendar' | 'settings';

interface NavigationData {
  category?: any;
  session?: any;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [navigationData, setNavigationData] = useState<NavigationData>({});
  const [navigationHistory, setNavigationHistory] = useState<Array<{ screen: Screen; data: NavigationData }>>([]);

  const handleNavigate = (screen: Screen, data?: any) => {
    // Add current screen to history for back navigation
    setNavigationHistory(prev => [...prev, { screen: currentScreen, data: navigationData }]);
    setCurrentScreen(screen);
    setNavigationData(data || {});
  };

  const handleBack = () => {
    if (navigationHistory.length > 0) {
      const previous = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setCurrentScreen(previous.screen);
      setNavigationData(previous.data);
    } else {
      // Default back behavior
      setCurrentScreen('home');
      setNavigationData({});
    }
  };

  const handleTabChange = (tab: string) => {
    // Clear navigation history when switching tabs
    setNavigationHistory([]);
    setNavigationData({});
    
    switch (tab) {
      case 'home':
        setCurrentScreen('home');
        break;
      case 'categories':
        setCurrentScreen('home'); // Categories are shown on home for now
        break;
      case 'calendar':
        setCurrentScreen('calendar');
        break;
      case 'settings':
        setCurrentScreen('settings');
        break;
      default:
        setCurrentScreen('home');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      
      case 'category':
        return (
          <CategoryScreen 
            category={navigationData.category}
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        );
      
      case 'session-detail':
        return (
          <SessionDetailScreen
            category={navigationData.category}
            session={navigationData.session}
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        );
      
      case 'calendar':
        return <CalendarScreen onNavigate={handleNavigate} />;
      
      case 'settings':
        return <SettingsScreen onNavigate={handleNavigate} />;
      
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  // Determine active tab for bottom navigation
  const getActiveTab = () => {
    switch (currentScreen) {
      case 'home':
      case 'category':
      case 'session-detail':
        return 'home';
      case 'calendar':
        return 'calendar';
      case 'settings':
        return 'settings';
      default:
        return 'home';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white max-w-md mx-auto border-x border-gray-200">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderScreen()}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={getActiveTab()}
        onTabChange={handleTabChange}
      />
    </div>
  );
}