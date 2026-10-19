import { useState } from "react";
import { isUsernameTaken, createPlayerProfile } from "../firebase/auth";
import { useAuthStore } from "../store/useAuthStore";

const COUNTRIES = [
  "Uzbekistan",
  "Russia",
  "United States",
  "United Kingdom",
  "France",
  "Germany",
  "China",
  "Japan",
  "India",
  "Brazil",
  "Turkey",
  "Kazakhstan",
];

export default function CreatePlayer() {
  const { user, setProfile } = useAuthStore();
  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [country, setCountry] = useState("Uzbekistan");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    // Только латиница, 3-16 символов
    if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) {
      setError("Username: 3-16 chars, Latin letters, digits, underscore only");
      return;
    }
    if (!birthDate) {
      setError("Select birth date");
      return;
    }
    setBusy(true);
    try {
      const taken = await isUsernameTaken(username);
      if (taken) {
        setError("Username already taken");
        setBusy(false);
        return;
      }
      await createPlayerProfile(user.uid, { username, birthDate, country });
      const profile = {
        username,
        birthDate,
        country,
        stats: { games: 0, wins: 0, kurt: 0, kotyrKurt: 0 },
      };
      setProfile(profile);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 text-black dark:text-white p-6 rounded-2xl w-96">
        <h3 className="text-xl font-bold mb-4">Create your player</h3>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <label className="block text-sm mb-1">Username (Latin only)</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded border dark:bg-slate-700"
          placeholder="e.g. Sardor_99"
        />
        <label className="block text-sm mb-1">Birth date</label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded border dark:bg-slate-700"
        />
        <label className="block text-sm mb-1">Country</label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded border dark:bg-slate-700"
        >
          {COUNTRIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          disabled={busy}
          onClick={submit}
          className="w-full py-2 rounded bg-gold text-black font-bold disabled:opacity-50"
        >
          Create Player
        </button>
      </div>
    </div>
  );
}
