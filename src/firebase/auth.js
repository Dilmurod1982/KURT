import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { auth, db, googleProvider, microsoftProvider } from "./config";


export function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function loginWithMicrosoft() {
  return signInWithPopup(auth, microsoftProvider);
}

export function logout() {
  return signOut(auth);
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// Проверить, существует ли профиль игрока в Firestore
export async function getPlayerProfile(uid) {
  const snap = await getDoc(doc(db, "players", uid));
  return snap.exists() ? snap.data() : null;
}

// Проверить уникальность ника через отдельную коллекцию usernames
// (Firestore не умеет проверять уникальность поля в security rules без доп. коллекции [citation:6][citation:9])
export async function isUsernameTaken(username) {
  const snap = await getDoc(doc(db, "usernames", username.toLowerCase()));
  return snap.exists();
}

// Создать игрока
export async function createPlayerProfile(uid, { username, birthDate, country }) {
  const lower = username.toLowerCase();

  // 1. Резервируем ник в коллекции usernames
  await setDoc(doc(db, "usernames", lower), { uid });

  // 2. Создаём профиль
  await setDoc(doc(db, "players", uid), {
    username,
    usernameLower: lower,
    birthDate,
    country,
    createdAt: serverTimestamp(),
    stats: {
      games: 0,
      wins: 0,
      kurt: 0,
      kotyrKurt: 0,
    },
  });
}

export async function saveGameResult(uid, { isWin, isKurt, isKotyrKurt }) {
    const playerRef = doc(db, "players", uid);
    const updates = {
      "stats.games": increment(1),
    };
    if (isWin) updates["stats.wins"] = increment(1);
    if (isKurt) updates["stats.kurt"] = increment(1);
    if (isKotyrKurt) updates["stats.kotyrKurt"] = increment(1);
  
    await updateDoc(playerRef, updates);
  }