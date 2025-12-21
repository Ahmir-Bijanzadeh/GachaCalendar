import React, { useState } from 'react';
import gamesData from './data/games.json';
import eventsData from './data/events.json';

const styles = {
  wrapper: { maxWidth: '1000px', margin: '20px auto', fontFamily: 'sans-serif', padding: '10px' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', alignItems: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#e5e7eb', border: '1px solid #e5e7eb' },
  dayHeader: { backgroundColor: '#f9fafb', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase' },
  cell: { backgroundColor: 'white', minHeight: '120px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px', cursor: 'pointer' },
  dateNumber: { fontSize: '0.75rem', fontWeight: 'bold', color: '#9ca3af' },
  eventBar: { fontSize: '0.65rem', padding: '2px 4px', borderRadius: '3px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  
  // Filter Menu
  filterMenu: {
    position: 'absolute', backgroundColor: 'white', border: '1px solid #ccc',
    padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 100, top: '50px', right: '0', minWidth: '280px', maxHeight: '70vh', overflowY: 'auto'
  },
  gameSection: { marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee' },
  filterRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' },
  subOption: { marginLeft: '22px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', cursor: 'pointer' },
  
  // Modal
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px' },
  modalItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }
};

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilter, setShowFilter] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  // 1. PERSISTENT FILTER STATE
  const [filters, setFilters] = useState(() => {
    const initialState = {};
    gamesData.forEach(game => {
      initialState[game.id] = { master: true, patch: true, banner: true, event: true, repeatable: true };
    });
    return initialState;
  });

  const toggleFilter = (gameId, key) => {
    setFilters(prev => ({
      ...prev,
      [gameId]: { ...prev[gameId], [key]: !prev[gameId][key] }
    }));
  };

  // 2. DATA CALCULATION
  const getEventsForDay = (day) => {
    if (!day) return [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const targetDate = new Date(year, month, day);
    targetDate.setHours(0,0,0,0);

    const staticEvents = eventsData.filter(e => {
      const gFilter = filters[e.gameId];
      if (!gFilter?.master || !gFilter[e.type]) return false;
      const s = new Date(e.start).setHours(0,0,0,0);
      const end = new Date(e.end).setHours(23,59,59,999);
      return targetDate >= s && targetDate <= end;
    });

    const repeatableEvents = [];
    if (day === 16 && filters['genshin']?.master && filters['genshin']?.repeatable) {
      repeatableEvents.push({ id: `abyss-${year}-${month}`, gameId: 'genshin', title: 'Spiral Abyss Reset', type: 'repeatable' });
    }

    return [...staticEvents, ...repeatableEvents];
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <div>
          <button onClick={() => setCurrentDate(new Date(year, month - 1))}>Prev</button>
          <span style={{ margin: '0 15px', fontWeight: 'bold' }}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))}>Next</button>
        </div>

        <button onClick={() => setShowFilter(!showFilter)}>⚙️ Filter Settings</button>

        {showFilter && (
          <div style={styles.filterMenu}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
              <h4 style={{margin: 0}}>Timeline Filters</h4>
              <button onClick={() => setShowFilter(false)}>✕</button>
            </div>
            {gamesData.map(game => (
              <div key={game.id} style={styles.gameSection}>
                <div style={styles.filterRow}>
                  <strong style={{color: game.color}}>{game.name}</strong>
                  <input type="checkbox" checked={filters[game.id].master} onChange={() => toggleFilter(game.id, 'master')} />
                </div>
                {filters[game.id].master && (
                  <div>
                    {['patch', 'banner', 'event', 'repeatable'].map(type => (
                      <label key={type} style={styles.subOption}>
                        <input type="checkbox" checked={filters[game.id][type]} onChange={() => toggleFilter(game.id, type)} />
                        {type.charAt(0).toUpperCase() + type.slice(1)}s
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* GRID */}
      <div style={styles.grid}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} style={styles.dayHeader}>{d}</div>)}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`b-${i}`} style={{...styles.cell, backgroundColor: '#f3f4f6', cursor: 'default'}} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayEvents = getEventsForDay(day);
          return (
            <div key={day} style={styles.cell} onClick={() => setSelectedDay(day)}>
              <span style={styles.dateNumber}>{day}</span>
              {dayEvents.map(e => (
                <div key={e.id} style={{...styles.eventBar, backgroundColor: gamesData.find(g => g.id === e.gameId)?.color}}>
                  {e.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {selectedDay && (
        <div style={styles.overlay} onClick={() => setSelectedDay(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>{currentDate.toLocaleString('default', { month: 'long' })} {selectedDay}</h3>
            {getEventsForDay(selectedDay).map(e => (
              <div key={e.id} style={styles.modalItem}>
                <div style={{width: 10, height: 10, borderRadius: '50%', backgroundColor: gamesData.find(g => g.id === e.gameId)?.color}} />
                <div>
                  <div style={{fontWeight: 'bold', fontSize: '0.9rem'}}>{e.title}</div>
                  <div style={{fontSize: '0.75rem', color: '#666'}}>{e.type}</div>
                </div>
              </div>
            ))}
            <button style={{width: '100%', marginTop: '20px'}} onClick={() => setSelectedDay(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;