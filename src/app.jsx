import React, { useState } from 'react';
import gamesData from './data/games.json';
import eventsData from './data/events.json';

const styles = {
  pageContainer: {
    backgroundColor: '#242424',
    minHeight: '100vh',
    width: '100%',
    color: '#eeeeee',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  wrapper: { 
    maxWidth: '1300px', 
    margin: '0 auto', 
    padding: '40px 20px',
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  monthTitle: { fontSize: '2.2rem', fontWeight: '800', textTransform: 'uppercase', flex: 1, textAlign: 'center' },
  navButton: { backgroundColor: '#3a3a3a', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  
  // New Layout: Sidebar + Grid
  mainContent: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start'
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#2d2d2d',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #444',
    position: 'sticky',
    top: '20px'
  },
  sidebarTitle: { fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '0.85rem' },
  colorDot: { width: '12px', height: '12px', borderRadius: '3px' },

  grid: { 
    flex: 1,
    display: 'grid', 
    gridTemplateColumns: 'repeat(7, 1fr)', 
    gap: '1px', 
    backgroundColor: '#444444', 
    border: '1px solid #444444', 
    borderRadius: '12px', 
    overflow: 'hidden',
  },
  dayHeader: { backgroundColor: '#2d2d2d', padding: '15px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' },
  cell: { backgroundColor: '#333333', minHeight: '120px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' },
  dateNumber: { fontSize: '0.85rem', fontWeight: 'bold', color: '#666', marginBottom: '6px' },
  
  // Clean throughline bars (No Text)
  eventBar: { 
    height: '8px', // Thinner, cleaner bars
    width: '100%',
    borderRadius: '0px', // Managed dynamically
    transition: 'opacity 0.2s'
  },

  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#2d2d2d', padding: '30px', borderRadius: '20px', width: '95%', maxWidth: '450px', border: '1px solid #444' }
};

function App() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const [filters] = useState(() => {
    const state = {};
    gamesData.forEach(g => {
      state[g.id] = { master: true, patch: true, banner: true, event: true, repeatable: true };
    });
    return state;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get all events visible in this month for the sidebar
  const visibleEvents = eventsData.filter(e => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    return start <= monthEnd && end >= monthStart;
  });

  const getEventsForDay = (day) => {
    if (!day) return [];
    const d = new Date(year, month, day);
    d.setHours(0,0,0,0);
    return eventsData.filter(e => {
      const gF = filters[e.gameId];
      if (!gF?.master || !gF[e.type]) return false;
      return d >= new Date(e.start).setHours(0,0,0,0) && d <= new Date(e.end).setHours(23,59,59,999);
    });
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.wrapper}>
        <header style={styles.navRow}>
          <button style={styles.navButton} onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>PREVIOUS</button>
          <h1 style={styles.monthTitle}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
          <button style={styles.navButton} onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>NEXT</button>
        </header>

        <div style={styles.mainContent}>
          {/* SIDEBAR LEGEND */}
          <aside style={styles.sidebar}>
            <div style={styles.sidebarTitle}>Active Patches</div>
            {visibleEvents.filter(e => e.type === 'patch').map(e => (
              <div key={e.id} style={styles.legendItem}>
                <div style={{...styles.colorDot, backgroundColor: gamesData.find(g => g.id === e.gameId)?.color}} />
                <div>
                  <div style={{fontWeight: 'bold'}}>{e.title}</div>
                  <div style={{fontSize: '0.7rem', color: '#888'}}>{gamesData.find(g => g.id === e.gameId)?.name}</div>
                </div>
              </div>
            ))}
          </aside>

          {/* CALENDAR GRID */}
          <div style={styles.grid}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={styles.dayHeader}>{d}</div>
            ))}
            
            {Array.from({ length: new Date(year, month, 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} style={{ ...styles.cell, backgroundColor: '#2a2a2a' }} />
            ))}

            {Array.from({ length: new Date(year, month + 1, 0).getDate() }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const cellDate = new Date(year, month, day);

              return (
                <div key={day} style={styles.cell} onClick={() => setSelectedDay(day)}>
                  <span style={styles.dateNumber}>{day}</span>
                  {dayEvents.map(e => {
                    const isStart = new Date(e.start).toDateString() === cellDate.toDateString();
                    const isEnd = new Date(e.end).toDateString() === cellDate.toDateString();
                    return (
                      <div key={e.id} style={{
                        ...styles.eventBar, 
                        backgroundColor: gamesData.find(g => g.id === e.gameId)?.color,
                        borderTopLeftRadius: isStart ? '4px' : '0px',
                        borderBottomLeftRadius: isStart ? '4px' : '0px',
                        borderTopRightRadius: isEnd ? '4px' : '0px',
                        borderBottomRightRadius: isEnd ? '4px' : '0px',
                      }} />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal logic remains for detail viewing */}
        {selectedDay && (
          <div style={styles.overlay} onClick={() => setSelectedDay(null)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: '20px' }}>{currentDate.toLocaleString('default', { month: 'long' })} {selectedDay}</h2>
              {getEventsForDay(selectedDay).map(e => (
                <div key={e.id} style={{ display: 'flex', gap: '15px', padding: '15px 0', borderBottom: '1px solid #444' }}>
                  <div style={{ width: '15px', height: '15px', borderRadius: '4px', backgroundColor: gamesData.find(g => g.id === e.gameId)?.color }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{e.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{e.type.toUpperCase()}</div>
                  </div>
                </div>
              ))}
              <button onClick={() => setSelectedDay(null)} style={{ width: '100%', padding: '15px', marginTop: '20px', borderRadius: '8px', border: 'none', backgroundColor: '#eee', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>CLOSE</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;