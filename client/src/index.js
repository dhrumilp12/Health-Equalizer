import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { GlobalStateProvider } from './context/globalState';

const initialState = {}; // Define your initial state here
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      };
    case 'UPDATE_SCORE':
      return {
        ...state,
        score: action.payload
      };
    default:
      return state;
  }
};


ReactDOM.render(
  <React.StrictMode>
    <GlobalStateProvider initialState={initialState} reducer={reducer}>
      <App />
    </GlobalStateProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
