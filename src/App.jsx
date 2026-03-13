import { useEffect, useMemo, useRef, useState } from "react";

const videos = [
  { file: "1.MOV", label: "динамичный lifestyle reel", number: "01" },
  { file: "2.MOV", label: "быстрый монтаж с акцентом на ритм", number: "02" },
  { file: "3.MOV", label: "визуал для личного бренда", number: "03" },
  { file: "4.MOV", label: "вертикальный storytelling", number: "04" },
  { file: "5.MOV", label: "монтаж с чистой структурой и вайбом", number: "05" },
];

const tickerItems = [
  "Рилсы",
  "графика",
  "монтаж",
  "iphone съемка",
  "личный бренд",
  "бьюти сфера",
  "свадьбы",

];

const services = [
  {
    title: "Reels Production",
    text: "Идея, съемка, монтаж, титры, ритм и готовый вертикальный ролик под публикацию.",
  },
  {
    title: "Editing Only",
    text: "Соберу из вашего материала сильный reel с правильной динамикой и акцентами.",
  },
  {
    title: "Content Day",
    text: "Пакетная съемка серии роликов за один съемочный день с продуманной структурой.",
  },
];

const mediaUrl = (file) => `${import.meta.env.BASE_URL}${file}`;

function InteractiveVideo({
  src,
  className,
  autoPlay = false,
  loop = false,
  controls = false,
  ariaLabel,
  soundEnabled = false,
  onSoundChange,
  isActive = true,
}) {
  const videoRef = useRef(null);
  const [showBadge, setShowBadge] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !soundEnabled || !isActive;
  }, [soundEnabled, isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    if (!isActive) {
      video.muted = true;
      video.pause();
      return undefined;
    }

    if (!autoPlay) return undefined;

    const tryPlay = () => {
      video.muted = !soundEnabled;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        tryPlay();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [autoPlay, isActive, soundEnabled, src]);

  useEffect(() => {
    if (!showBadge) return undefined;
    const timer = setTimeout(() => setShowBadge(false), 700);
    return () => clearTimeout(timer);
  }, [showBadge]);

  useEffect(() => {
    if (!isBlurred) return undefined;
    const timer = setTimeout(() => setIsBlurred(false), 500);
    return () => clearTimeout(timer);
  }, [isBlurred]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (video && isActive && video.paused) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }

    onSoundChange?.(!soundEnabled);

    setShowBadge(true);
    setIsBlurred(true);
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className={`${className} transition-[filter] duration-500 ${isBlurred ? "blur-[3px]" : "blur-0"}`}
        autoPlay={autoPlay}
        controls={controls}
        loop={loop}
        muted={!soundEnabled || !isActive}
        playsInline
        preload="metadata"
        onClick={toggleSound}
        aria-label={ariaLabel}
      >
        <source src={src} />
      </video>
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white shadow-lg backdrop-blur-md transition-all duration-200 ${
            showBadge ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
        >
          {!soundEnabled ? (
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 5L6 9H3v6h3l5 4V5z" />
              <line x1="17" y1="9" x2="21" y2="15" />
              <line x1="21" y1="9" x2="17" y2="15" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 5L6 9H3v6h3l5 4V5z" />
              <path d="M15 9a5 5 0 0 1 0 6" />
              <path d="M18.5 6.5a9 9 0 0 1 0 11" />
            </svg>
          )}
        </span>
      </span>
    </div>
  );
}

function WorkCarousel({ videos, soundEnabled, onSoundChange }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);
  const viewportRef = useRef(null);

  const clampIndex = (index) => Math.max(0, Math.min(videos.length - 1, index));

  const finishDrag = () => {
    if (!isDragging) return;
    const viewportWidth = viewportRef.current?.offsetWidth || 1;
    const moved = dragCurrentX.current - dragStartX.current;
    const threshold = Math.max(56, viewportWidth * 0.14);

    if (Math.abs(moved) > threshold) {
      setActiveIndex((prev) => clampIndex(prev + (moved < 0 ? 1 : -1)));
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  const handlePointerDown = (event) => {
    dragStartX.current = event.clientX;
    dragCurrentX.current = event.clientX;
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;
    dragCurrentX.current = event.clientX;
    setDragOffset(dragCurrentX.current - dragStartX.current);
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const slideVideos = Array.from(viewport.querySelectorAll("video"));
    slideVideos.forEach((video, index) => {
      const isCurrent = index === activeIndex;
      if (!isCurrent) {
        video.muted = true;
        video.pause();
        return;
      }

      video.muted = !soundEnabled;
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      }
    });
  }, [activeIndex, soundEnabled]);

  return (
    <div className="grid w-full gap-3">
      <div
        ref={viewportRef}
        className="overflow-hidden rounded-[24px] border border-[rgba(17,17,17,0.12)] bg-[rgba(255,250,243,0.88)] shadow-[0_20px_50px_rgba(35,20,6,0.12)] touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onPointerLeave={finishDrag}
      >
        <div
          className="flex"
          style={{
            transform: `translate3d(calc(${-activeIndex * 100}% + ${dragOffset}px), 0, 0)`,
            transition: isDragging ? "none" : "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {videos.map((video, index) => (
            <article key={video.file} className="w-full shrink-0 p-2.5">
              <InteractiveVideo
                src={mediaUrl(video.file)}
                className="aspect-[9/16] w-full rounded-[14px] bg-[#d5c0ab] object-cover"
                autoPlay
                loop
                ariaLabel={`Showreel video ${video.number}`}
                soundEnabled={soundEnabled}
                onSoundChange={onSoundChange}
                isActive={activeIndex === index}
              />
              <div className="mt-3 flex min-h-0 flex-col items-start gap-1.5 text-[0.9rem] min-[960px]:min-h-[3.2rem] min-[960px]:flex-row min-[960px]:items-start min-[960px]:justify-between min-[960px]:gap-3">
                <strong>{video.number}</strong>
                <span className="flex-1 text-[#5e584f]">{video.label}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pb-1">
        {videos.map((video, index) => (
          <button
            key={`dot-${video.file}`}
            type="button"
            aria-label={`Открыть видео ${video.number}`}
            aria-current={activeIndex === index ? "true" : undefined}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              activeIndex === index ? "w-8 bg-[#111111]" : "w-2.5 bg-[#111111]/30 hover:bg-[#111111]/55"
            }`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heroSoundEnabled, setHeroSoundEnabled] = useState(false);
  const [workSoundEnabled, setWorkSoundEnabled] = useState(false);
  const [isWideWorkLayout, setIsWideWorkLayout] = useState(false);
  const [workCarouselSounds, setWorkCarouselSounds] = useState([false, false, false]);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const workColumns = useMemo(
    () =>
      [0, 1, 2].map((shift) =>
        videos.map((_, index) => videos[(index + shift) % videos.length]),
      ),
    [],
  );

  useEffect(() => {
    document.title = "nataliastoianova - reelsmaker & editor";

    const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("reveal-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );

    revealItems.forEach((item) => observer.observe(item));
    revealItems.slice(0, 2).forEach((item) => item.classList.add("reveal-visible"));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      const target = event.target;
      if (menuRef.current?.contains(target) || menuButtonRef.current?.contains(target)) {
        return;
      }
      setIsMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = (event) => setIsWideWorkLayout(event.matches);
    setIsWideWorkLayout(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    setWorkSoundEnabled(false);
    setWorkCarouselSounds([false, false, false]);
  }, [isWideWorkLayout]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div
      id="top"
      className="mx-auto w-[min(calc(100%-24px),1180px)] min-[640px]:w-[min(calc(100%-40px),1180px)] min-[960px]:w-[min(calc(100%-52px),1180px)]"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 py-2.5 backdrop-blur-[14px] min-[960px]:gap-4 min-[960px]:py-3.5">
        <a
          className="inline-flex min-w-0 max-w-[calc(100%-58px)] items-center gap-2.5 min-[960px]:max-w-none min-[960px]:gap-3"
          href="#top"
          aria-label="На главную"
          onClick={closeMenu}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#111111] text-sm font-bold tracking-[0.08em] text-[#fff7ee] min-[960px]:h-[46px] min-[960px]:w-[46px]">
            NS
          </span>
          <span className="flex min-w-0 flex-col gap-0.5 text-[0.64rem] uppercase tracking-[0.1em] min-[960px]:text-[0.72rem] min-[960px]:tracking-[0.14em]">
            <strong className="[overflow-wrap:anywhere] text-[0.8rem] min-[960px]:text-[0.88rem]">nataliastoianova</strong>
            <span className="[overflow-wrap:anywhere]">reelsmaker / editor</span>
          </span>
        </a>

        <button
          ref={menuButtonRef}
          className={`inline-flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] rounded-full border shadow-[0_20px_50px_rgba(35,20,6,0.12)] transition min-[960px]:hidden ${
            isMenuOpen
              ? "border-[#6495ED] bg-[#6495ED] text-white"
              : "border-[rgba(17,17,17,0.12)] bg-[rgba(255,250,243,0.92)] text-[#111111]"
          }`}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span
            className={`h-0.5 w-[18px] rounded-full bg-current transition-all duration-200 ease-out ${isMenuOpen ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-[18px] rounded-full bg-current transition-all duration-200 ease-out ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
          />
          <span
            className={`h-0.5 w-[18px] rounded-full bg-current transition-all duration-200 ease-out ${isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>

        <nav className="hidden items-center gap-[18px] text-[0.82rem] uppercase tracking-[0.12em] min-[960px]:inline-flex">
          <a href="#work">Работы</a>
          <a href="#services">Услуги</a>
          <a href="#contact">Контакт</a>
        </nav>

        <nav
          ref={menuRef}
          id="mobile-menu"
          aria-label="Мобильная навигация"
          className={`absolute left-0 right-0 top-[calc(100%+8px)] grid gap-2.5 rounded-2xl border border-[rgba(17,17,17,0.12)] bg-[rgba(255,250,243,0.98)] p-2.5 shadow-[0_20px_50px_rgba(35,20,6,0.12)] transition min-[960px]:hidden ${isMenuOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"}`}
        >
          <a
            className="rounded-[18px] border border-[rgba(17,17,17,0.12)] bg-[#fffaf3] px-3 py-3 text-[0.76rem] uppercase tracking-[0.12em]"
            href="#work"
            onClick={closeMenu}
          >
            Работы
          </a>
          <a
            className="rounded-[18px] border border-[rgba(17,17,17,0.12)] bg-[#fffaf3] px-3 py-3 text-[0.76rem] uppercase tracking-[0.12em]"
            href="#services"
            onClick={closeMenu}
          >
            Услуги
          </a>
          <a
            className="rounded-[18px] border border-[rgba(17,17,17,0.12)] bg-[#fffaf3] px-3 py-3 text-[0.76rem] uppercase tracking-[0.12em]"
            href="#contact"
            onClick={closeMenu}
          >
            Контакты
          </a>
        </nav>
      </header>

      <main
        id="home"
        className={`transition duration-200 ${isMenuOpen ? "max-[959px]:pointer-events-none max-[959px]:select-none max-[959px]:opacity-45 max-[959px]:blur-sm" : ""}`}
      >
        <section className="grid min-h-0 items-center gap-[18px] pt-2 min-[640px]:gap-[22px] min-[960px]:min-h-[calc(100vh-74px)] min-[960px]:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] min-[960px]:gap-7 min-[960px]:pt-5">
          <div className="reveal-base grid min-w-0 gap-3.5 min-[640px]:gap-4.5" data-reveal>
            <p className="m-0 text-[0.78rem] uppercase tracking-[0.22em] text-[#cf452b]">content that feels alive</p>
            <div className="relative grid w-full max-w-full gap-0 pl-5 min-[960px]:pl-8">
              <span className="absolute left-5 top-[55%] rotate-[-13deg] font-['Lavishly_Yours'] text-[50px] leading-none text-[#6495ED] min-[960px]:text-[50px]">
                by
              </span>
              <h1 className="m-0 max-w-full [overflow-wrap:anywhere] pl-10 rotate-[-13deg] font-['Caveat'] text-[74px] leading-[0.92] min-[960px]:text-[clamp(2.8rem,10vw,6.2rem)] min-[960px]:leading-[1.02]">
                Natalia
              </h1>
              <h1 className="-mt-2 m-0 max-w-full [overflow-wrap:anywhere] pl-[6.25rem] rotate-[-13deg] font-['Caveat'] text-[74px] leading-[0.92] min-[960px]:mt-0 min-[960px]:text-[clamp(2.8rem,10vw,6.2rem)] min-[960px]:leading-[1.02]">
                Stoianova
              </h1>
            </div>
            <p className="m-0 pt-5 text-[0.95rem] leading-[1.55] text-[#5e584f] min-[960px]:text-base min-[960px]:leading-[1.6]">
              Снимаю, монтирую и собираю уникальные истории для брендов,
              экспертов и личных блогов.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#111111] px-[18px] py-3.5 text-[0.85rem] font-bold uppercase tracking-[0.12em] text-[#fffaf3] transition hover:-translate-y-0.5 min-[640px]:w-auto min-[640px]:min-w-[44%] min-[960px]:w-auto"
                href="#contact"
                onClick={closeMenu}
              >
                Обсудить проект
              </a>
              <a
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[rgba(17,17,17,0.12)] px-[18px] py-3.5 text-[0.85rem] font-bold uppercase tracking-[0.12em] transition hover:-translate-y-0.5 min-[640px]:w-auto min-[640px]:min-w-[44%] min-[960px]:w-auto"
                href="#work"
                onClick={closeMenu}
              >
                Портфолио
              </a>
            </div>
          </div>

          <div className="reveal-base mx-auto grid w-full min-w-0 max-w-none gap-3.5 min-[960px]:w-[min(100%,32rem)]" data-reveal aria-label="Превью работ">
            <article className="overflow-hidden rounded-[24px] border border-[rgba(17,17,17,0.12)] bg-[rgba(255,250,243,0.88)] shadow-[0_20px_50px_rgba(35,20,6,0.12)]">
              <InteractiveVideo
                src={mediaUrl("1.MOV")}
                className="aspect-[3/4] w-full object-cover"
                autoPlay
                loop
                ariaLabel="Hero preview video"
                soundEnabled={heroSoundEnabled}
                onSoundChange={setHeroSoundEnabled}
              />
            </article>
          </div>
        </section>

        <section className="mb-[22px] mt-4 overflow-hidden border-y border-[rgba(17,17,17,0.12)] py-2.5 min-[960px]:mb-7 min-[960px]:py-3.5">
          <div className="ticker-marquee flex w-max gap-5 text-[0.78rem] uppercase tracking-[0.18em] text-[#5e584f]">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span key={`${item}-${index}`} aria-hidden={index >= tickerItems.length}>
                {item}
              </span>
            ))}
          </div>
        </section>
<hr />
        <section className="reveal-base pt-7 min-[1040px]:pt-15" data-reveal>
          <div className="mb-[18px] grid gap-2.5 min-[960px]:mb-[22px]">
            <p className="m-0 text-[0.78rem] uppercase tracking-[0.22em] text-[#cf452b]">обо мне</p>
            <h2 className="m-0 max-w-full font-[Georgia,'Times_New_Roman',serif] text-[clamp(1.9rem,11vw,3rem)] leading-[0.96] text-balance min-[960px]:max-w-[11ch] min-[960px]:text-[clamp(2rem,8vw,4.6rem)]">
              Снимаю быстро. Монтирую точно. Делаю ролики, которые цепляют с первых секунд.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 text-base leading-[1.6] text-[#5e584f] min-[640px]:grid-cols-2 min-[640px]:gap-3.5 min-[960px]:grid-cols-2">
            <p className="m-0">
              Мой фокус - короткий формат, в котором важна не просто красивая картинка, а ритм, чувство кадра
              и монтаж, который удерживает внимание.
            </p>
        
          </div>
        </section>

        <section className="pt-7 min-[1040px]:pt-15" id="work">
          <div className="reveal-base mb-[18px] grid gap-2.5 min-[960px]:mb-[22px]" data-reveal>
            <hr />
            <p className="m-0 text-[0.78rem] uppercase tracking-[0.22em] text-[#cf452b]">мои работы</p>
            <h2 className="m-0 max-w-full font-[Georgia,'Times_New_Roman',serif] text-[clamp(1.9rem,11vw,3rem)] leading-[0.96] text-balance min-[960px]:max-w-[11ch] min-[960px]:text-[clamp(2rem,8vw,4.6rem)]">
              Карусель моих работ
            </h2>
          </div>

          <div className="reveal-base" data-reveal>
            {!isWideWorkLayout ? (
              <div className="mx-auto w-full max-w-[420px]">
                <WorkCarousel
                  videos={videos}
                  soundEnabled={workSoundEnabled}
                  onSoundChange={setWorkSoundEnabled}
                />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 min-[1040px]:gap-4">
                {workColumns.map((columnVideos, columnIndex) => (
                  <WorkCarousel
                    key={`work-column-${columnIndex}`}
                    videos={columnVideos}
                    soundEnabled={workCarouselSounds[columnIndex]}
                    onSoundChange={(enabled) =>
                      setWorkCarouselSounds((prev) =>
                        prev.map((_, index) => (enabled ? index === columnIndex : false)),
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="pt-7 min-[1040px]:pt-15" id="services">
          <div className="reveal-base mb-[18px] grid gap-2.5 min-[960px]:mb-[22px]" data-reveal>
            <p className="m-0 text-[0.78rem] uppercase tracking-[0.22em] text-[#cf452b]">услуги</p>
            <h2 className="m-0 max-w-full font-[Georgia,'Times_New_Roman',serif] text-[clamp(1.9rem,11vw,3rem)] leading-[0.96] text-balance min-[960px]:max-w-[11ch] min-[960px]:text-[clamp(2rem,8vw,4.6rem)]">
              Форматы, с которыми я работаю
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 min-[640px]:grid-cols-2 min-[640px]:gap-3.5 min-[960px]:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                data-reveal
                className="reveal-base rounded-[24px] border border-[rgba(17,17,17,0.12)] bg-[rgba(255,250,243,0.88)] p-3.5 shadow-[0_20px_50px_rgba(35,20,6,0.12)]"
              >
                <h3 className="mb-2.5 mt-0 text-[1.2rem]">{service.title}</h3>
                <p className="m-0 text-base leading-[1.6] text-[#5e584f]">{service.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="reveal-base pt-7 min-[1040px]:pt-15" data-reveal id="contact">
          <div className="rounded-[24px] border border-[rgba(17,17,17,0.12)] bg-[linear-gradient(135deg,rgba(244,91,63,0.18),rgba(255,250,243,0.92)),rgba(255,250,243,0.88)] p-3 shadow-[0_20px_50px_rgba(35,20,6,0.12)] min-[960px]:p-3.5">
            <p className="m-0 text-[0.78rem] uppercase tracking-[0.22em] text-[#cf452b]">связь</p>
            <h2 className="mt-2.5 max-w-full font-[Georgia,'Times_New_Roman',serif] text-[clamp(1.9rem,11vw,3rem)] leading-[0.96] text-balance min-[960px]:max-w-[11ch] min-[960px]:text-[clamp(2rem,8vw,4.6rem)]">
              Если нужен контент, который выглядит современно и монтируется со вкусом.
            </h2>
            <p className="m-0 mt-3 text-base leading-[1.6] text-[#5e584f]">
              Напиши мне в Instagram / Telegram и пришли задачу, нишу и желаемый стиль.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#111111] px-[18px] py-3.5 text-[0.85rem] font-bold uppercase tracking-[0.12em] text-[#fffaf3] transition hover:-translate-y-0.5 min-[640px]:w-auto min-[640px]:min-w-[44%] min-[960px]:w-auto"
                href="https://instagram.com/nataliastoianova"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
              <a
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[rgba(17,17,17,0.12)] px-[18px] py-3.5 text-[0.85rem] font-bold uppercase tracking-[0.12em] transition hover:-translate-y-0.5 min-[640px]:w-auto min-[640px]:min-w-[44%] min-[960px]:w-auto"
                href="https://t.me/nataliastoianova"
                target="_blank"
                rel="noreferrer"
              >
                Telegram
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer
        className={`flex flex-col gap-1.5 py-5 text-[0.76rem] text-[#5e584f] transition duration-200 min-[960px]:pt-7 min-[960px]:text-[0.82rem] ${isMenuOpen ? "max-[959px]:pointer-events-none max-[959px]:select-none max-[959px]:opacity-45 max-[959px]:blur-sm" : ""}`}
      >
        <p className="m-0">&copy; {new Date().getFullYear()} nataliastoianova</p>
        <p className="m-0">mobile-first portfolio / shot & edited for attention</p>
      </footer>
    </div>
  );
}
