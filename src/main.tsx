import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { StudyProvider } from './context/StudyContext';
import { initGA } from './lib/analytics';
import './index.css';

initGA();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StudyProvider>
      <App />
    </StudyProvider>
  </StrictMode>,
);
