import React, { useState } from "react";
import {
  Gamepad2,
  ChevronRight,
  Lock,
  Unlock,
  Cloud,
  X,
  Shield,
  Home,
  Edit3,
} from "lucide-react";

// ============================================================================
// IMPORTAÇÃO DOS MÓDULOS E HUBS
// ============================================================================
import FC26App from "./FC26App";
import KingsLeagueApp from "./KingsLeagueApp";
import HubFC26 from "./hub";
import HubKL from "./hub kl";

const SoccerBallIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 12l3.5 2 1.5-3.5-2.5-3.5h-5l-2.5 3.5 1.5 3.5z"></path>
    <path d="M12 12v10M15.5 14l4.5 2M8.5 14l-4.5 2M9.5 7l-4.5-2M14.5 7l4.5-2"></path>
  </svg>
);

export default function App() {
  // --- Roteador de Telas ---
  // O estado agora pode ser: null | "hub_fc26" | "fc26" | "hub_kl" | "futsal_masc"
  const [activeModule, setActiveModule] = useState<string | null>(null);

  // --- Estados de Admin do Lobby ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [showWaitPopup, setShowWaitPopup] = useState(false);
  const [klConfig, setKlConfig] = useState<any>(null);
  const [fc26Config, setFc26Config] = useState<any>(null);

  const handleAdminLogin = (e: any) => {
    e.preventDefault();
    if (adminPwd === "6508") {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPwd("");
      setPwdError("");
    } else {
      setPwdError("Senha incorreta!");
      setAdminPwd("");
    }
  };

  // Função para voltar ao lobby inicial
  const handleBackToLobby = () => {
    setActiveModule(null);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800 relative">
      {/* CABEÇALHO GLOBAL */}
      <div className="fixed top-4 right-4 flex items-center gap-3 z-[200] bg-[#0a0a0a] p-3 rounded-full border border-zinc-800/60 shadow-xl">
        {activeModule ? (
          <Home
            size={18}
            className="text-zinc-400 hover:text-white cursor-pointer transition-colors"
            onClick={handleBackToLobby}
            title="Voltar ao Portal"
          />
        ) : (
          <Cloud
            size={18}
            className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
            title="Lobby Online"
          />
        )}
        <div className="w-px h-4 bg-zinc-700/80" />
        {isAdmin ? (
          <Unlock
            size={18}
            className="text-amber-500 cursor-pointer hover:text-amber-400 transition-colors drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
            onClick={() => setIsAdmin(false)}
            title="Sair do Modo Administrador"
          />
        ) : (
          <Lock
            size={18}
            className="text-amber-500/40 hover:text-amber-500 cursor-pointer transition-colors"
            onClick={() => setShowAdminLogin(true)}
            title="Entrar como Administrador"
          />
        )}
      </div>

      {/* MODAL DE LOGIN ADMIN */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[250] p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-zinc-700/50 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-200 relative">
            <button
              onClick={() => {
                setShowAdminLogin(false);
                setPwdError("");
              }}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white bg-white/5 p-1.5 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
            <Lock className="mx-auto mb-4 text-amber-500 mt-2" size={32} />
            <h3 className="text-white text-sm font-black uppercase tracking-wider mb-6 text-center">
              Acesso Administrativo
            </h3>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="password"
                value={adminPwd}
                onChange={(e) => setAdminPwd(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-center text-white focus:border-amber-500 outline-none transition-all tracking-[0.3em] font-black"
                placeholder="SENHA"
                autoFocus
              />
              {pwdError && (
                <p className="text-red-500 text-xs font-bold text-center animate-pulse">
                  {pwdError}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase py-4 rounded-2xl transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)] mt-2"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      )}

      {showWaitPopup && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[260] p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-zinc-700/50 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-200 relative">
            <button
              onClick={() => setShowWaitPopup(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white bg-white/5 p-1.5 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
            <Shield className="mx-auto mb-4 text-orange-500 mt-2" size={32} />
            <h3 className="text-orange-400 text-sm font-black uppercase tracking-[0.35em] mb-3 text-center">
              Aguarde
            </h3>
            <p className="text-zinc-300 text-xs font-bold uppercase tracking-widest leading-relaxed text-center">
              A competição ainda não começou.
            </p>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.25em] leading-relaxed text-center mt-2">
              Aguarde o inicio da competição.
            </p>
          </div>
        </div>
      )}

      {/* =========================================
          TELA INICIAL (LOBBY / PORTAL)
      ========================================= */}
      {!activeModule && (
        <div className="relative flex flex-col items-center justify-center min-h-screen text-center animate-in fade-in duration-500 px-4 py-20">
          <div className="relative z-10 flex flex-col items-center w-full max-w-md">
            <div className="w-36 md:w-44 h-36 md:h-44 mb-6 flex items-center justify-center">
              <img
                src="/brandao1.png"
                alt="Brandão"
                className="w-full h-full object-contain drop-shadow-[0_0_18px_rgba(255,255,255,0.08)]"
              />
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white tracking-[0.3em] uppercase mb-12 text-center">
              INTERCLASSE
              <br />
              2026
            </h1>

            <div className="flex flex-col gap-4 w-full">
              {/* BOTÃO DO FC 26 */}
              <button
                onClick={() => {
                  if (isAdmin) {
                    setActiveModule("hub_fc26");
                  } else {
                    setActiveModule("fc26");
                  }
                }}
                className="relative group w-full flex items-center justify-between px-6 md:px-8 py-5 rounded-[2rem] bg-[#0c0c0e] border border-zinc-800/60 hover:bg-[#121214] hover:border-zinc-700 transition-all duration-300 shadow-md"
              >
                <div className="flex items-center gap-4">
                  <Gamepad2
                    size={24}
                    className="text-zinc-400 group-hover:text-white transition-colors"
                  />
                  <span className="text-white font-black tracking-[0.2em] uppercase text-xs md:text-sm">
                    Campeonato FC 26
                  </span>
                </div>
                {isAdmin ? (
                  <Edit3
                    size={18}
                    className="text-amber-500 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  />
                ) : (
                  <ChevronRight
                    size={18}
                    className="text-zinc-600 group-hover:text-white transition-colors"
                  />
                )}
              </button>

              {/* BOTÃO KINGS LEAGUE */}
              <button
                onClick={() => {
                  if (isAdmin) {
                    setActiveModule("hub_kl");
                  } else {
                    setActiveModule("futsal_masc");
                  }
                }}
                className="relative group w-full flex items-center justify-between px-6 md:px-8 py-5 rounded-[2rem] bg-[#0c0c0e] border border-zinc-800/60 hover:bg-[#121214] hover:border-zinc-700 transition-all duration-300 shadow-md"
              >
                <div className="flex items-center gap-4">
                  <SoccerBallIcon
                    size={24}
                    className="text-zinc-400 group-hover:text-white transition-colors"
                  />
                  <span className="text-white font-black tracking-[0.2em] uppercase text-xs md:text-sm">
                    Futsal Masculino
                  </span>
                </div>
                {isAdmin ? (
                  <Edit3
                    size={18}
                    className="text-amber-500 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  />
                ) : (
                  <ChevronRight
                    size={18}
                    className="text-zinc-600 group-hover:text-white transition-colors"
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          RENDERIZAÇÃO CONDICIONAL DOS MÓDULOS
      ========================================= */}

      {/* Módulo FC26 (Página do Torneio e HUB de criação) */}
      {activeModule === "fc26" && (
        <FC26App
          isAdmin={isAdmin}
          onBack={handleBackToLobby}
          onAccessDenied={() => {
            setActiveModule(null);
            setShowWaitPopup(true);
          }}
        />
      )}
      {activeModule === "hub_fc26" && (
        <HubFC26
          onBack={handleBackToLobby}
          onTournamentCreated={(cfg: any) => {
            setFc26Config(cfg);
            setActiveModule("fc26");
          }}
        />
      )}

      {/* Módulo Kings League / Futsal (Página do Torneio e HUB de criação) */}
      {activeModule === "futsal_masc" && (
        <KingsLeagueApp
          isAdmin={isAdmin}
          onBack={handleBackToLobby}
          onAccessDenied={() => {
            setActiveModule(null);
            setShowWaitPopup(true);
          }}
          initialConfig={klConfig}
        />
      )}
      {activeModule === "hub_kl" && (
        <HubKL
          onTournamentCreated={(cfg: any) => {
            setKlConfig(cfg);
            setActiveModule("futsal_masc");
          }}
        />
      )}
    </div>
  );
}
