import React, { useState, useEffect, useMemo } from "react";
import {
  Dices,
  Users,
  RefreshCw,
  ArrowLeft,
  Shield,
  Trophy,
  CheckCircle,
  Swords,
  ListOrdered,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  XCircle,
  Trash2,
  ClipboardList,
  Printer,
  UserPlus,
  Info,
  Save,
  Plus,
  X,
  Zap,
  Undo2,
  Wand2,
  FileText,
  Globe,
  Eye,
  Cloud,
  CloudOff,
  Lock,
  Unlock,
  Key,
  Pencil,
  ClipboardPaste,
  Loader2,
  Home,
  LayoutGrid,
  BarChart2, // Substituído para compatibilidade universal
  PlaySquare,
} from "lucide-react";

import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  enableNetwork,
} from "firebase/firestore";

// ============================================================================
// ☁️ CONFIGURAÇÃO DO BANCO DE DADOS (KINGS LEAGUE)
// ============================================================================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDp5FtHG8zb7EnOaQrRupLSuNglrnlP9rI",
  authDomain: "kings-league-5e65d.firebaseapp.com",
  projectId: "kings-league-5e65d",
  storageBucket: "kings-league-5e65d.firebasestorage.app",
  messagingSenderId: "120333374868",
  appId: "1:120333374868:web:34a7a79d22e9ee0bf5ab81",
  measurementId: "G-01DLR8PHDB",
};

const app =
  getApps().find((a) => a.name === "KINGS") ||
  initializeApp(FIREBASE_CONFIG, "KINGS");
const auth = getAuth(app);
const db = getFirestore(app);

const appId = "kl-brandao-app";

// ============================================================================
// 🌍 48 SELEÇÕES DA COPA DO MUNDO DE 2026
// ============================================================================
const worldCup2026Teams = [
  { name: "Brasil", code: "br" },
  { name: "Argentina", code: "ar" },
  { name: "Uruguai", code: "uy" },
  { name: "Colômbia", code: "co" },
  { name: "Equador", code: "ec" },
  { name: "Paraguai", code: "py" },
  { name: "França", code: "fr" },
  { name: "Inglaterra", code: "gb-eng" },
  { name: "Portugal", code: "pt" },
  { name: "Espanha", code: "es" },
  { name: "Alemanha", code: "de" },
  { name: "Países Baixos", code: "nl", aliases: ["Holanda"] },
  { name: "Bélgica", code: "be" },
  { name: "Croácia", code: "hr" },
  { name: "Suíça", code: "ch" },
  { name: "Áustria", code: "at" },
  { name: "Escócia", code: "gb-sct" },
  { name: "Noruega", code: "no" },
  { name: "Suécia", code: "se" },
  { name: "Turquia", code: "tr" },
  { name: "Rep. Tcheca", code: "cz", aliases: ["República Tcheca", "Tcheca"] },
  {
    name: "Bósnia e Herz.",
    code: "ba",
    aliases: ["Bósnia", "Bosnia e Herzegovina"],
  },
  { name: "Marrocos", code: "ma" },
  { name: "Senegal", code: "sn" },
  { name: "Egito", code: "eg" },
  { name: "Nigéria", code: "ng" },
  { name: "Camarões", code: "cm" },
  { name: "Costa do Marfim", code: "ci" },
  { name: "Tunísia", code: "tn" },
  { name: "África do Sul", code: "za" },
  {
    name: "RD Congo",
    code: "cd",
    aliases: ["Congo", "República Democrática do Congo"],
  },
  { name: "Japão", code: "jp" },
  { name: "Coreia do Sul", code: "kr", aliases: ["Coreia"] },
  { name: "Irã", code: "ir" },
  { name: "Austrália", code: "au" },
  { name: "Uzbequistão", code: "uz" },
  { name: "Jordânia", code: "jo" },
  { name: "Arábia Saudita", code: "sa", aliases: ["Arábia"] },
  { name: "Iraque", code: "iq" },
  { name: "Estados Unidos", code: "us", aliases: ["EUA", "USA"] },
  { name: "México", code: "mx" },
  { name: "Canadá", code: "ca" },
  { name: "Costa Rica", code: "cr" },
  { name: "Panamá", code: "pa" },
  { name: "Jamaica", code: "jm" },
  { name: "Nova Zelândia", code: "nz" },
  { name: "Cabo Verde", code: "cv" },
  { name: "Curaçao", code: "cw" },
];

const normalizeStr = (str: string) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

const normalizedWorldCupTeams = worldCup2026Teams.map((team) => ({
  code: team.code,
  names: [team.name, ...(team.aliases || [])].map(normalizeStr),
}));

const detectTeamCode = (inputName: string) => {
  if (!inputName) return null;
  const normalizedInput = normalizeStr(inputName);
  for (const team of normalizedWorldCupTeams) {
    if (team.names.some((teamName) => normalizedInput.includes(teamName)))
      return team.code;
  }
  return null;
};

const shuffleArray = (array: any[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const generateId = () => Math.random().toString(36).slice(2, 11);

const getGroupKeysFromCount = (count: number) => {
  const safeCount = Math.max(0, Math.floor(count || 0));
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").slice(0, safeCount);
};

const inferDefaultGroupCount = (teamCount: number) => {
  const n = Math.max(teamCount || 12, 4);
  if (n <= 15) return Math.max(2, Math.round(n / 3));
  return Math.max(2, Math.round(n / 4));
};

const getEventStats = (team: any, goalsM: any, yellowM: any, redM: any) => {
  if (!team?.players?.length) return [];
  return team.players.reduce((acc: any[], p: any) => {
    const goals = goalsM?.[p.id] || 0;
    const yellow = yellowM?.[p.id] || 0;
    const red = redM?.[p.id] || 0;
    if (goals > 0 || yellow > 0 || red > 0) {
      acc.push({ name: p.name, number: p.number, goals, yellow, red });
    }
    return acc;
  }, []);
};

const flattenBracket = (node: any, arr: any[] = []) => {
  if (!node) return arr;
  if (node.match) arr.push(node.match);
  if (node.children) node.children.forEach((c: any) => flattenBracket(c, arr));
  return arr;
};

const createEmptyStats = () => ({ goals: {}, yellow: {}, red: {} });

const simulateTeamStats = (team: any, score: number) => {
  const stats: any = createEmptyStats();
  if (!team.players?.length) return stats;
  for (let i = 0; i < score; i++) {
    const pid =
      team.players[Math.floor(Math.random() * team.players.length)].id;
    stats.goals[pid] = (stats.goals[pid] || 0) + 1;
  }
  const numYellows = Math.floor(Math.random() * 2);
  for (let i = 0; i < numYellows; i++) {
    const pid =
      team.players[Math.floor(Math.random() * team.players.length)].id;
    stats.yellow[pid] = Math.min((stats.yellow[pid] || 0) + 1, 2);
    if (stats.yellow[pid] === 2) stats.red[pid] = 1;
  }
  if (Math.random() > 0.95) {
    const pid =
      team.players[Math.floor(Math.random() * team.players.length)].id;
    stats.red[pid] = 1;
  }
  return stats;
};

const createMatchEvents = (
  team: any,
  goalsMap: any,
  yellowMap: any,
  redMap: any,
  side: 1 | 2
) => {
  const events: any[] = [];
  const addEvents = (map: any, type: "goal" | "yellow" | "red") => {
    if (!map) return;
    Object.keys(map).forEach((id) => {
      const count = map[id] || 0;
      const playerName =
        team?.players?.find((p: any) => p.id === id)?.name || "Jogador";
      for (let i = 0; i < count; i++) {
        events.push({
          team: side,
          type,
          playerName,
          id: Math.random(),
        });
      }
    });
  };
  addEvents(goalsMap, "goal");
  addEvents(yellowMap, "yellow");
  addEvents(redMap, "red");
  return events;
};

const getDisplayScore = (home: any, away: any) => ({
  home: home === "" && away !== "" ? 0 : home,
  away: away === "" && home !== "" ? 0 : away,
  played: home !== "" || away !== "",
});

const SoccerIcon = ({ size = 16, className = "" }: any) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11.99 15.4L8.14 12.6L9.61 7.9H14.36L15.83 12.6L11.99 15.4ZM6.64 13.78L4.1 11.95C4.54 8.78 6.42 6.09 9.07 4.67L8.03 9.38L6.64 13.78ZM14.9 4.65C17.56 6.07 19.45 8.76 19.89 11.93L17.34 13.77L15.95 9.37L14.9 4.65ZM5.6 15.11L9.12 17.65L10.37 21.46C7.54 20.65 5.2 18.25 4.3 15.34L5.6 15.11ZM13.62 21.46L14.86 17.65L18.39 15.11L19.69 15.34C18.79 18.25 16.45 20.65 13.62 21.46Z" />
  </svg>
);

// --- COMPONENTES UI BASE ---
const TeamBadge = ({ name, className = "w-6 h-6 text-[10px]" }: any) => {
  const code = detectTeamCode(name);
  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-zinc-900 border border-zinc-700 text-zinc-300 font-black rounded shadow-inner overflow-hidden ${className}`}
    >
      {code ? (
        <img
          src={`https://flagcdn.com/w160/${code}.png`}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="translate-no">
          {name && typeof name === "string"
            ? name.substring(0, 2).toUpperCase()
            : "??"}
        </span>
      )}
    </div>
  );
};

const TabBtn = ({ id, active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`px-4 md:px-5 py-2.5 md:py-3 rounded-full text-[10px] md:text-[11px] font-bold tracking-widest uppercase transition-all flex items-center gap-1.5 md:gap-2 whitespace-nowrap shrink-0 ${
      active === id
        ? "bg-white text-black font-black shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105"
        : "bg-[#0c0c0c] text-zinc-400 hover:text-white border border-[#222]"
    }`}
  >
    {Icon && <Icon size={14} className="hidden sm:block" />} {label}
  </button>
);

const SubTabBtn = ({ id, active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
      active === id
        ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)] scale-105"
        : "bg-[#0c0c0c] text-zinc-400 hover:text-white border border-[#222]"
    }`}
  >
    {Icon && <Icon size={12} />} {label}
  </button>
);

// --- CORREÇÃO: COMPONENTES GLOBAIS (GroupTable, MatchCard, etc) ---
const GroupTable = ({
  groupName,
  standings,
  matches,
  updateMatchScore,
  isAdmin,
  isSingleGroup,
  setEditingScorersMatch,
  setViewingMatchDetails,
}: any) => {
  const [showMatches, setShowMatches] = useState(false);
  return (
    <div className="bg-[#0a0a0a] rounded-2xl overflow-hidden border border-[#1a1a1a] shadow-xl avoid-page-break flex flex-col relative h-full w-full">
      <div className="p-3 md:p-4 border-b border-[#151515] flex justify-start items-center gap-2 md:gap-3 bg-[#0c0c0c]">
        <div className="bg-[#111] border border-[#222] rounded-xl w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0">
          {isSingleGroup ? (
            <Trophy size={18} className="text-amber-500 drop-shadow-md" />
          ) : (
            <span className="text-white font-black text-lg md:text-xl">
              {groupName}
            </span>
          )}
        </div>
        <h2 className="font-black text-[10px] md:text-[13px] uppercase tracking-[0.3em] text-white">
          {isSingleGroup ? (
            "Classificação da Liga"
          ) : (
            <>
              <span className="text-zinc-500">GRUPO</span> {groupName}
            </>
          )}
        </h2>
      </div>
      <div className="relative z-10 bg-[#0a0a0a] flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-max md:min-w-0">
          <thead className="text-[#555] uppercase text-[8px] md:text-[9px] tracking-widest bg-transparent">
            <tr>
              <th className="px-1.5 md:px-4 py-2 md:py-4 font-bold w-6 md:w-12 border-b border-[#151515] text-center md:text-left">
                Pos
              </th>
              <th className="px-1 md:px-2 py-2 md:py-4 font-bold border-b border-[#151515]">
                Equipa
              </th>
              <th className="px-1 md:px-2 py-2 md:py-4 text-center font-bold text-white w-7 md:w-12 border-b border-[#151515]">
                PTS
              </th>
              <th className="px-1 md:px-2 py-2 md:py-4 text-center font-bold w-7 md:w-12 border-b border-[#151515]">
                SG
              </th>
            </tr>
          </thead>
          <tbody>
            {standings?.map((stat: any, idx: number) => {
              const isQualified = isSingleGroup ? idx === 0 : idx < 2;
              // 🌟 NEON VERMELHO PARA OS 2 ÚLTIMOS DE CADA GRUPO
              const isEliminatedGroup =
                !isSingleGroup && idx >= standings.length - 2;
              return (
                <tr
                  key={stat.team.id}
                  className="border-b border-[#151515] hover:bg-[#111] transition-colors relative group"
                >
                  <td className="relative px-1.5 md:px-4 py-2.5 md:py-4 text-zinc-400 font-black text-[9px] md:text-xs text-center md:text-left">
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-[2px] md:w-[3px] ${
                        isQualified
                          ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]"
                          : isEliminatedGroup
                          ? "bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.8)]"
                          : "bg-transparent"
                      }`}
                    />
                    {idx + 1}º
                  </td>
                  <td className="px-1 md:px-2 py-2.5 md:py-4">
                    <div className="flex items-center gap-1.5 md:gap-3">
                      <TeamBadge
                        name={stat.team.name}
                        className="w-4 h-4 md:w-5 md:h-5 object-contain drop-shadow-md shrink-0"
                      />
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-white truncate max-w-[80px] sm:max-w-[120px] lg:max-w-[200px] uppercase text-[9px] md:text-[11px] tracking-wider">
                          {stat.team.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-1 md:px-2 py-2.5 md:py-4 text-center font-black text-white text-[10px] md:text-xs">
                    {stat.pts}
                  </td>
                  <td className="px-1 md:px-2 py-2.5 md:py-4 text-center text-[#666] font-bold text-[10px] md:text-xs">
                    {stat.sg}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out bg-[#050505] border-t border-[#151515] ${
          showMatches
            ? "max-h-[500px] overflow-y-auto custom-scrollbar opacity-100"
            : "max-h-0 opacity-0 border-t-0"
        }`}
      >
        <div className="p-2 md:p-4 space-y-1.5 md:space-y-2">
          {matches.map((match: any) => {
            const {
              home: displayScore1,
              away: displayScore2,
              played: isPlayed,
            } = getDisplayScore(match.score1, match.score2);
            return (
              <div
                key={match.id}
                className="flex flex-col bg-[#111] p-2 md:p-3 rounded-xl md:rounded-2xl border border-[#222]"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 md:gap-3 w-full">
                  <div className="min-w-0 text-right flex flex-col items-end gap-0.5 justify-self-end">
                    <span className="text-[8px] md:text-[9px] font-bold text-white uppercase truncate w-full tracking-wider">
                      {match.t1.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1 md:gap-2 shrink-0 relative group min-w-[3.75rem] md:min-w-[5rem] justify-self-center">
                    <input
                      type="number"
                      min="0"
                      value={displayScore1}
                      readOnly={!isAdmin}
                      onChange={(e) =>
                        isAdmin &&
                        updateMatchScore(match.id, "score1", e.target.value)
                      }
                      className={`w-5 h-5 md:w-7 md:h-7 text-center bg-[#050505] border border-[#333] rounded-md md:rounded-lg text-[9px] md:text-xs font-black text-white outline-none transition-all mx-auto ${
                        isAdmin
                          ? "focus:border-zinc-500 cursor-text"
                          : "cursor-default opacity-80 select-none"
                      }`}
                    />
                    <span className="text-zinc-600 text-[7px] md:text-[9px] font-black">
                      X
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={displayScore2}
                      readOnly={!isAdmin}
                      onChange={(e) =>
                        isAdmin &&
                        updateMatchScore(match.id, "score2", e.target.value)
                      }
                      className={`w-5 h-5 md:w-7 md:h-7 text-center bg-[#050505] border border-[#333] rounded-md md:rounded-lg text-[9px] md:text-xs font-black text-white outline-none transition-all mx-auto ${
                        isAdmin
                          ? "focus:border-zinc-500 cursor-text"
                          : "cursor-default opacity-80 select-none"
                      }`}
                    />
                  </div>
                  <div className="min-w-0 text-left flex flex-col items-start gap-0.5 justify-self-start">
                    <span className="text-[8px] md:text-[9px] font-bold text-white uppercase truncate w-full tracking-wider">
                      {match.t2.name}
                    </span>
                  </div>
                </div>
                {isPlayed &&
                  (isAdmin ? (
                    <button
                      onClick={() =>
                        setEditingScorersMatch({ ...match, group: true })
                      }
                      className="w-full mt-2 py-1.5 md:py-2 bg-[#0a0a0a] hover:bg-zinc-900 border border-[#222] text-[8px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors rounded-lg"
                    >
                      <ListOrdered size={10} className="md:w-3 md:h-3" /> Gols e
                      Cartões
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setViewingMatchDetails({
                          ...match,
                          tag: `Grupo ${groupName}`,
                        })
                      }
                      className="w-full mt-2 py-1.5 md:py-2 bg-[#0a0a0a] hover:bg-zinc-900 border border-[#222] text-[8px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors rounded-lg"
                    >
                      <FileText size={10} className="md:w-3 md:h-3" /> Ver
                      Detalhes
                    </button>
                  ))}
              </div>
            );
          })}
        </div>
      </div>
      <button
        onClick={() => setShowMatches(!showMatches)}
        className="w-full py-2.5 md:py-4 text-[8px] md:text-[9px] font-black text-zinc-600 hover:text-white hover:bg-[#111] uppercase tracking-[0.2em] flex items-center justify-center gap-2 border-t border-[#151515] bg-[#0a0a0a] transition-colors z-10 relative mt-auto"
      >
        {showMatches ? <ChevronUp size={12} /> : <ChevronDown size={12} />}{" "}
        {showMatches ? "RECOLHER" : "VER JOGOS E ESTATÍSTICAS"}
      </button>
    </div>
  );
};

const MatchCard = ({
  match,
  knockoutScores,
  updateKoScore,
  isAdmin,
  setViewingMatchDetails,
}: any) => {
  if (!match) return null;
  const score = knockoutScores[match.id] || { s1: "", s2: "" };
  const isTie = score.s1 !== "" && score.s2 !== "" && score.s1 === score.s2;
  const isTBD = typeof match.t1 === "string" || typeof match.t2 === "string";
  const {
    home: displayS1,
    away: displayS2,
    played: isPlayed,
  } = getDisplayScore(score.s1, score.s2);

  let winner = 0;
  if (isPlayed) {
    if (score.s1 > score.s2) winner = 1;
    else if (score.s2 > score.s1) winner = 2;
    else if (score.p1 !== "" && score.p2 !== "") {
      if (score.p1 > score.p2) winner = 1;
      else if (score.p2 > score.p1) winner = 2;
    }
  }

  const renderParticipant = (p: any) =>
    typeof p === "string" ? (
      <span className="text-[9px] md:text-[10px] lg:text-xs font-bold truncate uppercase tracking-wider text-[#666]">
        {p}
      </span>
    ) : (
      <div className="flex items-center gap-1.5 md:gap-2 overflow-hidden w-full">
        <TeamBadge
          name={p.name}
          className="w-3.5 h-3.5 md:w-5 md:h-5 shrink-0 object-contain"
        />
        <span className="text-[9px] md:text-[10px] lg:text-xs font-bold text-white truncate uppercase tracking-wider">
          {p.name || "TBD"}
        </span>
      </div>
    );

  return (
    <div
      className={`bg-[#0a0a0a] border ${
        match.isFinal
          ? "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          : "border-[#1a1a1a]"
      } rounded-xl md:rounded-2xl p-2 md:p-3 w-[120px] md:w-48 lg:w-56 relative z-10 transition-colors avoid-page-break shadow-xl group`}
    >
      {match.isFinal && (
        <span className="absolute -top-2.5 left-2 md:left-3 bg-amber-500 text-black text-[7px] md:text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest z-10 shadow-lg">
          Grande Final
        </span>
      )}
      <div
        className={`${
          match.isFinal ? "mt-1 md:mt-2" : ""
        } space-y-1.5 md:space-y-2`}
      >
        <div
          className={`flex items-center justify-between gap-1 md:gap-2 bg-[#111] p-1.5 md:p-2 rounded-lg md:rounded-xl border border-[#222] transition-all duration-300 ${
            winner === 2 ? "opacity-30 grayscale scale-[0.98]" : ""
          }`}
        >
          <div className="overflow-hidden flex-1">
            {renderParticipant(match.t1)}
          </div>
          {!isTBD && (
            <input
              type="number"
              min="0"
              value={displayS1}
              readOnly={!isAdmin}
              onChange={(e) =>
                isAdmin && updateKoScore(match.id, "s1", e.target.value)
              }
              className={`w-5 h-5 md:w-8 md:h-auto shrink-0 text-center bg-[#050505] border border-[#333] rounded-md md:rounded-lg md:py-1 text-[9px] md:text-xs font-black outline-none text-white ${
                isAdmin
                  ? "focus:border-white cursor-text"
                  : "cursor-default opacity-80"
              }`}
            />
          )}
        </div>
        <div
          className={`flex items-center justify-between gap-1 md:gap-2 bg-[#111] p-1.5 md:p-2 rounded-lg md:rounded-xl border border-[#222] transition-all duration-300 ${
            winner === 1 ? "opacity-30 grayscale scale-[0.98]" : ""
          }`}
        >
          <div className="overflow-hidden flex-1">
            {renderParticipant(match.t2)}
          </div>
          {!isTBD && (
            <input
              type="number"
              min="0"
              value={displayS2}
              readOnly={!isAdmin}
              onChange={(e) =>
                isAdmin && updateKoScore(match.id, "s2", e.target.value)
              }
              className={`w-5 h-5 md:w-8 md:h-auto shrink-0 text-center bg-[#050505] border border-[#333] rounded-md md:rounded-lg md:py-1 text-[9px] md:text-xs font-black outline-none text-white ${
                isAdmin
                  ? "focus:border-white cursor-text"
                  : "cursor-default opacity-80"
              }`}
            />
          )}
        </div>
      </div>
      {isTie && !isTBD && (
        <div className="mt-1.5 md:mt-2 pt-1.5 md:pt-2 border-t border-[#1a1a1a]">
          <div className="text-[6px] md:text-[8px] text-center text-amber-500/70 uppercase font-bold mb-1 md:mb-1.5 tracking-[0.2em]">
            Penalidades
          </div>
          <div className="flex justify-between items-center gap-1 md:gap-2">
            <input
              type="number"
              min="0"
              value={score.p1 || ""}
              placeholder="P"
              readOnly={!isAdmin}
              onChange={(e) =>
                isAdmin && updateKoScore(match.id, "p1", e.target.value)
              }
              className={`w-full text-center bg-[#050505] border border-[#222] rounded-md py-0.5 md:py-1 text-[8px] md:text-xs text-white outline-none ${
                isAdmin ? "cursor-text" : "cursor-default"
              }`}
            />
            <span className="text-[#444] text-[8px] md:text-[10px] font-black">
              X
            </span>
            <input
              type="number"
              min="0"
              value={score.p2 || ""}
              placeholder="P"
              readOnly={!isAdmin}
              onChange={(e) =>
                isAdmin && updateKoScore(match.id, "p2", e.target.value)
              }
              className={`w-full text-center bg-[#050505] border border-[#222] rounded-md py-0.5 md:py-1 text-[8px] md:text-xs text-white outline-none ${
                isAdmin ? "cursor-text" : "cursor-default"
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const BracketNode = ({
  node,
  knockoutScores,
  updateKoScore,
  direction = "left",
  isAdmin,
  setViewingMatchDetails,
}: any) => {
  if (!node) return null;
  const hasChildren = node.children?.length > 0;
  const isLeft = direction === "left";
  const dirClass = isLeft ? "flex-row" : "flex-row-reverse";
  const paddingClass = isLeft ? "pr-2 md:pr-8" : "pl-2 md:pl-8";

  return (
    <div className={`flex items-stretch avoid-page-break ${dirClass}`}>
      {hasChildren && (
        <div className="flex flex-col justify-center">
          <div
            className={`relative flex-1 flex items-center ${paddingClass} py-2 md:py-4`}
          >
            <div
              className={`absolute ${
                isLeft
                  ? "right-0 border-r-2 rounded-tr-xl"
                  : "left-0 border-l-2 rounded-tl-xl"
              } top-1/2 bottom-0 w-2 md:w-4 border-t-2 border-[#222]`}
            />
            <BracketNode
              node={node.children[0]}
              knockoutScores={knockoutScores}
              updateKoScore={updateKoScore}
              direction={direction}
              isAdmin={isAdmin}
              setViewingMatchDetails={setViewingMatchDetails}
            />
          </div>
          <div
            className={`relative flex-1 flex items-center ${paddingClass} py-2 md:py-4`}
          >
            <div
              className={`absolute ${
                isLeft
                  ? "right-0 border-r-2 rounded-br-xl"
                  : "left-0 border-l-2 rounded-tl-xl"
              } top-0 bottom-1/2 w-2 md:w-4 border-b-2 border-[#222]`}
            />
            <BracketNode
              node={node.children[1]}
              knockoutScores={knockoutScores}
              updateKoScore={updateKoScore}
              direction={direction}
              isAdmin={isAdmin}
              setViewingMatchDetails={setViewingMatchDetails}
            />
          </div>
        </div>
      )}
      <div
        className={`relative flex items-center w-[120px] md:w-48 lg:w-56 shrink-0`}
      >
        {hasChildren && (
          <div
            className={`absolute ${
              isLeft ? "-left-1 md:-left-4" : "-right-1 md:-right-4"
            } top-1/2 w-1 md:w-4 border-b-2 border-[#222]`}
          />
        )}
        <MatchCard
          match={node.match}
          knockoutScores={knockoutScores}
          updateKoScore={updateKoScore}
          isAdmin={isAdmin}
          setViewingMatchDetails={setViewingMatchDetails}
        />
      </div>
    </div>
  );
};

const SummaryMatchCard = ({
  match,
  score1,
  score2,
  p1,
  p2,
  isKnockout,
  events,
  isAdmin,
  setEditingScorersMatch,
}: any) => {
  const isTBD = typeof match.t1 === "string" || typeof match.t2 === "string";
  if (isTBD && isKnockout)
    return (
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 rounded-3xl flex justify-center items-center h-full opacity-50 min-h-[120px] md:min-h-[140px] w-full">
        <span className="text-[#666] font-bold text-[10px] md:text-xs uppercase tracking-widest">
          Confronto não definido
        </span>
      </div>
    );

  const team1 = isKnockout ? match.t1 : match.t1;
  const team2 = isKnockout ? match.t2 : match.t2;

  const p1Name = isKnockout
    ? typeof team1 === "string"
      ? team1
      : team1?.name
    : team1?.name;
  const p2Name = isKnockout
    ? typeof team2 === "string"
      ? team2
      : team2?.name
    : team2?.name;

  const e1 = events?.filter((e: any) => e.team === 1) || [];
  const e2 = events?.filter((e: any) => e.team === 2) || [];
  const displayScore1 = score1 === "" && score2 !== "" ? 0 : score1;
  const displayScore2 = score2 === "" && score1 !== "" ? 0 : score2;

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 md:p-5 rounded-[2rem] hover:bg-[#111] transition-colors shadow-lg flex flex-col justify-center w-full">
      <div className="flex items-center justify-between w-full">
        {/* Equipa 1 */}
        <div className="flex items-center gap-3 md:gap-4 w-[40%]">
          <TeamBadge
            name={p1Name}
            className="w-8 h-8 md:w-12 md:h-12 object-contain drop-shadow-md shrink-0"
          />
          <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
            <span className="font-black text-white uppercase text-[10px] md:text-[13px] truncate w-full tracking-wider">
              {p1Name || "TBD"}
            </span>
          </div>
        </div>

        {/* Placar Central */}
        <div className="flex items-center justify-center gap-2 md:gap-3 w-[20%] shrink-0">
          <div className="bg-[#050505] border border-[#222] w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white font-black text-xs md:text-base shadow-inner text-center">
            {displayScore1 !== "" ? displayScore1 : "-"}
          </div>
          <span className="text-zinc-600 font-black text-[10px] md:text-[12px]">
            X
          </span>
          <div className="bg-[#050505] border border-[#222] w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white font-black text-xs md:text-base shadow-inner text-center">
            {displayScore2 !== "" ? displayScore2 : "-"}
          </div>
        </div>

        {/* Equipa 2 */}
        <div className="flex items-center justify-end gap-3 md:gap-4 w-[40%] text-right">
          <div className="flex flex-col items-end overflow-hidden flex-1 min-w-0">
            <span className="font-black text-white uppercase text-[10px] md:text-[13px] truncate w-full tracking-wider">
              {p2Name || "TBD"}
            </span>
          </div>
          <TeamBadge
            name={p2Name}
            className="w-8 h-8 md:w-12 md:h-12 object-contain drop-shadow-md shrink-0"
          />
        </div>
      </div>

      {(e1.length > 0 || e2.length > 0) && (
        <div className="flex justify-between w-full mt-4 pt-3 border-t border-[#151515] px-2">
          <div className="w-[45%] flex flex-col items-start gap-1">
            {e1.map((e: any) => (
              <div
                key={e.id}
                className="flex items-center gap-1.5 text-[8px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-wider"
              >
                {e.type === "goal" && "⚽"}
                {e.type === "yellow" && (
                  <div className="w-1.5 h-2.5 bg-yellow-500 rounded-sm"></div>
                )}
                {e.type === "red" && (
                  <div className="w-1.5 h-2.5 bg-red-600 rounded-sm"></div>
                )}
                {e.playerName}
              </div>
            ))}
          </div>
          <div className="w-[45%] flex flex-col items-end gap-1 text-right">
            {e2.map((e: any) => (
              <div
                key={e.id}
                className="flex items-center justify-end gap-1.5 text-[8px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-wider"
              >
                {e.playerName}
                {e.type === "goal" && "⚽"}
                {e.type === "yellow" && (
                  <div className="w-1.5 h-2.5 bg-yellow-500 rounded-sm"></div>
                )}
                {e.type === "red" && (
                  <div className="w-1.5 h-2.5 bg-red-600 rounded-sm"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <button
          onClick={() =>
            setEditingScorersMatch({
              ...match,
              group: !isKnockout,
              score1,
              score2,
            })
          }
          className="mt-4 w-full py-1.5 bg-[#111] hover:bg-[#222] border border-zinc-800 text-[8px] md:text-[9px] text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-lg transition-colors"
        >
          <ListOrdered size={10} className="md:w-3 md:h-3" /> Editar na Súmula
        </button>
      )}

      {isKnockout &&
        p1 !== undefined &&
        p2 !== undefined &&
        p1 !== "" &&
        p2 !== "" && (
          <div className="flex justify-center items-center gap-2 mt-4 pt-3 border-t border-[#151515]">
            <span className="text-amber-500/80 font-bold text-[9px] md:text-[11px] tracking-[0.3em]">
              PÊNALTIS:
            </span>
            <span className="text-white font-black text-[11px] md:text-[13px]">
              {p1} x {p2}
            </span>
          </div>
        )}
    </div>
  );
};

// --- MODAIS GLOBAIS ---
const ImportDataModal = ({ onClose, onImport }: any) => {
  const [text, setText] = useState("");
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4 backdrop-blur-sm translate-no">
      <div className="bg-[#0a0a0a] border border-[#222] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-black p-5 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-black uppercase tracking-wider text-lg text-white flex items-center gap-2">
            <ClipboardPaste size={20} className="text-zinc-400" /> Importar
            Dados Rápidos
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white bg-white/5 p-1.5 rounded-full"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Cole os dados das equipes no formato exato abaixo. Separe as equipes
            pulando uma linha em branco. A primeira linha será o nome do time,
            as seguintes os jogadores e números.
          </p>
          <pre className="bg-black border border-zinc-800 p-4 rounded-lg text-xs text-zinc-500 mb-4 font-mono leading-loose">
            3 ANO A - BRASIL
            <br />
            Mateus 2<br />
            Gabriel 8<br />
          </pre>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-48 bg-[#050505] border border-zinc-700 rounded-xl p-4 text-white text-sm outline-none focus:border-amber-500 focus:bg-black transition-all custom-scrollbar"
            placeholder="Cole os dados aqui..."
          />
        </div>
        <div className="p-5 bg-black border-t border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-bold uppercase text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onImport(text)}
            className="px-6 py-2.5 rounded-full text-xs font-black uppercase bg-white text-black hover:bg-zinc-200 flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <CheckCircle size={16} /> Importar
          </button>
        </div>
      </div>
    </div>
  );
};

const WorldCupTeamsModal = ({ onClose }: any) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4 backdrop-blur-md translate-no">
    <div className="bg-[#0a0a0a] rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#222]">
      <div className="bg-black p-5 border-b border-zinc-800 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h3 className="font-black uppercase tracking-wider text-xl text-white flex items-center gap-3">
            <Globe className="text-zinc-400" /> Seleções da Copa do Mundo 2026
          </h3>
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">
            Lista com as 48 Participantes Classificadas
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-white bg-white/5 p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-6 bg-[#050505] overflow-y-auto flex-1 custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {worldCup2026Teams.map((team, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 hover:bg-zinc-800 hover:border-zinc-600 transition-colors shadow-sm group"
            >
              <div className="w-16 h-11 relative shadow-[0_4px_10px_rgba(0,0,0,0.5)] rounded overflow-hidden">
                <img
                  src={`https://flagcdn.com/w80/${team.code}.png`}
                  alt={team.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-[11px] font-black text-zinc-300 uppercase text-center tracking-wide">
                {team.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const DeleteOptionsModal = ({ onClose, onClear, onDeleteAll }: any) => (
  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[250] p-4 backdrop-blur-sm">
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-[2rem] p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-200 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-1"
      >
        <X size={18} />
      </button>
      <Trash2 className="mx-auto mb-4 text-red-500 mt-2" size={36} />
      <h3 className="text-white text-sm font-black uppercase tracking-wider mb-2">
        Opções de Exclusão
      </h3>
      <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-8">
        O que deseja fazer com o torneio atual?
      </p>
      <div className="space-y-4">
        <button
          onClick={onClear}
          className="w-full px-6 py-4 bg-[#111] border border-[#222] hover:border-amber-500/50 hover:bg-[#151515] transition-all rounded-2xl flex flex-col items-center gap-1.5 group cursor-pointer"
        >
          <span className="text-amber-500 font-black text-xs uppercase tracking-widest group-hover:scale-105 transition-transform">
            Limpar Torneio
          </span>
          <span className="text-zinc-500 font-bold text-[9px] tracking-wider uppercase">
            Apaga nomes e resultados. Mantém regulamento.
          </span>
        </button>
        <button
          onClick={onDeleteAll}
          className="w-full px-6 py-4 bg-[#111] border border-[#222] hover:border-red-500/50 hover:bg-red-500/5 transition-all rounded-2xl flex flex-col items-center gap-1.5 group cursor-pointer"
        >
          <span className="text-red-500 font-black text-xs uppercase tracking-widest group-hover:scale-105 transition-transform">
            Excluir Tudo
          </span>
          <span className="text-red-500/50 font-bold text-[9px] tracking-wider uppercase group-hover:text-red-400/80">
            Apaga tudo e volta para o Hub de Setup.
          </span>
        </button>
      </div>
    </div>
  </div>
);

const AlertModal = ({ message, onClose }: any) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[150] p-4 backdrop-blur-sm">
    <div className="bg-[#111] p-8 rounded-3xl border border-[#222] max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-200 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-1"
      >
        <X size={18} />
      </button>
      <h3 className="text-white text-sm font-black uppercase tracking-wider mt-4 mb-8">
        {message}
      </h3>
      <button
        onClick={onClose}
        className="px-8 py-3 bg-[#1a1a1a] border border-[#333] text-white hover:bg-[#222] font-black uppercase text-xs rounded-full w-full transition-colors"
      >
        Voltar
      </button>
    </div>
  </div>
);

const TeamEditorModal = ({ team, onClose, onSave }: any) => {
  const normalizePlayers = (list: any[] = []) => {
    const source = list.length
      ? list
      : [{ id: generateId(), name: "", number: "1" }];

    return source.map((p: any, idx: number) => {
      const currentNumber = String(p.number ?? "").trim();
      return {
        ...p,
        number: currentNumber || String(idx + 1),
      };
    });
  };

  const [players, setPlayers] = useState(normalizePlayers(team.players));

  useEffect(() => {
    setPlayers(normalizePlayers(team.players));
    // Recarrega o elenco quando outro time é aberto no modal
  }, [team.id]);

  const nextPlayerNumber = () => {
    const usedNumbers = new Set(
      players
        .map((p: any) => parseInt(String(p.number), 10))
        .filter((n: number) => !Number.isNaN(n))
    );
    let n = 1;
    while (usedNumbers.has(n)) n++;
    return String(n);
  };

  const updatePlayer = (id: any, f: any, v: any) =>
    setPlayers((prev: any[]) =>
      prev.map((p: any) => (p.id === id ? { ...p, [f]: v } : p))
    );

  const addPlayerRow = () =>
    setPlayers((prev: any[]) => [
      ...prev,
      { id: generateId(), name: "", number: nextPlayerNumber() },
    ]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm translate-no">
      <div className="bg-[#0a0a0a] border border-[#222] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-black p-5 border-b border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <TeamBadge
              name={team.name}
              className="w-10 h-10 text-sm shadow-lg"
            />
            <div>
              <h3 className="font-black uppercase tracking-wider text-lg text-white">
                {team.name || "Time"}
              </h3>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                Gestão de Elenco
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white bg-white/5 p-1.5 rounded-full"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 bg-[#050505] overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-sm text-left border-separate border-spacing-y-2">
            <thead className="text-[10px] text-zinc-600 uppercase tracking-widest">
              <tr>
                <th className="px-2 pb-2 w-20 text-center">Nº</th>
                <th className="px-2 pb-2">Nome do Jogador</th>
                <th className="px-2 pb-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {players.map((p: any, idx: any) => (
                <tr key={p.id} className="group">
                  <td className="px-1">
                    <input
                      type="number"
                      value={p.number}
                      onChange={(e) =>
                        updatePlayer(p.id, "number", e.target.value)
                      }
                      className="w-full bg-[#111] border border-zinc-800 rounded-xl px-2 py-3 text-center text-white font-bold outline-none focus:border-zinc-500"
                      placeholder="00"
                    />
                  </td>
                  <td className="px-1">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) =>
                        updatePlayer(p.id, "name", e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && idx === players.length - 1)
                          addPlayerRow();
                      }}
                      className="w-full bg-[#111] border border-zinc-800 rounded-xl px-4 py-3 text-white font-bold uppercase outline-none focus:border-zinc-500"
                      placeholder="NOME DO JOGADOR"
                    />
                  </td>
                  <td className="px-1 text-center">
                    <button
                      onClick={() =>
                        setPlayers(players.filter((x: any) => x.id !== p.id))
                      }
                      className="text-zinc-600 hover:text-red-500 hover:bg-red-900/20 p-2 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={addPlayerRow}
            className="mt-4 w-full py-3.5 bg-black hover:bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 uppercase flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={16} /> Adicionar Linha
          </button>
        </div>
        <div className="p-5 bg-black border-t border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-bold uppercase text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              onSave({
                ...team,
                players: players.filter((p: any) => p.name.trim() !== ""),
              })
            }
            className="px-6 py-2.5 rounded-full text-xs font-black uppercase bg-white text-black hover:bg-zinc-200 hover:scale-105 flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <Save size={16} /> Salvar Elenco
          </button>
        </div>
      </div>
    </div>
  );
};

const MatchStatsModal = ({ match, onClose, onSave }: any) => {
  const [stats1, setStats1] = useState({
    goals: match.scorers1 || {},
    yellow: match.yellow1 || {},
    red: match.red1 || {},
  });
  const [stats2, setStats2] = useState({
    goals: match.scorers2 || {},
    yellow: match.yellow2 || {},
    red: match.red2 || {},
  });

  const updateStat = (teamId: any, playerId: any, type: any, delta: any) => {
    const setState = teamId === 1 ? setStats1 : setStats2;
    setState((prev: any) => {
      const next = (prev[type][playerId] || 0) + delta;
      if (type === "yellow" && (next < 0 || next > 2)) return prev;
      if (type === "red" && (next < 0 || next > 1)) return prev;
      if (type === "goals" && next < 0) return prev;
      return { ...prev, [type]: { ...prev[type], [playerId]: next } };
    });
  };

  const renderTeamStats = (team: any, teamId: any, score: any, stats: any) => {
    const tGoals = Object.values(stats.goals).reduce(
      (a: any, b: any) => a + b,
      0
    );
    return (
      <div className="flex-1 bg-black p-4 md:p-5 rounded-2xl border border-zinc-800 flex flex-col">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <TeamBadge name={team.name} className="w-6 h-6 md:w-8 md:h-8" />
            <span className="font-black uppercase text-[10px] md:text-sm truncate text-zinc-200">
              {team.name}
            </span>
          </div>
          <span
            className={`text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-md tracking-widest uppercase ${
              tGoals === score
                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                : tGoals > score
                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800"
            }`}
          >
            {tGoals} / {score} GOLS
          </span>
        </div>
        <div className="flex justify-end pr-2 pb-1 gap-[20px] md:gap-[24px] text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
          <span>
            <SoccerIcon size={12} />
          </span>
          <span>🟨</span>
          <span className="mr-3 md:mr-4">🟥</span>
        </div>
        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-64">
          {team.players?.length === 0 && (
            <p className="text-zinc-600 text-xs italic text-center mt-4">
              Nenhum jogador cadastrado.
            </p>
          )}
          {team.players?.map((p: any) => {
            const [g, y, r] = [
              stats.goals[p.id] || 0,
              stats.yellow[p.id] || 0,
              stats.red[p.id] || 0,
            ];
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-2 rounded-xl border ${
                  g > 0 || y > 0 || r > 0
                    ? "bg-[#111] border-zinc-700"
                    : "bg-[#050505] border-zinc-800/50"
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-[9px] md:text-[10px] text-zinc-500 font-black w-6 shrink-0 bg-black px-1 py-1 rounded text-center border border-zinc-800">
                    {p.number}
                  </span>
                  <span className="text-[10px] md:text-xs font-bold text-zinc-300 uppercase truncate">
                    {p.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex items-center bg-black rounded-lg border border-zinc-800 h-7 md:h-8 px-1">
                    <button
                      onClick={() => updateStat(teamId, p.id, "goals", -1)}
                      className="px-1 md:px-2 text-zinc-500 hover:text-white text-xs md:text-sm"
                    >
                      -
                    </button>
                    <span className="w-3 md:w-4 text-center text-[10px] md:text-[11px] font-black text-zinc-300">
                      {g}
                    </span>
                    <button
                      onClick={() => updateStat(teamId, p.id, "goals", 1)}
                      disabled={tGoals >= score}
                      className="px-1 md:px-2 text-zinc-500 hover:text-white text-xs md:text-sm"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center bg-black rounded-lg border border-zinc-800 h-7 md:h-8 px-1">
                    <button
                      onClick={() => updateStat(teamId, p.id, "yellow", -1)}
                      className="px-1 md:px-1.5 text-yellow-800 hover:text-yellow-500 text-xs md:text-sm"
                    >
                      -
                    </button>
                    <span className="w-3 md:w-4 text-center text-[10px] md:text-[11px] font-black text-yellow-500">
                      {y}
                    </span>
                    <button
                      onClick={() => updateStat(teamId, p.id, "yellow", 1)}
                      disabled={y >= 2}
                      className="px-1 md:px-1.5 text-yellow-800 hover:text-yellow-500 text-xs md:text-sm"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center bg-black rounded-lg border border-zinc-800 h-7 md:h-8 px-1">
                    <button
                      onClick={() => updateStat(teamId, p.id, "red", -1)}
                      className="px-1 md:px-1.5 text-red-900 hover:text-red-500 text-xs md:text-sm"
                    >
                      -
                    </button>
                    <span className="w-3 md:w-4 text-center text-[10px] md:text-[11px] font-black text-red-500">
                      {r}
                    </span>
                    <button
                      onClick={() => updateStat(teamId, p.id, "red", 1)}
                      disabled={r >= 1}
                      className="px-1 md:px-1.5 text-red-900 hover:text-red-500 text-xs md:text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm translate-no">
      <div className="bg-[#0a0a0a] border border-[#222] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-black p-4 md:p-5 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-black text-white uppercase tracking-wider text-sm md:text-lg flex items-center gap-2">
            <ListOrdered size={20} className="text-zinc-500" /> Lançar
            Estatísticas
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white bg-white/5 p-1.5 rounded-full"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 md:p-6 overflow-y-auto flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 bg-[#050505]">
          {renderTeamStats(match.t1, 1, match.score1 || 0, stats1)}
          {renderTeamStats(match.t2, 2, match.score2 || 0, stats2)}
        </div>
        <div className="p-4 md:p-5 bg-black border-t border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase text-zinc-500 hover:text-white hover:bg-zinc-900"
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              onSave({
                scorers1: stats1.goals,
                yellow1: stats1.yellow,
                red1: stats1.red,
                scorers2: stats2.goals,
                yellow2: stats2.yellow,
                red2: stats2.red,
              })
            }
            className="px-6 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase bg-white text-black hover:bg-zinc-200 flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <Save size={14} /> Salvar Dados
          </button>
        </div>
      </div>
    </div>
  );
};

const MatchDetailsViewModal = ({ match, onClose }: any) => {
  const t1Stats = getEventStats(
    match.t1,
    match.scorers1,
    match.yellow1,
    match.red1
  );
  const t2Stats = getEventStats(
    match.t2,
    match.scorers2,
    match.yellow2,
    match.red2
  );
  const { home: displayScore1, away: displayScore2 } = getDisplayScore(
    match.score1,
    match.score2
  );

  const renderCol = (stats: any, isLeft: boolean) => (
    <div
      className={`space-y-4 w-1/2 ${
        isLeft ? "pr-3 md:pr-6 border-r border-[#222]" : "pl-3 md:pl-6"
      }`}
    >
      {stats.length === 0 ? (
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center mt-4">
          Sem eventos
        </p>
      ) : (
        stats.map((s: any, i: any) => (
          <div
            key={i}
            className={`flex items-center gap-2 text-[9px] md:text-xs font-bold uppercase text-zinc-400 ${
              isLeft ? "justify-end flex-row-reverse" : "justify-start"
            } flex-wrap`}
          >
            <div className="flex items-center gap-1.5 shrink-0">
              {s.goals > 0 &&
                Array.from({ length: s.goals }).map((_, idx) => (
                  <SoccerIcon
                    key={`g${idx}`}
                    size={12}
                    className="text-zinc-300"
                  />
                ))}
              {s.yellow > 0 &&
                Array.from({ length: s.yellow }).map((_, idx) => (
                  <div
                    key={`y${idx}`}
                    className="w-1.5 h-2.5 bg-yellow-500 rounded-sm shadow-sm"
                  />
                ))}
              {s.red > 0 && (
                <div className="w-1.5 h-2.5 bg-red-600 rounded-sm shadow-sm" />
              )}
            </div>
            <span className="truncate max-w-[80px] md:max-w-[150px] leading-tight text-white">
              {s.name}
            </span>
            <span className="text-[8px] bg-[#111] border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 shrink-0">
              Nº {s.number}
            </span>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm translate-no">
      <div className="bg-[#0a0a0a] border border-[#222] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-black p-4 border-b border-zinc-800 relative flex justify-center items-center">
          <h3 className="font-black uppercase tracking-wider text-xs md:text-sm text-zinc-300">
            {match.tag || "Detalhes da Partida"}
          </h3>
          <button
            onClick={onClose}
            className="absolute right-4 text-zinc-500 hover:text-white bg-white/5 p-1.5 rounded-full"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 md:p-8 bg-[#050505] flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-center gap-3 md:gap-8 mb-8 md:mb-10 border-b border-[#222] pb-8 md:pb-10">
            <div className="flex-1 flex flex-col items-center gap-3">
              <TeamBadge
                name={typeof match.t1 === "string" ? "" : match.t1.name}
                className="w-16 h-16 md:w-20 md:h-20 text-xl md:text-2xl shadow-xl"
              />
              <span className="font-black uppercase text-[10px] md:text-sm text-zinc-300 text-center">
                {typeof match.t1 === "string" ? match.t1 : match.t1.name}
              </span>
            </div>
            <div className="flex items-center gap-3 md:gap-6 bg-[#111] border border-[#222] px-6 py-4 rounded-3xl shadow-inner">
              <span className="text-3xl md:text-5xl font-black text-white">
                {displayScore1 !== "" ? displayScore1 : "-"}
              </span>
              <span className="text-zinc-600 text-sm md:text-lg font-black">
                X
              </span>
              <span className="text-3xl md:text-5xl font-black text-white">
                {displayScore2 !== "" ? displayScore2 : "-"}
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-3">
              <TeamBadge
                name={typeof match.t2 === "string" ? "" : match.t2.name}
                className="w-16 h-16 md:w-20 md:h-20 text-xl md:text-2xl shadow-xl"
              />
              <span className="font-black uppercase text-[10px] md:text-sm text-zinc-300 text-center">
                {typeof match.t2 === "string" ? match.t2 : match.t2.name}
              </span>
            </div>
          </div>
          <div className="flex w-full">
            {renderCol(t1Stats, true)}
            {renderCol(t2Stats, false)}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 🏛️ COMPONENTE PRINCIPAL MÓDULO KINGS LEAGUE / FUTSAL
// ============================================================================
export default function KingsLeagueApp({
  onBack,
  isAdmin,
  onAccessDenied,
}: any) {
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Config do HUB
  const [tournamentConfig, setTournamentConfig] = useState<any>(null);

  // Modais de Controle
  const [alertDialog, setAlertDialog] = useState<any>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWorldCupTeams, setShowWorldCupTeams] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [editingScorersMatch, setEditingScorersMatch] = useState<any>(null);
  const [viewingMatchDetails, setViewingMatchDetails] = useState<any>(null);

  // Estado UI Abas
  const [activeTab, setActiveTab] = useState("groups");
  const [activeGeneralTab, setActiveGeneralTab] = useState("standings");
  const [activeSummaryTab, setActiveSummaryTab] = useState("groups");
  const [redrawCount, setRedrawCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [championFired, setChampionFired] = useState("");

  // Estados Nuvem / Torneio
  const [phase, setPhase] = useState("setup");
  const [teams, setTeams] = useState<any[]>([]);
  const [groups, setGroups] = useState<any>({});
  const [matches, setMatches] = useState<any[]>([]);

  const [knockoutStep, setKnockoutStep] = useState("unstarted");
  const [knockoutPlayers, setKnockoutPlayers] = useState<any[]>([]);
  const [knockoutDraw, setKnockoutDraw] = useState<any[]>([]);
  const [knockoutScores, setKnockoutScores] = useState<any>({});

  // Lógica Adaptativa Dinâmica (Ligas sem grupos)
  const isSingleGroup = tournamentConfig?.rules?.groupsCount === 1;
  const isPureLeague = tournamentConfig?.format === "league";

  const GROUPS_KEYS = useMemo(() => {
    const existingGroupKeys = Object.keys(groups || {});
    const fallbackCount = inferDefaultGroupCount(
      tournamentConfig?.numTeams || teams.length || 12
    );

    if (!tournamentConfig || !tournamentConfig.rules) {
      return existingGroupKeys.length > 0
        ? existingGroupKeys
        : getGroupKeysFromCount(fallbackCount);
    }

    const fmt = tournamentConfig.format;
    if (fmt === "league" || fmt === "league_knockout" || fmt === "knockout") {
      return ["A"];
    }

    if (fmt === "groups_knockout") {
      const fromHub = tournamentConfig.rules.groupsCount;
      const count =
        fromHub && fromHub > 1
          ? fromHub
          : inferDefaultGroupCount(
              tournamentConfig.numTeams || teams.length || 12
            );
      return getGroupKeysFromCount(count);
    }

    const count =
      tournamentConfig.rules.groupsCount ||
      existingGroupKeys.length ||
      fallbackCount;
    return getGroupKeysFromCount(count);
  }, [tournamentConfig, groups, teams.length]);

  const getCleanDefaultPlayers = (size: number) => Array(size).fill("");

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        enableNetwork(db).catch(console.error);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (
      isLoaded &&
      (phase === "setup" || phase === "inserir_nomes") &&
      !isAdmin
    ) {
      if (onAccessDenied) onAccessDenied();
    }
  }, [isLoaded, phase, isAdmin, onAccessDenied]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const initialAuthToken =
          typeof window !== "undefined"
            ? (window as any).__initial_auth_token
            : undefined;
        if (initialAuthToken) {
          try {
            await signInWithCustomToken(auth, initialAuthToken);
          } catch (tokenErr) {
            console.warn("Token falhou, a tentar anónimo", tokenErr);
            await signInAnonymously(auth);
          }
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Erro na autenticação", e);
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "tournaments",
      "kings_league"
    );
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();

          if (data.config !== undefined) setTournamentConfig(data.config);
          if (data.phase !== undefined) setPhase(data.phase);
          if (data.groups !== undefined) setGroups(data.groups);
          if (data.matches !== undefined) setMatches(data.matches);
          if (data.knockoutStep !== undefined)
            setKnockoutStep(data.knockoutStep);
          if (data.knockoutPlayers !== undefined)
            setKnockoutPlayers(data.knockoutPlayers);
          if (data.knockoutDraw !== undefined)
            setKnockoutDraw(data.knockoutDraw);
          if (data.knockoutScores !== undefined)
            setKnockoutScores(data.knockoutScores);

          const numT = data.config?.numTeams || 12; // fallback neutro; hub sempre envia o valor correto
          if (data.teams && data.teams.length > 0) {
            let adjusted = [...data.teams];
            if (adjusted.length < numT) {
              while (adjusted.length < numT)
                adjusted.push({ id: generateId(), name: "", players: [] });
            } else if (adjusted.length > numT) {
              adjusted = adjusted.slice(0, numT);
            }
            setTeams(adjusted);
          } else {
            setTeams(
              Array.from({ length: numT }, () => ({
                id: generateId(),
                name: "",
                players: [],
              }))
            );
          }
        }
        setIsLoaded(true);
      },
      (err) => {
        console.error("Erro ao sincronizar do Firestore", err);
        setIsLoaded(true);
      }
    );
    return () => unsub();
  }, [user]);

  const updateDB = async (updates: any) => {
    if (!user || !isAdmin) return;
    try {
      const docRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "tournaments",
        "kings_league"
      );
      await setDoc(docRef, updates, { merge: true });
    } catch (e) {
      console.error("Erro ao salvar", e);
    }
  };

  const limparTorneio = () => {
    const numT = tournamentConfig?.numTeams || teams.length || 12;
    const emptyTeams = Array.from({ length: numT }, () => ({
      id: generateId(),
      name: "",
      players: [],
    }));

    setPhase("inserir_nomes");
    setTeams(emptyTeams);
    setGroups({});
    setMatches([]);
    setKnockoutStep("unstarted");
    setKnockoutPlayers([]);
    setKnockoutDraw([]);
    setKnockoutScores({});
    setActiveTab("groups");
    setRedrawCount(0);
    setChampionFired("");

    updateDB({
      phase: "inserir_nomes",
      teams: emptyTeams,
      groups: {},
      matches: [],
      knockoutStep: "unstarted",
      knockoutPlayers: [],
      knockoutDraw: [],
      knockoutScores: {},
    });
    setShowDeleteModal(false);
  };

  const excluirTorneioCompleto = () => {
    setPhase("setup");
    setTeams([]);
    setGroups({});
    setMatches([]);
    setKnockoutStep("unstarted");
    setKnockoutPlayers([]);
    setKnockoutDraw([]);
    setKnockoutScores({});
    setTournamentConfig(null);
    setActiveTab("groups");
    setRedrawCount(0);
    setChampionFired("");

    updateDB({
      phase: "setup",
      config: null,
      teams: [],
      groups: {},
      matches: [],
      knockoutStep: "unstarted",
      knockoutPlayers: [],
      knockoutDraw: [],
      knockoutScores: {},
    });
    setShowDeleteModal(false);
    if (onBack) onBack();
  };

  const handleImportList = (text: string) => {
    const blocks = text.split(/\n\s*\n/);
    const newTeams = [...teams];
    let currentIdx = newTeams.findIndex((t) => t.name.trim() === "");
    if (currentIdx === -1) currentIdx = 0;

    blocks.forEach((block) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim().toUpperCase())
        .filter(Boolean);
      if (lines.length > 0 && currentIdx < newTeams.length) {
        const teamName = lines[0];
        const parsedPlayers = lines.slice(1).map((l, idx) => {
          const match = l.match(/^(.*?)\s+(\d+)$/);
          if (match)
            return { id: generateId(), name: match[1], number: match[2] };
          return {
            id: generateId(),
            name: l,
            number: String(idx + 1),
          };
        });
        newTeams[currentIdx] = {
          ...newTeams[currentIdx],
          name: teamName,
          players:
            parsedPlayers.length > 0
              ? parsedPlayers
              : newTeams[currentIdx].players,
        };
        currentIdx++;
      }
    });
    setTeams(newTeams);
    updateDB({ teams: newTeams });
    setShowImportModal(false);
    setAlertDialog({ message: "Dados importados com sucesso!" });
  };

  const fillDummyNames = () => {
    const dummyNamesPool = [
      "3º ANO A - BRASIL",
      "3º ANO B - ESPANHA",
      "3º ANO C - PORTUGAL",
      "3º ANO D - ARGENTINA",
      "3º ANO E - ITÁLIA",
      "3º ANO F - FRANÇA",
      "2º ANO A - ALEMANHA",
      "2º ANO B - HOLANDA",
      "2º ANO C - INGLATERRA",
      "2º ANO D - URUGUAI",
      "2º ANO E - BÉLGICA",
      "2º ANO F - CROÁCIA",
      "1º ANO A - JAPÃO",
      "1º ANO B - EUA",
      "1º ANO C - MÉXICO",
      "1º ANO D - SENEGAL",
      "1º ANO E - MARROCOS",
      "1º ANO F - CANADÁ",
      "9º ANO A - SUÍÇA",
      "9º ANO B - SUÉCIA",
      "9º ANO C - DINAMARCA",
      "9º ANO D - POLÔNIA",
      "9º ANO E - SÉRVIA",
      "9º ANO F - ÁUSTRIA",
      "8º ANO A - CHILE",
      "8º ANO B - COLÔMBIA",
      "8º ANO C - PERU",
      "8º ANO D - EQUADOR",
      "8º ANO E - PARAGUAI",
      "8º ANO F - VENEZUELA",
    ];
    const dummyPlayersPool = [
      "GABRIEL",
      "LUCAS",
      "MATEUS",
      "PEDRO",
      "GUSTAVO",
      "DANIEL",
      "RAFAEL",
      "BRUNO",
      "JOAO",
      "FELIPE",
      "THIAGO",
      "DAVI",
      "ENZO",
      "LEO",
      "HENRIQUE",
      "VINICIUS",
      "CAIO",
      "SAMUEL",
      "MIGUEL",
      "NATHAN",
      "IGOR",
      "HEITOR",
      "ARTHUR",
      "YURI",
      "ALEX",
      "LUIZ",
      "RAPHAEL",
      "RAVI",
      "VITOR",
      "OTAVIO",
      "BENJAMIN",
      "PABLO",
      "KAIQUE",
      "EDUARDO",
      "AUGUSTO",
      "RAIAN",
      "ALAN",
      "CAUÃ",
      "PAULO",
      "DAVI LUCAS",
    ];
    const totalRequired = tournamentConfig?.numTeams || teams.length || 12;
    const selectedNames = dummyNamesPool.slice(0, totalRequired);
    while (selectedNames.length < totalRequired)
      selectedNames.push("TURMA EXTRA " + (selectedNames.length + 1));

    const rosterSize = tournamentConfig?.rules?.playersPerTeam || 5;
    const newTeams = selectedNames.map((name, teamIdx) => {
      const players = Array.from({ length: rosterSize }, (_, playerIdx) => {
        const playerName =
          dummyPlayersPool[
            (teamIdx * rosterSize + playerIdx) % dummyPlayersPool.length
          ];
        return {
          id: generateId(),
          name: playerName,
          number: String(playerIdx + 1),
        };
      });

      return {
        id: generateId(),
        name: name,
        players,
      };
    });

    setTeams(newTeams);
    updateDB({ teams: newTeams });
  };

  const simulateGroupMatches = () => {
    setMatches((prev) => {
      const next = prev.map((m) => {
        if (m.score1 !== "" && m.score2 !== "") return m;
        const s1 = Math.floor(Math.random() * 5);
        const s2 = Math.floor(Math.random() * 5);
        const st1 = simulateTeamStats(m.t1, s1);
        const st2 = simulateTeamStats(m.t2, s2);
        return {
          ...m,
          score1: s1,
          score2: s2,
          scorers1: st1.goals,
          yellow1: st1.yellow,
          red1: st1.red,
          scorers2: st2.goals,
          yellow2: st2.yellow,
          red2: st2.red,
        };
      });
      updateDB({ matches: next });
      return next;
    });
  };

  const simulateCurrentKnockout = () => {
    const extractReadyMatches = (node: any, ready: any[] = []) => {
      if (!node) return ready;
      const m = node.match;
      const s = knockoutScores[m.id] || { s1: "", s2: "" };
      const isTBD = typeof m.t1 === "string" || typeof m.t2 === "string";
      if (!isTBD && s.s1 === "" && s.s2 === "") ready.push(m.id);
      if (node.children)
        node.children.forEach((c: any) => extractReadyMatches(c, ready));
      return ready;
    };
    const readyMatchIds = extractReadyMatches(bracketTree?.tree);
    if (readyMatchIds.length === 0)
      return setAlertDialog({
        message: "Nenhuma partida pendente pronta para simular.",
      });

    setKnockoutScores((prev: any) => {
      const nextState = { ...prev };
      readyMatchIds.forEach((id) => {
        const flatM = allKnockoutMatchesFlat.find((x: any) => x.id === id);
        let s1 = Math.floor(Math.random() * 4);
        let s2 = Math.floor(Math.random() * 4);
        let p1: any = "";
        let p2: any = "";
        if (s1 === s2) {
          p1 = Math.floor(Math.random() * 5) + 3;
          p2 = Math.floor(Math.random() * 5);
          if (p1 === p2) p1++;
        }

        const st1 = flatM
          ? simulateTeamStats(flatM.t1, s1)
          : createEmptyStats();
        const st2 = flatM
          ? simulateTeamStats(flatM.t2, s2)
          : createEmptyStats();

        nextState[id] = {
          ...nextState[id],
          s1,
          s2,
          p1,
          p2,
          scorers1: st1.goals,
          yellow1: st1.yellow,
          red1: st1.red,
          scorers2: st2.goals,
          yellow2: st2.yellow,
          red2: st2.red,
        };
      });
      updateDB({ knockoutScores: nextState });
      return nextState;
    });
  };

  const performDraw = () => {
    const validTeams = teams.filter((t) => t.name.trim() !== "");
    const totalRequired = tournamentConfig?.numTeams || teams.length || 12;

    if (validTeams.length < totalRequired)
      return setAlertDialog({
        message: `Insira pelo menos ${totalRequired} equipas.`,
      });

    const shuffled = shuffleArray(validTeams);

    const numGroups = GROUPS_KEYS.length;
    const teamsPerGroup =
      tournamentConfig?.rules?.teamsPerGroup ||
      Math.floor(shuffled.length / numGroups);
    const extraTeams =
      tournamentConfig?.rules?.extraTeams !== undefined
        ? tournamentConfig.rules.extraTeams
        : shuffled.length % numGroups;

    const newGroups: any = {};
    let currentIdx = 0;

    GROUPS_KEYS.forEach((g, idx) => {
      const currentGroupSize = teamsPerGroup + (idx < extraTeams ? 1 : 0);
      newGroups[g] = shuffled.slice(currentIdx, currentIdx + currentGroupSize);
      currentIdx += currentGroupSize;
    });

    setGroups(newGroups);
    setPhase("draw");
    updateDB({ groups: newGroups, phase: "draw" });
  };

  const generateTournament = () => {
    let newMatches: any[] = [];
    Object.entries(groups).forEach(([g, t]: [string, any]) => {
      for (let i = 0; i < t.length; i++) {
        for (let j = i + 1; j < t.length; j++) {
          newMatches.push({
            id: `${g}-m-${i}-${j}`,
            group: g,
            t1: t[i],
            t2: t[j],
            score1: "",
            score2: "",
            scorers1: {},
            yellow1: {},
            red1: {},
            scorers2: {},
            yellow2: {},
            red2: {},
          });
        }
      }
    });

    setMatches(newMatches);
    setPhase("tournament");
    setActiveTab("groups");
    updateDB({ matches: newMatches, phase: "tournament" });
  };

  const updateMatchScore = (matchId: string, field: string, value: any) => {
    setMatches((prev) => {
      const next = prev.map((m) => {
        if (m.id !== matchId) return m;
        const normalizedValue = value === "" ? "" : parseInt(value, 10);
        const otherField = field === "score1" ? "score2" : "score1";
        const shouldAutoFillOther =
          normalizedValue !== "" &&
          (m[otherField] === "" || m[otherField] === undefined);
        return {
          ...m,
          [field]: normalizedValue,
          ...(shouldAutoFillOther ? { [otherField]: 0 } : {}),
        };
      });
      updateDB({ matches: next });
      return next;
    });
  };

  const saveMatchStats = (matchId: string, stats: any) => {
    setMatches((prev: any) => {
      const next = prev.map((m: any) =>
        m.id === matchId ? { ...m, ...stats } : m
      );
      updateDB({ matches: next });
      return next;
    });
  };

  const updateKoScore = (mId: string, f: string, v: any) => {
    setKnockoutScores((p: any) => {
      const current = p[mId] || {
        s1: "",
        s2: "",
        scorers1: {},
        scorers2: {},
        yellow1: {},
        yellow2: {},
        red1: {},
        red2: {},
      };
      const normalizedValue = v === "" ? "" : parseInt(v, 10);
      const otherField = f === "s1" ? "s2" : "s1";
      const shouldAutoFillOther =
        normalizedValue !== "" &&
        (current[otherField] === "" || current[otherField] === undefined);
      const next = {
        ...p,
        [mId]: {
          ...current,
          [f]: normalizedValue,
          ...(shouldAutoFillOther ? { [otherField]: 0 } : {}),
        },
      };
      updateDB({ knockoutScores: next });
      return next;
    });
  };

  const saveKoStats = (matchId: string, stats: any) => {
    setKnockoutScores((p: any) => {
      const current = p[matchId] || { s1: "", s2: "" };
      const next = { ...p, [matchId]: { ...current, ...stats } };
      updateDB({ knockoutScores: next });
      return next;
    });
  };

  const performKnockoutDraw = async (skipAnimation: boolean) => {
    if (!isAdmin) return;
    setIsDrawing(true);

    const half = knockoutPlayers.length / 2;
    const pot1 = shuffleArray(knockoutPlayers.slice(0, half));
    const pot2 = shuffleArray(
      knockoutPlayers.slice(half, knockoutPlayers.length)
    );
    const draws = [];

    const prefix =
      half === 16
        ? "T"
        : half === 8
        ? "O"
        : half === 4
        ? "Q"
        : half === 2
        ? "S"
        : half === 1
        ? "F"
        : "M";

    if (skipAnimation) {
      for (let i = 0; i < half; i++)
        draws.push({
          t1: pot1[i].team,
          t2: pot2[i].team,
          id: `${prefix}${i + 1}`,
        });
      setKnockoutDraw(draws);
      updateDB({ knockoutDraw: draws });
      setIsDrawing(false);
    } else {
      setKnockoutDraw([]);
      for (let i = 0; i < half; i++) {
        draws.push({
          t1: pot1[i].team,
          t2: pot2[i].team,
          id: `${prefix}${i + 1}`,
        });
        setKnockoutDraw([...draws]);
        await updateDB({ knockoutDraw: [...draws] });
        await new Promise((r) => setTimeout(r, 1500));
      }
      setIsDrawing(false);
    }
  };

  const groupStandings = useMemo(() => {
    if (phase !== "tournament") return {};
    const calc: any = {};
    GROUPS_KEYS.forEach((g) => {
      if (!groups[g]) return;
      let stats = groups[g].map((team: any) => ({
        team,
        group: g,
        pts: 0,
        v: 0,
        e: 0,
        d: 0,
        gf: 0,
        gc: 0,
        sg: 0,
      }));
      matches
        .filter((m) => m.group === g)
        .forEach((m) => {
          if (m.score1 !== "" && m.score2 !== "") {
            let t1 = stats.find((s: any) => s.team.id === m.t1.id);
            let t2 = stats.find((s: any) => s.team.id === m.t2.id);
            if (t1 && t2) {
              t1.gf += m.score1;
              t1.gc += m.score2;
              t1.sg = t1.gf - t1.gc;
              t2.gf += m.score2;
              t2.gc += m.score1;
              t2.sg = t2.gf - t2.gc;
              if (m.score1 > m.score2) {
                t1.pts += 3;
                t1.v += 1;
                t2.d += 1;
              } else if (m.score1 < m.score2) {
                t2.pts += 3;
                t2.v += 1;
                t1.d += 1;
              } else {
                t1.pts += 1;
                t2.pts += 1;
                t1.e += 1;
                t2.e += 1;
              }
            }
          }
        });
      calc[g] = stats.sort((a: any, b: any) =>
        b.pts !== a.pts
          ? b.pts - a.pts
          : b.sg !== a.sg
          ? b.sg - a.sg
          : b.v !== a.v
          ? b.v - a.v
          : b.gf - a.gf
      );
    });
    return calc;
  }, [matches, groups, phase, GROUPS_KEYS]);

  const generalStandings = useMemo(() => {
    return phase === "tournament"
      ? Object.values(groupStandings)
          .flat()
          .sort((a: any, b: any) =>
            b.pts !== a.pts
              ? b.pts - a.pts
              : b.sg !== a.sg
              ? b.sg - a.sg
              : b.v !== a.v
              ? b.v - a.v
              : b.gf - a.gf
          )
      : [];
  }, [groupStandings, phase]);

  const bracketTree = useMemo(() => {
    if (
      knockoutStep !== "bracket" ||
      !knockoutDraw ||
      knockoutDraw.length === 0
    )
      return { tree: null, F: null };

    const mapToP = (drawP: any) => (drawP ? drawP : "TBD");

    const getWinner = (mId: string, t1: any, t2: any) => {
      const s = knockoutScores[mId];
      if (!s || s.s1 === "" || s.s2 === "") return null;
      if (s.s1 > s.s2) return t1;
      if (s.s2 > s.s1) return t2;
      if (s.p1 !== "" && s.p2 !== "") return s.p1 > s.p2 ? t1 : t2;
      return null;
    };

    const totalDraws = knockoutDraw.length;

    const getPhaseAndPrefix = (drawsCount: number) => {
      if (drawsCount === 16) return { phaseName: "16 Avos", prefix: "T" };
      if (drawsCount === 8) return { phaseName: "Oitavas", prefix: "O" };
      if (drawsCount === 4) return { phaseName: "Quartas", prefix: "Q" };
      if (drawsCount === 2) return { phaseName: "Semifinal", prefix: "S" };
      if (drawsCount === 1) return { phaseName: "Grande Final", prefix: "F" };
      return { phaseName: "Mata-Mata", prefix: "M" };
    };

    let { phaseName, prefix } = getPhaseAndPrefix(totalDraws);

    let currentRoundNodes = knockoutDraw.map((draw, i) => {
      return {
        match: {
          id: `${prefix}${i + 1}`,
          t1: mapToP(draw.t1),
          t2: mapToP(draw.t2),
          tag: `${phaseName} ${totalDraws > 1 ? i + 1 : ""}`.trim(),
          isFinal: totalDraws === 1,
        },
      };
    });

    while (currentRoundNodes.length > 1) {
      const nextRoundNodes = [];
      const totalNextDraws = Math.ceil(currentRoundNodes.length / 2);
      const nextPhase = getPhaseAndPrefix(totalNextDraws);

      for (let i = 0; i < totalNextDraws; i++) {
        const child1 = currentRoundNodes[i * 2];
        const child2 = currentRoundNodes[i * 2 + 1];

        const m1 = child1?.match;
        const m2 = child2?.match;

        const w1 = m1
          ? getWinner(m1.id, m1.t1, m1.t2) || `Venc. ${m1.id}`
          : "BYE";
        const w2 = m2
          ? getWinner(m2.id, m2.t1, m2.t2) || `Venc. ${m2.id}`
          : "BYE";

        nextRoundNodes.push({
          match: {
            id: `${nextPhase.prefix}${i + 1}`,
            t1: w1,
            t2: w2,
            tag: `${nextPhase.phaseName} ${
              totalNextDraws > 1 ? i + 1 : ""
            }`.trim(),
            isFinal: totalNextDraws === 1,
          },
          children: [child1, child2].filter(Boolean),
        });
      }
      currentRoundNodes = nextRoundNodes;
    }

    return { tree: currentRoundNodes[0], F: currentRoundNodes[0]?.match };
  }, [knockoutStep, knockoutDraw, knockoutScores]);

  const allKnockoutMatchesFlat = useMemo(
    () => flattenBracket(bracketTree.tree),
    [bracketTree]
  );

  const topScorers = useMemo(() => {
    if (phase !== "tournament") return [];
    const playerGoals: any = {};
    const addGoals = (scorersMap: any) => {
      if (scorersMap)
        Object.entries(scorersMap).forEach(([pId, goals]: any) => {
          playerGoals[pId] = (playerGoals[pId] || 0) + goals;
        });
    };
    matches.forEach((m: any) => {
      addGoals(m.scorers1);
      addGoals(m.scorers2);
    });
    Object.values(knockoutScores).forEach((m: any) => {
      addGoals(m.scorers1);
      addGoals(m.scorers2);
    });

    const result: any[] = [];
    Object.entries(playerGoals).forEach(([pId, goals]: any) => {
      if (goals > 0) {
        for (const t of teams) {
          const player = t.players?.find((pl: any) => pl.id === pId);
          if (player) {
            result.push({
              id: pId,
              name: player.name,
              number: player.number,
              team: t,
              goals: goals,
            });
            break;
          }
        }
      }
    });
    return result.sort((a: any, b: any) => b.goals - a.goals);
  }, [matches, knockoutScores, phase, teams]);

  const overallStatsTable = useMemo(() => {
    if (phase !== "tournament" || teams.length === 0) return [];
    const statsMap: any = {};
    teams.forEach((t) => {
      statsMap[t.id] = {
        team: t,
        j: 0,
        v: 0,
        e: 0,
        d: 0,
        gp: 0,
        gc: 0,
        sg: 0,
        pts: 0,
        aprov: 0,
      };
    });
    matches.forEach((m) => {
      if (m.score1 !== "" && m.score2 !== "") {
        const p1 = m.t1.id;
        const p2 = m.t2.id;
        const s1 = parseInt(m.score1, 10);
        const s2 = parseInt(m.score2, 10);
        if (statsMap[p1] && statsMap[p2]) {
          statsMap[p1].j++;
          statsMap[p2].j++;
          statsMap[p1].gp += s1;
          statsMap[p2].gp += s2;
          statsMap[p1].gc += s2;
          statsMap[p2].gc += s1;
          if (s1 > s2) {
            statsMap[p1].v++;
            statsMap[p2].d++;
            statsMap[p1].pts += 3;
          } else if (s1 < s2) {
            statsMap[p2].v++;
            statsMap[p1].d++;
            statsMap[p2].pts += 3;
          } else {
            statsMap[p1].e++;
            statsMap[p2].e++;
            statsMap[p1].pts += 1;
            statsMap[p2].pts += 1;
          }
        }
      }
    });
    if (allKnockoutMatchesFlat && allKnockoutMatchesFlat.length > 0) {
      allKnockoutMatchesFlat.forEach((m: any) => {
        const s = knockoutScores[m.id];
        if (s && s.s1 !== "" && s.s2 !== "") {
          const p1Id = m.t1?.id;
          const p2Id = m.t2?.id;
          const s1 = parseInt(s.s1, 10);
          const s2 = parseInt(s.s2, 10);
          if (p1Id && p2Id && statsMap[p1Id] && statsMap[p2Id]) {
            statsMap[p1Id].j++;
            statsMap[p2Id].j++;
            statsMap[p1Id].gp += s1;
            statsMap[p2Id].gp += s2;
            statsMap[p1Id].gc += s2;
            statsMap[p2Id].gc += s1;
            if (s1 > s2) {
              statsMap[p1Id].v++;
              statsMap[p2Id].d++;
              statsMap[p1Id].pts += 3;
            } else if (s1 < s2) {
              statsMap[p2Id].v++;
              statsMap[p1Id].d++;
              statsMap[p2Id].pts += 3;
            } else {
              statsMap[p1Id].e++;
              statsMap[p2Id].e++;
              statsMap[p1Id].pts += 1;
              statsMap[p2Id].pts += 1;
            }
          }
        }
      });
    }
    Object.values(statsMap).forEach((st: any) => {
      st.sg = st.gp - st.gc;
      st.aprov = st.j > 0 ? ((st.pts / (st.j * 3)) * 100).toFixed(1) : "0.0";
    });
    return Object.values(statsMap).sort((a: any, b: any) =>
      b.pts !== a.pts
        ? b.pts - a.pts
        : b.sg !== a.sg
        ? b.sg - a.sg
        : b.gp !== a.gp
        ? b.gp - a.gp
        : b.v - a.v
    );
  }, [phase, teams, matches, allKnockoutMatchesFlat, knockoutScores]);

  // 🌟 CAMPEÃO CORRIGIDO E BLINDADO
  const grandChampion = useMemo(() => {
    if (isPureLeague) {
      if (matches.length === 0 || phase !== "tournament") return null;
      const allPlayed = matches.every(
        (m) => m.score1 !== "" && m.score2 !== ""
      );
      if (allPlayed && overallStatsTable.length > 0) {
        return overallStatsTable[0].team;
      }
      return null;
    }

    if (!bracketTree || !bracketTree.F) return null;
    const m = bracketTree.F;
    const f1Score = knockoutScores[m.id];
    if (!f1Score || f1Score.s1 === "" || f1Score.s2 === "") return null;

    let winner = null;
    if (f1Score.s1 > f1Score.s2) winner = m.t1;
    else if (f1Score.s2 > f1Score.s1) winner = m.t2;
    else if (f1Score.p1 !== "" && f1Score.p2 !== "") {
      if (f1Score.p1 > f1Score.p2) winner = m.t1;
      else if (f1Score.p2 > f1Score.p1) winner = m.t2;
    }
    return winner;
  }, [
    isPureLeague,
    matches,
    phase,
    overallStatsTable,
    bracketTree,
    knockoutScores,
  ]);

  // 🌟 CONFETE: Dispara apenas UMA VEZ central e seguro
  useEffect(() => {
    let timer: any;
    const champName =
      typeof grandChampion === "string" ? grandChampion : grandChampion?.name;
    if (
      champName &&
      championFired !== champName &&
      typeof (window as any).confetti === "function"
    ) {
      timer = setTimeout(() => {
        (window as any).confetti({
          particleCount: 800,
          spread: 160,
          origin: { y: 0.35, x: 0.5 },
          colors: ["#fbbf24", "#f59e0b", "#ffffff", "#eab308"],
          ticks: 500,
          gravity: 0.9,
          startVelocity: 70,
        });
        setChampionFired(champName);
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [grandChampion, championFired]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <RefreshCw size={32} className="animate-spin text-zinc-600" />
        <p className="text-xs font-bold tracking-widest uppercase text-zinc-400">
          Carregando Nuvem...
        </p>
      </div>
    );
  }

  const getBracketHeaders = (tk: number) => {
    if (tk === 64)
      return [
        "32 Avos",
        "16 Avos",
        "Oitavas",
        "Quartas",
        "Semis",
        "Grande Final",
      ];
    if (tk === 32)
      return ["16 Avos", "Oitavas", "Quartas", "Semis", "Grande Final"];
    if (tk === 16) return ["Oitavas", "Quartas", "Semis", "Grande Final"];
    if (tk === 8) return ["Quartas", "Semis", "Grande Final"];
    if (tk === 4) return ["Semis", "Grande Final"];
    if (tk === 2) return ["Grande Final"];
    return ["Mata-Mata"];
  };
  const bracketHeadersList = getBracketHeaders(knockoutPlayers.length);

  return (
    <div className="max-w-[1400px] mx-auto relative w-full pt-4 px-2 md:px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap'); 
        .font-oswald { font-family: 'Oswald', sans-serif; }
        @media print { @page { margin: 0; } body { padding: 1.5cm; background: white; color: black; } .avoid-page-break { page-break-inside: avoid; break-inside: avoid; } }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      {/* Modais */}
      {showWorldCupTeams && (
        <WorldCupTeamsModal onClose={() => setShowWorldCupTeams(false)} />
      )}
      {showImportModal && (
        <ImportDataModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportList}
        />
      )}
      {alertDialog && (
        <AlertModal
          message={alertDialog.message}
          onClose={() => setAlertDialog(null)}
        />
      )}
      {showDeleteModal && (
        <DeleteOptionsModal
          onClose={() => setShowDeleteModal(false)}
          onClear={limparTorneio}
          onDeleteAll={excluirTorneioCompleto}
        />
      )}
      {editingTeam && (
        <TeamEditorModal
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
          onSave={(u: any) => {
            const nt = teams.map((t: any) => (t.id === u.id ? u : t));
            setTeams(nt);
            updateDB({ teams: nt });
            setEditingTeam(null);
          }}
        />
      )}
      {editingScorersMatch && isAdmin && (
        <MatchStatsModal
          match={editingScorersMatch}
          onClose={() => setEditingScorersMatch(null)}
          onSave={(stats: any) => {
            if (editingScorersMatch.group)
              saveMatchStats(editingScorersMatch.id, stats);
            else saveKoStats(editingScorersMatch.id, stats);
            setEditingScorersMatch(null);
          }}
        />
      )}
      {viewingMatchDetails && (
        <MatchDetailsViewModal
          match={viewingMatchDetails}
          onClose={() => setViewingMatchDetails(null)}
        />
      )}

      {/* --- SETUP / INSERIR NOMES (ADMIN) --- */}
      {(phase === "setup" || phase === "inserir_nomes") && isAdmin && (
        <div className="max-w-5xl mx-auto w-full animate-in fade-in pt-8">
          <div className="flex flex-col items-center justify-center mb-12">
            <h2 className="text-white tracking-[0.3em] uppercase text-lg font-black mt-2 flex items-center gap-2">
              {tournamentConfig?.name || "KINGS LEAGUE BRANDÃO"}
            </h2>
            <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mt-1">
              SELEÇÕES BRANDÃO
            </span>
          </div>

          <div className="bg-transparent relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#111] border border-[#222] rounded-full flex items-center justify-center">
                  <Users size={18} className="text-zinc-500" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-[0.2em] flex items-center gap-3 text-white">
                  TIMES
                </h2>
                <div className="bg-[#111] border border-[#222] text-amber-500 font-black px-3 py-1 rounded-lg text-sm">
                  {teams.filter((t) => t.name.trim() !== "").length}/
                  {tournamentConfig?.numTeams || teams.length}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowWorldCupTeams(true)}
                  className="bg-transparent border border-[#222] text-zinc-400 hover:text-white hover:bg-[#111] text-[10px] font-bold uppercase tracking-widest py-3 px-5 rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  <Globe size={14} /> 48 Seleções
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-transparent border border-[#222] text-zinc-400 hover:text-white hover:bg-[#111] text-[10px] font-bold uppercase tracking-widest py-3 px-5 rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  <ClipboardPaste size={14} /> Colar da Área de Transf.
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-10">
              {teams.map((t, i) => (
                <div
                  key={t.id}
                  className="relative bg-[#050505] border border-[#1a1a1a] rounded-2xl p-1.5 focus-within:border-[#333] transition-all duration-300 flex flex-col"
                >
                  <span className="absolute -top-3 left-4 bg-zinc-900 px-3 py-0.5 text-[9px] text-zinc-400 font-black uppercase tracking-widest border border-zinc-700/50 rounded-md shadow-sm z-10">
                    Time {i + 1}
                  </span>
                  <div className="absolute top-4 right-4 pointer-events-none z-10">
                    <TeamBadge name={t.name} className="w-8 h-6 text-[10px]" />
                  </div>
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => {
                      const n = [...teams];
                      n[i].name = e.target.value.toUpperCase();
                      setTeams(n);
                      updateDB({ teams: n });
                    }}
                    className="w-full bg-[#0a0a0a] rounded-t-xl px-4 pt-6 pb-3 text-xs font-bold text-white uppercase transition-all placeholder:text-zinc-800 outline-none"
                    placeholder={`NOME ${i + 1}`}
                  />
                  <button
                    onClick={() => setEditingTeam(t)}
                    className="w-full bg-[#111] hover:bg-[#1a1a1a] border-t border-[#222] text-zinc-400 font-bold text-[9px] uppercase py-2.5 rounded-b-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <UserPlus size={12} /> Editar Elenco{" "}
                    <span className="bg-black px-1.5 py-0.5 rounded ml-1">
                      {t.players?.length || 0}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-[#1a1a1a] flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => {
                    const cleaned = getCleanDefaultPlayers(
                      tournamentConfig?.numTeams || teams.length || 12
                    );
                    setTeams(
                      Array.from({ length: cleaned.length }, () => ({
                        id: generateId(),
                        name: "",
                        players: [],
                      }))
                    );
                    updateDB({
                      teams: Array.from({ length: cleaned.length }, () => ({
                        id: generateId(),
                        name: "",
                        players: [],
                      })),
                    });
                  }}
                  className="text-zinc-600 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  Limpar Nomes
                </button>
                <button
                  onClick={fillDummyNames}
                  className="text-zinc-500 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  <Zap size={14} /> Preencher Automatico
                </button>
              </div>
              <button
                onClick={() => performDraw()}
                className="bg-white text-black hover:bg-zinc-200 font-black uppercase text-xs py-4 px-10 rounded-full flex items-center justify-center gap-2 transition-all w-full md:w-auto shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                <Dices size={18} /> Sortear Equipes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DRAW VISITANTE --- */}
      {phase === "draw" && !isAdmin && (
        <div className="relative flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500 overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-[#111] border border-[#222] rounded-full flex items-center justify-center mb-8 shadow-2xl">
              <Dices size={48} className="text-zinc-400 animate-bounce" />
            </div>
            <h2 className="text-white tracking-[0.2em] uppercase text-2xl font-black mt-2 drop-shadow-md">
              Equipes Sorteadas!
            </h2>
            <div className="mt-10 flex items-center gap-3 bg-[#111] border border-[#222] px-8 py-4 rounded-full shadow-xl">
              <Loader2 size={16} className="text-zinc-500 animate-spin" />
              <span className="text-[#888] uppercase tracking-widest text-xs font-black">
                Aguardando o administrador gerar os grupos...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- DRAW ADMIN --- */}
      {phase === "draw" && isAdmin && (
        <div className="max-w-5xl mx-auto w-full animate-in fade-in pt-8">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6 mb-8 print:hidden relative z-20">
            <div className="flex items-center gap-4 mx-auto xl:mx-0">
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3">
                {tournamentConfig?.name || "KINGS LEAGUE BRANDÃO"}
                <div className="flex items-center gap-2 border border-[#222] bg-[#111] px-2.5 py-1 rounded-md shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)] animate-pulse"></span>
                  <span className="text-[8px] md:text-[9px] font-black tracking-widest uppercase text-green-500 hidden sm:block">
                    Sorteio
                  </span>
                </div>
              </h1>
            </div>
          </div>

          <div className="bg-[#0a0a0a] rounded-3xl border border-[#1a1a1a] shadow-2xl overflow-hidden mt-6">
            <div className="bg-zinc-900 p-4 md:p-6 border-b border-zinc-800 text-center">
              <h2 className="font-oswald text-xl md:text-2xl uppercase tracking-[0.15em] text-white">
                Sorteio dos Grupos
              </h2>
            </div>
            <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 bg-[#050505]">
              {GROUPS_KEYS.map((g) => {
                if (!groups[g]) return null;
                return (
                  <div
                    key={g}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg"
                  >
                    <div className="bg-white text-black text-center py-2 md:py-3 font-oswald uppercase tracking-widest text-sm md:text-lg">
                      Grupo {g}
                    </div>
                    <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                      {groups[g].map((t: any) => (
                        <div
                          key={t.id}
                          className="flex items-center gap-2 md:gap-3 bg-black p-2 md:p-3 rounded-xl border border-zinc-800"
                        >
                          <TeamBadge
                            name={t.name}
                            className="w-6 h-6 md:w-8 md:h-8 text-[10px] md:text-xs rounded shadow-sm"
                          />
                          <span className="font-bold text-xs md:text-sm uppercase truncate text-zinc-200">
                            {t.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 md:p-6 bg-[#0a0a0a] border-t border-[#1a1a1a] flex flex-col md:flex-row justify-between items-center gap-4">
              <button
                onClick={() => {
                  setPhase("inserir_nomes");
                  updateDB({ phase: "inserir_nomes" });
                }}
                className="text-[#888] hover:text-white font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 w-full md:w-auto justify-center"
              >
                <ArrowLeft size={14} /> Voltar
              </button>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <button
                  onClick={() => {
                    performDraw();
                  }}
                  className="text-[#888] hover:text-white font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border border-[#222] bg-[#111] px-4 py-3 md:py-2 rounded-full"
                >
                  <RefreshCw size={12} /> Refazer Sorteio
                </button>
                <button
                  onClick={generateTournament}
                  className="bg-white text-black hover:bg-zinc-200 font-black uppercase text-[10px] md:text-[11px] tracking-widest py-3 px-8 rounded-full flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                >
                  Gerar Competição <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TOURNAMENT --- */}
      {phase === "tournament" && (
        <div className="pt-4">
          {/* HEADER PREMIUM (KL.PNG Gigante) */}
          <div className="flex flex-col items-center justify-center text-center mt-2 mb-8 print:hidden relative z-20 gap-4">
            <div className="relative mb-2 mt-4 flex justify-center">
              <img
                src="kl.png"
                alt="Logo do Torneio"
                className="w-48 h-48 md:w-64 md:h-64 object-contain relative z-10"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  if (e.currentTarget.nextSibling) {
                    (e.currentTarget.nextSibling as HTMLElement).style.display =
                      "flex";
                  }
                }}
              />
              {/* Fallback caso não encontre o kl.png */}
              <div className="hidden w-48 h-48 md:w-64 md:h-64 bg-[#0a0a0a] border border-[#1a1a1a] rounded-full items-center justify-center relative z-10 shadow-lg">
                <SoccerIcon size={56} className="text-amber-500" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.12em] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                {tournamentConfig?.name || "KINGS LEAGUE"}
              </h1>

              {grandChampion ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#111] border border-[#222] rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-[0_0_6px_rgba(113,113,122,0.9)]"></span>
                  Competição Encerrada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#111] border border-[#222] rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e] animate-pulse"></span>
                  Em Andamento
                </span>
              )}
            </div>
          </div>

          <div className="w-full flex justify-center mb-8 print:hidden">
            <div className="flex overflow-x-auto custom-scrollbar gap-2 md:gap-3 max-w-full pb-3 md:pb-0 px-2 sm:flex-wrap sm:justify-center">
              <TabBtn
                id="groups"
                active={activeTab}
                onClick={setActiveTab}
                icon={isSingleGroup ? ListOrdered : LayoutGrid}
                label={isSingleGroup ? "Tabela" : "Grupos"}
              />
              <TabBtn
                id="teams"
                active={activeTab}
                onClick={setActiveTab}
                icon={Shield}
                label="Seleções"
              />
              <TabBtn
                id="general"
                active={activeTab}
                onClick={setActiveTab}
                icon={isSingleGroup ? BarChart2 : ListOrdered}
                label={isSingleGroup ? "Estatísticas" : "Geral"}
              />
              {!isPureLeague && (
                <TabBtn
                  id="knockout"
                  active={activeTab}
                  onClick={setActiveTab}
                  icon={Swords}
                  label="Mata-Mata"
                />
              )}
              <TabBtn
                id="scorers"
                active={activeTab}
                onClick={setActiveTab}
                icon={SoccerIcon}
                label="Artilharia"
              />
              <TabBtn
                id="summary"
                active={activeTab}
                onClick={setActiveTab}
                icon={ClipboardList}
                label={isAdmin ? "Súmula" : "Resultado"}
              />
            </div>
          </div>

          {/* PÓDIO DO CAMPEÃO */}
          {grandChampion &&
            (() => {
              const champName =
                typeof grandChampion === "string"
                  ? grandChampion
                  : grandChampion?.name || "TBD";
              const displayChampName =
                typeof champName === "string"
                  ? champName.replace(/^[0-9]+.*?-\s*/, "")
                  : "TBD";
              return (
                <div className="max-w-lg mx-auto mb-8 mt-4 animate-in slide-in-from-bottom-8 duration-1000 px-4 md:px-0">
                  <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl px-6 py-4 relative overflow-hidden shadow-[0_4px_20px_0_rgba(0,0,0,0.5)] flex items-center gap-5">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-40"></div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <Trophy
                        size={16}
                        strokeWidth={1.5}
                        className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                      />
                      <span className="text-zinc-600 font-bold text-[7px] tracking-[0.3em] uppercase">
                        Campeão
                      </span>
                    </div>
                    <TeamBadge
                      name={champName}
                      className="w-10 h-10 object-contain drop-shadow-xl shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-white font-black text-lg md:text-xl uppercase tracking-wider leading-none truncate drop-shadow-lg">
                        {displayChampName}
                      </span>
                      {typeof grandChampion !== "string" && (
                        <span className="text-amber-500/70 font-bold text-[8px] uppercase tracking-[0.2em] mt-0.5 truncate">
                          {champName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* ABA DE GRUPOS / TABELA */}
          {activeTab === "groups" && (
            <div className="space-y-4 max-w-lg md:max-w-7xl mx-auto animate-in fade-in pb-10">
              {isAdmin && (
                <div
                  className={`flex flex-col sm:flex-row gap-2 px-2 md:px-0 print:hidden mb-2 ${
                    isSingleGroup &&
                    !isPureLeague &&
                    knockoutStep === "unstarted"
                      ? "justify-between items-end"
                      : "justify-end items-end"
                  }`}
                >
                  {isSingleGroup &&
                    !isPureLeague &&
                    knockoutStep === "unstarted" && (
                      <button
                        onClick={() => {
                          let tk =
                            tournamentConfig?.rules?.targetKnockout || 16;
                          while (tk > generalStandings.length && tk > 2)
                            tk = tk / 2;
                          const kp = generalStandings
                            .slice(0, tk)
                            .map((st: any) => ({ team: st.team }));
                          setKnockoutPlayers(kp);
                          setKnockoutStep("draw");
                          setActiveTab("knockout");
                          updateDB({
                            knockoutPlayers: kp,
                            knockoutStep: "draw",
                          });
                        }}
                        className="bg-white text-black font-black uppercase tracking-widest py-2 px-4 rounded-full flex items-center justify-center gap-2 text-[8px] md:text-[9px] shadow-[0_0_15px_rgba(255,255,255,0.2)] w-full sm:w-auto transition-colors hover:bg-zinc-200"
                      >
                        <Swords size={12} /> Gerar Mata-Mata
                      </button>
                    )}
                  <button
                    onClick={simulateGroupMatches}
                    className={`text-[#666] hover:text-white text-[8px] md:text-[9px] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-colors bg-[#111] px-4 py-2 rounded-full border border-[#222] hover:bg-[#1a1a1a] w-full sm:w-auto ${
                      isSingleGroup &&
                      !isPureLeague &&
                      knockoutStep === "unstarted"
                        ? ""
                        : "ml-auto"
                    }`}
                  >
                    <Zap size={10} /> Simular Todos os Jogos
                  </button>
                </div>
              )}
              <div
                className={`grid grid-cols-1 ${
                  isSingleGroup
                    ? "w-full max-w-lg md:max-w-3xl mx-auto"
                    : "sm:grid-cols-2 xl:grid-cols-4 max-w-lg sm:max-w-none mx-auto"
                } gap-3 md:gap-4`}
              >
                {GROUPS_KEYS.map((g) => (
                  <GroupTable
                    key={g}
                    groupName={g}
                    standings={groupStandings[g]}
                    matches={matches.filter((m) => m.group === g)}
                    updateMatchScore={updateMatchScore}
                    isAdmin={isAdmin}
                    isSingleGroup={isSingleGroup}
                    setEditingScorersMatch={setEditingScorersMatch}
                    setViewingMatchDetails={setViewingMatchDetails}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ABA DE TIMES */}
          {activeTab === "teams" && (
            <div className="max-w-lg md:max-w-5xl mx-auto w-full animate-in fade-in duration-500">
              <div className="bg-[#0a0a0a] rounded-[2rem] overflow-hidden border border-[#1a1a1a] shadow-2xl">
                <div className="p-4 md:p-6 border-b border-[#1a1a1a] flex items-center gap-3">
                  <Shield size={18} className="text-zinc-500" />
                  <h2 className="text-[10px] md:text-[12px] font-black text-white uppercase tracking-[0.2em]">
                    Seleções e Participantes
                  </h2>
                </div>
                <div className="p-3 md:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 bg-[#050505]">
                  {teams.map((t, i) => (
                    <div
                      key={t.id}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#0a0a0a] border border-[#222] hover:bg-[#111] transition-colors shadow-sm gap-2"
                    >
                      <div className="font-black text-[9px] md:text-xs uppercase text-white truncate w-full tracking-wider text-center">
                        {t.name}
                      </div>
                      <div className="flex items-center justify-center gap-1.5 w-full mt-2">
                        <TeamBadge
                          name={t.name}
                          className="w-5 h-5 object-contain drop-shadow-md shrink-0"
                        />
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => setEditingTeam(t)}
                          className="w-full mt-2 bg-[#111] hover:bg-[#222] border border-zinc-800 text-zinc-400 font-bold text-[8px] md:text-[10px] uppercase py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                        >
                          <UserPlus size={10} /> Editar Elenco{" "}
                          <span className="bg-black px-1.5 py-0.5 rounded ml-0.5">
                            {t.players?.length || 0}
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA GERAL / ESTATÍSTICAS */}
          {activeTab === "general" && (
            <div className="max-w-lg md:max-w-6xl mx-auto animate-in fade-in">
              {!isSingleGroup && (
                <>
                  <p className="md:hidden text-[#666] text-[9px] text-center uppercase tracking-widest mb-3 animate-pulse">
                    ↔ Deslize a barra abaixo
                  </p>
                  <div className="flex overflow-x-auto custom-scrollbar justify-start md:justify-center mb-6 pb-2 md:pb-0 w-full md:w-auto gap-2 md:gap-3 px-1">
                    <TabBtn
                      id="standings"
                      active={activeGeneralTab}
                      onClick={setActiveGeneralTab}
                      icon={ListOrdered}
                      label="Classificação"
                    />
                    <TabBtn
                      id="stats"
                      active={activeGeneralTab}
                      onClick={setActiveGeneralTab}
                      icon={BarChart2}
                      label="Estatísticas"
                    />
                  </div>
                </>
              )}

              {!isSingleGroup && activeGeneralTab === "standings" && (
                <div className="bg-[#0a0a0a] rounded-3xl overflow-hidden border border-[#1a1a1a] shadow-2xl animate-in zoom-in-95 duration-300 max-w-lg md:max-w-none mx-auto">
                  <div className="p-3 md:p-5 border-b border-[#1a1a1a] flex flex-col md:flex-row md:justify-between md:items-center gap-3 bg-[#0c0c0c]">
                    <div>
                      <h2 className="text-[10px] md:text-[12px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <ListOrdered size={14} className="text-zinc-500" />{" "}
                        Classificação Geral
                      </h2>
                      <p className="text-[#666] text-[7px] md:text-[8px] mt-1 uppercase tracking-widest">
                        Verde: Pote 1 | Azul: Pote 2 | Vermelho: Eliminados
                      </p>
                    </div>
                    {knockoutStep === "unstarted" && isAdmin && (
                      <button
                        onClick={() => {
                          let tk =
                            tournamentConfig?.rules?.targetKnockout || 16;
                          while (tk > generalStandings.length && tk > 2)
                            tk = tk / 2;
                          const kp = generalStandings
                            .slice(0, tk)
                            .map((st: any) => ({ team: st.team }));
                          setKnockoutPlayers(kp);
                          setKnockoutStep("draw");
                          setActiveTab("knockout");
                          updateDB({
                            knockoutPlayers: kp,
                            knockoutStep: "draw",
                          });
                        }}
                        className="bg-white text-black font-black uppercase tracking-widest py-2 px-5 rounded-full flex items-center justify-center gap-1.5 text-[9px] hover:bg-zinc-200 transition-colors w-full md:w-auto shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      >
                        <Swords size={12} /> Gerar Mata-Mata
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto bg-[#0a0a0a] custom-scrollbar">
                    <table className="w-full text-xs text-left border-collapse min-w-max md:min-w-[500px]">
                      <thead className="text-[#666] uppercase bg-[#111] tracking-widest text-[8px] md:text-[9px]">
                        <tr>
                          <th className="px-2 md:px-5 py-3 font-bold w-8 md:w-12">
                            Pos
                          </th>
                          <th className="px-2 md:px-4 py-3 font-bold">Grp</th>
                          <th className="px-2 md:px-4 py-3 font-bold">
                            Competidor
                          </th>
                          <th className="px-2 md:px-4 py-3 text-center text-white font-bold">
                            PTS
                          </th>
                          <th className="px-2 md:px-3 py-3 text-center font-bold">
                            SG
                          </th>
                          <th className="hidden sm:table-cell px-2 md:px-3 py-3 text-center font-bold">
                            V
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#0f0f0f]">
                        {generalStandings.map((st: any, idx) => {
                          const tk =
                            tournamentConfig?.rules?.targetKnockout || 16;

                          const isPot1 = idx < 4;
                          const isPot2 = idx >= 4 && idx < 8;
                          const isEliminated = idx >= 8;

                          return (
                            <tr
                              key={idx}
                              className={`border-b border-[#1a1a1a] relative transition-all ${
                                isEliminated
                                  ? "opacity-40 hover:opacity-60"
                                  : "hover:bg-[#151515]"
                              }`}
                            >
                              <td
                                className={`px-2 md:px-5 py-3 font-black text-[9px] md:text-xs border-l-[3px] md:border-l-[4px] ${
                                  isPot1
                                    ? "border-green-500 text-green-500 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                                    : isPot2
                                    ? "border-blue-500 text-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                                    : "border-red-600/50 text-red-500/50"
                                }`}
                              >
                                {idx + 1}º
                              </td>
                              <td
                                className={`px-2 md:px-4 py-3 font-bold text-[8px] md:text-[9px] ${
                                  isEliminated ? "text-zinc-600" : "text-[#888]"
                                }`}
                              >
                                {st.group}
                              </td>
                              <td className="px-2 md:px-4 py-3">
                                <div className="flex items-center gap-2 md:gap-3">
                                  <TeamBadge
                                    name={st.team.name}
                                    className="w-4 h-4 md:w-5 md:h-5 object-contain"
                                  />
                                  <div className="flex flex-col">
                                    <span
                                      className={`font-black uppercase text-[9px] md:text-[11px] tracking-wider ${
                                        isEliminated
                                          ? "text-zinc-400"
                                          : "text-white"
                                      }`}
                                    >
                                      {st.team.name}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td
                                className={`px-2 md:px-4 py-3 text-center font-black text-[10px] md:text-sm ${
                                  isEliminated ? "text-zinc-500" : "text-white"
                                }`}
                              >
                                {st.pts}
                              </td>
                              <td
                                className={`px-2 md:px-3 py-3 text-center font-bold text-[10px] md:text-xs ${
                                  isEliminated ? "text-zinc-600" : "text-[#888]"
                                }`}
                              >
                                {st.sg}
                              </td>
                              <td
                                className={`hidden sm:table-cell px-2 md:px-3 py-3 text-center text-[10px] md:text-xs ${
                                  isEliminated ? "text-zinc-600" : "text-[#888]"
                                }`}
                              >
                                {st.v}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(isSingleGroup || activeGeneralTab === "stats") && (
                <div className="space-y-4 md:space-y-6 animate-in zoom-in-95 duration-300 max-w-lg md:max-w-none mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 md:gap-4">
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-3 md:p-5 shadow-2xl flex items-center gap-3 md:gap-4 hover:bg-[#111] transition-colors">
                      <div className="w-8 h-8 md:w-12 md:h-12 shrink-0 rounded-full overflow-hidden border-2 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                        {(() => {
                          const code = detectTeamCode(
                            overallStatsTable[0]?.team?.name || ""
                          );
                          return code ? (
                            <img
                              src={`https://flagcdn.com/w160/${code}.png`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-amber-500/10 flex items-center justify-center">
                              <Trophy
                                size={14}
                                className="text-amber-500 md:w-5 md:h-5"
                              />
                            </div>
                          );
                        })()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[#888] text-[7px] md:text-[9px] uppercase font-black tracking-widest truncate">
                          Melhor Campanha
                        </p>
                        <p className="text-white font-black uppercase text-[10px] md:text-sm truncate w-full mt-0.5">
                          {overallStatsTable[0]?.team?.name || "-"}
                        </p>
                        <p className="text-amber-500 font-bold text-[9px] md:text-[11px] mt-0.5 md:mt-1 truncate">
                          {overallStatsTable[0]?.aprov || 0}% Aproveitamento
                        </p>
                      </div>
                    </div>
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-3 md:p-5 shadow-2xl flex items-center gap-3 md:gap-4 hover:bg-[#111] transition-colors">
                      <div className="w-8 h-8 md:w-12 md:h-12 shrink-0 rounded-full overflow-hidden border-2 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                        {(() => {
                          const teamName =
                            overallStatsTable
                              .slice()
                              .sort((a: any, b: any) => b.gp - a.gp)[0]?.team
                              ?.name || "";
                          const code = detectTeamCode(teamName);
                          return code ? (
                            <img
                              src={`https://flagcdn.com/w160/${code}.png`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-500/10 flex items-center justify-center">
                              <SoccerIcon
                                size={14}
                                className="text-blue-500 md:w-5 md:h-5"
                              />
                            </div>
                          );
                        })()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[#888] text-[7px] md:text-[9px] uppercase font-black tracking-widest truncate">
                          Melhor Ataque (GP)
                        </p>
                        <p className="text-white font-black uppercase text-[10px] md:text-sm truncate w-full mt-0.5">
                          {overallStatsTable
                            .slice()
                            .sort((a: any, b: any) => b.gp - a.gp)[0]?.team
                            ?.name || "-"}
                        </p>
                        <p className="text-blue-400 font-bold text-[9px] md:text-[11px] mt-0.5 md:mt-1 truncate">
                          {overallStatsTable
                            .slice()
                            .sort((a: any, b: any) => b.gp - a.gp)[0]?.gp ||
                            0}{" "}
                          Gols Marcados
                        </p>
                      </div>
                    </div>
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-3 md:p-5 shadow-2xl flex items-center gap-3 md:gap-4 hover:bg-[#111] transition-colors">
                      <div className="w-8 h-8 md:w-12 md:h-12 shrink-0 rounded-full overflow-hidden border-2 border-green-500/40 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                        {(() => {
                          const teamName =
                            overallStatsTable
                              .slice()
                              .filter((s: any) => s.j > 0)
                              .sort((a: any, b: any) => a.gc - b.gc)[0]?.team
                              ?.name || "";
                          const code = detectTeamCode(teamName);
                          return code ? (
                            <img
                              src={`https://flagcdn.com/w160/${code}.png`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-green-500/10 flex items-center justify-center">
                              <Shield
                                size={14}
                                className="text-green-500 md:w-5 md:h-5"
                              />
                            </div>
                          );
                        })()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[#888] text-[7px] md:text-[9px] uppercase font-black tracking-widest truncate">
                          Melhor Defesa (Menos GC)
                        </p>
                        <p className="text-white font-black uppercase text-[10px] md:text-sm truncate w-full mt-0.5">
                          {overallStatsTable
                            .slice()
                            .filter((s: any) => s.j > 0)
                            .sort((a: any, b: any) => a.gc - b.gc)[0]?.team
                            ?.name || "-"}
                        </p>
                        <p className="text-green-400 font-bold text-[9px] md:text-[11px] mt-0.5 md:mt-1 truncate">
                          {overallStatsTable
                            .slice()
                            .filter((s: any) => s.j > 0)
                            .sort((a: any, b: any) => a.gc - b.gc)[0]?.gc ||
                            0}{" "}
                          Gols Sofridos
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] rounded-3xl overflow-hidden border border-[#1a1a1a] shadow-2xl">
                    <div className="p-3 md:p-5 border-b border-[#1a1a1a] bg-[#0c0c0c]">
                      <h2 className="text-[10px] md:text-[12px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <BarChart2
                          size={14}
                          className="text-zinc-500 md:w-4 md:h-4"
                        />{" "}
                        Tabela Completa
                      </h2>
                    </div>
                    <div className="overflow-x-auto bg-[#0a0a0a] custom-scrollbar pb-2">
                      <table className="w-full text-xs text-left border-collapse whitespace-nowrap min-w-max md:min-w-[700px]">
                        <thead className="text-[#666] uppercase bg-[#111] tracking-widest text-[7px] md:text-[9px]">
                          <tr>
                            <th className="px-1 md:px-5 py-2 md:py-4 font-bold w-8 md:w-12 text-center md:text-left">
                              Pos
                            </th>
                            <th className="px-1 md:px-4 py-2 md:py-4 font-bold">
                              Competidor
                            </th>
                            <th className="hidden sm:table-cell px-1 md:px-3 py-2 md:py-4 font-bold text-center">
                              J
                            </th>
                            <th className="hidden sm:table-cell px-1 md:px-3 py-2 md:py-4 font-bold text-center text-green-500">
                              V
                            </th>
                            <th className="hidden sm:table-cell px-1 md:px-3 py-2 md:py-4 font-bold text-center text-zinc-400">
                              E
                            </th>
                            <th className="hidden sm:table-cell px-1 md:px-3 py-2 md:py-4 font-bold text-center text-red-500">
                              D
                            </th>
                            <th className="hidden sm:table-cell px-1 md:px-3 py-2 md:py-4 font-bold text-center text-blue-400">
                              GP
                            </th>
                            <th className="hidden sm:table-cell px-1 md:px-3 py-2 md:py-4 font-bold text-center text-orange-400">
                              GC
                            </th>
                            <th className="px-1 md:px-3 py-2 md:py-4 font-bold text-center">
                              SG
                            </th>
                            <th className="px-1 md:px-4 py-2 md:py-4 font-bold text-center w-16 md:w-32">
                              APROV.
                            </th>
                            <th className="px-1 md:px-5 py-2 md:py-4 text-center text-white font-black">
                              PTS
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-[#0f0f0f]">
                          {overallStatsTable.map((st: any, idx) => (
                            <tr
                              key={st.team.id}
                              className="border-b border-[#1a1a1a] hover:bg-[#151515] transition-colors relative"
                            >
                              <td className="px-1 md:px-5 py-2 md:py-4 font-black text-[9px] md:text-xs text-zinc-500 border-l-[2px] md:border-l-[4px] border-zinc-700 text-center md:text-left">
                                {idx + 1}º
                              </td>
                              <td className="px-1 md:px-4 py-2 md:py-4">
                                <div className="flex items-center gap-1.5 md:gap-3">
                                  <TeamBadge
                                    name={st.team.name}
                                    className="w-3.5 h-3.5 md:w-5 md:h-5 object-contain"
                                  />
                                  <div className="flex flex-col overflow-hidden">
                                    <span className="font-black uppercase text-[8px] md:text-[11px] tracking-wider text-white truncate max-w-[80px] sm:max-w-[120px] lg:max-w-none">
                                      {st.team.name}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="hidden sm:table-cell px-1 md:px-3 py-2 md:py-4 text-center font-bold text-zinc-400 text-[9px] md:text-xs">
                                {st.j}
                              </td>
                              <td className="hidden sm:table-cell px-1 md:px-3 py-2 md:py-4 text-center font-bold text-green-500/80 text-[9px] md:text-xs">
                                {st.v}
                              </td>
                              <td className="hidden sm:table-cell px-1 md:px-3 py-2 md:py-4 text-center font-bold text-zinc-500 text-[9px] md:text-xs">
                                {st.e}
                              </td>
                              <td className="hidden sm:table-cell px-1 md:px-3 py-2 md:py-4 text-center font-bold text-red-500/80 text-[9px] md:text-xs">
                                {st.d}
                              </td>
                              <td className="hidden sm:table-cell px-1 md:px-3 py-2 md:py-4 text-center font-bold text-blue-400 text-[9px] md:text-xs">
                                {st.gp}
                              </td>
                              <td className="hidden sm:table-cell px-1 md:px-3 py-2 md:py-4 text-center font-bold text-orange-400/80 text-[9px] md:text-xs">
                                {st.gc}
                              </td>
                              <td className="px-1 md:px-3 py-2 md:py-4 text-center font-bold text-[#888] text-[9px] md:text-xs">
                                {st.sg}
                              </td>
                              <td className="px-1 md:px-4 py-2 md:py-4 text-center">
                                <div className="flex items-center justify-center gap-1 md:gap-2">
                                  <span className="font-bold text-[7px] md:text-[9px] text-zinc-300 w-5 md:w-8">
                                    {st.aprov}%
                                  </span>
                                  <div className="w-8 md:w-12 h-1 md:h-1.5 bg-[#222] rounded-full overflow-hidden">
                                    <div
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          Math.max(0, parseFloat(st.aprov))
                                        )}%`,
                                      }}
                                      className={`h-full ${
                                        parseFloat(st.aprov) >= 50
                                          ? "bg-green-500"
                                          : "bg-red-500"
                                      }`}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-1 md:px-5 py-2 md:py-4 text-center font-black text-[10px] md:text-sm text-white">
                                {st.pts}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ABA ARTILHARIA */}
          {phase === "tournament" && activeTab === "scorers" && (
            <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden max-w-4xl mx-auto">
              <div className="p-4 md:p-6 border-b border-zinc-800 flex justify-between items-center bg-[#111]">
                <div>
                  <h2 className="font-oswald text-lg md:text-xl uppercase flex items-center gap-3 tracking-wider text-white">
                    <SoccerIcon
                      size={20}
                      className="text-zinc-400 md:w-6 md:h-6"
                    />{" "}
                    Artilharia Oficial
                  </h2>
                </div>
              </div>
              <div className="p-4 md:p-6 bg-[#050505]">
                {topScorers.length === 0 ? (
                  <div className="text-center py-12 md:py-16 flex flex-col items-center opacity-50">
                    <SoccerIcon
                      size={48}
                      className="text-zinc-600 mb-4 md:w-16 md:h-16"
                    />
                    <p className="uppercase font-bold tracking-widest text-[10px] md:text-sm text-white">
                      Nenhum gol registrado
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    {topScorers.map((scorer: any, idx: any) => {
                      const isFirst = idx === 0;
                      return (
                        <div
                          key={scorer.id}
                          className={`flex items-center justify-between p-3 md:p-4 rounded-xl border ${
                            isFirst
                              ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                              : "bg-black border-zinc-800"
                          }`}
                        >
                          <div className="flex items-center gap-3 md:gap-5 overflow-hidden">
                            <div
                              className={`w-5 md:w-8 text-center font-oswald text-base md:text-xl shrink-0 ${
                                isFirst
                                  ? "text-amber-500 font-black"
                                  : "text-zinc-500"
                              }`}
                            >
                              {idx + 1}º
                            </div>
                            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                              <TeamBadge
                                name={scorer.team.name}
                                className="w-8 h-8 md:w-12 md:h-12 text-[10px] md:text-sm rounded shadow-md shrink-0"
                              />
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`font-black uppercase tracking-wider text-[11px] md:text-sm truncate ${
                                      isFirst ? "text-amber-500" : "text-white"
                                    }`}
                                  >
                                    {scorer.name}
                                  </div>
                                  {isFirst && (
                                    <span className="bg-amber-500 text-black text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                                      <Trophy
                                        size={10}
                                        className="hidden md:block"
                                      />{" "}
                                      MVP
                                    </span>
                                  )}
                                </div>
                                <div className="text-[8px] md:text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1 truncate">
                                  <span className="truncate max-w-[80px] md:max-w-none">
                                    {scorer.team.name}
                                  </span>
                                  <span className="bg-zinc-900 border border-zinc-700 px-1 md:px-1.5 py-0.5 rounded shrink-0">
                                    Nº {scorer.number || "-"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border shrink-0 ${
                              isFirst
                                ? "bg-amber-500 text-black border-amber-400 shadow-md"
                                : "bg-zinc-900 border-zinc-700"
                            }`}
                          >
                            <span
                              className={`text-lg md:text-2xl font-oswald leading-none ${
                                isFirst ? "text-black" : "text-white"
                              }`}
                            >
                              {scorer.goals}
                            </span>
                            <span
                              className={`text-[8px] md:text-[10px] font-bold uppercase mt-0.5 md:mt-1 ${
                                isFirst ? "text-amber-900" : "text-zinc-400"
                              }`}
                            >
                              Gols
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABA MATA MATA */}
          {activeTab === "knockout" && !isPureLeague && (
            <div className="w-full animate-in fade-in max-w-lg md:max-w-none mx-auto">
              {knockoutStep === "unstarted" && (
                <div className="bg-[#0f0f0f] rounded-3xl p-6 md:p-10 text-center border border-[#1a1a1a] max-w-xl mx-auto shadow-2xl">
                  <Shield className="text-[#333] mx-auto mb-4" size={48} />
                  <h2 className="text-sm font-black mb-2 uppercase tracking-[0.2em] text-white">
                    Chave Não Gerada
                  </h2>
                  <p className="text-[#666] mb-8 text-[10px] uppercase tracking-widest">
                    {isAdmin
                      ? "Acesse a aba Geral para iniciar o sorteio dos potes."
                      : "Aguardando o administrador iniciar o sorteio..."}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => setActiveTab("general")}
                      className="bg-white text-black py-3 px-6 rounded-full text-[10px] font-black uppercase inline-flex items-center justify-center gap-2 tracking-widest hover:bg-zinc-200 w-full md:w-auto"
                    >
                      Ir para Classificação <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              )}

              {knockoutStep === "draw" && (
                <div className="max-w-6xl mx-auto px-2 md:px-4">
                  <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.3em] mb-2">
                      Sorteio do Mata-Mata
                    </h2>
                    <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                      Top {knockoutPlayers.length} - Os confrontos definirão a
                      chave principal
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 md:gap-12 mb-10 md:mb-12">
                    <div className="bg-[#050505] border border-[#111] rounded-[2rem] p-4 md:p-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-30"></div>
                      <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-8">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
                        <h3 className="text-green-500 font-black uppercase tracking-[0.3em] text-[10px] md:text-sm">
                          Pote 1{" "}
                          <span className="text-green-500/50 text-[7px] md:text-[10px] ml-1">
                            (Cabeças de Chave)
                          </span>
                        </h3>
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        {knockoutPlayers
                          .slice(0, knockoutPlayers.length / 2)
                          .map((p: any) => {
                            const isDrawn = knockoutDraw.some(
                              (m: any) =>
                                m.t1?.id === p.team?.id ||
                                m.t2?.id === p.team?.id
                            );
                            return (
                              <div
                                key={p.team.id}
                                className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] text-xs flex justify-between items-center transition-all duration-500 ${
                                  isDrawn
                                    ? "opacity-20 grayscale scale-[0.98]"
                                    : "shadow-md"
                                }`}
                              >
                                <span className="font-black text-white uppercase tracking-wider truncate max-w-[120px] sm:max-w-[150px] md:max-w-none text-[8px] md:text-xs">
                                  {p.team.name}
                                </span>
                                <TeamBadge
                                  name={p.team.name}
                                  className="w-4 h-4 md:w-6 md:h-6 shrink-0 drop-shadow-md"
                                />
                              </div>
                            );
                          })}
                      </div>
                    </div>
                    <div className="bg-[#050505] border border-[#111] rounded-[2rem] p-4 md:p-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
                      <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-8">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
                        <h3 className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px] md:text-sm">
                          Pote 2{" "}
                          <span className="text-blue-500/50 text-[7px] md:text-[10px] ml-1">
                            (Desafiantes)
                          </span>
                        </h3>
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        {knockoutPlayers
                          .slice(
                            knockoutPlayers.length / 2,
                            knockoutPlayers.length
                          )
                          .map((p: any) => {
                            const isDrawn = knockoutDraw.some(
                              (m: any) =>
                                m.t1?.id === p.team?.id ||
                                m.t2?.id === p.team?.id
                            );
                            return (
                              <div
                                key={p.team.id}
                                className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] text-xs flex justify-between items-center transition-all duration-500 ${
                                  isDrawn
                                    ? "opacity-20 grayscale scale-[0.98]"
                                    : "shadow-md"
                                }`}
                              >
                                <span className="font-black text-white uppercase tracking-wider truncate max-w-[120px] sm:max-w-[150px] md:max-w-none text-[8px] md:text-xs">
                                  {p.team.name}
                                </span>
                                <TeamBadge
                                  name={p.team.name}
                                  className="w-4 h-4 md:w-6 md:h-6 shrink-0 drop-shadow-md"
                                />
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                  {isAdmin &&
                    knockoutDraw.length < knockoutPlayers.length / 2 &&
                    !isDrawing && (
                      <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-5 mb-10">
                        <button
                          onClick={() => performKnockoutDraw(false)}
                          className="bg-white text-black hover:bg-zinc-200 font-black uppercase text-[9px] md:text-xs py-3.5 md:py-4 px-6 md:px-8 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 transition-colors"
                        >
                          <PlaySquare size={14} className="md:w-4 md:h-4" />{" "}
                          Iniciar Sorteio
                        </button>
                        <button
                          onClick={() => performKnockoutDraw(true)}
                          className="bg-[#111] text-zinc-400 hover:text-white border border-[#333] font-black uppercase text-[9px] md:text-xs py-3.5 md:py-4 px-6 md:px-8 rounded-full transition-colors flex items-center justify-center gap-2 hover:bg-[#1a1a1a]"
                        >
                          <Zap size={14} className="md:w-4 md:h-4" /> Pular
                          Animação
                        </button>
                      </div>
                    )}
                  {!isAdmin &&
                    knockoutDraw.length < knockoutPlayers.length / 2 && (
                      <div className="flex justify-center mb-10">
                        <div className="bg-[#111] border border-[#222] px-5 md:px-6 py-3 md:py-4 rounded-full flex items-center gap-2 md:gap-3">
                          <Loader2
                            size={14}
                            className="text-zinc-500 animate-spin md:w-4 md:h-4"
                          />
                          <span className="text-[#888] font-bold text-[8px] md:text-[10px] uppercase tracking-widest">
                            Aguardando o Sorteio...
                          </span>
                        </div>
                      </div>
                    )}
                  {knockoutDraw.length > 0 && (
                    <div className="mt-8 border-t border-[#111] pt-10 md:pt-12 animate-in fade-in">
                      <h3 className="text-center text-zinc-500 font-black uppercase tracking-[0.3em] text-[9px] md:text-xs mb-8">
                        Confrontos Definidos
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {knockoutDraw.map((m: any, i) => (
                          <div
                            key={i}
                            className="bg-[#050505] border border-[#1a1a1a] rounded-3xl p-4 md:p-5 text-center shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden"
                          >
                            <div className="text-[7px] md:text-[9px] text-[#555] font-black uppercase tracking-[0.2em] mb-3 md:mb-4">
                              Confronto {i + 1}
                            </div>
                            <div className="flex items-center justify-between bg-gradient-to-r from-green-500/10 to-transparent p-2.5 md:p-3 rounded-2xl border border-green-500/10 mb-2 md:mb-3">
                              <span className="text-[9px] md:text-[11px] text-white font-black uppercase tracking-wider truncate">
                                {m.t1?.name || "TBD"}
                              </span>
                              <TeamBadge
                                name={m.t1?.name}
                                className="w-4 h-4 md:w-5 md:h-5 shrink-0 ml-2"
                              />
                            </div>
                            <div className="text-[9px] md:text-[10px] font-black text-zinc-700 my-1.5 md:my-2">
                              X
                            </div>
                            <div className="flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-transparent p-2.5 md:p-3 rounded-2xl border border-blue-500/10 mt-2 md:mt-3">
                              <span className="text-[9px] md:text-[11px] text-white font-black uppercase tracking-wider truncate">
                                {m.t2?.name || "TBD"}
                              </span>
                              <TeamBadge
                                name={m.t2?.name}
                                className="w-4 h-4 md:w-5 md:h-5 shrink-0 ml-2"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {knockoutDraw.length === knockoutPlayers.length / 2 &&
                    !isDrawing &&
                    isAdmin && (
                      <div className="flex justify-center mt-10 md:mt-12 mb-10 animate-in slide-in-from-bottom-4">
                        <button
                          onClick={() => {
                            setKnockoutStep("bracket");
                            updateDB({ knockoutStep: "bracket" });
                          }}
                          className="bg-amber-500 text-black font-black uppercase text-[10px] md:text-sm py-3.5 md:py-4 px-8 md:px-10 rounded-full hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 w-full md:w-auto"
                        >
                          <Swords
                            size={16}
                            className="md:w-[18px] md:h-[18px]"
                          />{" "}
                          Gerar Chave Oficial
                        </button>
                      </div>
                    )}
                </div>
              )}

              {knockoutStep === "bracket" && (
                <div className="w-full">
                  {isAdmin && (
                    <div className="w-full flex justify-end mb-4 md:mb-6 px-2 md:px-4 print:hidden">
                      <button
                        onClick={simulateCurrentKnockout}
                        className="bg-[#111] hover:bg-[#1a1a1a] text-amber-500 hover:text-amber-400 py-2.5 md:py-2 px-4 md:px-5 rounded-full text-[8px] md:text-[10px] font-bold uppercase flex items-center gap-1.5 md:gap-2 border border-[#222] transition-colors shadow-lg"
                      >
                        <Zap size={12} className="md:w-3.5 md:h-3.5" /> Simular
                        Rodada
                      </button>
                    </div>
                  )}
                  <p className="md:hidden text-[#666] text-[8px] md:text-[9px] text-center uppercase tracking-widest mb-4 animate-pulse flex flex-col items-center gap-1">
                    <span className="text-[10px] md:text-[12px]">↕ ↔</span>{" "}
                    Deslize para explorar a chave
                  </p>
                  <div className="overflow-auto w-full h-[65vh] md:h-[75vh] min-h-[600px] md:min-h-[800px] custom-scrollbar border border-[#1a1a1a] md:border-transparent rounded-3xl bg-[#050505] md:bg-transparent p-1 md:p-0 relative shadow-inner md:shadow-none">
                    <div className="min-w-max w-fit mx-auto relative pb-6 md:pb-10">
                      <div className="flex mb-4 md:mb-8 border-b border-[#222] pb-2 md:pb-4 items-center justify-start gap-4 md:gap-8 px-2 md:px-4 lg:px-6 sticky top-0 bg-[#050505] md:bg-transparent z-20">
                        {bracketHeadersList.map((h, i) => (
                          <div
                            key={h}
                            className={`w-[120px] md:w-48 lg:w-56 text-center font-black uppercase text-[7px] md:text-[10px] tracking-[0.2em] ${
                              i === bracketHeadersList.length - 1
                                ? "text-amber-500"
                                : "text-[#555]"
                            }`}
                          >
                            {h}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-start px-1 md:px-0">
                        <BracketNode
                          node={bracketTree.tree}
                          knockoutScores={knockoutScores}
                          updateKoScore={updateKoScore}
                          direction="left"
                          isAdmin={isAdmin}
                          setEditingScorersMatch={setEditingScorersMatch}
                          setViewingMatchDetails={setViewingMatchDetails}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ABA SÚMULA */}
          {activeTab === "summary" && (
            <div className="max-w-6xl mx-auto animate-in fade-in max-w-lg md:max-w-none">
              {!isPureLeague && (
                <>
                  <p className="md:hidden text-[#666] text-[9px] text-center uppercase tracking-widest mb-3 animate-pulse">
                    ↔ Deslize a barra abaixo
                  </p>
                  <div className="flex overflow-x-auto custom-scrollbar justify-start md:justify-center gap-2 md:gap-3 px-1 mb-8 md:mb-10 w-full max-w-full pb-3 md:pb-0">
                    <TabBtn
                      id="groups"
                      active={activeSummaryTab}
                      onClick={setActiveSummaryTab}
                      label="Fase de Grupos"
                    />
                    <TabBtn
                      id="quarters"
                      active={activeSummaryTab}
                      onClick={setActiveSummaryTab}
                      label="Quartas"
                    />
                    <TabBtn
                      id="semis"
                      active={activeSummaryTab}
                      onClick={setActiveSummaryTab}
                      label="Semis"
                    />
                    <TabBtn
                      id="final"
                      active={activeSummaryTab}
                      onClick={setActiveSummaryTab}
                      label="Final"
                    />
                  </div>
                </>
              )}

              {(activeSummaryTab === "groups" || isPureLeague) && (
                <div
                  className={`grid grid-cols-1 ${
                    isSingleGroup
                      ? "max-w-4xl w-full mx-auto"
                      : "sm:grid-cols-2 xl:grid-cols-4 max-w-lg sm:max-w-none mx-auto"
                  } gap-4 md:gap-6`}
                >
                  {GROUPS_KEYS.map((g) => {
                    const groupMatches = matches.filter((m) => m.group === g);
                    if (groupMatches.length === 0) return null;
                    return (
                      <div
                        key={g}
                        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl overflow-hidden shadow-lg"
                      >
                        <div className="bg-[#0c0c0c] border-b border-[#1a1a1a] p-3 md:p-4 text-center flex items-center justify-center gap-2 md:gap-3">
                          {isSingleGroup ? (
                            <ListOrdered
                              size={14}
                              className="text-zinc-500 md:w-4 md:h-4"
                            />
                          ) : (
                            <div className="w-4 h-4 md:w-5 md:h-5 bg-[#1a1a1a] border border-[#333] text-white text-[9px] md:text-[10px] rounded-md flex items-center justify-center font-black">
                              {g}
                            </div>
                          )}
                          <span className="font-black text-white text-[10px] md:text-[12px] uppercase tracking-[0.3em]">
                            {isSingleGroup ? "Jogos da Liga" : `Grupo ${g}`}
                          </span>
                        </div>
                        <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                          {groupMatches.map((m) => {
                            const events = [
                              ...createMatchEvents(
                                m.t1,
                                m.scorers1,
                                m.yellow1,
                                m.red1,
                                1
                              ),
                              ...createMatchEvents(
                                m.t2,
                                m.scorers2,
                                m.yellow2,
                                m.red2,
                                2
                              ),
                            ];

                            return (
                              <SummaryMatchCard
                                key={m.id}
                                match={m}
                                score1={m.score1}
                                score2={m.score2}
                                isKnockout={false}
                                events={events}
                                isAdmin={isAdmin}
                                setEditingScorersMatch={setEditingScorersMatch}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isPureLeague && activeSummaryTab !== "groups" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {(() => {
                    if (knockoutStep !== "bracket")
                      return (
                        <div className="col-span-full py-10 md:py-20 text-center">
                          <Shield
                            className="mx-auto text-[#333] mb-4"
                            size={40}
                          />
                          <h3 className="text-white text-[11px] md:text-sm font-black uppercase tracking-[0.2em] mb-2">
                            Fase Não Iniciada
                          </h3>
                          <p className="text-zinc-500 text-[9px] md:text-xs tracking-widest uppercase font-bold px-4">
                            O sorteio e a geração da chave ainda não foram
                            concluídos.
                          </p>
                        </div>
                      );
                    let filterTag = "";
                    if (activeSummaryTab === "round16") filterTag = "Oitavas";
                    if (activeSummaryTab === "quarters") filterTag = "Quartas";
                    if (activeSummaryTab === "semis") filterTag = "Semifinal";
                    if (activeSummaryTab === "final") filterTag = "Final";
                    const filteredMatches = allKnockoutMatchesFlat.filter(
                      (m: any) => m.tag && m.tag.includes(filterTag)
                    );
                    if (filteredMatches.length === 0) return null;
                    return filteredMatches.map((m: any) => {
                      const score = knockoutScores[m.id] || {
                        s1: "",
                        s2: "",
                        p1: "",
                        p2: "",
                      };
                      const events = [
                        ...createMatchEvents(
                          m.t1,
                          score.scorers1,
                          score.yellow1,
                          score.red1,
                          1
                        ),
                        ...createMatchEvents(
                          m.t2,
                          score.scorers2,
                          score.yellow2,
                          score.red2,
                          2
                        ),
                      ];

                      return (
                        <SummaryMatchCard
                          key={m.id}
                          match={m}
                          score1={score.s1}
                          score2={score.s2}
                          p1={score.p1}
                          p2={score.p2}
                          isKnockout={true}
                          events={events}
                          isAdmin={isAdmin}
                          setEditingScorersMatch={setEditingScorersMatch}
                        />
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer Admin */}
      {phase !== "setup" && isAdmin && (
        <div className="mt-12 md:mt-20 pt-6 md:pt-8 text-center pb-8 md:pb-12 print:hidden relative z-10 px-4">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-zinc-500 hover:text-red-500 bg-black/40 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 text-[9px] md:text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 mx-auto px-4 md:px-6 py-2.5 md:py-3 rounded-full transition-all w-full sm:w-auto"
          >
            <Trash2 size={12} className="md:w-3.5 md:h-3.5" /> Encerrar e Apagar
            Tudo
          </button>
        </div>
      )}
    </div>
  );
}
