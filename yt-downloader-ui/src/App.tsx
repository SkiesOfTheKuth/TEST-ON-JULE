import React from 'react';
import YouTubeDownloaderUI from './YouTubeDownloader';
import { AppProvider } from './context/AppContext';
import './index.css';

const App: React.FC = () => {
  return (
    <AppProvider>
      <YouTubeDownloaderUI />
    </AppProvider>
  );
}

export default App;