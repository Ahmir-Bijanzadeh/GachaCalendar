import React, { useState } from 'react';
import gamesData from './data/games.json';
import eventsData from './data/events.json';

const styles = {
  pageContainer: { backgroundColor: '#242424', minHeight: '100vh', width: '100%', color: '#eeeeee', fontFamily: 'Inter, sans-serif' },
  wrapper: { maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' },
  navRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  monthTitle: { fontSize: '2rem', fontWeight: '800', textTransform: 'uppercase', flex: 1, textAlign: 'center' },
  navButton: { backgroundColor: '#3a3a3a', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  mainContent: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
  
  sidebar: { width: '320px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'sticky', top: '20px', maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' },
  sidebarTitle: { fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1.5px', fontWeight: 'bold' },
  eventCard: { backgroundColor: '#2d2d2d', borderRadius: '10px', padding: '16px', border: '1px solid #444', cursor: 'pointer', transition: 'all 0.2s' },
  
  grid: { flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#444444', border: '1px solid #444444', borderRadius: '12px', overflow: 'hidden' },
  dayHeader: { backgroundColor: '#2d2d2d', padding: '15px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' },
  cell: { backgroundColor: '#333333', minHeight: '120px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer', position: 'relative' },
  dateNumber: { fontSize: '0.85rem', fontWeight: 'bold', color: '#555', marginBottom: '6px' },
  
  // Today's highlight style
  todayBadge: { position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ff4d4d', color: 'white', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '900' },
  todayCell: { backgroundColor: '#3a3a3a', border: '1px solid #555' },

  eventBar: { height: '6px', width: '100%', transition: 'all 0.2s', borderRadius: '2px' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#2d2d2d', padding: '30px', borderRadius: '20px', width: '95%', maxWidth: '450px', border: '1px solid #444' }
};

function App() {
  // 1. Initialize with current system date
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [hoveredEventId, setHoveredEventId] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const sidebarEvents = eventsData.filter(e => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    const mStart = new Date(year, month, 1);
    const mEnd = new Date(year, month + 1, 0);
    return start <= mEnd && end >= mStart;
  }).sort((a, b) => new Date(a.start) - new Date(b.start));

  const getEventsForDay = (day) => {
    if (!day) return [];
    const d = new Date(year, month, day);
    d.setHours(0,0,0,0);
    return eventsData.filter(e => {
      const start = new Date(e.start).setHours(0,0,0,0);
      const end = new Date(e.end).setHours(23,59,59,999);
      return d >= start && d <= end;
    });
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.wrapper}>
        <header style={styles.navRow}>
          <button style={styles.navButton} onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>PREVIOUS</button>
          
          <div style={{textAlign: 'center'}}>
            <h1 style={styles.monthTitle}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
            {/* Quick reset to today button */}
            <button 
              onClick={() => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))}
              style={{background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline'}}
            >
              Jump to Today
            </button>
          </div>

          <button style={styles.navButton} onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>NEXT</button>
        </header>

        <div style={styles.mainContent}>
          <aside style={styles.sidebar}>
            <div style={styles.sidebarTitle}>Current Timeline</div>
            {sidebarEvents.map(e => (
              <div 
                key={e.id} 
                style={{
                  ...styles.eventCard,
                  borderColor: hoveredEventId === e.id ? '#666' : '#444',
                  transform: hoveredEventId === e.id ? 'translateX(4px)' : 'none'
                }}
                onMouseEnter={() => setHoveredEventId(e.id)}
                onMouseLeave={() => setHoveredEventId(null)}
                onClick={() => setSelectedEvent(e)}
              >
                <div style={{fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: gamesData.find(g => g.id === e.gameId)?.color, color: '#000', width: 'fit-content', fontWeight: 'bold'}}>
                  {gamesData.find(g => g.id === e.gameId)?.name}
                </div>
                <div style={{fontWeight: 'bold', marginTop: '4px'}}>{e.title}</div>
              </div>
            ))}
          </aside>

          <div style={styles.grid}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} style={styles.dayHeader}>{d}</div>)}
            {Array.from({ length: new Date(year, month, 1).getDay() }).map((_, i) => <div key={`e-${i}`} style={{...styles.cell, backgroundColor: '#2a2a2a'}} />)}
            
            {Array.from({ length: new Date(year, month + 1, 0).getDate() }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              
              // Check if this cell is today's date
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

              return (
                <div 
                  key={day} 
                  style={{...styles.cell, ...(isToday ? styles.todayCell : {})}} 
                  onClick={() => setSelectedDay(day)}
                >
                  <span style={{...styles.dateNumber, color: isToday ? '#fff' : '#555'}}>{day}</span>
                  {isToday && <span style={styles.todayBadge}>TODAY</span>}
                  
                  {dayEvents.map(e => (
                    <div key={e.id} style={{
                      ...styles.eventBar, 
                      backgroundColor: gamesData.find(g => g.id === e.gameId)?.color,
                      opacity: (hoveredEventId === e.id || !hoveredEventId) ? 1 : 0.2,
                      height: hoveredEventId === e.id ? '10px' : '6px',
                    }} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* MODALS (Same as previous version) */}
        {selectedEvent && (
          <div style={styles.overlay} onClick={() => setSelectedEvent(null)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <h3 style={{color: gamesData.find(g => g.id === selectedEvent.gameId)?.color, marginTop: 0}}>{selectedEvent.title}</h3>
              <p style={{fontSize: '0.9rem', color: '#ccc'}}>{selectedEvent.type.toUpperCase()} Details</p>
              <div style={{padding: '15px', backgroundColor: '#333', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem'}}>
                Starts: {new Date(selectedEvent.start).toLocaleString()}<br/>
                Ends: {new Date(selectedEvent.end).toLocaleString()}
              </div>
              <button style={{width: '100%', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: '#eee', fontWeight: 'bold'}} onClick={() => setSelectedEvent(null)}>CLOSE</button>
            </div>
          </div>
        )}

        {selectedDay && (
          <div style={styles.overlay} onClick={() => setSelectedDay(null)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <h2 style={{margin: '0 0 20px 0'}}>{currentDate.toLocaleString('default', { month: 'long' })} {selectedDay}</h2>
              {getEventsForDay(selectedDay).map(e => (
                <div key={e.id} style={{display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 0', borderBottom: '1px solid #444'}}>
                  <div style={{width: '12px', height: '12px', borderRadius: '3px', backgroundColor: gamesData.find(g => g.id === e.gameId)?.color}} />
                  <div>
                    <div style={{fontWeight: 'bold'}}>{e.title}</div>
                    <div style={{fontSize: '0.75rem', color: '#888'}}>{e.type}</div>
                  </div>
                </div>
              ))}
              <button style={{width: '100%', padding: '12px', marginTop: '20px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: '#333', color: 'white'}} onClick={() => setSelectedDay(null)}>CLOSE</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;