"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type Particle = {
  rainX: number;
  rainY: number;
  velocity: number;
  targetX: number;
  targetY: number;
  size: number;
  glyph: "0" | "1";
  phase: number;
};

const projects = [
  {
    index: "01",
    name: "Foundry",
    label: "AI assessment & training",
    description:
      "AI에게 실제 업무를 지시하고, 결과물로 역량을 평가하고 훈련하는 실기 플랫폼.",
    metric: "238 tasks · 1,073 runs",
    href: "https://foundry.linearsolve.com/",
  },
  {
    index: "02",
    name: "LinearSolve",
    label: "Algorithm learning system",
    description:
      "문제 제작부터 채점, 학습 기록까지 직접 운영하는 알고리즘 교육 온라인 저지.",
    metric: "1,430 problems · 190 users",
    href: "https://www.linearsolve.com/",
  },
  {
    index: "03",
    name: "Education",
    label: "High school AI education",
    description:
      "2023년부터 알고리즘을, 2026년부터는 LLM과 에이전트를 고등학교 현장에 연결합니다.",
    metric: "Teaching since 2023",
    href: "#teaching",
  },
];

const achievements = [
  ["2026", "AI TOP 100", "Bronze"],
  ["2026", "Hongik Startup Festival", "Grand Prize"],
  ["2026", "SUAPC Winter", "6th"],
  ["2026", "UCPC", "Finalist"],
];

const securitySignals = [
  ["2026", "IHHH CTF", "1st"],
  ["2026", "CodeVinci CTF", "2nd"],
  ["2026", "Hacktheon Sejong", "Quals 6th · Final 12th"],
  ["2025", "LLM Safety Challenge", "Final 1st"],
  ["2025", "WhiteHat Contest", "Final 5th"],
  ["PROFILE", "Dreamhack CTF", "Ranking #2"],
];

const binaryColumns = Array.from({ length: 28 }, (_, column) => ({
  id: column,
  value: Array.from({ length: 52 }, (_, index) =>
    (column * 7 + index * 11 + index * column) % 5 > 2 ? "1" : "0",
  ).join(""),
  left: `${(column / 27) * 100}%`,
  delay: `-${(column * 1.73) % 23}s`,
  duration: `${22 + (column % 8) * 1.7}s`,
}));

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(value: number) {
  const x = clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
}

function BinaryIntro({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const completionRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const finish = useCallback(() => {
    if (completionRef.current) return;
    completionRef.current = true;
    setLeaving(true);
    window.setTimeout(onComplete, 900);
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      const timer = window.setTimeout(finish, 500);
      return () => window.clearTimeout(timer);
    }

    document.body.classList.add("intro-active");

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let particles: Particle[] = [];
    let targetProgress = 0;
    let assembly = 0;
    let pointerX = width / 2;
    let pointerY = height / 2;
    let pointerVisible = false;
    let lastPointer: { x: number; y: number } | null = null;
    let frame = 0;
    let lastTime = performance.now();
    let lastUiUpdate = 0;
    let completedAt = 0;
    const startedAt = performance.now();

    const buildTargets = () => {
      const buffer = document.createElement("canvas");
      buffer.width = width;
      buffer.height = height;
      const bufferContext = buffer.getContext("2d");
      if (!bufferContext) return [] as { x: number; y: number }[];

      const mobile = width < 720;
      const fontSize = mobile
        ? Math.min(width * 0.16, 76)
        : Math.min(width * 0.145, 196);
      bufferContext.clearRect(0, 0, width, height);
      bufferContext.fillStyle = "#ffffff";
      const siteFont = window.getComputedStyle(document.body).fontFamily;
      bufferContext.font = `720 ${fontSize}px ${siteFont}`;
      bufferContext.textAlign = "center";
      bufferContext.textBaseline = "middle";
      bufferContext.fillText("bformat.dev", width / 2, height / 2);

      const image = bufferContext.getImageData(0, 0, width, height).data;
      const step = mobile ? 4 : 6;
      const points: { x: number; y: number }[] = [];
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          if (image[(y * width + x) * 4 + 3] > 110) points.push({ x, y });
        }
      }

      for (let i = points.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [points[i], points[j]] = [points[j], points[i]];
      }
      return points;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const targets = buildTargets();
      const desiredCount = clamp(
        Math.floor((width * height) / 900),
        width < 720 ? 360 : 820,
        1520,
      );

      particles = Array.from({ length: desiredCount }, (_, index) => {
        const target = targets[index % Math.max(targets.length, 1)] ?? {
          x: width / 2,
          y: height / 2,
        };
        return {
          rainX: Math.random() * width,
          rainY: Math.random() * (height + 240) - 120,
          velocity: 9 + Math.random() * 23,
          targetX: target.x,
          targetY: target.y,
          size: 8 + Math.random() * 5,
          glyph: Math.random() > 0.5 ? "1" : "0",
          phase: Math.random() * Math.PI * 2,
        };
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerVisible = event.pointerType !== "touch";

      if (lastPointer) {
        const distance = Math.hypot(
          event.clientX - lastPointer.x,
          event.clientY - lastPointer.y,
        );
        targetProgress = clamp(targetProgress + Math.min(distance, 80) / 2100, 0, 1);
      }
      lastPointer = { x: event.clientX, y: event.clientY };
    };

    const onPointerDown = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      targetProgress = clamp(targetProgress + 0.08, 0, 1);
    };

    const draw = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const elapsed = (now - startedAt) / 1000;

      if (elapsed > 6 && targetProgress < 0.18) {
        targetProgress = Math.min(0.18, targetProgress + delta * 0.018);
      }
      if (window.matchMedia("(pointer: coarse)").matches && elapsed > 1.2) {
        targetProgress = Math.min(1, targetProgress + delta * 0.13);
      }

      assembly +=
        (targetProgress - assembly) * (1 - Math.exp(-delta * 1.85));
      const resolved = smoothstep(assembly);

      context.clearRect(0, 0, width, height);
      context.textAlign = "center";
      context.textBaseline = "middle";

      for (const particle of particles) {
        particle.rainY += particle.velocity * delta * (1 - resolved * 0.82);
        if (particle.rainY > height + 24) {
          particle.rainY = -24;
          particle.rainX = Math.random() * width;
          particle.glyph = Math.random() > 0.5 ? "1" : "0";
        }

        const drift = Math.sin(now * 0.00045 + particle.phase) * 4;
        const x = particle.rainX + drift + (particle.targetX - particle.rainX - drift) * resolved;
        const y = particle.rainY + (particle.targetY - particle.rainY) * resolved;
        const proximity = 1 - clamp(Math.hypot(x - pointerX, y - pointerY) / 190, 0, 1);
        const alpha = 0.1 + resolved * 0.78 + proximity * 0.08 * (1 - resolved);

        context.font = `${500 + Math.round(resolved * 130)} ${particle.size + resolved * 1.5}px var(--font-geist-mono), monospace`;
        context.fillStyle = `rgba(231, 255, 231, ${alpha})`;
        context.fillText(particle.glyph, x, y);
      }

      if (pointerVisible && !completionRef.current) {
        context.beginPath();
        context.arc(pointerX, pointerY, 17, 0, Math.PI * 2);
        context.strokeStyle = `rgba(226,255,225,${0.18 + resolved * 0.12})`;
        context.lineWidth = 1;
        context.stroke();
        context.beginPath();
        context.arc(pointerX, pointerY, 2, 0, Math.PI * 2);
        context.fillStyle = "rgba(240,255,235,.8)";
        context.fill();
      }

      if (now - lastUiUpdate > 90) {
        setProgress(assembly);
        lastUiUpdate = now;
      }

      if (targetProgress >= 1 && assembly > 0.975) {
        if (!completedAt) completedAt = now;
        if (now - completedAt > 1450) finish();
      }

      frame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    frame = window.requestAnimationFrame(draw);

    return () => {
      document.body.classList.remove("intro-active");
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [finish]);

  return (
    <div className={`binary-intro${leaving ? " is-leaving" : ""}`}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <div
        className="intro-resolved-word"
        aria-hidden="true"
        style={{
          opacity: clamp((progress - 0.78) / 0.22, 0, 1) * 0.34,
          filter: `blur(${(1 - clamp((progress - 0.78) / 0.22, 0, 1)) * 8}px)`,
        }}
      >
        bformat.dev
      </div>
      <div className="intro-brand">bformat / resolving identity</div>
      <div className="intro-guide" aria-live="polite">
        <span>move to reconstruct</span>
        <div className="intro-progress" aria-hidden="true">
          <i style={{ transform: `scaleX(${clamp(progress, 0, 1)})` }} />
        </div>
        <span>{String(Math.round(progress * 100)).padStart(2, "0")}%</span>
      </div>
      <button className="intro-skip" type="button" onClick={finish}>
        Skip intro
      </button>
    </div>
  );
}

function SiteContent() {
  const moveHackerGlow = (event: ReactPointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--hacker-x",
      `${event.clientX - bounds.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--hacker-y",
      `${event.clientY - bounds.top}px`,
    );
  };

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        }
      },
      { threshold: 0.15 },
    );

    elements.forEach((element) => observer.observe(element));

    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? window.scrollY / max : 0;
      document.documentElement.style.setProperty("--page-progress", String(value));
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  return (
    <div className="site-shell">
      <div className="page-progress" aria-hidden="true" />
      <header className="site-nav">
        <a className="site-brand" href="#top" aria-label="bformat.dev home">
          bformat.dev
        </a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#teaching">Teaching</a>
          <a href="#archive">Archive</a>
          <a href="#hacker">Security</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero-meta" data-reveal>
            <span>Founder · Educator · Competitive Programmer</span>
            <span>Seoul, KR / 2026</span>
          </div>

          <div className="hero-copy">
            <h1 data-reveal>
              I build systems
              <br />
              that make ability
              <br />
              <em>visible.</em>
            </h1>
            <div className="hero-support" data-reveal>
              <div className="profile-chip">
                <div
                  className="profile-avatar"
                  role="img"
                  aria-label="검은색과 흰색의 펭귄 인형 — bformat 프로필 이미지"
                />
                <div className="profile-identity">
                  <span>BFORMAT / PROFILE</span>
                  <strong>전승민</strong>
                </div>
              </div>
              <p>
                AI 업무역량 평가·훈련 플랫폼을 만들고, 학생들에게 알고리즘과
                AI를 가르칩니다. <span className="nowrap">알고리즘 / 보안</span>
                {" "}대회 출제, 참여에 관심이 많습니다.
              </p>
              <div className="hero-actions">
                <a className="primary-link" href="#work">
                  Explore my work <span aria-hidden="true">↘</span>
                </a>
                <a
                  className="text-link"
                  href="https://github.com/bFormat"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub ↗
                </a>
              </div>
            </div>
          </div>

          <div className="proof-strip" data-reveal>
            <div><strong>1,430</strong><span>Problems</span></div>
            <div><strong>1,073</strong><span>AI runs</span></div>
            <div><strong>2023—</strong><span>Teaching</span></div>
            <div><strong>Bronze</strong><span>AI TOP 100</span></div>
          </div>
        </section>

        <section className="work section" id="work">
          <div className="section-heading" data-reveal>
            <p>01 / Selected work</p>
            <h2>Things I&apos;m building.</h2>
          </div>
          <div className="project-list">
            {projects.map((project) => (
              <a
                className="project-row"
                href={project.href}
                key={project.name}
                target={project.href.startsWith("http") ? "_blank" : undefined}
                rel={project.href.startsWith("http") ? "noreferrer" : undefined}
                data-reveal
              >
                <span className="project-index">{project.index}</span>
                <div className="project-title">
                  <p>{project.label}</p>
                  <h3>{project.name}</h3>
                </div>
                <p className="project-description">{project.description}</p>
                <div className="project-metric">
                  <span>{project.metric}</span>
                  <b aria-hidden="true">↗</b>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="teaching section" id="teaching">
          <div className="section-heading light" data-reveal>
            <p>02 / Teaching</p>
            <h2>Give students the tool.<br />Then get out of the way.</h2>
          </div>
          <div className="teaching-grid">
            <p className="teaching-statement" data-reveal>
              학생이 무엇을 갈고닦을지 스스로 정하고, LLM과 에이전트를 성장의
              도구로 쓸 수 있어야 한다고 믿습니다.
            </p>
            <div className="teaching-timeline" data-reveal>
              <div><time>2023</time><p>고등학교 알고리즘 교육 20회 · Django 프로젝트 멘토링</p></div>
              <div><time>2024</time><p>알고리즘 교육 7회 · 문제 제작과 대회 운영</p></div>
              <div><time>2026</time><p>생성형 AI 교육 · 교사 대상 AI·에이전트 연수</p></div>
            </div>
          </div>
        </section>

        <section className="archive section" id="archive">
          <div className="section-heading" data-reveal>
            <p>03 / Selected signals</p>
            <h2>Proof, not decoration.</h2>
          </div>
          <div className="achievement-list" data-reveal>
            {achievements.map(([year, title, result]) => (
              <div className="achievement-row" key={title}>
                <span>{year}</span>
                <strong>{title}</strong>
                <em>{result}</em>
              </div>
            ))}
          </div>
          <div className="archive-links" data-reveal>
            <a href="https://dreamhack.io/users/35607" target="_blank" rel="noreferrer">Dreamhack ↗</a>
            <a href="https://www.linkedin.com/in/%EC%8A%B9%EB%AF%BC-%EC%A0%84-588023348/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
          </div>
        </section>

        <section
          className="hacker-section"
          id="hacker"
          onPointerMove={moveHackerGlow}
        >
          <div className="hacker-binary" aria-hidden="true">
            {binaryColumns.map((column) => (
              <span
                className="binary-column"
                key={column.id}
                style={{
                  left: column.left,
                  animationDelay: column.delay,
                  animationDuration: column.duration,
                }}
              >
                {column.value}
              </span>
            ))}
          </div>
          <div className="hacker-spotlight" aria-hidden="true" />
          <div className="hacker-content">
            <div className="hacker-heading" data-reveal>
              <p>04 / Security &amp; CTF</p>
              <div>
                <span className="terminal-line">
                  bformat@security:~$ ./trace --signal
                </span>
                <h2>
                  Break it.<br />
                  Understand it.<br />
                  <em>Build it better.</em>
                </h2>
              </div>
            </div>

            <div className="hacker-grid">
              <p className="hacker-statement" data-reveal>
                보안 리서치와 AI를 접목한 솔루션에 관심이 많습니다. Agent가 잘
                하는 영역을 분리하여 자동화하고, 대체할 수 없는 인간 전문가만의
                영역과 마음가짐을 연구하고 있습니다.
              </p>
              <div className="hacker-records" data-reveal>
                {securitySignals.map(([year, title, result], index) => (
                  <div className="hacker-record" key={`${year}-${title}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <time>{year}</time>
                    <strong>{title}</strong>
                    <em>{result}</em>
                  </div>
                ))}
              </div>
            </div>

            <div className="hacker-footer" data-reveal>
              <span>TEAM / CatN1p</span>
              <span>HANDLE / bformat</span>
              <a
                href="https://dreamhack.io/users/35607"
                target="_blank"
                rel="noreferrer"
              >
                Open Dreamhack profile ↗
              </a>
            </div>
          </div>
        </section>

        <section className="contact section" id="contact">
          <p data-reveal>05 / Contact</p>
          <h2 data-reveal>
            Build something
            <br />
            that can be <em>tested.</em>
          </h2>
          <div className="contact-bottom" data-reveal>
            <p>Founder of Naedideum · Building Foundry and LinearSolve.</p>
            <div>
              <a href="https://github.com/bFormat" target="_blank" rel="noreferrer">GitHub ↗</a>
              <a href="https://foundry.linearsolve.com/" target="_blank" rel="noreferrer">Foundry ↗</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);
  const completeIntro = useCallback(() => setIntroComplete(true), []);

  return (
    <>
      <SiteContent />
      {!introComplete && <BinaryIntro onComplete={completeIntro} />}
    </>
  );
}
