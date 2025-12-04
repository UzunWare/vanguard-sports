import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Trophy, X, Coffee } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import sessionService from '../services/sessionService';

/**
 * CalendarView Component
 * Full-featured calendar showing training sessions and special events
 * Integrated with backend API for real session data
 */
const CalendarView = ({ onBack, user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState('all');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch sessions from backend
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        const response = await sessionService.getAllSessions();
        console.log('Calendar: API Response:', response);
        console.log('Calendar: Sessions count:', response?.sessions?.length);
        if (response.sessions) {
          console.log('Calendar: Setting sessions:', response.sessions);
          setSessions(response.sessions);
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  // Helper: Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay, year, month };
  };

  // Helper: Get events for a specific day
  const getEventsForDay = (day, month, year) => {
    const dayOfWeek = new Date(year, month, day).getDay();

    // Debug: Log for all Saturdays in current view
    if (dayOfWeek === 6 && month === 11) {
      console.log(`\n=== Checking Saturday ${month+1}/${day}/${year} (dayOfWeek=${dayOfWeek}) ===`);
      console.log(`Sessions array length: ${sessions.length}`);
      console.log(`Filter: ${filter}`);
    }

    let events = [];

    // Map sessions to calendar events based on day_of_week
    const dayMap = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };

    sessions.forEach(session => {
      const sessionDay = dayMap[session.day_of_week?.toLowerCase()];
      // Show all sessions except Archived ones
      const isActive = session.status && session.status.toLowerCase() !== 'archived';

      // Debug for Saturdays
      if (dayOfWeek === 6 && month === 11) {
        console.log(`  Session "${session.level} ${session.sport}":`, {
          day_of_week: session.day_of_week,
          mapped: sessionDay,
          matches: sessionDay === dayOfWeek,
          status: session.status,
          isActive,
          willAdd: sessionDay === dayOfWeek && isActive
        });
      }

      if (sessionDay === dayOfWeek && isActive) {
        const event = {
          id: session.id,
          title: `${session.level} ${session.sport}`,
          time: `${session.start_time} - ${session.end_time}`,
          type: session.sport.toLowerCase(),
          location: session.location || 'TBA',
          coach: session.head_coach_name || session.coach_name,
          capacity: session.capacity,
          enrolled: session.enrolled_count || 0,
          price: session.price,
          status: session.status,
          sessionData: session
        };
        events.push(event);

        if (dayOfWeek === 6 && month === 11) {
          console.log(`  ✓ ADDED: ${event.title} at ${event.time}`);
        }
      }
    });

    // Debug before and after filter
    if (dayOfWeek === 6 && month === 11) {
      console.log(`Events before filter: ${events.length}`);
    }

    // Apply filter
    if (filter !== 'all') {
      events = events.filter(e => e.type === filter.toLowerCase());
    }

    if (dayOfWeek === 6 && month === 11) {
      console.log(`Events after filter: ${events.length}`);
      console.log(`=== End Saturday ${month+1}/${day} ===\n`);
    }

    return events;
  };

  const { days, firstDay, year, month } = getDaysInMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const navigateMonth = (dir) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + dir);
    setCurrentDate(newDate);
  };

  const isToday = (d) => {
    const today = new Date();
    return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isSelected = (d) => {
    return d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  };

  // Generate Calendar Grid
  const renderCalendarGrid = () => {
    const blanks = Array(firstDay).fill(null);
    const dayNumbers = Array.from({ length: days }, (_, i) => i + 1);
    const allCells = [...blanks, ...dayNumbers];

    return allCells.map((day, index) => {
      if (!day) return <div key={`blank-${index}`} className="bg-slate-50 min-h-[100px]"></div>;

      const dayEvents = getEventsForDay(day, month, year);
      const maxPreview = 3;

      return (
        <div
          key={day}
          onClick={() => setSelectedDate(new Date(year, month, day))}
          className={`min-h-[100px] bg-white p-2 cursor-pointer transition-colors hover:bg-slate-50 relative group
            ${isSelected(day) ? 'ring-2 ring-inset ring-orange-500 bg-orange-50/30' : ''}
          `}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
              ${isToday(day) ? 'bg-slate-900 text-white' : 'text-slate-700'}
              ${isSelected(day) && !isToday(day) ? 'text-orange-600' : ''}
            `}>
              {day}
            </span>
          </div>

          <div className="space-y-1">
            {dayEvents.slice(0, maxPreview).map((event, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0
                  ${event.type === 'basketball' ? 'bg-orange-500' :
                    event.type === 'volleyball' ? 'bg-blue-500' : 'bg-purple-500'}`}
                />
                <span className="text-[10px] text-slate-600 truncate leading-tight w-full">{event.title}</span>
              </div>
            ))}
            {dayEvents.length > maxPreview && (
              <div className="text-[10px] text-slate-400 pl-2.5">
                +{dayEvents.length - maxPreview} more
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  const selectedDayEvents = getEventsForDay(selectedDate.getDate(), selectedDate.getMonth(), selectedDate.getFullYear());

  // Event badge component
  const EventBadge = ({ type }) => {
    const styles = {
      basketball: 'bg-orange-100 text-orange-700 border-orange-200',
      volleyball: 'bg-blue-100 text-blue-700 border-blue-200',
      soccer: 'bg-green-100 text-green-700 border-green-200',
    };

    const labels = {
      basketball: 'Basketball',
      volleyball: 'Volleyball',
      soccer: 'Soccer',
    };

    return (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${styles[type] || 'bg-gray-100'}`}>
        {labels[type] || type}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <Card className="overflow-hidden shadow-xl">
          <div className="flex flex-col lg:flex-row h-[85vh]">

            {/* MAIN CALENDAR AREA */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">

              {/* Header */}
              <header className="bg-white border-b border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-600 text-white p-2 rounded-lg">
                    <CalendarIcon size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">SCHEDULE</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Vanguard Sports Academy</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-white rounded-md text-slate-600 shadow-sm transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="w-40 text-center font-bold text-slate-800 text-lg">
                    {monthNames[month]} {year}
                  </div>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-white rounded-md text-slate-600 shadow-sm transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded text-xs font-bold border transition-all ${filter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('basketball')}
                    className={`px-3 py-1.5 rounded text-xs font-bold border transition-all ${filter === 'basketball' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-300'}`}
                  >
                    Basketball
                  </button>
                  <button
                    onClick={() => setFilter('volleyball')}
                    className={`px-3 py-1.5 rounded text-xs font-bold border transition-all ${filter === 'volleyball' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300'}`}
                  >
                    Volleyball
                  </button>
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="ml-2 p-2 hover:bg-slate-100 rounded-md text-slate-600 transition-all"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </header>

              {/* Grid Header (Days of Week) */}
              <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-px bg-slate-200 flex-1 overflow-y-auto border border-slate-200">
                {loading ? (
                  <div className="col-span-7 flex items-center justify-center py-12">
                    <div className="text-slate-400">Loading calendar...</div>
                  </div>
                ) : (
                  renderCalendarGrid()
                )}
              </div>
            </div>

            {/* SIDEBAR DETAILS PANEL */}
            <div className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-xl z-20">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Selected Date</h2>
                <div className="text-3xl font-black text-slate-900">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <div className="text-xl text-slate-600">
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {selectedDayEvents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDayEvents.map((event, idx) => (
                      <div key={idx} className="fade-in bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow group relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1
                          ${event.type === 'basketball' ? 'bg-orange-500' :
                            event.type === 'volleyball' ? 'bg-blue-600' : 'bg-purple-500'}`
                        }></div>

                        <div className="flex justify-between items-start mb-2 pl-2 gap-2 flex-wrap">
                          <EventBadge type={event.type} />
                          {event.status && (
                            <Badge color={
                              event.status === 'Open' ? 'green' :
                              event.status === 'Limited' ? 'yellow' :
                              event.status === 'Waitlist Soon' ? 'orange' :
                              'gray'
                            }>
                              {event.status}
                            </Badge>
                          )}
                          {event.capacity && (
                            <Badge color={event.enrolled >= event.capacity ? 'red' : 'green'}>
                              {event.enrolled}/{event.capacity}
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-900 pl-2 mb-1">{event.title}</h3>

                        <div className="space-y-1 pl-2">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock size={14} /> {event.time}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <MapPin size={14} /> {event.location}
                          </div>
                          {event.coach && (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <span className="font-semibold">Coach:</span> {event.coach}
                            </div>
                          )}
                          {event.price && (
                            <div className="flex items-center gap-2 text-sm text-slate-700 font-semibold">
                              ${event.price}/month
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                      <Coffee size={32} />
                    </div>
                    <p className="font-medium">No sessions scheduled</p>
                    <p className="text-sm mt-1">Enjoy the rest day!</p>
                  </div>
                )}
              </div>

              {user?.role === 'parent' && (
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                  <Button
                    className="w-full bg-slate-900 hover:bg-orange-600 text-white"
                    onClick={() => {/* TODO: Implement booking */}}
                  >
                    Book Private Session
                  </Button>
                </div>
              )}
            </div>

          </div>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
