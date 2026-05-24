import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    RufflePlayer: {
      newest: () => {
        createPlayer: () => HTMLElement & {
          load: (config: { url: string; allowScriptAccess?: boolean }) => void;
        };
      };
    };
  }
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    const loadRuffle = () => {
      script = document.createElement("script");
      // Load Ruffle from static path (works in Capacitor Android WebView)
      script.src = "./ruffle/ruffle.js";
      script.onload = () => setTimeout(initPlayer, 300);
      script.onerror = () => setStatus("error");
      document.head.appendChild(script);
    };

    const initPlayer = () => {
      if (!window.RufflePlayer || !containerRef.current) {
        setStatus("error");
        return;
      }
      containerRef.current.innerHTML = "";
      const ruffle = window.RufflePlayer.newest();
      const player = ruffle.createPlayer();
      player.style.width = "100%";
      player.style.height = "100%";
      containerRef.current.appendChild(player);
      player.load({ url: "./game.swf", allowScriptAccess: true });
      setStatus("ready");
    };

    loadRuffle();
    return () => { if (script) document.head.removeChild(script); };
  }, []);

  const toggleFullscreen = () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-left">
          <span className="logo-icon">&#9654;</span>
          <span className="logo-text">Flash Player</span>
        </div>
        <div className="header-right">
          <span className="status-badge" data-status={status}>
            {status === "loading" && "Загрузка..."}
            {status === "ready" && "Игра запущена"}
            {status === "error" && "Ошибка загрузки"}
          </span>
          <button className="fullscreen-btn" onClick={toggleFullscreen} title="Полноэкранный режим">
            {isFullscreen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="game-area">
        {status === "loading" && (
          <div className="overlay">
            <div className="spinner" />
            <p className="overlay-text">Инициализация Flash-эмулятора...</p>
          </div>
        )}
        {status === "error" && (
          <div className="overlay">
            <div className="error-icon">&#9888;</div>
            <p className="overlay-text">Не удалось загрузить игру</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>
              Попробовать снова
            </button>
          </div>
        )}
        <div
          ref={containerRef}
          className="ruffle-container"
          style={{ opacity: status === "ready" ? 1 : 0 }}
        />
      </main>

      <footer className="app-footer">
        <span>Работает на Ruffle &mdash; Flash-эмулятор</span>
        <span className="offline-badge">&#10003; Доступно офлайн</span>
      </footer>
    </div>
  );
}
