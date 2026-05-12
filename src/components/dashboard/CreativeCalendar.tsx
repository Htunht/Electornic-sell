import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, Send } from 'lucide-react';
import { calendarApi } from '../../lib/api';
import { cn } from '../../lib/utils';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
}

interface CreativeCalendarProps {
  canEdit?: boolean;
}

export default function CreativeCalendar({ canEdit = false }: CreativeCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Record<string, CalendarEvent>>({});
  const [loading, setLoading] = useState(true);
  
  // Selection/Modal state
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchEvents = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month + 2, 0).toISOString();
      
      const res = await calendarApi.getEvents({ startDate, endDate });
      const eventMap: Record<string, CalendarEvent> = {};
      
      (res.data?.events || []).forEach((ev: any) => {
        const d = new Date(ev.date).toDateString();
        eventMap[d] = ev;
      });
      
      setEvents(eventMap);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const existing = events[clickedDate.toDateString()];
    
    setSelectedDay(clickedDate);
    setNoteText(existing?.title || "");
    
    // If student, they just see the note if it exists
    // If teacher, they can edit
  };

  const handleSaveNote = async () => {
    if (!selectedDay || !canEdit) return;
    setSaving(true);
    try {
      await calendarApi.saveEvent({
        date: selectedDay.toISOString(),
        title: noteText,
        description: "", // Short note goes into title for now as per "short note" request
      });
      await fetchEvents();
      setSelectedDay(null);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days: React.ReactNode[] = [];
    
    const prevMonthDays = daysInMonth(year, month - 1);
    const startOffset = startDayOfMonth(year, month);
    
    // Previous month overlap
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="h-10 sm:h-12 flex items-center justify-center text-slate-300 text-xs font-medium opacity-40">
          {prevMonthDays - i}
        </div>
      );
    }

    const totalDays = daysInMonth(year, month);
    const today = new Date().toDateString();

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toDateString();
      const hasEvent = !!events[dateStr];
      const isToday = dateStr === today;

      days.push(
        <button
          key={`day-${d}`}
          onClick={() => handleDayClick(d)}
          className={cn(
            "relative h-10 sm:h-12 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300",
            hasEvent 
              ? "bg-rose-500 text-white shadow-lg shadow-rose-200 hover:scale-110 active:scale-95" 
              : isToday
                ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-100 hover:bg-emerald-100"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            "group"
          )}
        >
          {d}
          {hasEvent && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-rose-500 animate-pulse" />
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {currentDate.toLocaleString('default', { month: 'long' })}
          </h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{currentDate.getFullYear()}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={`${d}-${i}`} className="h-8 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px] flex items-center justify-center rounded-xl animate-in fade-in duration-300">
            <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        )}
        {renderDays()}
      </div>

      {/* Note Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm" onClick={() => setSelectedDay(null)} />
          <div className="relative w-full max-w-[300px] bg-white rounded-[1.75rem] shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5 mb-5">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                events[selectedDay.toDateString()] ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-500"
              )}>
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedDay.toLocaleDateString('default', { day: 'numeric', month: 'short' })}</h4>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Daily Note</p>
              </div>
            </div>

            {canEdit ? (
              <div className="space-y-3">
                <textarea 
                  className="w-full p-3.5 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500/20 focus:bg-white outline-none transition-all text-xs font-bold text-slate-700 min-h-[80px] resize-none"
                  placeholder="Type a short note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  maxLength={50}
                />
                <button 
                  onClick={handleSaveNote}
                  disabled={saving || !noteText.trim()}
                  className="w-full h-10 bg-emerald-600 text-white rounded-lg font-bold text-xs shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-all"
                >
                  {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={14}/> Save Note</>}
                </button>
              </div>
            ) : (
              <div className="p-5 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-700 italic leading-relaxed">
                  {events[selectedDay.toDateString()]?.title || "No notes for this day."}
                </p>
              </div>
            )}
            
            <button 
              onClick={() => setSelectedDay(null)}
              className="w-full mt-2 h-8 text-slate-400 font-bold text-[10px] hover:text-slate-600 transition-colors uppercase tracking-widest"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
