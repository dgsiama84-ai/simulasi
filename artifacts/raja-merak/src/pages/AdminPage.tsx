import { useState } from "react";
import { useGameStore } from "@/hooks/use-game-store";
import { MobileContainer } from "@/components/MobileContainer";
import { formatRp } from "@/lib/utils";
import { useLocation } from "wouter";
import { ArrowLeft, Save, Trash2, Users, Settings2, ShieldCheck } from "lucide-react";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { session, users, config, updateConfig, deleteUser, logout } = useGameStore();
  
  // Local form state
  const [formData, setFormData] = useState(config);
  const [newPass, setNewPass] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  if (!session?.isAdmin) {
    setLocation("/");
    return null;
  }

  const handleSave = () => {
    const updates: any = { ...formData };
    if (newPass) updates.adminPass = newPass;
    updateConfig(updates);
    
    setNewPass("");
    setSavedMsg("✅ Pengaturan berhasil disimpan!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const usersList = Object.entries(users);

  return (
    <MobileContainer className="bg-[#0b090a] overflow-y-auto">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-900 to-[#0b090a] border-b border-blue-500/20 px-4 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2 text-blue-400">
          <ShieldCheck className="w-5 h-5" />
          <h1 className="font-display font-bold text-lg tracking-wider">ADMIN PANEL</h1>
        </div>
        <button 
          onClick={() => setLocation("/game")}
          className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Ke Game
        </button>
      </header>

      <div className="p-4 space-y-6 pb-12">
        
        {/* User List */}
        <section className="bg-card border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm tracking-wide">Daftar Pemain</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/40 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Saldo</th>
                  <th className="px-4 py-3 font-semibold">Main</th>
                  <th className="px-4 py-3 font-semibold">WR</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground italic">
                      Belum ada pemain terdaftar.
                    </td>
                  </tr>
                ) : (
                  usersList.map(([username, data]) => {
                    const wr = data.total > 0 ? Math.round((data.menang / data.total) * 100) : 0;
                    return (
                      <tr key={username} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">{username}</td>
                        <td className="px-4 py-3 text-primary">{formatRp(data.saldo)}</td>
                        <td className="px-4 py-3 text-white/70">{data.total}</td>
                        <td className="px-4 py-3 text-blue-400">{wr}%</td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => {
                              if(window.confirm(`Hapus akun "${username}"?`)) deleteUser(username);
                            }}
                            className="p-1.5 text-red-400 hover:bg-red-400/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Game Config Form */}
        <section className="bg-card border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm tracking-wide">Pengaturan Mesin</h3>
          </div>
          <div className="p-4 space-y-4">
            
            <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg border border-white/5">
              <label className="text-sm text-white/80 font-medium">Saldo Awal Baru</label>
              <input type="number" 
                value={formData.saldoAwal} 
                onChange={e => setFormData(p => ({...p, saldoAwal: parseInt(e.target.value)||0}))}
                className="w-24 bg-card border border-white/10 rounded px-2 py-1 text-right text-primary focus:outline-none focus:border-primary" 
              />
            </div>

            <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg border border-white/5">
              <label className="text-sm text-white/80 font-medium">Target Kalah (Auto Stop)</label>
              <input type="number" 
                value={formData.targetKalah} 
                onChange={e => setFormData(p => ({...p, targetKalah: parseInt(e.target.value)||0}))}
                className="w-24 bg-card border border-white/10 rounded px-2 py-1 text-right text-white focus:outline-none focus:border-primary" 
              />
            </div>

            <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg border border-white/5">
              <label className="text-sm text-white/80 font-medium">Peluang Jackpot (%)</label>
              <input type="number" min="0" max="100"
                value={formData.pctJackpot} 
                onChange={e => setFormData(p => ({...p, pctJackpot: parseFloat(e.target.value)||0}))}
                className="w-24 bg-card border border-white/10 rounded px-2 py-1 text-right text-yellow-400 focus:outline-none focus:border-primary" 
              />
            </div>

            <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg border border-white/5">
              <label className="text-sm text-white/80 font-medium">Peluang Menang (%)</label>
              <input type="number" min="0" max="100"
                value={formData.pctMenang} 
                onChange={e => setFormData(p => ({...p, pctMenang: parseFloat(e.target.value)||0}))}
                className="w-24 bg-card border border-white/10 rounded px-2 py-1 text-right text-green-400 focus:outline-none focus:border-primary" 
              />
            </div>

            <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg border border-white/5">
              <label className="text-sm text-white/80 font-medium">Pengali Jackpot (x)</label>
              <input type="number" min="2"
                value={formData.multiJackpot} 
                onChange={e => setFormData(p => ({...p, multiJackpot: parseFloat(e.target.value)||0}))}
                className="w-24 bg-card border border-white/10 rounded px-2 py-1 text-right text-white focus:outline-none focus:border-primary" 
              />
            </div>

            <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg border border-white/5">
              <label className="text-sm text-white/80 font-medium">Animasi Hampir Menang (%)</label>
              <input type="number" min="0" max="100"
                value={formData.pctHampir} 
                onChange={e => setFormData(p => ({...p, pctHampir: parseFloat(e.target.value)||0}))}
                className="w-24 bg-card border border-white/10 rounded px-2 py-1 text-right text-orange-400 focus:outline-none focus:border-primary" 
              />
            </div>

          </div>
        </section>

        {/* Admin Password */}
        <section className="bg-card border border-white/10 rounded-xl overflow-hidden shadow-xl">
           <div className="p-4 flex justify-between items-center gap-4">
              <label className="text-sm text-white/80 font-medium whitespace-nowrap">Ganti Password Admin</label>
              <input type="password" 
                placeholder="(Kosongkan jika tidak)"
                value={newPass} 
                onChange={e => setNewPass(e.target.value)}
                className="w-full max-w-[180px] bg-black/50 border border-white/10 rounded-md px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary" 
              />
           </div>
        </section>

        <button 
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg active:scale-[0.98] transition-all"
        >
          <Save className="w-5 h-5" /> SIMPAN PENGATURAN
        </button>

        {savedMsg && (
          <p className="text-center text-green-400 font-bold animate-in fade-in slide-in-from-bottom-2">{savedMsg}</p>
        )}

        <div className="pt-4 flex justify-center">
          <button 
            onClick={() => { logout(); setLocation("/"); }}
            className="text-sm text-muted-foreground hover:text-white underline underline-offset-4"
          >
            Logout Admin
          </button>
        </div>

      </div>
    </MobileContainer>
  );
}
