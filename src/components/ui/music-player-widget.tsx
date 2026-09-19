"use client";

import {
  useCallback,
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
} from "react";

/* ─────────────────────────────── YouTube utilities ─────────────── */

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const m = trimmed.match(
    /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

/* ─────────────────── YouTube IFrame API — singleton loader ──────── */

let _ytLoaded = false;
const _ytCbs: (() => void)[] = [];

function whenYTReady(cb: () => void) {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    YT?: { Player: unknown };
    onYouTubeIframeAPIReady?: () => void;
  };
  if (w.YT?.Player) {
    cb();
    return;
  }
  _ytCbs.push(cb);
  if (!_ytLoaded) {
    _ytLoaded = true;
    w.onYouTubeIframeAPIReady = () => {
      while (_ytCbs.length) {
        const next = _ytCbs.shift();
        next?.();
      }
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  }
}

/* ─────────────────────────────────── types ──────────────────────── */

export interface Track {
  title: string;
  artist: string;
  cover: string; // If empty, realistic vinyl record SVG spins
  src: string;   // YouTube URL
}
export type LoopMode = "off" | "all" | "one";
export type Direction = "next" | "prev" | null;

interface YTP {
  loadVideoById: (id: string) => void;
  cueVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (s: number, a: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

/* ─────────────────────── useYouTubePlayer hook ──────────────────── */

function useYouTubePlayer(divId: string) {
  const playerRef = useRef<YTP | null>(null);
  const isReadyRef = useRef(false);
  const onEndedRef = useRef<(() => void) | null>(null);
  const loopRef = useRef<LoopMode>("off");
  const isPlayingRef = useRef(false);
  const pendingActionRef = useRef<"play" | "cue" | null>(null);
  const pendingAutoPlayRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startProgressPoll = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p || !isReadyRef.current) return;
      try {
        const cur = p.getCurrentTime();
        const dur = p.getDuration();
        if (typeof cur === "number" && !isNaN(cur)) {
          setCurrentTime(cur);
        }
        if (typeof dur === "number" && !isNaN(dur) && dur > 0) {
          setDuration(dur);
        }
      } catch {
        /* ignore */
      }
    }, 250);
  }, []);

  const stopProgressPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Mobil Tarayıcılar İçin Autoplay Engeli Çözümü:
  // Okuyucu sayfaya dokunduğu/kaydırdığı anda (ilk kullanıcı jesti), bekleyen autoplay'i derhal devreye al
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFirstGesture = () => {
      if (pendingAutoPlayRef.current && playerRef.current && isReadyRef.current) {
        try {
          playerRef.current.playVideo();
          startProgressPoll();
          setIsPlaying(true);
          isPlayingRef.current = true;
          pendingAutoPlayRef.current = false;
        } catch {}
      }
    };

    const gestureEvents = ["touchstart", "touchend", "pointerdown", "click", "scroll"];
    gestureEvents.forEach((ev) => {
      window.addEventListener(ev, handleFirstGesture, { capture: true, passive: true });
    });

    return () => {
      gestureEvents.forEach((ev) => {
        window.removeEventListener(ev, handleFirstGesture, { capture: true });
      });
    };
  }, [startProgressPoll]);

  const loadVideo = useCallback((videoId: string, autoplay: boolean) => {
    setCurrentTime(0);
    setDuration(0);
    if (autoplay) {
      pendingAutoPlayRef.current = true;
    } else {
      pendingAutoPlayRef.current = false;
    }

    if (playerRef.current && isReadyRef.current) {
      try {
        if (autoplay) {
          isPlayingRef.current = true;
          setIsPlaying(true);
          playerRef.current.loadVideoById(videoId);
          startProgressPoll();
        } else {
          isPlayingRef.current = false;
          setIsPlaying(false);
          playerRef.current.cueVideoById(videoId);
          stopProgressPoll();
        }
        return;
      } catch (err) {
        console.warn("YouTube loadVideo error:", err);
      }
    }

    if (autoplay) {
      isPlayingRef.current = true;
      setIsPlaying(true);
      pendingActionRef.current = "play";
    } else {
      pendingActionRef.current = "cue";
    }

    whenYTReady(() => {
      const w = window as unknown as {
        YT: { Player: new (id: string, opts: unknown) => YTP };
      };
      new w.YT.Player(divId, {
        height: "160",
        width: "240",
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: typeof window !== "undefined" ? window.location.origin : "",
        },
        events: {
          onReady: (e: { target: YTP }) => {
            playerRef.current = e.target;
            isReadyRef.current = true;
            try {
              const dur = e.target.getDuration();
              if (dur > 0) setDuration(dur);
            } catch {}

            if (pendingActionRef.current === "play") {
              pendingActionRef.current = null;
              try {
                e.target.playVideo();
                startProgressPoll();
              } catch {}
            }
          },
          onStateChange: (e: { data: number }) => {
            // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
            if (e.data === 1) {
              pendingAutoPlayRef.current = false;
              isPlayingRef.current = true;
              setIsPlaying(true);
              startProgressPoll();
            } else if (e.data === 2) {
              isPlayingRef.current = false;
              setIsPlaying(false);
              stopProgressPoll();
            } else if (e.data === 0) {
              isPlayingRef.current = false;
              setIsPlaying(false);
              stopProgressPoll();
              if (loopRef.current === "one") {
                try {
                  playerRef.current?.seekTo(0, true);
                  playerRef.current?.playVideo();
                  isPlayingRef.current = true;
                  setIsPlaying(true);
                  startProgressPoll();
                } catch {}
              } else {
                onEndedRef.current?.();
              }
            }
          },
        },
      } as unknown);
    });
  }, [divId, startProgressPoll, stopProgressPoll]);

  // Optimistic play/pause for instant feedback
  const play = useCallback(() => {
    isPlayingRef.current = true;
    setIsPlaying(true);
    startProgressPoll();
    if (!playerRef.current || !isReadyRef.current) {
      pendingActionRef.current = "play";
      return;
    }
    try {
      playerRef.current.playVideo();
    } catch {}
  }, [startProgressPoll]);

  const pause = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    pendingActionRef.current = null;
    stopProgressPoll();
    try {
      playerRef.current?.pauseVideo();
    } catch {}
  }, [stopProgressPoll]);

  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  const seek = useCallback((pct: number) => {
    try {
      const dur = playerRef.current?.getDuration() || duration || 0;
      if (dur > 0) {
        const target = pct * dur;
        setCurrentTime(target);
        playerRef.current?.seekTo(target, true);
      }
    } catch {}
  }, [duration]);

  const setOnEnded = useCallback((cb: () => void) => {
    onEndedRef.current = cb;
  }, []);

  const setLoopMode = useCallback((m: LoopMode) => {
    loopRef.current = m;
  }, []);

  useEffect(() => {
    return () => {
      stopProgressPoll();
    };
  }, [stopProgressPoll]);

  return {
    isPlaying,
    currentTime,
    duration,
    loadVideo,
    play,
    pause,
    toggle,
    seek,
    setOnEnded,
    setLoopMode,
  };
}

/* ──────────────────────── track-list reducer ────────────────────── */

interface MgrState {
  currentIndex: number;
  order: number[];
  shuffled: boolean;
  loopMode: LoopMode;
  direction: Direction;
}
type MgrAction =
  | { type: "SET_TRACK"; index: number; direction: Direction }
  | { type: "TOGGLE_SHUFFLE"; count: number }
  | { type: "CYCLE_LOOP" }
  | { type: "SYNC_TRACKS"; count: number };

function shuffle(pin: number, n: number) {
  const a = Array.from({ length: n }, (_, i) => i).filter((x) => x !== pin);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return [pin, ...a];
}

function mgrReducer(s: MgrState, a: MgrAction): MgrState {
  switch (a.type) {
    case "SET_TRACK":
      return { ...s, currentIndex: a.index, direction: a.direction };
    case "TOGGLE_SHUFFLE": {
      const sh = !s.shuffled;
      return {
        ...s,
        shuffled: sh,
        order: sh ? shuffle(s.currentIndex, a.count) : Array.from({ length: a.count }, (_, i) => i),
      };
    }
    case "CYCLE_LOOP": {
      const next: LoopMode = s.loopMode === "off" ? "all" : s.loopMode === "all" ? "one" : "off";
      return { ...s, loopMode: next };
    }
    case "SYNC_TRACKS": {
      const count = a.count;
      if (count <= 0) return { ...s, currentIndex: 0, order: [], direction: null };
      const safeCurrent = Math.min(s.currentIndex, count - 1);
      if (s.shuffled) {
        return {
          ...s,
          currentIndex: safeCurrent,
          order: shuffle(safeCurrent, count),
        };
      }
      return {
        ...s,
        currentIndex: safeCurrent,
        order: Array.from({ length: count }, (_, i) => i),
      };
    }
  }
}

/* ───────────────────── useRafLoop ──────────────────────────────── */

function useRafLoop(cb: (now: number, dt: number) => void) {
  const r = useRef(cb);
  r.current = cb;
  useEffect(() => {
    let id = 0,
      last = performance.now();
    const loop = (now: number) => {
      r.current(now, now - last);
      last = now;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);
}

/* ─────────────────────── Realistic Vinyl Record SVG ─────────────── */

const VINYL_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="vgrooves" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#141414" />
      <stop offset="30%" stop-color="#1c1c1c" />
      <stop offset="31%" stop-color="#0c0c0c" />
      <stop offset="38%" stop-color="#242424" />
      <stop offset="39%" stop-color="#111111" />
      <stop offset="48%" stop-color="#262626" />
      <stop offset="49%" stop-color="#0e0e0e" />
      <stop offset="59%" stop-color="#222222" />
      <stop offset="60%" stop-color="#101010" />
      <stop offset="72%" stop-color="#272727" />
      <stop offset="73%" stop-color="#0f0f0f" />
      <stop offset="85%" stop-color="#202020" />
      <stop offset="86%" stop-color="#0c0c0c" />
      <stop offset="100%" stop-color="#181818" />
    </radialGradient>
    <linearGradient id="vshine" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.18)" />
      <stop offset="25%" stop-color="rgba(255,255,255,0.02)" />
      <stop offset="50%" stop-color="rgba(255,255,255,0.15)" />
      <stop offset="75%" stop-color="rgba(255,255,255,0.02)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.16)" />
    </linearGradient>
    <radialGradient id="vcenter" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3d1e0c" />
      <stop offset="80%" stop-color="#241005" />
      <stop offset="100%" stop-color="#140802" />
    </radialGradient>
  </defs>

  <!-- Vinyl body with micro grooves -->
  <circle cx="100" cy="100" r="99" fill="url(#vgrooves)" stroke="#2b2b2b" stroke-width="1"/>
  
  <!-- Realistic vinyl sheen reflection overlay -->
  <circle cx="100" cy="100" r="98" fill="url(#vshine)" opacity="0.8"/>

  <!-- Concentric micro grooves -->
  <circle cx="100" cy="100" r="90" fill="none" stroke="#262626" stroke-width="0.7" opacity="0.6"/>
  <circle cx="100" cy="100" r="82" fill="none" stroke="#222222" stroke-width="0.8" opacity="0.7"/>
  <circle cx="100" cy="100" r="74" fill="none" stroke="#282828" stroke-width="0.6" opacity="0.6"/>
  <circle cx="100" cy="100" r="66" fill="none" stroke="#202020" stroke-width="0.7" opacity="0.8"/>
  <circle cx="100" cy="100" r="58" fill="none" stroke="#282828" stroke-width="0.6" opacity="0.6"/>
  <circle cx="100" cy="100" r="50" fill="none" stroke="#1f1f1f" stroke-width="0.7" opacity="0.7"/>

  <!-- Center Paper Label (Antique Oak / Amber) -->
  <circle cx="100" cy="100" r="41" fill="url(#vcenter)" stroke="#d4af37" stroke-width="1.2"/>
  <circle cx="100" cy="100" r="38.5" fill="none" stroke="#a37e2c" stroke-width="0.6" stroke-dasharray="2,2"/>

  <!-- Label Typography -->
  <text x="100" y="87" text-anchor="middle" font-family="Georgia,serif" font-size="6.5" font-weight="bold" fill="#f5d485" letter-spacing="0.5">GÜNDÜZ RAKISI</text>
  <text x="100" y="96" text-anchor="middle" font-family="Georgia,serif" font-size="4.8" font-style="italic" fill="#d4af37">Mert Kip</text>
  <path d="M 76 101 Q 100 105 124 101" fill="none" stroke="#d4af37" stroke-width="0.5" opacity="0.6"/>
  <text x="100" y="111" text-anchor="middle" font-family="Georgia,serif" font-size="3.8" fill="#a88532">33 ⅓ RPM • STEREO</text>

  <!-- Center spindle hole -->
  <circle cx="100" cy="100" r="7.5" fill="#080808" stroke="#555" stroke-width="0.8"/>
  <circle cx="100" cy="100" r="3" fill="#111"/>
</svg>`)}`;

/* ──────────────────────── ScalesMixer (Visualizer) ─────────────── */

const COLS = 10,
  ROWS = 10;
const sineOut = (x: number) => Math.sin((x * Math.PI) / 2);
const sineIn = (x: number) => 1 - Math.cos((x * Math.PI) / 2);
const sineInOut = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const A_DUR = 1.5,
  A_TO = 11,
  A_STEP = 3 / (COLS - 1);
const B_DUR = 1,
  S_FROM = 0.133,
  S_TO = 0.8;

function colY(t: number, c: number) {
  const lo = t - c * A_STEP,
    p = A_DUR * 2,
    cy = ((lo % p) + p) % p;
  return A_TO * (cy < A_DUR ? sineInOut(cy / A_DUR) : sineInOut(1 - (cy - A_DUR) / A_DUR));
}
function bCircle(t: number, c: number, r: number): [number, number] {
  const fr = r / ROWS,
    yF = lerp(77, -77, fr),
    yT = lerp(c, -c, fr);
  const lo = t - c / COLS,
    p = B_DUR * 2,
    cy = ((lo % p) + p) % p;
  const e = cy < B_DUR ? sineOut(cy / B_DUR) : sineIn(1 - (cy - B_DUR) / B_DUR);
  return [lerp(yF, yT, e), lerp(S_FROM, S_TO, e)];
}

function ScalesMixer({ isPlaying }: { isPlaying: boolean }) {
  const maskId = useId().replace(/:/g, "_");
  const cRefs = useRef<(SVGGElement | null)[]>([]);
  const ciRefs = useRef<(SVGCircleElement | null)[][]>(Array.from({ length: COLS }, () => []));
  const tRef = useRef(50);

  useRafLoop((_, dt) => {
    if (isPlaying) tRef.current += dt / 1000;
    for (let c = 0; c < COLS; c++) {
      const el = cRefs.current[c];
      if (el) el.style.transform = `translate(${c * 10}px, ${colY(tRef.current, c)}px)`;
      for (let r = 0; r < ROWS; r++) {
        const ci = ciRefs.current[c][r];
        if (!ci) continue;
        const [ty, s] = bCircle(tRef.current, c, r);
        ci.style.transform = `translateY(${ty}px) scale(${s})`;
      }
    }
  });

  return (
    <svg className="gr-scales" viewBox="0 0 98 108" aria-hidden="true">
      <mask id={maskId}>
        <rect width="10" height="10" fill="#fff" />
      </mask>
      {Array.from({ length: COLS }, (_, c) => (
        <g
          key={c}
          ref={(el) => {
            cRefs.current[c] = el;
          }}
          style={{ transform: `translate(${c * 10}px,0)` }}
        >
          {Array.from({ length: ROWS }, (_, r) => (
            <g key={r} mask={`url(#${maskId})`} transform={`translate(0 ${r * 10})`}>
              <circle
                ref={(el) => {
                  ciRefs.current[c][r] = el;
                }}
                cx="5"
                cy="5"
                r="5"
                fill="#d97706"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

/* ───────────────────────────── Disc ────────────────────────────── */

interface LayerItem {
  id: number;
  track: Track;
  dir: Direction;
}

function Disc({
  layers,
  isPlaying,
  trackKey,
  direction,
}: {
  layers: LayerItem[];
  isPlaying: boolean;
  trackKey: number;
  direction: Direction;
}) {
  const spinRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef(0);
  const velRef = useRef(0);
  const burst = useRef({ from: 0, start: 0, active: false, pending: false });
  const lastKey = useRef(trackKey);

  useEffect(() => {
    if (trackKey !== lastKey.current) {
      lastKey.current = trackKey;
      if (direction) {
        burst.current.from = direction === "prev" ? 360 : -360;
        burst.current.pending = true;
      }
    }
  }, [trackKey, direction]);

  useRafLoop((now) => {
    const el = spinRef.current;
    if (!el) return;
    if (isPlaying) {
      // Smoothly accelerate to 0.85 deg/frame
      velRef.current += (0.85 - velRef.current) * 0.12;
    } else {
      // Smoothly decelerate to 0
      velRef.current *= 0.94;
      if (velRef.current < 0.001) velRef.current = 0;
    }
    rotRef.current = (rotRef.current + velRef.current) % 360;

    const b = burst.current;
    if (b.pending) {
      b.start = now;
      b.pending = false;
      b.active = true;
    }
    let extra = 0;
    if (b.active) {
      const t = (now - b.start) / 620;
      if (t >= 1) b.active = false;
      else extra = b.from * (1 - Math.pow(1 - t, 3));
    }

    el.style.transform = `rotate(${rotRef.current + extra}deg)`;
  });

  return (
    <div className="gr-disc-mask">
      <div ref={spinRef} className="gr-disc-spin" style={{ transformOrigin: "center center" }}>
        {layers.map((l, i) => {
          const isNew = i === layers.length - 1;
          // When no cover is provided, display the authentic vinyl record
          const img = l.track.cover ? l.track.cover : VINYL_SVG;
          return (
            <img
              key={l.id}
              src={img}
              alt={l.track.title}
              className={`gr-disc-cover${isNew ? (l.dir ? " gr-cover-enter" : "") : " gr-cover-exit"}`}
              draggable={false}
              onError={(e) => {
                (e.target as HTMLImageElement).src = VINYL_SVG;
              }}
            />
          );
        })}
      </div>
      <div className="gr-disc-hole">
        <div className="gr-disc-hole-inner" />
      </div>
    </div>
  );
}

/* ─────────────────────── TrackInfo ─────────────────────────────── */

function TrackInfo({ layers }: { layers: LayerItem[] }) {
  return (
    <div className="gr-track-info">
      {layers.map((l, i) => {
        const isNew = i === layers.length - 1;
        const dx = l.dir === "next" ? 14 : l.dir === "prev" ? -14 : 0;
        return (
          <div key={l.id} className={`gr-ti-layer${isNew ? "" : " gr-ti-abs"}`}>
            <p
              className={`gr-ti-artist${isNew ? (l.dir ? " gr-ti-enter" : "") : " gr-ti-exit"}`}
              style={{ ["--gr-dx" as string]: `${isNew ? dx : -dx}px` }}
            >
              {l.track.artist}
            </p>
            <h2
              className={`gr-ti-title${isNew ? (l.dir ? " gr-ti-enter" : "") : " gr-ti-exit"}`}
              style={{ ["--gr-dx" as string]: `${isNew ? dx : -dx}px` }}
            >
              {l.track.title}
            </h2>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────── ProgressBar ───────────────────────────── */

function fmt(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function ProgressBar({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (p: number) => void;
}) {
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  return (
    <div className="gr-progress-area">
      <div
        className="gr-progress-bar"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onSeek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
        }}
      >
        <div className="gr-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="gr-time">
        <span>{fmt(currentTime)}</span>
        <span className="gr-time-sep">/</span>
        <span>{fmt(duration)}</span>
      </div>
    </div>
  );
}

/* ─────────────────────── Controls ──────────────────────────────── */

function Controls({
  isPlaying,
  shuffled,
  loopMode,
  onToggle,
  onNext,
  onPrev,
  onShuffle,
  onLoop,
  n,
}: {
  isPlaying: boolean;
  shuffled: boolean;
  loopMode: LoopMode;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onShuffle: () => void;
  onLoop: () => void;
  n: number;
}) {
  return (
    <div className="gr-controls">
      <button
        className={`gr-ctrl gr-ctrl-sm${shuffled ? " gr-active" : ""}`}
        onClick={onShuffle}
        disabled={n < 2}
        title={shuffled ? "Karıştırma Açık" : "Karıştır"}
      >
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 3h5v5" />
          <path d="M21 3l-7 7" />
          <path d="M3 21l7-7" />
          <path d="M16 21h5v-5" />
          <path d="M21 21l-7-7" />
          <path d="M3 3l7 7" />
        </svg>
      </button>
      <button className="gr-ctrl" onClick={onPrev} disabled={n < 2} title="Önceki">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M19 5L8 12l11 7zM5 5h2v14H5z" />
        </svg>
      </button>
      <button
        className="gr-ctrl gr-ctrl-play"
        onClick={onToggle}
        title={isPlaying ? "Duraklat" : "Oynat"}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
            <path d="M6 5h3v14H6zM15 5h3v14h-3z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
            <path d="M7 5v14l11-7z" />
          </svg>
        )}
      </button>
      <button className="gr-ctrl" onClick={onNext} disabled={n < 2} title="Sonraki">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M5 5l11 7L5 19zM17 5h2v14h-2z" />
        </svg>
      </button>
      <button
        className={`gr-ctrl gr-ctrl-sm${loopMode !== "off" ? " gr-active" : ""}`}
        onClick={onLoop}
        title={
          loopMode === "off"
            ? "Döngü (Kapalı)"
            : loopMode === "all"
            ? "Döngü (Tümünü Çal)"
            : "Döngü (Tekrar Çal)"
        }
        style={{ position: "relative" }}
      >
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12V8a2 2 0 0 1 2-2h12" />
          <path d="M16 3l4 3l-4 3" />
          <path d="M20 12v4a2 2 0 0 1-2 2H6" />
          <path d="M8 21l-4-3l4-3" />
        </svg>
        {loopMode === "one" && <span className="gr-loop-badge">1</span>}
      </button>
    </div>
  );
}

/* ──────────────────────── MusicPlayerWidget ─────────────────────── */

export interface MusicPlayerWidgetProps {
  tracks: Track[];
  autoPlay?: boolean;
}

export function MusicPlayerWidget({ tracks, autoPlay = false }: MusicPlayerWidgetProps) {
  const ytDivId = useId().replace(/:/g, "gr");
  const yt = useYouTubePlayer(ytDivId);

  const [mgr, dispatch] = useReducer(mgrReducer, {
    currentIndex: 0,
    order: Array.from({ length: tracks.length }, (_, i) => i),
    shuffled: false,
    loopMode: "off",
    direction: null,
  });

  const [layers, setLayers] = useState<LayerItem[]>(() => [{ id: 0, track: tracks[0], dir: null }]);
  const lastIdx = useRef(0);
  const layerId = useRef(1);
  const wasPlayingRef = useRef(false);

  // Init first track
  useEffect(() => {
    const id = extractYouTubeId(tracks[0]?.src);
    if (id) yt.loadVideo(id, autoPlay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync loop mode
  useEffect(() => {
    yt.setLoopMode(mgr.loopMode);
  }, [mgr.loopMode, yt]);

  // Track playback state for seamless track switching
  useEffect(() => {
    wasPlayingRef.current = yt.isPlaying;
  }, [yt.isPlaying]);

  // On track change → update layers + load video
  useEffect(() => {
    if (mgr.currentIndex === lastIdx.current) return;
    lastIdx.current = mgr.currentIndex;
    const id = layerId.current++;
    const track = tracks[mgr.currentIndex];
    setLayers((prev) => [...prev, { id, track, dir: mgr.direction }]);
    const vid = extractYouTubeId(track?.src);
    if (vid) yt.loadVideo(vid, wasPlayingRef.current);
    const t = setTimeout(() => setLayers((prev) => prev.filter((l) => l.id === id)), 760);
    return () => clearTimeout(t);
  }, [mgr.currentIndex, mgr.direction, tracks, yt]);

  // Sync player order if tracks list length changes
  useEffect(() => {
    dispatch({ type: "SYNC_TRACKS", count: tracks.length });
  }, [tracks.length]);

  const goNext = useCallback(() => {
    if (mgr.order.length === 0) return;
    const pos = mgr.order.indexOf(mgr.currentIndex);
    const np = pos + 1;
    if (np >= mgr.order.length) {
      // Wrap around to start of playlist
      dispatch({ type: "SET_TRACK", index: mgr.order[0], direction: "next" });
      return;
    }
    dispatch({ type: "SET_TRACK", index: mgr.order[np], direction: "next" });
  }, [mgr.order, mgr.currentIndex]);

  const goPrev = useCallback(() => {
    if (mgr.order.length === 0) return;
    const pos = mgr.order.indexOf(mgr.currentIndex);
    const pp = pos - 1;
    if (pp < 0) {
      // Wrap around to end of playlist
      dispatch({ type: "SET_TRACK", index: mgr.order[mgr.order.length - 1], direction: "prev" });
      return;
    }
    dispatch({ type: "SET_TRACK", index: mgr.order[pp], direction: "prev" });
  }, [mgr.order, mgr.currentIndex]);

  // Transition automatically when song finishes playing
  const handleEnded = useCallback(() => {
    if (mgr.order.length === 0) return;
    const pos = mgr.order.indexOf(mgr.currentIndex);
    const np = pos + 1;
    if (np >= mgr.order.length) {
      if (mgr.loopMode === "all") {
        wasPlayingRef.current = true;
        dispatch({ type: "SET_TRACK", index: mgr.order[0], direction: "next" });
      }
      return;
    }
    wasPlayingRef.current = true;
    dispatch({ type: "SET_TRACK", index: mgr.order[np], direction: "next" });
  }, [mgr.order, mgr.currentIndex, mgr.loopMode]);

  useEffect(() => {
    yt.setOnEnded(handleEnded);
  }, [yt, handleEnded]);

  return (
    <div className={`gr-player-card${yt.isPlaying ? " gr-playing" : ""}`}>
      {/* YouTube iframe container — sized at 240x160 behind card with 0.001 opacity so browser/YT does not throttle audio */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 240,
          height: 160,
          opacity: 0.001,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div id={ytDivId} />
      </div>

      {/* Disc */}
      <Disc
        layers={layers}
        isPlaying={yt.isPlaying}
        trackKey={mgr.currentIndex}
        direction={mgr.direction}
      />

      {/* Info panel */}
      <div className="gr-info">
        <ScalesMixer isPlaying={yt.isPlaying} />
        <TrackInfo layers={layers} />
        <ProgressBar
          currentTime={yt.currentTime}
          duration={yt.duration}
          onSeek={yt.seek}
        />
        <Controls
          isPlaying={yt.isPlaying}
          shuffled={mgr.shuffled}
          loopMode={mgr.loopMode}
          onToggle={yt.toggle}
          onNext={goNext}
          onPrev={goPrev}
          onShuffle={() => dispatch({ type: "TOGGLE_SHUFFLE", count: tracks.length })}
          onLoop={() => dispatch({ type: "CYCLE_LOOP" })}
          n={tracks.length}
        />
      </div>
    </div>
  );
}

export default MusicPlayerWidget;
