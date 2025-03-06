import React from 'react';
import './App.css';
import MetronomeApp from './components/MetronomeApp';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>React Metronome</h1>
      </header>
      <main>
        <MetronomeApp />
      </main>
    </div>
  );
}

export default App;