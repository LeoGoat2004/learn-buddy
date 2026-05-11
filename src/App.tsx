import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/common/Toast';
import { I18nProvider } from './i18n';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { AddKnowledge } from './pages/AddKnowledge';
import { Review } from './pages/Review';
import { Settings } from './pages/Settings';
import './styles/global.css';
import './styles/animations.css';

function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <AppProvider>
          <ToastProvider>
            <div className="app">
              <Header />
              <div className="app-layout">
                <Sidebar />
                <main className="app-main">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/add" element={<AddKnowledge />} />
                    <Route path="/review" element={<Review />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
              </div>
            </div>
          </ToastProvider>
        </AppProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}

export default App;
