import { CalendarDays, ArrowRight, ExternalLink, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_CONFIG = {
  EXAM:       { emoji: "📝", color: "border-rose-100 bg-rose-50/50",    label: "Exam",       badge: "text-rose-600 bg-rose-100 border-rose-200" },
  ASSIGNMENT: { emoji: "📋", color: "border-emerald-100 bg-emerald-50/50",   label: "Assignment", badge: "text-emerald-600 bg-emerald-100 border-emerald-200" },
  HOLIDAY:    { emoji: "🏖️", color: "border-blue-100 bg-blue-50/50", label: "Holiday",    badge: "text-blue-600 bg-blue-100 border-blue-200" },
  TUTORIAL:   { emoji: "🎓", color: "border-indigo-100 bg-indigo-50/50", label: "Tutorial",   badge: "text-indigo-600 bg-indigo-100 border-indigo-200" },
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
    <div className="rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 p-8 h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
            <CalendarDays size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-0.5">Academic Calendar</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upcoming Events</p>
          </div>
        </div>
        <button className="p-2 bg-slate-50 text-slate-300 rounded-xl hover:bg-indigo-50 hover:text-indigo-500 transition-colors">
          <ExternalLink size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {sorted.map((event) => {
          const cfg = TYPE_CONFIG[event.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.TUTORIAL;
          const eventDate = event.startDate || event.date;
          const days = daysUntil(eventDate);
          const isUrgent = days >= 0 && days <= 3;

          return (
            <div
              key={event.id}
              className={cn(
                "relative rounded-3xl border-2 p-5 transition-all duration-300 group cursor-pointer shadow-sm",
                cfg.color,
                isUrgent ? "scale-[1.02] border-rose-200" : "hover:scale-[1.02] hover:shadow-md"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-500">
                  {cfg.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-black text-slate-800 group-hover:text-indigo-700 transition-colors leading-tight">{event.title}</span>
                    <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-widest", cfg.badge)}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed">{event.description}</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{formatDate(eventDate)}</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      isUrgent ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-200" : "bg-white text-slate-500 border border-slate-100"
                    )}>
                      {days === 0 ? "Today" : days < 0 ? `${Math.abs(days)}d ago` : `in ${days}d`}
                      <ArrowRight size={10} className="ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="size-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
            <CalendarDays size={32} />
          </div>
          <h4 className="text-sm font-black text-slate-800 mb-1 uppercase tracking-widest">Quiet Period</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No upcoming events scheduled</p>
        </div>
      )}
    </div>
  );
}
