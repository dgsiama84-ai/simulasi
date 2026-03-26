import { useState } from "react";
import { useGameStore } from "@/hooks/use-game-store";
import { MobileContainer } from "@/components/MobileContainer";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, User, KeyRound, Sparkles } from "lucide-react";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pass2, setPass2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const { login, register } = useGameStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = login(username, password);
    if (!res.success && res.msg) setError(res.msg);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== pass2) {
      setError("❌ Password tidak cocok.");
      return;
    }
    const res = register(username, password);
    if (res.success) {
      setSuccess("✅ Akun berhasil dibuat! Silakan login.");
      setUsername("");
      setPassword("");
      setPass2("");
      setTimeout(() => {
        setTab("login");
        setSuccess("");
      }, 1500);
    } else if (res.msg) {
      setError(res.msg);
    }
  };

  return (
    <MobileContainer className="justify-center items-center p-6 bg-[url('/images/hero-bg.png')] bg-cover bg-center bg-no-repeat before:content-[''] before:absolute before:inset-0 before:bg-black/80 before:z-0">
      
      <div className="w-full max-w-sm z-10 flex flex-col items-center">
        {/* Logo Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black text-gradient-gold drop-shadow-lg mb-2 font-display">
            RAJA MERAK
          </h1>
          <p className="text-primary/80 font-semibold tracking-widest text-sm uppercase flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Simulasi Edukasi
            <Sparkles className="w-4 h-4" />
          </p>
        </motion.div>

        {/* Education Warning */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-accent/20 border border-accent/40 rounded-xl p-3 mb-8 w-full flex items-start gap-3 backdrop-blur-md"
        >
          <ShieldAlert className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-accent-foreground/90 leading-relaxed">
            <strong className="text-white block mb-0.5">PERHATIAN:</strong>
            Ini adalah aplikasi simulasi murni untuk edukasi probabilitas. Tidak menggunakan uang nyata. Data disimpan di perangkat lokal.
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          {/* Tabs */}
          <div className="flex rounded-lg bg-black/50 p-1 mb-6 border border-white/5">
            <button
              onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${
                tab === "login" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-white"
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${
                tab === "register" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-white"
              }`}
            >
              DAFTAR
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={tab}
              initial={{ opacity: 0, x: tab === 'login' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === 'login' ? 10 : -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={tab === "login" ? handleLogin : handleRegister}
              className="space-y-4"
            >
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                {tab === "register" && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Ulangi Password"
                      value={pass2}
                      onChange={(e) => setPass2(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                )}
              </div>

              {error && <p className="text-destructive text-sm font-semibold mt-2 text-center animate-in fade-in">{error}</p>}
              {success && <p className="text-green-400 text-sm font-semibold mt-2 text-center animate-in fade-in">{success}</p>}

              <button
                type="submit"
                className="w-full mt-6 py-3.5 rounded-xl font-black text-lg bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 text-black shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_25px_rgba(255,215,0,0.5)] active:scale-[0.98] transition-all"
              >
                {tab === "login" ? "MASUK SEKARANG" : "BUAT AKUN"}
              </button>
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>
    </MobileContainer>
  );
}
