import { useState, useEffect, useMemo } from "react";
import {
  Home, CalendarDays, Dumbbell, UtensilsCrossed, HeartPulse, Flag,
  ClipboardList, Check, ChevronRight, ChevronLeft, Plus, Trash2,
  AlertTriangle, Info, X, Droplets, Moon, Trophy, Minus
} from "lucide-react";

/* ============================== DESIGN TOKENS ==============================
   Subject: a 100-day marathon + physique log for one specific athlete (Shivam).
   Direction: a training-log / results-board aesthetic — the visual language of
   a track meet program and a gym logbook, not a wellness-app gradient.
   Color: cinder (#15140F), ledger (#1E1C15), chalk (#ECE7DA), ash (#8C8676),
          clay (#C1502E, running), slate (#3E6C8C, lifting), moss (#6B7A56, rest),
          flare (#E0A458, milestones/alerts).
   Type: Oswald (condensed, bib-number display) / Inter (body) / IBM Plex Mono (data).
============================================================================= */

const START_DATE = new Date(2026, 5, 29); // 29 Jun 2026
const RACE_DATE = new Date(2026, 9, 6); // 6 Oct 2026

const GYM_META = {
  push: { label: "Push (Heavy)", sub: "Chest / Shoulders / Triceps", color: "#3E6C8C" },
  pull: { label: "Pull (Heavy)", sub: "Back / Biceps", color: "#3E6C8C" },
  legs: { label: "Legs (Moderate)", sub: "Deliberately lighter — tomorrow has a tempo run", color: "#3E6C8C" },
  upper: { label: "Upper Hypertrophy + Core", sub: "Pump-focused, higher reps, shorter rest", color: "#3E6C8C" },
  full: { label: "Full Body + Core", sub: "Lighter loads, higher reps — leave you fresh, not wrecked", color: "#3E6C8C" },
  mobility: { label: "Mobility / Stretch", sub: "No lifting — legs just did the long run", color: "#6B7A56" },
  restday: { label: "Mobility + Recovery", sub: "Rest day", color: "#6B7A56" },
  none: { label: "—", sub: "Race day", color: "#E0A458" },
};

const GYM_PROGRAMS = {
  push: {
    title: "Push (Heavy)", sub: "Chest / Shoulders / Triceps",
    exercises: [
      ["Barbell Bench Press", "4 x 6-8", "2 min", "Main lift — add weight when all reps feel solid"],
      ["Incline Dumbbell Press", "3 x 8-10", "90s", ""],
      ["Seated Overhead Press", "3 x 8-10", "90s", ""],
      ["Weighted Dips", "3 x 10-12", "60s", "Bodyweight dips if weighted feels too heavy"],
      ["Cable Triceps Pushdown", "3 x 12-15", "60s", ""],
      ["Lateral Raise", "3 x 15-20", "45s", "Light weight, strict form — for shoulder width"],
    ],
  },
  pull: {
    title: "Pull (Heavy)", sub: "Back / Biceps",
    exercises: [
      ["Pull-ups (or Lat Pulldown)", "4 x 6-10", "2 min", "Use assistance/lat pulldown if needed"],
      ["Barbell Row", "4 x 8", "90s", ""],
      ["Seated Cable Row", "3 x 10-12", "90s", ""],
      ["Face Pull", "3 x 15", "60s", "Posture and shoulder health, especially with all the running"],
      ["Barbell / EZ-Bar Curl", "3 x 10", "60s", ""],
      ["Hammer Curl", "3 x 12", "45s", ""],
    ],
  },
  legs: {
    title: "Legs (Moderate)", sub: "Deliberately lighter than max effort — tomorrow has a tempo run",
    exercises: [
      ["Back Squat or Goblet Squat", "3 x 10", "90s", "RPE 7/10 — stop two reps short of failure"],
      ["Romanian Deadlift", "3 x 10", "90s", ""],
      ["Leg Press", "3 x 12", "75s", ""],
      ["Walking Lunge", "2 x 12 / leg", "60s", ""],
      ["Standing Calf Raise", "3 x 15", "45s", ""],
    ],
    footnote: "From Week 9: drop one set from Squat and Leg Press. In Week 13 (peak week), do this session at ~60% of normal volume.",
  },
  upper: {
    title: "Upper Body Hypertrophy + Core", sub: "Pump-focused, higher reps, shorter rest",
    exercises: [
      ["Incline Dumbbell Press", "3 x 12", "60s", ""],
      ["Lat Pulldown", "3 x 12", "60s", ""],
      ["Seated DB Shoulder Press", "3 x 12", "60s", ""],
      ["Cable Fly", "3 x 15", "45s", ""],
      ["Plank", "3 x 45-60s", "45s", ""],
      ["Hanging Leg Raise", "3 x 12", "45s", "Lower with control — don't swing"],
    ],
  },
  full: {
    title: "Full Body + Core", sub: "Lighter loads, higher reps — this session should leave you fresh, not wrecked",
    exercises: [
      ["Goblet Squat", "3 x 15", "60s", ""],
      ["Push-up", "3 x 15", "45s", "Add weight on back, or elevate feet, once easy"],
      ["Dumbbell Row", "3 x 15", "60s", ""],
      ["Glute Bridge", "3 x 15", "45s", ""],
      ["Cable Crunch", "3 x 15", "45s", ""],
      ["Farmer's Carry", "3 x 30 m", "60s", "Heavy dumbbells/kettlebells, walk tall"],
    ],
  },
};

// ============================== 100-DAY CALENDAR ==============================
// Transcribed directly from the plan's day-by-day calendar (Section 8).
const RAW_DAYS = [
  [1,"2026-06-29","Mon",1,"Foundation","Easy run/walk — 2 km","push"],
  [2,"2026-06-30","Tue",1,"Foundation","Intervals: 8x(1min run/2min walk), ~2 km","pull"],
  [3,"2026-07-01","Wed",1,"Foundation","Recovery jog/walk — 2 km","legs"],
  [4,"2026-07-02","Thu",1,"Foundation","Easy run/walk — 2 km","upper"],
  [5,"2026-07-03","Fri",1,"Foundation","Easy run/walk — 2.5 km","full"],
  [6,"2026-07-04","Sat",1,"Foundation","Long run/walk — 3 km","mobility"],
  [7,"2026-07-05","Sun",1,"Foundation","Rest or 20-min walk","restday"],

  [8,"2026-07-06","Mon",2,"Foundation","Easy — 3 km","push"],
  [9,"2026-07-07","Tue",2,"Foundation","Intervals: 5x400m fast/400m slow, ~3.5 km","pull"],
  [10,"2026-07-08","Wed",2,"Foundation","Recovery — 2.5 km","legs"],
  [11,"2026-07-09","Thu",2,"Foundation","Easy — 3 km","upper"],
  [12,"2026-07-10","Fri",2,"Foundation","Easy — 3 km","full"],
  [13,"2026-07-11","Sat",2,"Foundation","Long run — 4 km","mobility"],
  [14,"2026-07-12","Sun",2,"Foundation","Rest or 25-min walk","restday"],

  [15,"2026-07-13","Mon",3,"Base Building","Easy — 4 km","push"],
  [16,"2026-07-14","Tue",3,"Base Building","Intervals: 6x400m, ~4 km","pull"],
  [17,"2026-07-15","Wed",3,"Base Building","Recovery — 3 km","legs"],
  [18,"2026-07-16","Thu",3,"Base Building","Tempo — 3 km steady","upper"],
  [19,"2026-07-17","Fri",3,"Base Building","Easy — 4 km","full"],
  [20,"2026-07-18","Sat",3,"Base Building","Long run — 5 km","mobility",null,"Milestone: long run crosses 5 km for the first time."],
  [21,"2026-07-19","Sun",3,"Base Building","Rest or 30-min walk","restday"],

  [22,"2026-07-20","Mon",4,"Base Building","Easy — 5 km","push"],
  [23,"2026-07-21","Tue",4,"Base Building","Intervals: 6x400m + 2x800m, ~5 km","pull"],
  [24,"2026-07-22","Wed",4,"Base Building","Recovery — 3 km","legs"],
  [25,"2026-07-23","Thu",4,"Base Building","Tempo — 4 km","upper",null,"Day 25 milestone check-in: one quarter down."],
  [26,"2026-07-24","Fri",4,"Base Building","Easy — 5 km","full"],
  [27,"2026-07-25","Sat",4,"Base Building","Long run — 7 km","mobility",null,"Milestone: first run past 5 km."],
  [28,"2026-07-26","Sun",4,"Base Building","Rest or 30-min walk","restday"],

  [29,"2026-07-27","Mon",5,"Endurance","Easy — 5 km","push"],
  [30,"2026-07-28","Tue",5,"Endurance","Intervals: 5x800m, ~5 km","pull"],
  [31,"2026-07-29","Wed",5,"Endurance","Recovery — 4 km","legs"],
  [32,"2026-07-30","Thu",5,"Endurance","Tempo — 4 km","upper"],
  [33,"2026-07-31","Fri",5,"Endurance","Easy — 6 km","full"],
  [34,"2026-08-01","Sat",5,"Endurance","Long run — 8 km","mobility"],
  [35,"2026-08-02","Sun",5,"Endurance","Rest or 30-min walk","restday"],

  [36,"2026-08-03","Mon",6,"Endurance","Easy — 6 km","push"],
  [37,"2026-08-04","Tue",6,"Endurance","Intervals: 4x1 km, ~6 km","pull"],
  [38,"2026-08-05","Wed",6,"Endurance","Recovery — 4 km","legs"],
  [39,"2026-08-06","Thu",6,"Endurance","Tempo — 5 km","upper"],
  [40,"2026-08-07","Fri",6,"Endurance","Easy — 6 km","full"],
  [41,"2026-08-08","Sat",6,"Endurance","Long run — 10 km","mobility",null,"Milestone: first double-digit long run."],
  [42,"2026-08-09","Sun",6,"Endurance","Rest or 30-min walk","restday"],

  [43,"2026-08-10","Mon",7,"Endurance","Easy — 7 km","push"],
  [44,"2026-08-11","Tue",7,"Endurance","Steady run — 6 km","pull"],
  [45,"2026-08-12","Wed",7,"Endurance","Recovery — 4-5 km","legs"],
  [46,"2026-08-13","Thu",7,"Endurance","Tempo — 5 km","upper"],
  [47,"2026-08-14","Fri",7,"Endurance","Easy — 7 km","full"],
  [48,"2026-08-15","Sat",7,"Endurance","Long run — 12 km","mobility"],
  [49,"2026-08-16","Sun",7,"Endurance","Rest or 30-min walk","restday"],

  [50,"2026-08-17","Mon",8,"Endurance","Easy — 8 km","push",null,"Day 50 milestone check-in: halfway."],
  [51,"2026-08-18","Tue",8,"Endurance","Steady run — 7 km","pull"],
  [52,"2026-08-19","Wed",8,"Endurance","Recovery — 5 km","legs"],
  [53,"2026-08-20","Thu",8,"Endurance","Tempo — 6 km","upper"],
  [54,"2026-08-21","Fri",8,"Endurance","Easy — 8 km","full"],
  [55,"2026-08-22","Sat",8,"Endurance","Long run — 14 km","mobility"],
  [56,"2026-08-23","Sun",8,"Endurance","Rest or 30-min walk","restday"],

  [57,"2026-08-24","Mon",9,"Distance","Easy — 8 km","push"],
  [58,"2026-08-25","Tue",9,"Distance","Steady run — 7 km","pull"],
  [59,"2026-08-26","Wed",9,"Distance","Recovery — 5 km","legs",null,"From this week: trim Wed leg-day volume ~20% to protect long-run recovery."],
  [60,"2026-08-27","Thu",9,"Distance","Tempo — 6 km","upper"],
  [61,"2026-08-28","Fri",9,"Distance","Easy — 8 km","full"],
  [62,"2026-08-29","Sat",9,"Distance","Long run — 16 km","mobility"],
  [63,"2026-08-30","Sun",9,"Distance","Rest or 30-min walk","restday"],

  [64,"2026-08-31","Mon",10,"Distance","Easy — 9 km","push"],
  [65,"2026-09-01","Tue",10,"Distance","Steady run — 7 km","pull"],
  [66,"2026-09-02","Wed",10,"Distance","Recovery — 5-6 km","legs"],
  [67,"2026-09-03","Thu",10,"Distance","Tempo — 7 km","upper"],
  [68,"2026-09-04","Fri",10,"Distance","Easy — 9 km","full"],
  [69,"2026-09-05","Sat",10,"Distance","Long run — 18 km","mobility",null,"Milestone: first big distance jump — go out slow."],
  [70,"2026-09-06","Sun",10,"Distance","Rest or 30-min walk","restday"],

  [71,"2026-09-07","Mon",11,"Distance","Easy — 9 km","push"],
  [72,"2026-09-08","Tue",11,"Distance","Steady run — 7 km","pull"],
  [73,"2026-09-09","Wed",11,"Distance","Recovery — 6 km","legs"],
  [74,"2026-09-10","Thu",11,"Distance","Tempo — 7 km","upper"],
  [75,"2026-09-11","Fri",11,"Distance","Easy — 9 km","full",null,"Day 75 milestone check-in: three quarters."],
  [76,"2026-09-12","Sat",11,"Distance","Long run — 20 km","mobility"],
  [77,"2026-09-13","Sun",11,"Distance","Rest or 30-min walk","restday"],

  [78,"2026-09-14","Mon",12,"Distance","Easy — 10 km","push"],
  [79,"2026-09-15","Tue",12,"Distance","Steady run — 8 km","pull"],
  [80,"2026-09-16","Wed",12,"Distance","Recovery — 6 km","legs"],
  [81,"2026-09-17","Thu",12,"Distance","Tempo — 8 km","upper"],
  [82,"2026-09-18","Fri",12,"Distance","Easy — 9-10 km","full"],
  [83,"2026-09-19","Sat",12,"Distance","Long run — 22 km","mobility"],
  [84,"2026-09-20","Sun",12,"Distance","Rest or 30-min walk","restday"],

  [85,"2026-09-21","Mon",13,"Peak","Easy — 8 km (cutback)","push",null,"PEAK WEEK & decision point. Reduce all gym volume ~30-40% this week."],
  [86,"2026-09-22","Tue",13,"Peak","Steady run — 6 km","pull"],
  [87,"2026-09-23","Wed",13,"Peak","Recovery — 5 km","legs"],
  [88,"2026-09-24","Thu",13,"Peak","Tempo — 6 km","upper"],
  [89,"2026-09-25","Fri",13,"Peak","Easy — 7 km","full"],
  [90,"2026-09-26","Sat",13,"Peak","Long run — 26 km","mobility",null,"Longest run of the program. This is the marathon/half-marathon decision point — see Race Day."],
  [91,"2026-09-27","Sun",13,"Peak","Rest — full recovery","restday"],

  [92,"2026-09-28","Mon",14,"Taper","Easy — 6 km","push",null,"Taper: same gym exercises, lighter loads, longer rest between sets."],
  [93,"2026-09-29","Tue",14,"Taper","Easy w/ strides — 5 km","pull"],
  [94,"2026-09-30","Wed",14,"Taper","Recovery — 4 km","legs"],
  [95,"2026-10-01","Thu",14,"Taper","Easy — 4 km","upper"],
  [96,"2026-10-02","Fri",14,"Taper","Easy — 3 km","full"],
  [97,"2026-10-03","Sat",14,"Taper","Long run (taper) — 16 km","mobility"],
  [98,"2026-10-04","Sun",14,"Taper","Rest — full recovery","restday"],

  [99,"2026-10-05","Mon",15,"Race Week","Rest, or 15-min easy jog","mobility",null,"Lay out race kit, hydrate, carb-focused meals."],
  [100,"2026-10-06","Tue",15,"Race Week","RACE DAY — Marathon or Half-Marathon","none",null,"Day 100 milestone check-in: race day."],
];

const CALENDAR = RAW_DAYS.map((r) => ({
  day: r[0], date: r[1], wd: r[2], week: r[3], phase: r[4], run: r[5], gym: r[6], note: r[8] || null,
}));

const PHASE_COLORS = {
  Foundation: "#6B7A56", "Base Building": "#8C8676", Endurance: "#C1502E",
  Distance: "#3E6C8C", Peak: "#E0A458", Taper: "#8C8676", "Race Week": "#E0A458",
};

function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function currentDayNumber() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((today - START_DATE) / 86400000) + 1;
  if (diff < 1) return 1;
  if (diff > 100) return 100;
  return diff;
}

// ============================== STORAGE HELPERS ==============================
async function loadKey(key, fallback) {
  try {
    const res = await window.storage.get(key, false);
    return res ? JSON.parse(res.value) : fallback;
  } catch {
    return fallback;
  }
}
async function saveKey(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), false);
  } catch (e) {
    console.error("storage save failed", key, e);
  }
}

const LIFTS = ["Barbell Bench Press", "Seated Overhead Press", "Barbell Row", "Pull-ups (max reps)", "Back Squat", "Romanian Deadlift"];
const CHECKPOINTS = ["Week 1", "Week 4", "Week 8", "Week 12"];
const HABIT_ROWS = ["Slept 7.5h+", "Hit protein target", "Drank 3L+ water", "Did the day's run", "Did the day's lift", "Stretched / mobility"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function App() {
  const [tab, setTab] = useState("today");
  const [loaded, setLoaded] = useState(false);
  const [completions, setCompletions] = useState({});
  const [weightLog, setWeightLog] = useState([]);
  const [paceLog, setPaceLog] = useState([]);
  const [prTracker, setPrTracker] = useState({});
  const [habitWeek, setHabitWeek] = useState(1);
  const [habitTracker, setHabitTracker] = useState({});
  const [milestones, setMilestones] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);

  const todayNum = useMemo(() => currentDayNumber(), []);

  useEffect(() => {
    (async () => {
      setCompletions(await loadKey("shivam100:completions", {}));
      setWeightLog(await loadKey("shivam100:weightLog", []));
      setPaceLog(await loadKey("shivam100:paceLog", []));
      setPrTracker(await loadKey("shivam100:prTracker", {}));
      setHabitTracker(await loadKey("shivam100:habitTracker", {}));
      setMilestones(await loadKey("shivam100:milestones", {}));
      setLoaded(true);
    })();
  }, []);

  function toggleCompletion(day, field) {
    setCompletions((prev) => {
      const next = { ...prev, [day]: { ...prev[day], [field]: !prev?.[day]?.[field] } };
      saveKey("shivam100:completions", next);
      return next;
    });
  }

  const streak = useMemo(() => {
    let s = 0;
    for (let d = todayNum; d >= 1; d--) {
      const c = completions[d];
      const info = CALENDAR[d - 1];
      const needsRun = info && info.gym !== "none";
      const done = c && (c.run || c.lift || c.mobility);
      if (done) s++;
      else if (d === todayNum) continue;
      else break;
    }
    return s;
  }, [completions, todayNum]);

  const todayInfo = CALENDAR[todayNum - 1];
  const weekNoteThisWeek = todayInfo?.note;

  const NAV = [
    { id: "today", label: "Today", icon: Home },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "gym", label: "Gym", icon: Dumbbell },
    { id: "fuel", label: "Fuel", icon: UtensilsCrossed },
    { id: "recover", label: "Recover", icon: HeartPulse },
    { id: "race", label: "Race Day", icon: Flag },
    { id: "log", label: "Trackers", icon: ClipboardList },
  ];

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        :root {
          --cinder:#15140F; --ledger:#1E1C15; --ledger2:#252217;
          --chalk:#ECE7DA; --ash:#9A9484; --ash-dim:#6b665a;
          --clay:#C1502E; --slate:#3E6C8C; --moss:#6B7A56; --flare:#E0A458;
          --line: rgba(236,231,218,0.09);
        }
        * { box-sizing: border-box; }
        .app { background: var(--cinder); color: var(--chalk); min-height: 100vh;
          font-family: 'Inter', sans-serif; padding-bottom: 84px; }
        .disp { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.02em; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .wrap { max-width: 860px; margin: 0 auto; padding: 0 16px; }

        /* Header */
        .hdr { position: sticky; top: 0; z-index: 20; background: linear-gradient(180deg, var(--cinder) 80%, rgba(21,20,15,0.85));
          border-bottom: 1px solid var(--line); backdrop-filter: blur(6px); padding: 14px 16px 12px; }
        .hdr-row { display:flex; align-items:baseline; justify-content:space-between; max-width:860px; margin:0 auto; }
        .day-count { font-size: 34px; font-weight: 700; line-height:1; }
        .day-count .slash { color: var(--ash-dim); font-weight: 400; margin: 0 3px; }
        .day-total { font-size: 15px; color: var(--ash); }
        .hdr-meta { text-align:right; }
        .phase-chip { display:inline-block; padding: 3px 10px; border-radius: 3px; font-size: 11px;
          font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
        .hdr-date { color: var(--ash); font-size: 12px; margin-top: 4px; }
        .streak { font-size: 11px; color: var(--flare); margin-top: 4px; letter-spacing: 0.04em; }

        /* Bottom Nav */
        .nav { position: fixed; bottom: 0; left: 0; right: 0; background: var(--ledger);
          border-top: 1px solid var(--line); display:flex; z-index: 30; }
        .nav-btn { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px;
          padding: 9px 2px 10px; background: none; border: none; color: var(--ash-dim); cursor:pointer; }
        .nav-btn.active { color: var(--flare); }
        .nav-btn span { font-size: 10px; letter-spacing: 0.03em; text-transform: uppercase; font-weight: 600; }

        .section { padding: 20px 0 8px; }
        .h1 { font-size: 26px; font-weight: 600; margin: 0 0 4px; }
        .h2 { font-size: 15px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--flare); margin: 28px 0 10px; }
        .sub { color: var(--ash); font-size: 13px; margin: 0 0 16px; line-height:1.5; }

        .card { background: var(--ledger); border: 1px solid var(--line); border-radius: 6px; padding: 16px; margin-bottom: 12px; }
        .card-tight { padding: 12px 14px; }

        .bib { display:flex; align-items:center; gap: 12px; }
        .bib-num { font-family:'IBM Plex Mono'; font-size: 13px; color: var(--ash); border: 1px solid var(--line);
          border-radius: 3px; padding: 3px 7px; }

        .row-line { display:flex; justify-content:space-between; align-items:center; padding: 9px 0; border-bottom: 1px solid var(--line); }
        .row-line:last-child { border-bottom: none; }

        .btn { background: var(--ledger2); border: 1px solid var(--line); color: var(--chalk); padding: 8px 14px;
          border-radius: 4px; font-size: 13px; font-weight: 600; cursor:pointer; display:inline-flex; align-items:center; gap:6px; }
        .btn:hover { border-color: var(--ash-dim); }
        .btn.on { background: var(--moss); border-color: var(--moss); color: var(--cinder); }
        .btn.run.on { background: var(--clay); border-color: var(--clay); color: var(--cinder); }
        .btn-icon { background:none; border:1px solid var(--line); color:var(--ash); border-radius:4px; width:30px; height:30px;
          display:flex; align-items:center; justify-content:center; cursor:pointer; }

        table.tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
        table.tbl th { text-align: left; color: var(--ash); font-weight: 600; font-size: 11px; letter-spacing:0.05em;
          text-transform: uppercase; padding: 6px 8px; border-bottom: 1px solid var(--line); }
        table.tbl td { padding: 9px 8px; border-bottom: 1px solid var(--line); vertical-align: top; }
        table.tbl tr:last-child td { border-bottom: none; }
        .mono-cell { font-family:'IBM Plex Mono'; color: var(--flare); font-size: 12.5px; white-space: nowrap; }

        .badge { display:inline-block; font-size:10px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;
          padding: 2px 7px; border-radius: 3px; }

        .tabs { display:flex; gap:6px; overflow-x:auto; padding-bottom:4px; margin-bottom: 14px; }
        .tabs::-webkit-scrollbar{display:none;}
        .tab-chip { flex-shrink:0; background: var(--ledger); border:1px solid var(--line); color: var(--ash);
          padding: 7px 13px; border-radius: 20px; font-size: 12.5px; font-weight:600; cursor:pointer; }
        .tab-chip.active { background: var(--slate); border-color: var(--slate); color: var(--chalk); }

        /* Calendar grid */
        .cal-grid { display:grid; grid-template-columns: repeat(10, 1fr); gap: 4px; }
        .cal-cell { position:relative; aspect-ratio: 1; border-radius: 3px; display:flex; align-items:center; justify-content:center;
          font-family:'IBM Plex Mono'; font-size: 10px; cursor:pointer; border: 1px solid rgba(0,0,0,0.2); color: rgba(21,20,15,0.75); font-weight:600; }
        .cal-cell.today { outline: 2px solid var(--chalk); outline-offset: 1px; }
        .cal-cell.done::after { content:''; position:absolute; bottom:2px; right:2px; width:5px; height:5px; border-radius:50%; background: var(--cinder); }
        .cal-legend { display:flex; gap:14px; flex-wrap:wrap; margin: 12px 0 4px; }
        .leg-item { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--ash); }
        .leg-dot { width:9px; height:9px; border-radius:2px; }

        .modal-bg { position:fixed; inset:0; background: rgba(0,0,0,0.6); z-index:50; display:flex; align-items:flex-end;
          justify-content:center; }
        .modal { background: var(--ledger); border-top: 1px solid var(--line); border-radius: 12px 12px 0 0; width:100%;
          max-width: 860px; max-height: 82vh; overflow-y:auto; padding: 18px 18px 28px; }
        @media (min-width: 600px) { .modal-bg{ align-items:center; } .modal{ border-radius:10px; max-height:80vh; } }

        .flag { display:flex; gap:10px; background: rgba(224,164,88,0.1); border:1px solid rgba(224,164,88,0.35);
          border-radius:5px; padding: 10px 12px; font-size: 12.5px; color: var(--flare); margin: 10px 0; }
        .flag.red { background: rgba(193,80,46,0.12); border-color: rgba(193,80,46,0.4); color: #E37A5C; }
        .flag svg { flex-shrink:0; margin-top:1px; }

        .input { background: var(--cinder); border:1px solid var(--line); color: var(--chalk); border-radius:4px;
          padding: 7px 10px; font-size: 13px; font-family: inherit; width: 100%; }
        .input::placeholder { color: var(--ash-dim); }
        .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .grid3 { display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }

        .habit-grid { display:grid; grid-template-columns: 130px repeat(7, 1fr); gap: 4px; align-items:center; }
        .habit-grid .hh { font-size:10px; color:var(--ash); text-align:center; text-transform:uppercase; letter-spacing:0.04em; }
        .chk { width: 22px; height: 22px; border-radius: 4px; border: 1px solid var(--line); background: var(--cinder);
          margin: 0 auto; cursor:pointer; display:flex; align-items:center; justify-content:center; }
        .chk.on { background: var(--moss); border-color: var(--moss); }

        textarea.input { resize: vertical; min-height: 60px; }
        .pill-row { display:flex; gap:8px; flex-wrap:wrap; }
      `}</style>

      {/* HEADER */}
      <div className="hdr">
        <div className="hdr-row">
          <div>
            <div className="day-count mono">{String(todayNum).padStart(2, "0")}<span className="slash">/</span><span className="day-total">100</span></div>
            <div className="hdr-date">{fmtDate(todayInfo.date)} · Week {todayInfo.week}</div>
          </div>
          <div className="hdr-meta">
            <span className="phase-chip" style={{ background: PHASE_COLORS[todayInfo.phase] + "30", color: PHASE_COLORS[todayInfo.phase] }}>
              {todayInfo.phase}
            </span>
            {streak > 0 && <div className="streak">{streak}-day streak</div>}
          </div>
        </div>
      </div>

      <div className="wrap">
        {tab === "today" && (
          <TodayTab dayNum={todayNum} info={todayInfo} completions={completions} onToggle={toggleCompletion} />
        )}
        {tab === "calendar" && (
          <CalendarTab todayNum={todayNum} completions={completions} onSelect={setSelectedDay} />
        )}
        {tab === "gym" && <GymTab />}
        {tab === "fuel" && <FuelTab />}
        {tab === "recover" && <RecoverTab />}
        {tab === "race" && <RaceTab />}
        {tab === "log" && (
          <LogTab
            weightLog={weightLog} setWeightLog={setWeightLog}
            paceLog={paceLog} setPaceLog={setPaceLog}
            prTracker={prTracker} setPrTracker={setPrTracker}
            habitWeek={habitWeek} setHabitWeek={setHabitWeek}
            habitTracker={habitTracker} setHabitTracker={setHabitTracker}
            milestones={milestones} setMilestones={setMilestones}
          />
        )}
      </div>

      {selectedDay && (
        <DayModal
          info={selectedDay}
          completion={completions[selectedDay.day]}
          onToggle={toggleCompletion}
          onClose={() => setSelectedDay(null)}
        />
      )}

      {/* NAV */}
      <div className="nav">
        {NAV.map((n) => {
          const Icon = n.icon;
          return (
            <button key={n.id} className={`nav-btn ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
              <Icon size={19} strokeWidth={2} />
              <span>{n.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================== TODAY ==============================
function TodayTab({ dayNum, info, completions, onToggle }) {
  const c = completions[dayNum] || {};
  const isRest = info.gym === "restday";
  const isRace = info.gym === "none";
  const gymMeta = GYM_META[info.gym];

  return (
    <div className="section">
      <div className="h1">{isRace ? "It's race day." : `Day ${dayNum}`}</div>
      <p className="sub">{info.wd}, {fmtDate(info.date)} — {info.phase} phase{info.week ? `, Week ${info.week}` : ""}.</p>

      {info.note && (
        <div className="flag">
          <Info size={16} />
          <span>{info.note}</span>
        </div>
      )}

      <div className="card">
        <div className="bib" style={{ marginBottom: 10 }}>
          <span className="badge" style={{ background: "#C1502E30", color: "#C1502E" }}>RUN</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>{info.run}</div>
        <button className={`btn run ${c.run ? "on" : ""}`} onClick={() => onToggle(dayNum, "run")}>
          <Check size={14} /> {c.run ? "Run logged" : "Mark run done"}
        </button>
      </div>

      <div className="card">
        <div className="bib" style={{ marginBottom: 10 }}>
          <span className="badge" style={{ background: gymMeta.color + "30", color: gymMeta.color }}>
            {isRest ? "REST" : isRace ? "RACE" : "LIFT"}
          </span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{gymMeta.label}</div>
        <div className="sub" style={{ marginBottom: 10 }}>{gymMeta.sub}</div>
        {!isRace && (
          <button className={`btn ${c.lift ? "on" : ""}`} onClick={() => onToggle(dayNum, "lift")}>
            <Check size={14} /> {c.lift ? "Session logged" : isRest ? "Mark stretch done" : "Mark session done"}
          </button>
        )}
      </div>

      {isRace && (
        <div className="flag red">
          <Trophy size={16} />
          <span>100 days of work are already done. Whatever happens today, that's the real win. See the Race Day tab for pacing and fuelling.</span>
        </div>
      )}

      <div className="h2">Quick links</div>
      <div className="pill-row">
        {!isRest && !isRace && <span className="btn-icon" />}
      </div>
    </div>
  );
}

// ============================== CALENDAR ==============================
function CalendarTab({ todayNum, completions, onSelect }) {
  return (
    <div className="section">
      <div className="h1">100-Day Calendar</div>
      <p className="sub">Every day of the plan, colour-coded by phase. Tap a day for the full run + gym detail.</p>

      <div className="cal-legend">
        {Object.entries(PHASE_COLORS).map(([phase, color]) => (
          <div className="leg-item" key={phase}>
            <span className="leg-dot" style={{ background: color }} />
            {phase}
          </div>
        ))}
      </div>

      <div className="cal-grid">
        {CALENDAR.map((info) => {
          const c = completions[info.day] || {};
          const done = c.run || c.lift;
          return (
            <div
              key={info.day}
              className={`cal-cell ${info.day === todayNum ? "today" : ""} ${done ? "done" : ""}`}
              style={{ background: PHASE_COLORS[info.phase] }}
              onClick={() => onSelect(info)}
              title={`Day ${info.day} — ${info.run}`}
            >
              {info.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayModal({ info, completion, onToggle, onClose }) {
  const c = completion || {};
  const gymMeta = GYM_META[info.gym];
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="h1" style={{ fontSize: 22 }}>Day {info.day}</div>
            <p className="sub" style={{ marginBottom: 4 }}>{info.wd}, {fmtDate(info.date)} — {info.phase}{info.week ? `, Week ${info.week}` : ""}</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        {info.note && <div className="flag"><Info size={16} /><span>{info.note}</span></div>}

        <div className="card card-tight" style={{ marginTop: 14 }}>
          <span className="badge" style={{ background: "#C1502E30", color: "#C1502E" }}>RUN</span>
          <div style={{ fontSize: 16, fontWeight: 600, margin: "8px 0 10px" }}>{info.run}</div>
          <button className={`btn run ${c.run ? "on" : ""}`} onClick={() => onToggle(info.day, "run")}>
            <Check size={14} /> {c.run ? "Logged" : "Mark done"}
          </button>
        </div>

        <div className="card card-tight">
          <span className="badge" style={{ background: gymMeta.color + "30", color: gymMeta.color }}>GYM</span>
          <div style={{ fontSize: 16, fontWeight: 600, margin: "8px 0 2px" }}>{gymMeta.label}</div>
          <div className="sub" style={{ marginBottom: 10 }}>{gymMeta.sub}</div>
          {info.gym !== "none" && (
            <button className={`btn ${c.lift ? "on" : ""}`} onClick={() => onToggle(info.day, "lift")}>
              <Check size={14} /> {c.lift ? "Logged" : "Mark done"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================== GYM ==============================
function GymTab() {
  const [day, setDay] = useState("push");
  const prog = GYM_PROGRAMS[day];
  return (
    <div className="section">
      <div className="h1">Gym Program</div>
      <p className="sub">Five sessions a week. Rest 60–120s between sets unless noted. Add weight whenever every rep lands with good form — that's the progressive overload building the muscle while the running builds the engine.</p>

      <div className="tabs">
        {Object.keys(GYM_PROGRAMS).map((k) => (
          <button key={k} className={`tab-chip ${day === k ? "active" : ""}`} onClick={() => setDay(k)}>
            {GYM_PROGRAMS[k].title.split(" (")[0]}
          </button>
        ))}
      </div>

      <div className="card">
        <div style={{ fontSize: 18, fontWeight: 600 }}>{prog.title}</div>
        <div className="sub" style={{ marginBottom: 12 }}>{prog.sub}</div>
        <table className="tbl">
          <thead><tr><th>Exercise</th><th>Sets x Reps</th><th>Rest</th><th>Notes</th></tr></thead>
          <tbody>
            {prog.exercises.map((ex, i) => (
              <tr key={i}>
                <td>{ex[0]}</td>
                <td className="mono-cell">{ex[1]}</td>
                <td className="mono-cell">{ex[2]}</td>
                <td className="sub" style={{ margin: 0 }}>{ex[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {prog.footnote && <div className="flag" style={{ marginTop: 14 }}><Info size={16} /><span>{prog.footnote}</span></div>}
      </div>

      <div className="h2">Two rules that matter more than the exercises</div>
      <div className="card">
        <div className="row-line"><span>1</span><span className="sub" style={{ margin: 0, flex: 1, marginLeft: 12 }}>Never lift legs heavy the day before a tempo run or the long run — Wednesday's leg session is capped at moderate on purpose.</span></div>
        <div className="row-line"><span>2</span><span className="sub" style={{ margin: 0, flex: 1, marginLeft: 12 }}>From Week 9, trim leg-day volume ~20%. In Week 13 (peak week), trim every session 30-40%. The long run gets priority.</span></div>
      </div>

      <div className="h2">Saturday &amp; Sunday</div>
      <p className="sub">Saturday evening: stretching only — no lifting, your legs just did the long run. Sunday: mobility work (hips, ankles, shoulders) plus an optional 30-minute easy walk.</p>
    </div>
  );
}

// ============================== FUEL ==============================
function FuelTab() {
  const [mealDay, setMealDay] = useState("nonveg");
  const [openRecipe, setOpenRecipe] = useState(null);

  const meals = {
    nonveg: {
      label: "Non-veg days (Mon, Thu, Fri, Sat, Sun)",
      rows: [
        ["Breakfast", "Oats cooked in milk + 2-3 whole eggs + 1 banana"],
        ["Lunch", "Rice or roti + grilled/curry chicken (150-200g) + mixed vegetables + salad"],
        ["Pre-gym snack", "Greek yogurt + 1 banana (or a small whey shake)"],
        ["Dinner", "Chicken or fish (150-200g) + rice or sweet potato + vegetables"],
        ["Post-gym (optional)", "Whey protein shake if dinner is more than ~45 min away"],
      ],
    },
    veg: {
      label: "Vegetarian, no eggs (Tue & Wed)",
      rows: [
        ["Breakfast", "Oats cooked in milk + whey or a handful of nuts + 1 banana"],
        ["Lunch", "Rice or roti + paneer/tofu or rajma-chole + mixed vegetables + curd"],
        ["Pre-gym snack", "Greek yogurt + banana, or roasted soy chunks"],
        ["Dinner", "Dal (generous portion) + paneer or tofu + roti/rice + vegetables + salad"],
      ],
    },
  };

  const recipes = [
    ["High-Protein Masala Oats", "Oats, milk, finely chopped onion/tomato, a spoon of paneer, turmeric, cumin, salt.", "Cook oats in milk on low heat; stir in sautéed onion-tomato-spice mix and crumbled paneer in the last 2 minutes."],
    ["Grilled Chicken & Rice Bowl", "Chicken breast, rice, mixed vegetables, garlic, black pepper, a little oil.", "Marinate chicken in garlic, pepper, a pinch of salt; grill or pan-sear. Serve over rice with steamed or stir-fried vegetables."],
    ["Paneer Bhurji (no egg)", "Paneer, onion, tomato, green chilli, turmeric, cumin, coriander leaves.", "Crumble paneer. Sweat onion, tomato and spices in a pan, fold in paneer for 2-3 minutes, finish with coriander."],
    ["Soy Chunk Curry", "Soy chunks (rehydrated), onion-tomato gravy, standard curry spices, rice or roti.", "Boil soy chunks 5 minutes, squeeze dry. Simmer in onion-tomato gravy with spices for 10-12 minutes; serve with rice."],
    ["Post-Run Recovery Shake", "Milk, 1 banana, 1 scoop whey, a spoon of peanut butter.", "Blend everything until smooth. Drink within an hour of a long run or a heavy lift session."],
  ];

  const grocery = {
    Proteins: ["Chicken breast", "Fish (your choice)", "Eggs", "Paneer", "Tofu", "Soy chunks", "Lentils (dal)", "Chickpeas / rajma", "Whey protein", "Greek yogurt / curd", "Milk"],
    "Carbs & Produce": ["Oats", "Rice", "Roti / atta", "Sweet potato", "Bananas", "Mixed seasonal fruit", "Mixed vegetables", "Onion, tomato, garlic, ginger", "Leafy greens"],
    "Fats & Pantry": ["Peanut butter", "Mixed nuts", "Olive oil / ghee", "Turmeric, cumin, coriander, garam masala", "Salt, black pepper", "Green chilli"],
  };

  return (
    <div className="section">
      <div className="h1">Nutrition</div>
      <p className="sub">Running most days and lifting heavy four times a week means this is not a deficit plan — a large deficit alongside this load is how you lose the muscle you're building and run on empty.</p>

      <div className="h2">Daily macro targets</div>
      <div className="grid3">
        <div className="card card-tight"><div className="mono" style={{ fontSize: 22, color: "#E0A458" }}>170-180g</div><div className="sub" style={{ margin: 0 }}>Protein — repairs muscle from lifting and running impact</div></div>
        <div className="card card-tight"><div className="mono" style={{ fontSize: 22, color: "#E0A458" }}>300-350g</div><div className="sub" style={{ margin: 0 }}>Carbs — fuels long runs & heavy lifting</div></div>
        <div className="card card-tight"><div className="mono" style={{ fontSize: 22, color: "#E0A458" }}>65-80g</div><div className="sub" style={{ margin: 0 }}>Fat — hormones, joints, satiety</div></div>
      </div>
      <p className="sub">~2,600-2,750 kcal/day on running + lifting days, toward the lower end on Sunday's rest day. Add 200-400 kcal (mostly carbs) on Saturdays once the long run passes 14-16 km.</p>

      <div className="h2">Sample meal plan</div>
      <div className="tabs">
        <button className={`tab-chip ${mealDay === "nonveg" ? "active" : ""}`} onClick={() => setMealDay("nonveg")}>Non-veg days</button>
        <button className={`tab-chip ${mealDay === "veg" ? "active" : ""}`} onClick={() => setMealDay("veg")}>Veg days (Tue/Wed)</button>
      </div>
      <div className="card">
        <div className="sub" style={{ marginTop: 0 }}>{meals[mealDay].label}</div>
        {meals[mealDay].rows.map((r, i) => (
          <div className="row-line" key={i}><strong style={{ fontSize: 13, width: 130, flexShrink: 0 }}>{r[0]}</strong><span className="sub" style={{ margin: 0, flex: 1 }}>{r[1]}</span></div>
        ))}
        {mealDay === "veg" && (
          <div className="flag" style={{ marginTop: 12 }}>
            <Info size={16} />
            <span>Hitting 170-180g protein without eggs or meat: paneer ~18g/100g, tofu ~12g/100g, rajma/chole ~15g/cup, milk ~8g/cup, whey ~24g/scoop, Greek yogurt ~17g/cup. Two solid meals plus one whey shake comfortably covers it.</span>
          </div>
        )}
      </div>

      <div className="h2">Five recipes that make this easy</div>
      {recipes.map((r, i) => (
        <div className="card card-tight" key={i} onClick={() => setOpenRecipe(openRecipe === i ? null : i)} style={{ cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: 14 }}>{r[0]}</strong>
            <ChevronRight size={16} style={{ transform: openRecipe === i ? "rotate(90deg)" : "none", color: "var(--ash)" }} />
          </div>
          {openRecipe === i && (
            <div style={{ marginTop: 10 }}>
              <div className="sub" style={{ marginBottom: 6 }}><strong style={{ color: "var(--chalk)" }}>Ingredients: </strong>{r[1]}</div>
              <div className="sub" style={{ margin: 0 }}><strong style={{ color: "var(--chalk)" }}>Method: </strong>{r[2]}</div>
            </div>
          )}
        </div>
      ))}

      <div className="h2">Weekly grocery list</div>
      <div className="grid3">
        {Object.entries(grocery).map(([cat, items]) => (
          <div className="card card-tight" key={cat}>
            <strong style={{ fontSize: 12.5, color: "var(--flare)" }}>{cat}</strong>
            <div className="sub" style={{ marginTop: 6, lineHeight: 1.7 }}>{items.join(" · ")}</div>
          </div>
        ))}
      </div>

      <div className="h2">Hydration</div>
      <div className="card">
        <div className="row-line"><Droplets size={16} style={{ color: "var(--slate)" }} /><span className="sub" style={{ margin: 0, flex: 1, marginLeft: 10 }}>Baseline: 3-4 litres a day, sipped steadily.</span></div>
        <div className="row-line"><Droplets size={16} style={{ color: "var(--slate)" }} /><span className="sub" style={{ margin: 0, flex: 1, marginLeft: 10 }}>Long run / hot weather: +500ml-1L; carry water past ~9-10 km.</span></div>
        <div className="row-line"><Droplets size={16} style={{ color: "var(--slate)" }} /><span className="sub" style={{ margin: 0, flex: 1, marginLeft: 10 }}>Runs over 60 min: add electrolytes — water alone isn't enough.</span></div>
        <div className="row-line"><Droplets size={16} style={{ color: "var(--slate)" }} /><span className="sub" style={{ margin: 0, flex: 1, marginLeft: 10 }}>Self-check: pale yellow urine = well hydrated; dark yellow = drink more.</span></div>
      </div>
    </div>
  );
}

// ============================== RECOVER ==============================
function RecoverTab() {
  const injuries = [
    ["Pain on the outer shin during/after running", "Shin splints — usually too much, too soon"],
    ["Dull ache around/behind the kneecap", "Runner's knee — often linked to weak hips/glutes"],
    ["Sharp pain on the outer knee/thigh", "IT band irritation"],
    ["Stabbing heel pain, worst with first steps in the morning", "Plantar fasciitis"],
    ["Pain/stiffness at the back of the ankle", "Achilles tendinitis"],
  ];
  return (
    <div className="section">
      <div className="h1">Recovery</div>

      <div className="h2">After every run (5-7 min)</div>
      <div className="card">
        {["Calf stretch against a wall — 30s each side", "Standing quad stretch — 30s each side", "Standing hamstring stretch (foot on a step) — 30s each side", "Kneeling hip-flexor stretch — 30s each side", "Figure-4 glute/IT-band stretch (lying down) — 30s each side"].map((s, i) => (
          <div className="row-line" key={i}><span className="sub" style={{ margin: 0 }}>{s}</span></div>
        ))}
      </div>

      <div className="h2">After lifting</div>
      <div className="card">
        {["Doorway chest stretch — 30s each side", "Overhead triceps stretch — 30s each side", "Cross-body shoulder stretch — 30s each side", "Lat stretch holding a rack or door frame — 30s each side"].map((s, i) => (
          <div className="row-line" key={i}><span className="sub" style={{ margin: 0 }}>{s}</span></div>
        ))}
      </div>

      <div className="h2">Foam rolling — 2-3x/week</div>
      <p className="sub">60-90 seconds each on calves, quads, IT band (outer thigh) and glutes. Firm pressure, not sharp pain.</p>

      <div className="h2">Sunday mobility flow</div>
      <div className="card">
        {["Hip circles — 10 each direction, each leg", "Ankle circles — 10 each direction, each foot", "Cat-cow — 10 slow reps", "World's greatest stretch — 5 reps each side", "Thoracic (mid-back) rotations — 10 each side"].map((s, i) => (
          <div className="row-line" key={i}><span className="sub" style={{ margin: 0 }}>{s}</span></div>
        ))}
      </div>

      <div className="h2">Injury early-warning signs</div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>Watch for</th><th>Often means</th></tr></thead>
          <tbody>{injuries.map((r, i) => (<tr key={i}><td className="sub" style={{ margin: 0 }}>{r[0]}</td><td className="sub" style={{ margin: 0 }}>{r[1]}</td></tr>))}</tbody>
        </table>
      </div>

      <div className="flag red">
        <AlertTriangle size={16} />
        <span><strong>Red flags — stop and see a doctor or physio:</strong> sharp, one-sided, or gait-changing pain; pain that worsens during a run instead of easing; any pain not improved after 3-4 days rest; visible swelling.</span>
      </div>

      <div className="h2">Sleep</div>
      <div className="card" style={{ display: "flex", gap: 12 }}>
        <Moon size={22} style={{ color: "var(--slate)", flexShrink: 0, marginTop: 2 }} />
        <p className="sub" style={{ margin: 0 }}>7.5-8 hours, every night, is doing as much work as any single session in this plan — it's when muscle repairs and a lot of injury risk gets decided. Screens off 9:45 PM, lights out 10:00 PM, especially the night before Tuesday intervals and Saturday's long run.</p>
      </div>
    </div>
  );
}

// ============================== RACE DAY ==============================
function RaceTab() {
  return (
    <div className="section">
      <div className="h1">Race-Day Strategy</div>

      <div className="h2">The Week-13 decision point</div>
      <p className="sub">After the 26 km long run in Week 13, answer honestly:</p>
      <div className="card">
        {["Did it feel hard but manageable, or did it hurt?", "Were you back to normal walking/movement within 2-3 days?", "Did the rest of that week's training go ahead as planned?"].map((q, i) => (
          <div className="row-line" key={i}><span className="mono" style={{ color: "var(--flare)" }}>{i + 1}</span><span className="sub" style={{ margin: 0, marginLeft: 12, flex: 1 }}>{q}</span></div>
        ))}
      </div>
      <p className="sub">Yes to all three → the full marathon with a run/walk strategy is reasonable. Any concerning answer, especially ongoing pain → shift to the half marathon this cycle. That's not a failure — a half marathon from a 2 km start in 100 days, with visible muscle gained, is a genuinely strong result.</p>
      <div className="flag"><Info size={16} /><span>Talk to a doctor or physiotherapist before race day if anything from Week 13 onward felt off. This guide can plan training; it can't examine a knee.</span></div>

      <div className="h2">Pacing</div>
      <div className="card">
        <div className="row-line"><strong style={{ width: 130, flexShrink: 0, fontSize: 13 }}>Half marathon</strong><span className="sub" style={{ margin: 0, flex: 1 }}>Start 20-30 sec/km slower than feels "right" — most first-timers go out too fast. Settle in by 3-4 km.</span></div>
        <div className="row-line"><strong style={{ width: 130, flexShrink: 0, fontSize: 13 }}>Full marathon</strong><span className="sub" style={{ margin: 0, flex: 1 }}>Start even slower. Treat the first 30 km as one steady effort, then run 8min/walk 1min for the final 12 km if needed.</span></div>
      </div>

      <div className="h2">Fuelling during the race</div>
      <div className="card">
        <div className="row-line"><span className="sub" style={{ margin: 0 }}>Half: water/electrolytes at aid stations; a gel after ~10 km if practised in training.</span></div>
        <div className="row-line"><span className="sub" style={{ margin: 0 }}>Full: 30-60g carbs/hour from gels or sports drink, starting ~45-60 min in — practise on 2+ long runs beforehand.</span></div>
        <div className="row-line"><span className="sub" style={{ margin: 0 }}>Hydrate at every aid station — small sips, not gulps.</span></div>
      </div>

      <div className="h2">Morning-of checklist</div>
      <div className="card">
        {["Lay out kit, bib, and fuel the night before.", "Eat a familiar carb-heavy breakfast 2-3 hours before the start.", "Arrive with time for a 10-min easy jog + dynamic stretches.", "Anti-chafe balm on underarms, inner thighs, anywhere kit has rubbed.", "Watch/phone charged, route/aid-station plan reviewed."].map((s, i) => (
          <div className="row-line" key={i}><span className="sub" style={{ margin: 0 }}>{s}</span></div>
        ))}
      </div>

      <div className="flag">
        <Trophy size={16} />
        <span>You will have done 99 days of work before the gun even goes off. Whatever happens on the day, that part is already a win.</span>
      </div>
    </div>
  );
}

// ============================== TRACKERS / LOG ==============================
function LogTab(props) {
  const [sub, setSub] = useState("weight");
  const SUBS = [
    { id: "weight", label: "Weight" },
    { id: "pace", label: "Pace" },
    { id: "pr", label: "Gym PRs" },
    { id: "habit", label: "Habits" },
    { id: "milestones", label: "Milestones" },
  ];
  return (
    <div className="section">
      <div className="h1">Trackers</div>
      <p className="sub">Trends matter far more than any single number. Everything here saves automatically.</p>
      <div className="tabs">
        {SUBS.map((s) => (
          <button key={s.id} className={`tab-chip ${sub === s.id ? "active" : ""}`} onClick={() => setSub(s.id)}>{s.label}</button>
        ))}
      </div>
      {sub === "weight" && <WeightLog {...props} />}
      {sub === "pace" && <PaceLog {...props} />}
      {sub === "pr" && <PrTracker {...props} />}
      {sub === "habit" && <HabitTracker {...props} />}
      {sub === "milestones" && <Milestones {...props} />}
    </div>
  );
}

function WeightLog({ weightLog, setWeightLog }) {
  const [form, setForm] = useState({ week: "", weight: "", bodyFat: "", notes: "" });
  function add() {
    if (!form.week || !form.weight) return;
    const next = [...weightLog, { ...form }];
    setWeightLog(next);
    saveKey("shivam100:weightLog", next);
    setForm({ week: "", weight: "", bodyFat: "", notes: "" });
  }
  function remove(i) {
    const next = weightLog.filter((_, idx) => idx !== i);
    setWeightLog(next);
    saveKey("shivam100:weightLog", next);
  }
  return (
    <div>
      <p className="sub">Weigh in once a week, same day/time, ideally Sunday morning, fasted. Starting point: 83 kg, ~23.5% body fat. Target: 80-82 kg, ~18-20%.</p>
      <div className="card">
        <div className="grid2" style={{ marginBottom: 8 }}>
          <input className="input" placeholder="Week (e.g. 1)" value={form.week} onChange={(e) => setForm({ ...form, week: e.target.value })} />
          <input className="input" placeholder="Weight (kg)" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
        </div>
        <div className="grid2" style={{ marginBottom: 8 }}>
          <input className="input" placeholder="Body fat %" value={form.bodyFat} onChange={(e) => setForm({ ...form, bodyFat: e.target.value })} />
          <input className="input" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <button className="btn on" onClick={add}><Plus size={14} /> Add entry</button>
      </div>
      {weightLog.length > 0 && (
        <div className="card">
          <table className="tbl">
            <thead><tr><th>Week</th><th>Weight</th><th>BF%</th><th>Notes</th><th></th></tr></thead>
            <tbody>
              {weightLog.map((r, i) => (
                <tr key={i}>
                  <td className="mono-cell">W{r.week}</td>
                  <td className="mono-cell">{r.weight}kg</td>
                  <td className="mono-cell">{r.bodyFat || "—"}</td>
                  <td className="sub" style={{ margin: 0 }}>{r.notes}</td>
                  <td><button className="btn-icon" onClick={() => remove(i)}><Trash2 size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PaceLog({ paceLog, setPaceLog }) {
  const [form, setForm] = useState({ date: "", type: "", distance: "", time: "", rpe: "" });
  function add() {
    if (!form.date || !form.distance) return;
    const next = [...paceLog, { ...form }];
    setPaceLog(next);
    saveKey("shivam100:paceLog", next);
    setForm({ date: "", type: "", distance: "", time: "", rpe: "" });
  }
  function remove(i) {
    const next = paceLog.filter((_, idx) => idx !== i);
    setPaceLog(next);
    saveKey("shivam100:paceLog", next);
  }
  return (
    <div>
      <p className="sub">Log every Tuesday interval session and every Saturday long run at minimum — that's enough to see real progress.</p>
      <div className="card">
        <div className="grid2" style={{ marginBottom: 8 }}>
          <input className="input" placeholder="Date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input className="input" placeholder="Run type (long/tempo/interval)" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
        </div>
        <div className="grid3" style={{ marginBottom: 8 }}>
          <input className="input" placeholder="Distance (km)" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} />
          <input className="input" placeholder="Time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          <input className="input" placeholder="RPE 1-10" value={form.rpe} onChange={(e) => setForm({ ...form, rpe: e.target.value })} />
        </div>
        <button className="btn on" onClick={add}><Plus size={14} /> Add entry</button>
      </div>
      {paceLog.length > 0 && (
        <div className="card">
          <table className="tbl">
            <thead><tr><th>Date</th><th>Type</th><th>Dist</th><th>Time</th><th>RPE</th><th></th></tr></thead>
            <tbody>
              {paceLog.map((r, i) => (
                <tr key={i}>
                  <td className="mono-cell">{r.date}</td>
                  <td className="sub" style={{ margin: 0 }}>{r.type}</td>
                  <td className="mono-cell">{r.distance}km</td>
                  <td className="mono-cell">{r.time}</td>
                  <td className="mono-cell">{r.rpe}</td>
                  <td><button className="btn-icon" onClick={() => remove(i)}><Trash2 size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PrTracker({ prTracker, setPrTracker }) {
  function update(lift, checkpoint, value) {
    const next = { ...prTracker, [lift]: { ...prTracker[lift], [checkpoint]: value } };
    setPrTracker(next);
    saveKey("shivam100:prTracker", next);
  }
  return (
    <div>
      <p className="sub">Record best working weight x reps at each checkpoint — the goal is for every column to beat the last.</p>
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead><tr><th>Lift</th>{CHECKPOINTS.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {LIFTS.map((lift) => (
              <tr key={lift}>
                <td style={{ fontSize: 13 }}>{lift}</td>
                {CHECKPOINTS.map((cp) => (
                  <td key={cp}>
                    <input
                      className="input" style={{ minWidth: 80 }}
                      placeholder="—"
                      value={prTracker[lift]?.[cp] || ""}
                      onChange={(e) => update(lift, cp, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HabitTracker({ habitWeek, setHabitWeek, habitTracker, setHabitTracker }) {
  function toggle(row, day) {
    const wk = habitTracker[habitWeek] || {};
    const rowData = wk[row] || {};
    const next = { ...habitTracker, [habitWeek]: { ...wk, [row]: { ...rowData, [day]: !rowData[day] } } };
    setHabitTracker(next);
    saveKey("shivam100:habitTracker", next);
  }
  const wk = habitTracker[habitWeek] || {};
  return (
    <div>
      <p className="sub">Reuse this same grid every week. Tick off each day.</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <button className="btn-icon" onClick={() => setHabitWeek(Math.max(1, habitWeek - 1))}><ChevronLeft size={15} /></button>
        <span className="mono" style={{ fontSize: 14 }}>Week {habitWeek} of 15</span>
        <button className="btn-icon" onClick={() => setHabitWeek(Math.min(15, habitWeek + 1))}><ChevronRight size={15} /></button>
      </div>
      <div className="card">
        <div className="habit-grid" style={{ marginBottom: 6 }}>
          <div />
          {WEEKDAYS.map((d) => <div className="hh" key={d}>{d}</div>)}
        </div>
        {HABIT_ROWS.map((row) => (
          <div className="habit-grid" key={row} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12.5 }}>{row}</div>
            {WEEKDAYS.map((d) => (
              <div key={d} className={`chk ${wk[row]?.[d] ? "on" : ""}`} onClick={() => toggle(row, d)}>
                {wk[row]?.[d] && <Check size={13} color="#15140F" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Milestones({ milestones, setMilestones }) {
  const CHECKINS = [
    { id: "day25", label: "Day 25 — One Quarter Down", date: "23 Jul 2026", note: "Foundation and base-building are done. The hardest adaptation — turning into someone who runs regularly — is largely behind you." },
    { id: "day50", label: "Day 50 — Halfway", date: "17 Aug 2026", note: "Deep into the endurance phase. Long runs are now genuinely long. This is usually where motivation dips hardest." },
    { id: "day75", label: "Day 75 — Three Quarters", date: "11 Sep 2026", note: "In or just past the Distance phase, closing in on the Week-13 decision point. Trust the taper that follows." },
    { id: "day100", label: "Day 100 — Race Day", date: "6 Oct 2026", note: "100 days ago: 2 km with real effort. Whatever the official result today, that gap is the real achievement." },
  ];
  function update(id, field, value) {
    const next = { ...milestones, [id]: { ...milestones[id], [field]: value } };
    setMilestones(next);
    saveKey("shivam100:milestones", next);
  }
  return (
    <div>
      {CHECKINS.map((ci) => {
        const m = milestones[ci.id] || {};
        return (
          <div className="card" key={ci.id}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{ci.label}</div>
            <div className="sub" style={{ marginTop: 2 }}>{ci.date}</div>
            <div className="grid2" style={{ marginBottom: 8 }}>
              <input className="input" placeholder="Weight (kg)" value={m.weight || ""} onChange={(e) => update(ci.id, "weight", e.target.value)} />
              <input className="input" placeholder="Body fat %" value={m.bodyFat || ""} onChange={(e) => update(ci.id, "bodyFat", e.target.value)} />
            </div>
            <div className="grid2" style={{ marginBottom: 8 }}>
              <input className="input" placeholder="Longest run to date" value={m.longestRun || ""} onChange={(e) => update(ci.id, "longestRun", e.target.value)} />
              <input className="input" placeholder="Best bench / squat" value={m.bestLift || ""} onChange={(e) => update(ci.id, "bestLift", e.target.value)} />
            </div>
            <textarea className="input" placeholder="How do you feel — physically and mentally?" value={m.feel || ""} onChange={(e) => update(ci.id, "feel", e.target.value)} style={{ marginBottom: 8 }} />
            <div className="flag"><Info size={16} /><span>{ci.note}</span></div>
          </div>
        );
      })}
    </div>
  );
}
