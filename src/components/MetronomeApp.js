import React, { useState, useEffect, useRef, useCallback } from 'react';
// Import icons from lucide-react
import { Play, Pause, Plus, Minus, Volume2 } from 'lucide-react';

// CSS for the metronome
const styles = {
  container: {
    width: '100%',
    maxWidth: '700px',
    margin: '0 auto',
    padding: '16px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    color: 'white',
  },
  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    fontSize: '14px',
    marginRight: '8px',
  },
  counterContainer: {
    display: 'flex',
  },
  counterButton: {
    width: '32px',
    height: '32px',
    backgroundColor: '#333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    color: 'white',
  },
  counterButtonLeft: {
    borderTopLeftRadius: '4px',
    borderBottomLeftRadius: '4px',
  },
  counterButtonRight: {
    borderTopRightRadius: '4px',
    borderBottomRightRadius: '4px',
  },
  counterValue: {
    width: '32px',
    height: '32px',
    backgroundColor: '#222',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
  clearButton: {
    padding: '4px 12px',
    marginRight: '12px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  subdivisionSelect: {
    padding: '4px 8px',
    backgroundColor: '#333',
    border: '1px solid #444',
    borderRadius: '4px',
    color: 'white',
  },
  tempoControls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '24px',
  },
  tempoButton: {
    width: '40px',
    height: '40px',
    backgroundColor: '#333',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    color: 'white',
  },
  tempoSliderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '0 16px',
    width: '250px',
  },
  tempoSlider: {
    width: '100%',
    height: '8px',
    backgroundColor: '#333',
    borderRadius: '4px',
    appearance: 'none',
    cursor: 'pointer',
  },
  tempoValue: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '8px',
  },
  tempoInput: {
    width: '80px',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
  },
  tempoUnit: {
    fontSize: '14px',
    color: '#999',
    marginLeft: '8px',
  },
  playButton: {
    width: '64px',
    height: '64px',
    backgroundColor: '#16a34a',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    color: 'white',
    margin: '0 auto 24px',
  },
  grid: {
    width: '100%',
    backgroundColor: '#222',
    borderRadius: '8px',
    padding: '8px',
    marginBottom: '24px',
    minHeight: '150px',
  },
  gridContainer: {
    display: 'grid',
    gap: '8px',
  },
  cell: {
    aspectRatio: '1/1',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellEmpty: {
    backgroundColor: '#333',
    border: '1px solid #444',
  },
  cellNormal: {
    backgroundColor: '#1e40af',
  },
  cellAccent: {
    backgroundColor: '#b91c1c',
  },
  cellActiveBg: {
    backgroundColor: '#4b5563',
  },
  cellActiveNormal: {
    backgroundColor: '#3b82f6',
  },
  cellActiveAccent: {
    backgroundColor: '#ef4444',
  },
  cellNumber: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  cellIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '8px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
  },
  legendColor: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    marginRight: '4px',
  },
  legendText: {
    fontSize: '14px',
  },
  instructions: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#999',
  },
};

const MetronomeApp = () => {
  // Main state
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [gridWidth, setGridWidth] = useState(4);
  const [gridHeight, setGridHeight] = useState(2);
  const [subdivision, setSubdivision] = useState(1); // 1 = quarter notes, 2 = eighth, 3 = triplets, 4 = sixteenth
  
  // Initialize the grid (all cells as empty)
  const initialGrid = Array(gridWidth * gridHeight).fill('empty');
  const [gridCells, setGridCells] = useState(initialGrid);
  
  // Refs for tracking state between renders
  const currentBeatRef = useRef(0);
  const gridCellsRef = useRef(gridCells);
  const tempoRef = useRef(tempo);
  const subdivisionRef = useRef(subdivision);
  const isPlayingRef = useRef(isPlaying);
  const gridWidthRef = useRef(gridWidth);
  const gridHeightRef = useRef(gridHeight);
  
  // Audio context refs
  const audioContextRef = useRef(null);
  const schedulerTimerRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  
  // Constants for scheduler
  const scheduleAheadTime = 0.1; // How far ahead to schedule audio (seconds)
  const lookahead = 25; // How frequently to call scheduling function (milliseconds)
  
  // Update refs when state changes
  useEffect(() => {
    gridCellsRef.current = gridCells;
  }, [gridCells]);
  
  useEffect(() => {
    tempoRef.current = tempo;
  }, [tempo]);
  
  useEffect(() => {
    subdivisionRef.current = subdivision;
  }, [subdivision]);
  
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  
  useEffect(() => {
    gridWidthRef.current = gridWidth;
  }, [gridWidth]);
  
  useEffect(() => {
    gridHeightRef.current = gridHeight;
  }, [gridHeight]);
  
  // Update grid when dimensions change
  useEffect(() => {
    const totalCells = gridWidth * gridHeight;
    
    if (totalCells > gridCells.length) {
      // Grid got bigger, add new EMPTY cells
      setGridCells(prev => [...prev, ...Array(totalCells - prev.length).fill('empty')]);
    } else if (totalCells < gridCells.length) {
      // Grid got smaller, remove excess cells
      setGridCells(prev => prev.slice(0, totalCells));
    }
    
    // Reset current beat if it's out of bounds
    if (currentBeat >= totalCells) {
      setCurrentBeat(0);
      currentBeatRef.current = 0;
    }
  }, [gridWidth, gridHeight, gridCells.length, currentBeat]);
  
  // Initialize Audio Context on first user interaction
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };
  
  // Create oscillator for a beat sound
  const createOscillator = (time, type) => {
    if (!audioContextRef.current) return;
    
    // Only play sound if the cell is not empty
    if (type !== 'empty') {
      const osc = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      osc.type = 'sine';
      
      // Set pitch and volume based on beat type
      if (type === 'accent') {
        osc.frequency.value = 880; // Higher pitch for accented beats
        gainNode.gain.value = 1.0; // Louder for accented beats
      } else {
        osc.frequency.value = 440;
        gainNode.gain.value = 0.8;
      }
      
      osc.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      osc.start(time);
      osc.stop(time + 0.05);
      
      const initialGain = gainNode.gain.value;
      gainNode.gain.setValueAtTime(initialGain, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    }
  };
  
  // Schedule the next beat
  const scheduleNote = useCallback(() => {
    if (!audioContextRef.current) return;
    
    // Get current values from refs
    const cells = gridCellsRef.current;
    const currentTempo = tempoRef.current;
    const currentSubdivision = subdivisionRef.current;
    
    // Get current beat index
    let beatIndex = currentBeatRef.current;
    const totalCells = cells.length;
    
    // Validate beat index
    if (beatIndex >= totalCells) {
      beatIndex = 0;
      currentBeatRef.current = 0;
    }
    
    // Update UI
    setCurrentBeat(beatIndex);
    
    // Get current beat type
    const beatType = cells[beatIndex];
    
    // Schedule main beat
    createOscillator(nextNoteTimeRef.current, beatType);
    
    // Schedule subdivisions if this is not an empty beat
    if (currentSubdivision > 1 && beatType !== 'empty') {
      // Subdivisions are always normal (non-accented)
      for (let i = 1; i < currentSubdivision; i++) {
        const subTime = nextNoteTimeRef.current + (i * (60.0 / currentTempo / currentSubdivision));
        createOscillator(subTime, 'normal');
      }
    }
    
    // Calculate time for next beat
    const secondsPerBeat = 60.0 / currentTempo;
    nextNoteTimeRef.current += secondsPerBeat;
    
    // Move to the next beat, ALWAYS go to the next cell even if empty
    currentBeatRef.current = (beatIndex + 1) % totalCells;
  }, []);
  
  // Scheduler function
  const scheduler = useCallback(() => {
    if (!audioContextRef.current) return;
    
    // Schedule notes until we're ahead enough
    while (nextNoteTimeRef.current < audioContextRef.current.currentTime + scheduleAheadTime) {
      scheduleNote();
    }
    
    // Schedule next run if still playing
    if (isPlayingRef.current) {
      schedulerTimerRef.current = setTimeout(scheduler, lookahead);
    }
  }, [scheduleNote]);
  
  // Start the metronome
  const startMetronome = useCallback(() => {
    // Initialize audio context if needed
    initAudioContext();
    
    if (!audioContextRef.current) {
      return;
    }
    
    // Resume context if suspended
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    
    // Reset the beat counter
    currentBeatRef.current = 0;
    setCurrentBeat(0);
    
    // Set the start time
    nextNoteTimeRef.current = audioContextRef.current.currentTime;
    
    // Start scheduling
    isPlayingRef.current = true;
    setIsPlaying(true);
    scheduler();
  }, [scheduler]);
  
  // Stop the metronome
  const stopMetronome = useCallback(() => {
    // Clear the scheduler
    clearTimeout(schedulerTimerRef.current);
    
    // Update state
    isPlayingRef.current = false;
    setIsPlaying(false);
    
    // Reset beat counter
    currentBeatRef.current = 0;
    setCurrentBeat(0);
  }, []);
  
  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };
  
  // Toggle cell state
  const toggleCellState = (index) => {
    const currentState = gridCells[index];
    let newState;
    
    // Cycle through states: empty -> normal -> accent -> empty
    switch (currentState) {
      case 'empty':
        newState = 'normal';
        break;
      case 'normal':
        newState = 'accent';
        break;
      case 'accent':
      default:
        newState = 'empty';
        break;
    }
    
    const newGridCells = [...gridCells];
    newGridCells[index] = newState;
    setGridCells(newGridCells);
  };
  
  // Clear the grid (set all cells to empty)
  const clearGrid = () => {
    setGridCells(Array(gridWidth * gridHeight).fill('empty'));
  };
  
  // Get cell number (for display)
  const getCellNumber = (index) => {
    return index + 1;
  };
  
  // Add a row
  const addRow = () => {
    setGridHeight(prev => Math.min(prev + 1, 8));
  };
  
  // Remove a row
  const removeRow = () => {
    setGridHeight(prev => Math.max(prev - 1, 1));
  };
  
  // Add a column
  const addColumn = () => {
    setGridWidth(prev => Math.min(prev + 1, 12));
  };
  
  // Remove a column
  const removeColumn = () => {
    setGridWidth(prev => Math.max(prev - 1, 1));
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(schedulerTimerRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(err => console.error(err));
      }
    };
  }, []);
  
  // Get styles for cell based on state and whether it's playing
  const getCellStyle = (index, state) => {
    const baseStyle = { ...styles.cell };
    
    if (index === currentBeat) {
      // Currently playing - brighter version
      switch (state) {
        case 'accent':
          return { ...baseStyle, ...styles.cellActiveAccent };
        case 'normal':
          return { ...baseStyle, ...styles.cellActiveNormal };
        case 'empty':
        default:
          return { ...baseStyle, ...styles.cellActiveBg };
      }
    } else {
      // Not playing - darker version
      switch (state) {
        case 'accent':
          return { ...baseStyle, ...styles.cellAccent };
        case 'normal':
          return { ...baseStyle, ...styles.cellNormal };
        case 'empty':
        default:
          return { ...baseStyle, ...styles.cellEmpty };
      }
    }
  };
  
  // Get icon for cell based on state
  const getCellIcon = (state) => {
    switch (state) {
      case 'accent':
        return 'A';
      case 'normal':
        return <Volume2 size={14} />;
      case 'empty':
      default:
        return '';
    }
  };
  
  return (
    <div style={styles.container}>
      {/* Grid Controls */}
      <div style={styles.controlsRow}>
        <div style={styles.controlGroup}>
          <div style={styles.label}>Columns:</div>
          <div style={styles.counterContainer}>
            <button 
              onClick={removeColumn}
              style={{...styles.counterButton, ...styles.counterButtonLeft}}
              disabled={gridWidth <= 1}
            >
              <Minus size={14} />
            </button>
            <div style={styles.counterValue}>
              {gridWidth}
            </div>
            <button 
              onClick={addColumn}
              style={{...styles.counterButton, ...styles.counterButtonRight}}
              disabled={gridWidth >= 16}
            >
              <Plus size={14} />
            </button>
          </div>
          
          <div style={{...styles.label, marginLeft: '16px'}}>Rows:</div>
          <div style={styles.counterContainer}>
            <button 
              onClick={removeRow}
              style={{...styles.counterButton, ...styles.counterButtonLeft}}
              disabled={gridHeight <= 1}
            >
              <Minus size={14} />
            </button>
            <div style={styles.counterValue}>
              {gridHeight}
            </div>
            <button 
              onClick={addRow}
              style={{...styles.counterButton, ...styles.counterButtonRight}}
              disabled={gridHeight >= 8}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        
        <div style={styles.controlGroup}>
          <button
            onClick={clearGrid}
            style={styles.clearButton}
          >
            Clear Grid
          </button>
          <select
            value={subdivision}
            onChange={(e) => setSubdivision(parseInt(e.target.value))}
            style={styles.subdivisionSelect}
          >
            <option value="1">Quarter</option>
            <option value="2">Eighth</option>
            <option value="3">Triplet</option>
            <option value="4">16th</option>
          </select>
        </div>
      </div>
      
      {/* Tempo Controls */}
      <div style={styles.tempoControls}>
        <button 
          onClick={() => setTempo(Math.max(40, tempo - 1))}
          style={styles.tempoButton}
        >
          <Minus size={20} />
        </button>
        
        <div style={styles.tempoSliderContainer}>
          <input
            type="range"
            min="40"
            max="280"
            value={tempo}
            onChange={(e) => setTempo(parseInt(e.target.value))}
            style={styles.tempoSlider}
          />
          
          <div style={styles.tempoValue}>
            <input
              type="number"
              value={tempo}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 40 && value <= 280) {
                  setTempo(value);
                }
              }}
              style={styles.tempoInput}
              min="40"
              max="280"
            />
            <div style={styles.tempoUnit}>BPM</div>
          </div>
        </div>
        
        <button 
          onClick={() => setTempo(Math.min(280, tempo + 1))}
          style={styles.tempoButton}
        >
          <Plus size={20} />
        </button>
      </div>
      
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        style={styles.playButton}
      >
        {isPlaying ? <Pause size={32} /> : <Play size={32} />}
      </button>
      
      {/* Beat Grid */}
      <div style={styles.grid}>
        <div 
          style={{
            ...styles.gridContainer,
            gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
          }}
        >
          {/* Generate the grid cells */}
          {gridCells.map((cellState, index) => (
            <div 
              key={index}
              onClick={() => toggleCellState(index)}
              style={getCellStyle(index, cellState)}
            >
              {/* Beat number */}
              <div style={styles.cellNumber}>{getCellNumber(index)}</div>
              
              {/* Beat type indicator */}
              <div style={styles.cellIcon}>
                {getCellIcon(cellState)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{...styles.legendColor, ...styles.cellEmpty}}></div>
          <span style={styles.legendText}>Empty</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{...styles.legendColor, ...styles.cellNormal}}></div>
          <span style={styles.legendText}>Normal</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{...styles.legendColor, ...styles.cellAccent}}></div>
          <span style={styles.legendText}>Accent</span>
        </div>
      </div>
      
      {/* Instructions */}
      <div style={styles.instructions}>
        Click a cell to cycle through states: Empty → Normal → Accent → Empty
      </div>
    </div>
  );
};

export default MetronomeApp;