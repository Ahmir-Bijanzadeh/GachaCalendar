import React, { useState } from 'react';
import gamesData from './data/games.json';
import eventsData from './data/events.json';

const styles = {
  wrapper: { maxWidth: '1000px', margin: '20px auto', fontFamily: 'sans-serif', padding: '10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#e5e7eb', border: '1px solid #e5e7eb' },
  dayHeader: { backgroundColor: '#f9fafb', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase' },
  cell: { backgroundColor: 'white', minHeight: '120px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' },
  dateNumber: { fontSize: '0.75rem', fontWeight: 'bold', color: '#9ca3af', marginBottom: '4px' },
  eventBar: { fontSize: '0.65rem', padding: '2px 4px', borderRadius: '3px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' },
  controls: { marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }
};

function App() {
  const [showDetails, setShowDetails] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); // Defaults to today

  // --- CALENDAR MATH ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // --- EVENT LOGIC ---
  const getGameColor = (gameId) => gamesData.find(g => g.id === gameId)?.color || '#999';

  const getEventsForDay = (day) => {
    const targetDate = new Date(year, month, day);
    return eventsData.filter(event => {
      const start = new Date(event.start);
      const end = new Date(event.end);
      // Normalize times to compare just the dates
      targetDate.setHours(0,0,0,0);
      const s = new Date(start).setHours(0,0,0,0);
      const e = new Date(end).setHours(23,59,59,999);
      
      const isVisible = showDetails ? true : event.type === 'patch';
      return isVisible && targetDate >= s && targetDate <= e;
    });
  };

  return (
    <div style={styles.wrapper}>
      <header style={styles.controls}>
        <h2 style={{margin: 0}}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => setCurrentDate(new Date(year, month - 1))}>Prev</button>
        <button onClick={() => setCurrentDate(new Date(year, month + 1))}>Next</button>
        <label style={{fontSize: '0.9rem'}}>
          <input type="checkbox" checked={showDetails} onChange={e => setShowDetails(e.target.checked)} /> Detailed View
        </label>
      </header>

      <div style={styles.grid}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} style={styles.dayHeader}>{d}</div>
        ))}

        {blanks.map(b => <div key={`b-${b}`} style={{...styles.cell, backgroundColor: '#f3f4f6'}} />)}

        {daysArray.map(day => (
          <div key={day} style={styles.cell}>
            <span style={styles.dateNumber}>{day}</span>
            {getEventsForDay(day).map(event => (
              <div 
                key={event.id} 
                title={event.title}
                style={{...styles.eventBar, backgroundColor: getGameColor(event.gameId)}}
              >
                {event.type === 'patch' ? `[V] ${event.title}` : event.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;