import React from 'react';
import {createRoot} from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import ScenarioEntry from '../components/staging/ScenarioEntry';
const base=process.env.NEXT_PUBLIC_STATIC_BASE || '';
createRoot(document.getElementById('root')!).render(<ScenarioEntry base={base}/>);
