import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, CircleUserRound, LogOut, Moon, RotateCcw, Settings, Sun, Trophy, Users, X } from "lucide-react";
import { chores, eligibleRoommates, roommates } from "./data";

const STORAGE_KEYS = {
  currentUser: "house-rules-current-user",
  completions: "house-rules-completions",
  theme: "house-rules-theme"
};

function getMonday(date = new Date()) {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
  result.setHours(0, 0, 0, 0);
  return result;
}

function getWeekId(date = new Date()) {
  return getMonday(date).toISOString().split("T")[0];
}

function getWeekNumber() {
  const start = new Date(2026, 0, 5);
  const current = getMonday(new Date());
  const difference = current.getTime() - start.getTime();
  const weeks = Math.floor(difference / (7 * 24 * 60 * 60 * 1000));
  return ((weeks % 12) + 12) % 12;
}

function createAssignments() {
  const week = getWeekNumber();
  const assignments = {};
  chores.forEach((chore, choreIndex) => {
    const eligible = eligibleRoommates[chore.id];
    assignments[chore.id] = eligible[(week + choreIndex) % eligible.length];
  });
  return assignments;
}

function getStoredJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem(STORAGE_KEYS.currentUser));
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.theme) || "light");
  const [completions, setCompletions] = useState(() => getStoredJSON(STORAGE_KEYS.completions, {}));
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.completions, JSON.stringify(completions));
  }, [completions]);

  const currentUser = roommates.find((roommate) => roommate.id === currentUserId);

  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={(userId) => {
          localStorage.setItem(STORAGE_KEYS.currentUser, userId);
          setCurrentUserId(userId);
        }}
        theme={theme}
        setTheme={setTheme}
      />
    );
  }

  return (
    <Dashboard
      currentUser={currentUser}
      theme={theme}
      setTheme={setTheme}
      completions={completions}
      setCompletions={setCompletions}
      showSettings={showSettings}
      setShowSettings={setShowSettings}
      onLogout={() => {
        localStorage.removeItem(STORAGE_KEYS.currentUser);
        setCurrentUserId(null);
      }}
    />
  );
}

function LoginScreen({ onLogin, theme, setTheme }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const user = roommates.find(
      (roommate) =>
        roommate.username.toLowerCase() === username.trim().toLowerCase() &&
        roommate.password === password
    );

    if (!user) {
      setError("Username or password is incorrect.");
      return;
    }

    setError("");
    onLogin(user.id);
  }

  return (
    <div className="login-page">
      <button className="theme-button login-theme" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Toggle theme">
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div className="login-card">
        <div className="house-logo">🏠</div>
        <p className="eyebrow">WELCOME HOME</p>
        <h1>House Rules</h1>
        <p className="login-subtitle">Because apparently someone has to make sure everyone does their chores.</p>

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter your username" autoComplete="username" />

          <label>Password</label>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" />

          {error && <div className="error-message">{error}</div>}

          <button className="primary-button" type="submit">
            Enter the House <ChevronRight size={19} />
          </button>
        </form>

        <p className="login-footer">Four roommates. Six chores. Zero excuses.</p>
      </div>
    </div>
  );
}

function Dashboard({ currentUser, theme, setTheme, completions, setCompletions, showSettings, setShowSettings, onLogout }) {
  const assignments = useMemo(() => createAssignments(), []);
  const weekId = getWeekId();

  const myChores = chores.filter((chore) => assignments[chore.id] === currentUser.id);
  const completedCount = myChores.filter((chore) => completions[weekId]?.[chore.id]?.[currentUser.id]).length;
  const totalChores = myChores.length;
  const completionPercent = totalChores === 0 ? 0 : Math.round((completedCount / totalChores) * 100);

  function toggleCompletion(choreId) {
    setCompletions((previous) => {
      const updated = { ...previous, [weekId]: { ...(previous[weekId] || {}) } };
      if (!updated[weekId][choreId]) updated[weekId][choreId] = {};
      updated[weekId][choreId][currentUser.id] = !Boolean(updated[weekId][choreId][currentUser.id]);
      return updated;
    });
  }

  function resetCurrentWeek() {
    setCompletions((previous) => {
      const updated = { ...previous };
      delete updated[weekId];
      return updated;
    });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">🏠</div>
          <div>
            <div className="brand-name">House Rules</div>
            <div className="brand-subtitle">Roommate chore tracker</div>
          </div>
        </div>

        <div className="topbar-actions">
          <button className="icon-button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} title="Toggle theme">
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button className="icon-button" onClick={() => setShowSettings(true)} title="Settings">
            <Settings size={20} />
          </button>

          <button className="profile-button" onClick={onLogout} title="Log out">
            <CircleUserRound size={20} />
            <span>{currentUser.displayName}</span>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">THIS WEEK</p>
            <h1>Hey, {currentUser.displayName}! 👋</h1>
            <p>Here’s what you’re responsible for this week.</p>
          </div>

          <div className="week-badge">
            <span>Week of</span>
            <strong>{getMonday().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard icon={<Check size={21} />} label="Completed" value={`${completedCount}/${totalChores}`} />
          <StatCard icon={<Trophy size={21} />} label="Progress" value={`${completionPercent}%`} />
          <StatCard icon={<Users size={21} />} label="Roommates" value="4" />
        </section>

        <section className="section-heading">
          <div>
            <p className="eyebrow">YOUR CHORES</p>
            <h2>Get it done</h2>
          </div>
          <div className="progress-container">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
        </section>

        <section className="chore-grid">
          {myChores.map((chore) => {
            const completed = Boolean(completions[weekId]?.[chore.id]?.[currentUser.id]);
            return <ChoreCard key={chore.id} chore={chore} completed={completed} onToggle={() => toggleCompletion(chore.id)} />;
          })}
        </section>

        {myChores.length === 0 && (
          <div className="empty-state">
            <span>🎉</span>
            <h3>You got lucky this week!</h3>
            <p>You don't have any assigned chores.</p>
          </div>
        )}

        <section className="everyone-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE HOUSE</p>
              <h2>Everyone's chores</h2>
            </div>
          </div>

          <div className="assignment-table">
            {chores.map((chore) => {
              const assignedId = assignments[chore.id];
              const assignedUser = roommates.find((roommate) => roommate.id === assignedId);
              const completed = Boolean(completions[weekId]?.[chore.id]?.[assignedId]);

              return (
                <div className="assignment-row" key={chore.id}>
                  <div className="assignment-chore">
                    <span className="chore-emoji">{chore.emoji}</span>
                    <span>{chore.name}</span>
                  </div>

                  <div className="assignment-person">
                    <span className="avatar">{assignedUser.displayName.charAt(0)}</span>
                    <span>{assignedUser.displayName}</span>
                  </div>

                  <div className={completed ? "status completed-status" : "status pending-status"}>
                    {completed ? <><Check size={15} /> Done</> : "Not done"}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onReset={resetCurrentWeek} />}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ChoreCard({ chore, completed, onToggle }) {
  return (
    <article className={completed ? "chore-card completed" : "chore-card"}>
      <div className="chore-card-top">
        <div className="large-emoji">{chore.emoji}</div>

        <button className={completed ? "check-button checked" : "check-button"} onClick={onToggle} aria-label={completed ? `Mark ${chore.name} incomplete` : `Mark ${chore.name} complete`}>
          {completed ? <Check size={23} /> : <span />}
        </button>
      </div>

      <h3>{chore.name}</h3>
      <p>{chore.description}</p>

      <div className={completed ? "chore-status done" : "chore-status"}>
        {completed ? "✓ Completed" : "Tap the circle when you're done"}
      </div>
    </article>
  );
}

function SettingsModal({ onClose, onReset }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">HOUSE RULES</p>
            <h2>Settings</h2>
          </div>
          <button className="icon-button" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="settings-item">
          <div>
            <strong>Weekly rotation</strong>
            <p>Chores automatically rotate every Monday.</p>
          </div>
          <RotateCcw size={20} />
        </div>

        <div className="settings-item">
          <div>
            <strong>Trash restriction</strong>
            <p>King is never assigned the trash.</p>
          </div>
          <span className="restriction-badge">Protected</span>
        </div>

        <div className="settings-divider" />

        <button className="danger-button" onClick={() => { onReset(); onClose(); }}>
          <RotateCcw size={18} /> Reset this week's progress
        </button>

        <button className="secondary-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}