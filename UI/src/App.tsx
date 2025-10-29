import { useState, useEffect } from 'react';
import Header from './components/Header';
import VideoCard from './components/VideoCard';
import NarrationCard from './components/NarrationCard';
import Footer from './components/Footer';
import VideoEditor from './components/VideoEditor'; 
import './App.css';
import './components/Cards.css';
import { FaVideo } from "react-icons/fa6";

const getInitialTheme = (): 'light' | 'dark' => {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }
  return 'light';
};

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme());
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleGoBack = () => {
    setVideoFile(null);
  };

  return (
    <div className="app-container">
      <Header currentTheme={theme} onToggleTheme={toggleTheme} />

      <main className="content">
        {!videoFile ? (
          <>
            <div className='title'>
              <FaVideo /> <p>SubLegend</p>
            </div>
            <p className='subtitle'>Legendagem automática e narração de conteúdo com IA</p>

            <div className="features-container">
              <VideoCard onVideoSelect={setVideoFile} />
              <NarrationCard />
            </div>

            <Footer />
          </>
        ) : (
          <VideoEditor file={videoFile} onGoBack={handleGoBack} />
        )}
      </main>
    </div>
  );
}

export default App;