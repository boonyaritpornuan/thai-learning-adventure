
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import Header from './components/Header';

// Import specific lesson pages with new naming convention
import Lesson1Page from './pages/lessons/Lesson1Page'; // Was Consonants1Page
import Lesson2Page from './pages/lessons/Lesson2Page'; // Was Vowels1Page
import Lesson3Page from './pages/lessons/Lesson3Page'; // Was Combinations1Page
import Lesson4Page from './pages/lessons/Lesson4Page'; // Was Vocabulary1Page


const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-sky-50">
        <Header />
        <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Route paths remain the same to match lesson IDs from LESSONS_CONFIG */}
            <Route path="/lesson/consonants1" element={<Lesson1Page />} />
            <Route path="/lesson/vowels1" element={<Lesson2Page />} />
            <Route path="/lesson/combinations1" element={<Lesson3Page />} />
            <Route path="/lesson/vocabulary1" element={<Lesson4Page />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
        <footer className="bg-sky-700 text-white text-center p-4 shadow-md mt-auto">
          <p>&copy; 2024 Thai Learning Adventure. Happy Learning! 🐘✨</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;