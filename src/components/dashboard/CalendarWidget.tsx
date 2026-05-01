import { CalendarDays } from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  type: "EXAM" | "ASSIGNMENT" | "HOLIDAY" | "TUTORIAL";
  date: string;
  description: string;
}

interface CalendarWidgetProps {
  events: CalendarEvent[];
}

const TYPE_CONFIG = {
  EXAM:       { emoji: "📝", color: "border-red-200 bg-red-50",    label: "Exam",       badge: "text-red-600 bg-red-50 border-red-100" },
  ASSIGNMENT: { emoji: "📋", color: "border-emerald-200 bg-emerald-50",   label: "Assignment", badge: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  HOLIDAY:    { emoji: "🏖️", color: "border-green-200 bg-green-50", label: "Holiday",    badge: "text-green-600 bg-green-50 border-green-100" },
  TUTORIAL:   { emoji: "🎓", color: "border-teal-200 bg-teal-50", label: "Tutorial",   badge: "text-teal-600 bg-teal-50 border-teal-100" },
};

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CalendarWidget({ events = [] }: { events?: any[] }) {
  const safeEvents = Array.isArray(events) ? events : [];
  const sorted = [...safeEvents].sort((a, b) => 
    new Date(a.startDate || a.date).getTime() - new Date(b.startDate || b.date).getTime()
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 h-full shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <CalendarDays size={16} className="text-emerald-500" />
        <h3 className="font-semibold text-slate-800">Upcoming Events</h3>
      </div>

      <div className="space-y-3">
        {sorted.map((event) => {
          const cfg = TYPE_CONFIG[event.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.TUTORIAL;
          const eventDate = event.startDate || event.date;
          const days = daysUntil(eventDate);
          return (
            <div
              key={event.id}
              className={`relative rounded-2xl border p-4 ${cfg.color} hover:scale-[1.01] transition-transform duration-200 group cursor-default shadow-sm border-opacity-50`}
            >
              <div className="flex items-start gap-3">
                <div className="text-xl flex-shrink-0 mt-0.5">{cfg.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-slate-700">{event.title}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{event.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-medium text-slate-400">{formatDate(eventDate)}</span>
                    <span className={`text-xs font-bold ${days <= 3 ? "text-red-500" : days <= 7 ? "text-amber-500" : "text-slate-400"}`}>
                      {days === 0 ? "Today!" : days < 0 ? `${Math.abs(days)}d ago` : `in ${days}d`}
                    </span>
                  </div>
                </div>
              </div>
              {/* Urgency indicator */}
              {days > 0 && days <= 3 && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>


      {sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-white/20">
          <CalendarDays size={32} className="mb-2" />
          <p className="text-sm">No upcoming events</p>
        </div>
      )}
    </div>
  );
}
