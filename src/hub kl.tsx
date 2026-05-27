import React, { useState, useEffect, useMemo } from "react";
import {
  Trophy,
  LayoutGrid,
  Swords,
  Users,
  ChevronRight,
  Settings,
  AlertCircle,
  Plus,
  Minus,
  ListOrdered,
  Loader2,
  CheckCircle,
  Shield,
} from "lucide-react";

// --- FIREBASE IMPORTS ---
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken, // <- Faltava esta importação!
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// --- NOVA CONFIGURAÇÃO FIREBASE DO FC26 ---
const FC26_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA-TgAOnrlLRB0q-45iuRybp2MNeAvDUEQ",
  authDomain: "fc26-496af.firebaseapp.com",
  projectId: "fc26-496af",
  storageBucket: "fc26-496af.firebasestorage.app",
  messagingSenderId: "500225582642",
  appId: "1:500225582642:web:8d98e36c74e8234a437e2b",
  measurementId: "G-1Z6TN3W4PM",
};

// Inicialização segura
const app =
  getApps().find((a) => a.name === "FC26") ||
  initializeApp(FC26_FIREBASE_CONFIG, "FC26");
const auth = getAuth(app);
const db = getFirestore(app);

const appId =
  typeof window !== "undefined" && (window as any).__app_id
    ? (window as any).__app_id
    : "default-app-id";

// ============================================================================
// ðŸ“¦ COMPONENTE HUB FC26
// ============================================================================
export default function HubFC26({
  tournamentId = "brandao_cup",
  onTournamentCreated,
  onBack,
}: {
  tournamentId?: string;
  onTournamentCreated?: (config: any) => void;
  onBack?: () => void;
}) {
  const [user, setUser] = useState<any>(null);
  const [tournamentName, setTournamentName] = useState("KINGS LEAGUE BRANDÃO");
  const [format, setFormat] = useState("groups_knockout");
  const [numTeams, setNumTeams] = useState<number | string>(12);

  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // --- AUTENTICAÇÃO ANÔNIMA OBRIGATÓRIA ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        const initialAuthToken =
          typeof window !== "undefined"
            ? (window as any).__initial_auth_token
            : undefined;
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Erro na autenticação do Hub", e);
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  // --- LÓGICA DE TEMPLATES (CÉREBRO DO TORNEIO) ---
  const ruleSummary = useMemo(() => {
    const parsedTeams = parseInt(numTeams.toString(), 10);

    if (isNaN(parsedTeams) || parsedTeams < 4)
      return { error: "Mínimo de 4 jogadores exigido." };
    if (parsedTeams > 64) return { error: "Máximo de 64 jogadores excedido." };

    if (format === "league") {
      const totalJogos = (parsedTeams * (parsedTeams - 1)) / 2;
      return {
        tag: "Pontos Corridos",
        title: "Todos contra Todos (Turno Único)",
        description: `Os ${parsedTeams} jogadores formam um grupo único. Teremos um total de ${totalJogos} confrontos. Quem somar mais pontos é o grande campeão.`,
        targetKnockout: 0,
        groups: 1,
        teamsPerGroup: parsedTeams,
        extraTeams: 0,
      };
    }

    if (format === "knockout") {
      const nextPow2 = Math.pow(2, Math.ceil(Math.log2(parsedTeams)));
      const byes = nextPow2 - parsedTeams;
      let phaseName = "Oitavas de Final";
      if (nextPow2 === 64) phaseName = "32 Avos de Final";
      if (nextPow2 === 32) phaseName = "16 Avos de Final";
      if (nextPow2 === 8) phaseName = "Quartos de Final";
      if (nextPow2 === 4) phaseName = "Semifinais";

      return {
        tag: "Eliminatória Direta",
        title: `Chave de ${nextPow2} Jogadores`,
        description:
          byes > 0
            ? `O torneio começa nos ${phaseName}. Como temos ${parsedTeams} jogadores, ${byes} jogadores avançam direto (BYE) para a segunda rodada para ajustar a chave perfeita de ${nextPow2}.`
            : `Chave perfeita! O torneio começa com os confrontos de ${phaseName}.`,
        targetKnockout: nextPow2,
        matches: nextPow2 / 2,
      };
    }

    if (format === "groups_knockout") {
      let groups = Math.floor(parsedTeams / 4);
      if (parsedTeams % 4 !== 0 && parsedTeams % 5 === 0)
        groups = parsedTeams / 5;
      if (groups < 2) groups = 2;

      let teamsPerGroup = Math.floor(parsedTeams / groups);
      let extraTeams = parsedTeams % groups;

      let targetKnockout = 8;
      if (parsedTeams >= 24) targetKnockout = 16;
      if (parsedTeams >= 48) targetKnockout = 32;
      if (parsedTeams < 12) targetKnockout = 4;

      let passPerGroup = Math.floor(targetKnockout / groups);
      let bestThirds = targetKnockout % groups;

      if (passPerGroup === 0) {
        passPerGroup = 1;
        bestThirds = 0;
      }

      return {
        tag: `Grupos + Mata-Mata (${targetKnockout})`,
        title: `${groups} Grupos no total`,
        description: `Serão sorteados ${groups} grupos. ${
          extraTeams > 0
            ? `${extraTeams} grupos terão ${
                teamsPerGroup + 1
              } jogadores e os restantes terão ${teamsPerGroup}.`
            : `Todos os grupos terão exatas ${teamsPerGroup} jogadores.`
        } Para formar a chave final, avançam os ${passPerGroup} primeiros classificados de cada grupo${
          bestThirds > 0
            ? ` + os ${bestThirds} melhores ${
                passPerGroup + 1
              }Âº colocados no geral`
            : ""
        }.`,
        targetKnockout,
        groups,
        teamsPerGroup,
        extraTeams,
      };
    }

    if (format === "league_knockout") {
      let targetKnockout = 2;
      if (parsedTeams >= 6) targetKnockout = 4;
      if (parsedTeams >= 12) targetKnockout = 8;
      if (parsedTeams >= 24) targetKnockout = 16;
      if (parsedTeams >= 48) targetKnockout = 32;

      const totalJogos = (parsedTeams * (parsedTeams - 1)) / 2;

      return {
        tag: `Liga + Mata-Mata (${targetKnockout})`,
        title: `Liga Única + Top ${targetKnockout} avançam`,
        description: `Os ${parsedTeams} jogadores formam um grupo único jogando em turno único (${totalJogos} jogos no total). Após o fim da fase de pontos corridos, os ${targetKnockout} primeiros classificados avançam para a fase final eliminatória.`,
        targetKnockout,
        groups: 1,
        teamsPerGroup: parsedTeams,
        extraTeams: 0,
      };
    }

    return { error: "Formato inválido" };
  }, [format, numTeams]);

  // --- GRAVAÇÃO DOS DADOS NO FIRESTORE ---
  const handleCreate = async () => {
    if (!user) return;
    setIsCreating(true);

    const configPayload = {
      name: tournamentName,
      format: format,
      numTeams: parseInt(numTeams.toString(), 10),
      rules: {
        targetKnockout: (ruleSummary as any).targetKnockout,
        groupsCount: (ruleSummary as any).groups || 1,
        teamsPerGroup: (ruleSummary as any).teamsPerGroup || numTeams,
        extraTeams: (ruleSummary as any).extraTeams || 0,
      },
      createdAt: new Date().toISOString(),
      phase: "inserir_nomes", // A fase que o FC26 deve ler a seguir
    };

    try {
      const docRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "tournaments",
        tournamentId
      );
      // Salva a configuração no banco do Hub
      await setDoc(
        docRef,
        { config: configPayload, phase: "inserir_nomes" },
        { merge: true }
      );

      setIsCreating(false);
      setIsSuccess(true);

      // DEVOLVE A CONFIGURAÇÃO PARA O MÓDULO PAI (FC26 / KL) APÓS 1 SEGUNDO
      setTimeout(() => {
        if (onTournamentCreated) onTournamentCreated(configPayload);
      }, 1000);
    } catch (e) {
      console.error("Erro ao salvar configuração no Firestore", e);
      setIsCreating(false);
    }
  };

  const incrementTeams = () => {
    let val = parseInt(numTeams.toString(), 10);
    if (isNaN(val)) val = 4;
    setNumTeams(Math.min(64, val + 1));
  };

  const decrementTeams = () => {
    let val = parseInt(numTeams.toString(), 10);
    if (isNaN(val)) val = 4;
    setNumTeams(Math.max(4, val - 1));
  };

  // --- CLASSES CSS SIMPLES ---
  const glassContainer =
    "bg-[#0a0a0a] border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.35)] rounded-[2rem] relative overflow-hidden";
  const glassBtnInactive =
    "relative p-3 rounded-xl border border-white/15 bg-[#111] opacity-75 hover:opacity-100 hover:bg-[#161616] hover:border-white/20 transition-all duration-300 flex flex-col items-center text-center gap-2 group overflow-hidden";
  const glassTopHighlight = "";

  // TELA 2: CARREGANDO
  if (isCreating) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center font-sans p-4 relative overflow-hidden">
        <Loader2
          size={64}
          className="text-amber-400 animate-spin mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] relative z-10"
        />
        <h2 className="text-xl font-black uppercase tracking-widest mb-2 animate-pulse drop-shadow-md relative z-10">
          Salvando Competição...
        </h2>
        <p className="text-zinc-400 text-xs font-bold tracking-widest uppercase relative z-10">
          A preparar a estrutura e gravando no servidor
        </p>
      </div>
    );
  }

  // TELA 3: SUCESSO E TRANSIÇÃO
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center font-sans p-4 animate-in zoom-in-95 duration-500 relative overflow-hidden">
        <div
          className={
            glassContainer +
            " p-8 md:p-10 max-w-lg w-full text-center z-10 flex flex-col items-center justify-center"
          }
        >
          <div className={glassTopHighlight}></div>
          <CheckCircle
            size={64}
            className="text-green-400 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(34,197,94,0.4)] bg-green-500/10 rounded-full p-2"
          />
          <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2 drop-shadow-md">
            Competição Criada!
          </h2>
          <p className="text-zinc-400 text-xs font-bold tracking-widest uppercase mb-4 animate-pulse">
            Carregando o painel de administração...
          </p>
          <Loader2 size={24} className="text-zinc-500 animate-spin" />
        </div>
      </div>
    );
  }

  // TELA 1: HUB DE CRIAÇÃO (Setup)
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-4 md:p-6 selection:bg-amber-500/30 relative overflow-hidden">
      <div className="max-w-2xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500 pb-10 relative z-10">
        {/* HEADER */}
        <div className="flex flex-col items-center justify-center mb-6 mt-2">
          <div className="w-10 h-10 bg-[#111] border border-white/15 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            <Settings
              size={20}
              className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] relative z-10"
            />
          </div>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-[0.3em] text-white text-center drop-shadow-lg">
            HUB DE CRIAÇÃO
          </h1>
          <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mt-1 text-center">
            Configure o formato do torneio
          </p>
        </div>

        {/* CONTAINER PRINCIPAL */}
        <div className={glassContainer}>
          <div className="p-4 md:p-6 space-y-6 relative z-10">
            {/* 1. NOME DO TORNEIO */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-zinc-400 font-black text-[11px] uppercase tracking-[0.2em]">
                <Trophy
                  size={13}
                  className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                />{" "}
                Nome da Competição
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={tournamentName}
                  onChange={(e) =>
                    setTournamentName(e.target.value.toUpperCase())
                  }
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm font-black text-white uppercase tracking-wider transition-all focus:border-amber-400/50 focus:bg-[#151515] outline-none"
                  placeholder="EX: KINGS LEAGUE BRANDÃO"
                />
              </div>
            </div>

            {/* 2. FORMATO */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-zinc-400 font-black text-[11px] uppercase tracking-[0.2em]">
                <LayoutGrid
                  size={13}
                  className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                />{" "}
                Formato do Torneio
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setFormat("groups_knockout")}
                  className={
                    format === "groups_knockout"
                      ? "relative p-3 rounded-xl border bg-blue-500/10 border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.15)] z-10 scale-[1.02] flex flex-col items-center text-center gap-2 overflow-hidden transition-all duration-300"
                      : glassBtnInactive
                  }
                >
                  <div className={glassTopHighlight}></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      format === "groups_knockout"
                        ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                        : "bg-white/5 text-zinc-400 border-white/10"
                    }`}
                  >
                    <LayoutGrid size={14} />
                  </div>
                  <div>
                    <h3
                      className={`font-black uppercase text-xs tracking-wider mb-1 drop-shadow-md ${
                        format === "groups_knockout"
                          ? "text-blue-300"
                          : "text-zinc-300"
                      }`}
                    >
                      Grupos + Mata-Mata
                    </h3>
                    <p className="text-[10px] text-zinc-300 font-medium leading-relaxed">
                      Fase de grupos classificatória seguida de eliminatórias
                      até a final.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setFormat("knockout")}
                  className={
                    format === "knockout"
                      ? "relative p-3 rounded-xl border bg-green-500/10 border-green-400/40 shadow-[0_0_20px_rgba(34,197,94,0.15)] z-10 scale-[1.02] flex flex-col items-center text-center gap-2 overflow-hidden transition-all duration-300"
                      : glassBtnInactive
                  }
                >
                  <div className={glassTopHighlight}></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      format === "knockout"
                        ? "bg-green-500/20 text-green-300 border-green-400/30"
                        : "bg-white/5 text-zinc-400 border-white/10"
                    }`}
                  >
                    <Swords size={14} />
                  </div>
                  <div>
                    <h3
                      className={`font-black uppercase text-xs tracking-wider mb-1 drop-shadow-md ${
                        format === "knockout"
                          ? "text-green-300"
                          : "text-zinc-300"
                      }`}
                    >
                      Mata-Mata Direto
                    </h3>
                    <p className="text-[10px] text-zinc-300 font-medium leading-relaxed">
                      Sorteio de chaveamento puro. Perdeu, está fora da
                      competição.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setFormat("league_knockout")}
                  className={
                    format === "league_knockout"
                      ? "relative p-3 rounded-xl border bg-amber-500/10 border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] z-10 scale-[1.02] flex flex-col items-center text-center gap-2 overflow-hidden transition-all duration-300"
                      : glassBtnInactive
                  }
                >
                  <div className={glassTopHighlight}></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      format === "league_knockout"
                        ? "bg-amber-500/20 text-amber-300 border-amber-400/30"
                        : "bg-white/5 text-zinc-400 border-white/10"
                    }`}
                  >
                    <Trophy size={14} />
                  </div>
                  <div>
                    <h3
                      className={`font-black uppercase text-xs tracking-wider mb-1 drop-shadow-md ${
                        format === "league_knockout"
                          ? "text-amber-300"
                          : "text-zinc-300"
                      }`}
                    >
                      Liga + Mata-Mata
                    </h3>
                    <p className="text-[10px] text-zinc-300 font-medium leading-relaxed">
                      Liga única inicial. Os mais bem classificados avançam para
                      o mata-mata.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setFormat("league")}
                  className={
                    format === "league"
                      ? "relative p-3 rounded-xl border bg-purple-500/10 border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.15)] z-10 scale-[1.02] flex flex-col items-center text-center gap-2 overflow-hidden transition-all duration-300"
                      : glassBtnInactive
                  }
                >
                  <div className={glassTopHighlight}></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      format === "league"
                        ? "bg-purple-500/20 text-purple-300 border-purple-400/30"
                        : "bg-white/5 text-zinc-400 border-white/10"
                    }`}
                  >
                    <ListOrdered size={14} />
                  </div>
                  <div>
                    <h3
                      className={`font-black uppercase text-xs tracking-wider mb-1 drop-shadow-md ${
                        format === "league"
                          ? "text-purple-300"
                          : "text-zinc-300"
                      }`}
                    >
                      Pontos Corridos
                    </h3>
                    <p className="text-[10px] text-zinc-300 font-medium leading-relaxed">
                      Todos jogam contra todos. Sem finais. O campeão é quem
                      pontuar mais.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. PARTICIPANTES E REGULAMENTO */}
            <div className="flex flex-col md:flex-row gap-5 items-start pt-5 border-t border-white/10 relative">
              <div className="w-full md:w-1/3 space-y-3 shrink-0">
                <label className="flex items-center gap-2 text-zinc-400 font-black text-[11px] uppercase tracking-[0.2em]">
                  <Shield size={14} className="text-zinc-300 drop-shadow-md" />{" "}
                  Quantidade de Times
                </label>
                <div className="relative flex items-center justify-center bg-[#111] border border-white/15 rounded-xl p-2 overflow-hidden gap-3">
                  <button
                    onClick={decrementTeams}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#161616] border border-white/10 hover:bg-[#1a1a1a] text-white transition-all relative z-10 shrink-0"
                  >
                    <Minus size={14} />
                  </button>
                  <div className="flex flex-col items-center justify-center relative z-10 min-w-[60px]">
                    <input
                      type="number"
                      min="4"
                      max="64"
                      value={numTeams}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") setNumTeams("");
                        else setNumTeams(parseInt(val, 10));
                      }}
                      onBlur={() => {
                        const val = parseInt(numTeams.toString(), 10);
                        if (isNaN(val) || val < 4) setNumTeams(4);
                        else if (val > 64) setNumTeams(64);
                        else setNumTeams(val);
                      }}
                      className="text-2xl font-black text-white bg-transparent text-center w-16 outline-none drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] focus:ring-0 focus:border-none p-0 m-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">
                      Times
                    </span>
                  </div>
                  <button
                    onClick={incrementTeams}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#161616] border border-white/10 hover:bg-[#1a1a1a] text-white transition-all relative z-10 shrink-0"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="flex gap-2">
                  {[8, 12, 16].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNumTeams(n)}
                      className={`relative flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 border overflow-hidden ${
                        numTeams === n
                          ? "bg-white/10 border-white/40 text-white"
                          : "bg-[#111] border-white/10 text-zinc-400 hover:text-white hover:bg-[#161616]"
                      }`}
                    >
                      <span className="relative z-10">{n}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full flex-1">
                <label className="flex items-center gap-2 text-zinc-400 font-black text-[11px] uppercase tracking-[0.2em] mb-4">
                  <AlertCircle
                    size={14}
                    className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  />{" "}
                  Regulamento Gerado
                </label>

                {(ruleSummary as any).error ? (
                  <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex items-center gap-3">
                    <span className="text-red-300 font-bold text-xs">
                      {(ruleSummary as any).error}
                    </span>
                  </div>
                ) : (
                  <div className="bg-[#111] border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.35)] p-4 md:p-5 rounded-xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
                    <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none transform rotate-12 scale-150">
                      {format === "groups_knockout" && (
                        <LayoutGrid size={160} />
                      )}
                      {format === "knockout" && <Swords size={160} />}
                      {format === "league" && <ListOrdered size={160} />}
                      {format === "league_knockout" && <Trophy size={160} />}
                    </div>
                    <div className="relative z-10">
                      <span className="inline-block px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-3">
                        {(ruleSummary as any).tag}
                      </span>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1.5 drop-shadow-md">
                        {(ruleSummary as any).title}
                      </h4>
                      <p className="text-xs text-zinc-300/80 leading-relaxed font-bold max-w-[95%]">
                        {(ruleSummary as any).description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER AÇÃO */}
          <div className="bg-[#0b0b0b] p-4 border-t border-white/10 flex justify-center">
            <button
              onClick={handleCreate}
              disabled={!!(ruleSummary as any).error || !user}
              className={`relative flex items-center gap-2 px-8 md:px-12 py-4 rounded-full font-black uppercase text-[10px] md:text-xs tracking-widest transition-all duration-500 w-full md:w-auto justify-center overflow-hidden group ${
                (ruleSummary as any).error || !user
                  ? "bg-[#111] border border-white/10 text-zinc-600 cursor-not-allowed"
                  : "bg-white text-black border border-white/30 hover:border-white/60 hover:bg-zinc-200 hover:scale-105"
              }`}
            >
              {!(ruleSummary as any).error && user && (
                <div className={glassTopHighlight}></div>
              )}
              <span className="relative z-10 drop-shadow-md">
                {user ? "Criar Nova Competição" : "Conectando..."}
              </span>
              <ChevronRight
                size={16}
                className="relative z-10 drop-shadow-md group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
