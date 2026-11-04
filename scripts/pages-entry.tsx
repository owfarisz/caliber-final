import React from 'react';
import {createRoot} from 'react-dom/client';
import Workspace from '../components/Workspace';
import '../app/globals.css';
createRoot(document.getElementById('root')!).render(<Workspace/>);
