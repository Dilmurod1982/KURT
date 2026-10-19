import { useState } from "react";
import { loginWithGoogle, loginWithMicrosoft } from "../firebase/auth";

export default function LoginModal({ onClose }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const tryLogin = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      onClose();
    } catch (e) {
      setError(e.code || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 text-black dark:text-white p-6 rounded-2xl w-80">
        <h3 className="text-xl font-bold mb-4">Sign in</h3>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button
          disabled={busy}
          onClick={() => tryLogin(loginWithGoogle)}
          className="w-full py-2 mb-2 rounded bg-red-500 text-white font-semibold disabled:opacity-50"
        >
          Continue with Google
        </button>
        <button
          disabled={busy}
          onClick={() => tryLogin(loginWithMicrosoft)}
          className="w-full py-2 mb-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-50"
        >
          Continue with Microsoft
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 mt-2 rounded border border-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
