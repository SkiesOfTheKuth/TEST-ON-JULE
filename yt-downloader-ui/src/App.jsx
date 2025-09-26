import YouTubeDownloaderUI from './YouTubeDownloader';
import { AppProvider } from './context/AppContext';
import './index.css';

function App() {
  return (
    <AppProvider>
      <YouTubeDownloaderUI />
    </AppProvider>
  );
}

export default App;