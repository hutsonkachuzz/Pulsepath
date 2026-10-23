import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ViewModeProvider } from './context/ViewModeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CoupleProvider } from './context/CoupleContext';
import { SecurityProvider } from './context/SecurityContext';
import { StreakProvider } from './context/StreakContext';

import { AppLayout } from './components/layout/AppLayout';
import { AuthMobileLayout } from './components/layout/AuthMobileLayout';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';
import { MemoriesPage } from './pages/MemoriesPage';
import { ChatPage } from './pages/ChatPage';
import { LoveThoughtsPage } from './pages/LoveThoughtsPage';
import { LoveLettersPage } from './pages/LoveLettersPage';
import { GalleryPage } from './pages/GalleryPage';
import { DatesPage } from './pages/DatesPage';
import { QuestionPage } from './pages/QuestionPage';
import { SettingsPage } from './pages/SettingsPage';
import { SnapsPage } from './pages/SnapsPage';

import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingScreen } from './components/common/LoadingScreen';

// Protected Route Guard with Heartbeat Logo Loading & Mobile Security Prompt
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const isExplicitlyLoggedIn = sessionStorage.getItem('pulsepath_logged_in') === 'true';

  if (loading) {
    return <LoadingScreen message="Connecting two hearts..." fullScreen={true} />;
  }

  // Strictly protected: prompt with security login first before gaining access to main dashboard or chats
  if (!currentUser || !isExplicitlyLoggedIn) {
    const redirectTarget = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
    return (
      <Navigate
        to={`/welcome?redirect=${redirectTarget}`}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ViewModeProvider>
          <AuthProvider>
            <CoupleProvider>
              <SecurityProvider>
                <StreakProvider>
                  <BrowserRouter>
                  <Routes>
                    {/* Public Authentication & Onboarding Routes in Mobile Shell */}
                    <Route element={<AuthMobileLayout />}>
                      <Route path="/" element={<WelcomePage />} />
                      <Route path="/welcome" element={<WelcomePage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="/onboarding" element={<OnboardingPage />} />
                    </Route>

                    {/* Strictly Protected Private Couple Routes Wrapped in AppLayout */}
                    <Route
                      element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/home" element={<HomePage />} />
                      <Route path="/dashboard" element={<Navigate to="/home" replace />} />
                      <Route path="/memories" element={<MemoriesPage />} />
                      <Route path="/chat" element={<ChatPage />} />
                      <Route path="/thoughts" element={<LoveThoughtsPage />} />
                      <Route path="/letters" element={<LoveLettersPage />} />
                      <Route path="/gallery" element={<GalleryPage />} />
                      <Route path="/dates" element={<DatesPage />} />
                      <Route path="/question" element={<QuestionPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/snaps" element={<SnapsPage />} />
                    </Route>

                    {/* Catch all redirect to root landing */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </BrowserRouter>
              </StreakProvider>
            </SecurityProvider>
          </CoupleProvider>
        </AuthProvider>
      </ViewModeProvider>
    </ThemeProvider>
  </ErrorBoundary>
  );
}
