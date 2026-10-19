"use client";

import { useEffect, useRef, useState } from "react";
import { responsiveViewports } from "@/data/responsiveViewports";
import { getLayoutMode } from "@/lib/responsive";
import styles from "./ResponsiveReview.module.css";

const groups = ["Móviles", "Tablets", "Computadoras", "Límites de diseño"] as const;
const sections = [
  ["top", "Inicio"], ["event-paths", "Servicio"], ["bar-setups", "Barras"],
  ["drinks", "Cócteles"], ["what-you-bring", "Logística"], ["real-work", "Eventos"],
  ["where-and-when", "Cobertura"], ["booking", "Reserva"],
] as const;
const journeyPhases = [["side", "Al costado"], ["horizontal", "Horizontal"], ["turning", "Giro"], ["inverted", "Tapa abajo"], ["pouring", "Vertido"]] as const;

export function ResponsiveReview() {
  const [width, setWidth] = useState(1440);
  const [height, setHeight] = useState(900);
  const [preset, setPreset] = useState("desktop");
  const [fit, setFit] = useState(true);
  const [available, setAvailable] = useState(1440);
  const [route, setRoute] = useState("/");
  const [canvasWidth, setCanvasWidth] = useState(1440);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const canvasObserver = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => setAvailable(Math.max(280, entry.contentRect.width - 32)));
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => canvasObserver.current?.disconnect(), []);

  function observeCanvas() {
    canvasObserver.current?.disconnect();
    const frame = frameRef.current;
    const canvas = frame?.contentDocument?.querySelector<HTMLElement>(route === "/demo" ? ".page-device" : ".live-site");
    if (!canvas || !frame?.contentWindow) return;
    const style = frame.contentWindow.getComputedStyle(canvas);
    setCanvasWidth(canvas.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
    canvasObserver.current = new ResizeObserver(([entry]) => setCanvasWidth(Math.round(entry.contentRect.width * 100) / 100));
    canvasObserver.current.observe(canvas);
  }

  const scale = fit ? Math.min(1, available / width) : 1;
  const mode = route === "/demo" ? "Móvil enmarcado" : getLayoutMode(canvasWidth);

  function choosePreset(id: string) {
    const selected = responsiveViewports.find((item) => item.id === id);
    if (!selected) return;
    setPreset(id);
    setWidth(selected.width);
    setHeight(selected.height);
  }

  function changeSize(value: string, axis: "width" | "height") {
    const number = Number(value);
    if (!Number.isFinite(number)) return;
    setPreset("");
    if (axis === "width") setWidth(Math.max(320, Math.min(2560, number)));
    else setHeight(Math.max(320, Math.min(2560, number)));
  }

  function showJourneyPhase(phase: string) {
    const frame = frameRef.current;
    const raw = frame?.contentDocument?.querySelector<HTMLElement>(".cocktail-journey")?.dataset.journeyStops;
    if (!raw || !frame?.contentWindow) return;
    try {
      const top = JSON.parse(raw)[phase];
      if (typeof top === "number" && Number.isFinite(top)) frame.contentWindow.scrollTo({ top, behavior: "smooth" });
    } catch { /* The scene may be remeasuring while the viewport changes. */ }
  }

  return (
    <main id="main" className={styles.review}>
      <header className={styles.header}>
        <div><p>PEPOSHOTS · COPIA LOCAL</p><h1>Revisión de pantallas</h1></div>
        <a href="/" target="_blank" rel="noreferrer">Abrir web en otra pestaña ↗</a>
      </header>
      <div className={styles.controls}>
        <label className={styles.preset}>Tamaño de referencia
          <select value={preset} onChange={(event) => choosePreset(event.target.value)}>
            <option value="" disabled>Personalizado</option>
            {groups.map((group) => <optgroup label={group} key={group}>
              {responsiveViewports.filter((item) => item.group === group).map((item) => <option value={item.id} key={item.id}>{item.label} · {item.width} × {item.height}</option>)}
            </optgroup>)}
          </select>
        </label>
        <label>Ancho<input type="number" min={320} max={2560} value={width} onChange={(event) => changeSize(event.target.value, "width")} /></label>
        <label>Alto<input type="number" min={320} max={2560} value={height} onChange={(event) => changeSize(event.target.value, "height")} /></label>
        <button type="button" onClick={() => { setWidth(height); setHeight(width); setPreset(""); }}>Girar ↻</button>
        <label>Versión<select value={route} onChange={(event) => setRoute(event.target.value)}><option value="/">Web adaptable</option><option value="/demo">Demo móvil original</option></select></label>
        <button type="button" aria-pressed={fit} onClick={() => setFit((value) => !value)}>{fit ? "Ajustada a la ventana" : "Tamaño real · 100 %"}</button>
      </div>
      <div className={styles.widthControl}>
        <span className={styles.mode}>{mode} · contenido {canvasWidth} px · ventana {width} × {height}</span>
        <label htmlFor="review-width">Cambiar ancho</label>
        <input id="review-width" type="range" min={320} max={2560} step={1} value={width} onChange={(event) => changeSize(event.target.value, "width")} />
        <span>Vista al {Math.round(scale * 100)} %</span>
      </div>
      <nav className={styles.sections} aria-label="Ir a una sección de la vista previa">
        {sections.map(([id, label]) => <button type="button" key={id} onClick={() => frameRef.current?.contentDocument?.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}>{label}</button>)}
      </nav>
      {route === "/" && mode !== "Móvil" ? <nav className={styles.phases} aria-label="Fases de la coctelera con scroll"><span>Coctelera</span>{journeyPhases.map(([phase, label]) => <button key={phase} type="button" onClick={() => showJourneyPhase(phase)}>{label}</button>)}</nav> : null}
      <p className={styles.note}>El tamaño cambia sin recargar ni borrar tu selección. La escala solo reduce la presentación. El modo depende del ancho útil del contenido: una barra de desplazamiento puede restar algunos píxeles. Esta vista no emula Safari, Android ni su teclado.</p>
      <div className={styles.stage} ref={stageRef}>
        <div className={styles.frame} style={{ width: width * scale, height: height * scale }}>
          <iframe ref={frameRef} onLoad={observeCanvas} title={`PepoShots · revisión ${mode}`} src={route} style={{ width, height, transform: `scale(${scale})` }} />
        </div>
      </div>
    </main>
  );
}
