import { useState, useEffect } from "react";
import Header from "./components/Header";
import VideoCard from "./components/VideoCard";
import NarrationCard from "./components/NarrationCard";
import Footer from "./components/Footer";
import VideoEditor from "./components/VideoEditor";
import "./App.css";
import "./components/Cards.css";
import { FaVideo } from "react-icons/fa6";

import { Narracao } from "./features/narracao/Narracao";

type View = "main" | "videoEditor" | "narration";

const getInitialTheme = (): "light" | "dark" => {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }
  return "light";
};

function App() {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme());
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [currentView, setCurrentView] = useState<View>("main");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleVideoSelect = (file: File) => {
    setVideoFile(file);
    setCurrentView("videoEditor");
  };

  const handleNarrationSelect = () => {
    setCurrentView("narration");
  };

  const handleGoBack = () => {
    setVideoFile(null);
    setCurrentView("main");
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "videoEditor":
        return <VideoEditor file={videoFile!} onGoBack={handleGoBack} />;

      case "narration":
        return <Narracao onGoBack={handleGoBack} />;

      case "main":
      default:
        return (
          <>
            <div className="title">
              <FaVideo /> <p>SubLegend</p>
            </div>
            <p className="subtitle">
              Legendagem automática e narração de conteúdo com IA
            </p>

            <div className="features-container">
              <VideoCard onVideoSelect={handleVideoSelect} />

              <NarrationCard onSelect={handleNarrationSelect} />
            </div>

            <Footer />
          </>
        );
    }
  };

  return (
    <div className="app-container">
      <Header currentTheme={theme} onToggleTheme={toggleTheme} />
      <main className="content">{renderCurrentView()}</main>
    </div>
  );
}

export default App;
