import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useLocalStorage, useSessionStorage } from "./use-local-storage";

export type UserData = {
  pass: string;
  saldo: number;
  total: number;
  menang: number;
  riwayat: string[];
  kalahCount: number;
  createdAt: number;
};

export type GameConfig = {
  adminPass: string;
  saldoAwal: number;
  targetKalah: number;
  pctJackpot: number;
  pctMenang: number;
  multiJackpot: number;
  pctHampir: number;
};

type SessionData = {
  isAdmin: boolean;
  username?: string | null;
} | null;

const DEFAULT_CONFIG: GameConfig = {
  adminPass: 'admin123',
  saldoAwal: 100000,
  targetKalah: 20,
  pctJackpot: 8,
  pctMenang: 30,
  multiJackpot: 5,
  pctHampir: 45
};

type GameStoreContextType = {
  // Config
  config: GameConfig;
  updateConfig: (newCfg: Partial<GameConfig>) => void;
  // Auth
  session: SessionData;
  users: Record<string, UserData>;
  login: (username: string, pass: string) => { success: boolean; msg?: string };
  register: (username: string, pass: string) => { success: boolean; msg?: string };
  logout: () => void;
  deleteUser: (username: string) => void;
  // Current User State
  currentUserData: UserData | null;
  updateCurrentUserData: (updates: Partial<UserData>) => void;
  resetUserGame: () => void;
};

const GameStoreContext = createContext<GameStoreContextType | null>(null);

export function GameStoreProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useLocalStorage<GameConfig>('rm_config', DEFAULT_CONFIG);
  const [users, setUsers] = useLocalStorage<Record<string, UserData>>('rm_users', {});
  const [session, setSession, removeSession] = useSessionStorage<SessionData>('rm_session', null);
  
  // Ephemeral admin state so admin can test the game without saving to DB
  const [adminTempState, setAdminTempState] = useState<UserData | null>(null);

  // Initialize admin temp state once
  useEffect(() => {
    if (session?.isAdmin && !adminTempState) {
      setAdminTempState({
        pass: '',
        saldo: config.saldoAwal,
        total: 0,
        menang: 0,
        riwayat: [],
        kalahCount: 0,
        createdAt: Date.now()
      });
    }
  }, [session, config.saldoAwal, adminTempState]);

  const updateConfig = (newCfg: Partial<GameConfig>) => {
    setConfig((prev) => ({ ...prev, ...newCfg }));
  };

  const login = (username: string, pass: string) => {
    const un = username.trim().toLowerCase();
    if (!un || !pass) return { success: false, msg: "Isi username & password." };

    if (un === 'admin' && pass === config.adminPass) {
      setSession({ isAdmin: true, username: '__admin__' });
      return { success: true };
    }

    const u = users[un];
    if (!u) return { success: false, msg: "❌ Username tidak ditemukan." };
    if (u.pass !== btoa(pass)) return { success: false, msg: "❌ Password salah." };

    setSession({ isAdmin: false, username: un });
    return { success: true };
  };

  const register = (username: string, pass: string) => {
    const un = username.trim().toLowerCase();
    if (un.length < 3) return { success: false, msg: "❌ Username min 3 karakter." };
    if (!/^[a-z0-9_]+$/.test(un)) return { success: false, msg: "❌ Hanya huruf kecil, angka, underscore." };
    if (un === 'admin') return { success: false, msg: "❌ Username tidak tersedia." };
    if (pass.length < 4) return { success: false, msg: "❌ Password min 4 karakter." };
    if (users[un]) return { success: false, msg: "❌ Username sudah dipakai." };

    const newUser: UserData = {
      pass: btoa(pass),
      saldo: config.saldoAwal,
      total: 0,
      menang: 0,
      riwayat: [],
      kalahCount: 0,
      createdAt: Date.now()
    };

    setUsers(prev => ({ ...prev, [un]: newUser }));
    return { success: true };
  };

  const logout = () => {
    removeSession();
  };

  const deleteUser = (username: string) => {
    setUsers(prev => {
      const copy = { ...prev };
      delete copy[username];
      return copy;
    });
  };

  let currentUserData: UserData | null = null;
  if (session?.isAdmin) {
    currentUserData = adminTempState;
  } else if (session?.username) {
    currentUserData = users[session.username] || null;
  }

  const updateCurrentUserData = (updates: Partial<UserData>) => {
    if (session?.isAdmin) {
      setAdminTempState(prev => prev ? { ...prev, ...updates } : null);
    } else if (session?.username) {
      const un = session.username;
      setUsers(prev => ({
        ...prev,
        [un]: { ...prev[un], ...updates }
      }));
    }
  };

  const resetUserGame = () => {
    updateCurrentUserData({
      saldo: config.saldoAwal,
      total: 0,
      menang: 0,
      riwayat: [],
      kalahCount: 0
    });
  };

  return (
    <GameStoreContext.Provider value={{
      config, updateConfig,
      session, users, login, register, logout, deleteUser,
      currentUserData, updateCurrentUserData, resetUserGame
    }}>
      {children}
    </GameStoreContext.Provider>
  );
}

export function useGameStore() {
  const context = useContext(GameStoreContext);
  if (!context) throw new Error("useGameStore must be used within GameStoreProvider");
  return context;
}
