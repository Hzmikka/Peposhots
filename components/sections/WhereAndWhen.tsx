"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent, type PointerEvent } from "react";
import { Container } from "@/components/ui/Container";
import { usePepoExperience } from "@/components/peposhots/PepoExperienceContext";
import { serviceAreas, type ServiceAreaId } from "@/data/serviceAreas";

export function WhereAndWhen() {
  const { setLocation } = usePepoExperience();
  const [activeLocation, setActiveLocation] = useState<ServiceAreaId | null>(null);
  const [markedLocation, setMarkedLocation] = useState<ServiceAreaId | null>(null);
  const [editingZone, setEditingZone] = useState(false);
  const [zoneDraft, setZoneDraft] = useState("");
  const [customZone, setCustomZone] = useState("");
  const zoneListRef = useRef<HTMLDivElement>(null);
  const zoneChipRefs = useRef<Partial<Record<ServiceAreaId, HTMLButtonElement | null>>>({});
  const zoneDragRef = useRef<{ pointerId: number; startX: number; scrollLeft: number; moved: boolean } | null>(null);
  const suppressZoneClick = useRef(false);

  function selectLocation(id: ServiceAreaId, label: string, centerChip = false) {
    setActiveLocation(null);
    setMarkedLocation(id);
    setCustomZone("");
    setZoneDraft("");
    setEditingZone(false);
    setLocation(label);
    if (!centerChip) return;

    window.requestAnimationFrame(() => {
      const list = zoneListRef.current;
      const chip = zoneChipRefs.current[id];
      if (!list || !chip) return;
      const target = chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2;
      list.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    });
  }

  function startZoneDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const list = zoneListRef.current;
    if (!list) return;
    zoneDragRef.current = { pointerId: event.pointerId, startX: event.clientX, scrollLeft: list.scrollLeft, moved: false };
  }

  function moveZoneDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = zoneDragRef.current;
    const list = zoneListRef.current;
    if (!drag || !list || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 4 && !drag.moved) {
      drag.moved = true;
      list.setPointerCapture(event.pointerId);
    }
    if (drag.moved) list.scrollLeft = drag.scrollLeft - distance;
  }

  function endZoneDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = zoneDragRef.current;
    const list = zoneListRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    suppressZoneClick.current = drag.moved;
    if (list?.hasPointerCapture(event.pointerId)) list.releasePointerCapture(event.pointerId);
    zoneDragRef.current = null;
    window.setTimeout(() => { suppressZoneClick.current = false; }, 0);
  }

  function saveZone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const zone = zoneDraft.trim();
    if (!zone) return;
    setCustomZone(zone);
    setMarkedLocation(null);
    setActiveLocation(null);
    setLocation(zone);
    setEditingZone(false);
  }

  const highlightedLocation = activeLocation ?? markedLocation;
  const selectedArea = markedLocation ? serviceAreas.find((area) => area.id === markedLocation) ?? null : null;
  const displayArea = selectedArea ?? serviceAreas[0];

  return (
    <section className="section section-where" id="where-and-when">
      <Container className="where-grid">
        <div>
          <p className="kicker">WHERE &amp; WHEN</p>
          <h2>Miami, con tiempo para organizarlo bien.</h2>
          <p className="lead">PepoShots trabaja en distintas zonas de Miami. Estas son algunas de nuestras áreas más frecuentes; si tu zona no aparece, escríbela para consultar cobertura.</p>

          <div className="miami-map" aria-label="Mapa de zonas de servicio en Miami">
            <Image
              src="/images/peposhots/mapa/mapa.webp"
              alt="Mapa de Miami con siete puntos de servicio"
              fill
              sizes="(max-width: 400px) calc(100vw - 40px), 360px"
            />
            {serviceAreas.map((location) => (
              <button
                id={location.id}
                key={location.id}
                type="button"
                aria-label={location.label}
                aria-pressed={markedLocation === location.id}
                className={[
                  "miami-map-point",
                  activeLocation === location.id ? "is-active" : "",
                  markedLocation === location.id ? "is-selected" : "",
                ].filter(Boolean).join(" ")}
                style={{ left: `${location.x}%`, top: `${location.y}%` }}
                onPointerEnter={(event) => { if (event.pointerType === "mouse") setActiveLocation(location.id); }}
                onPointerLeave={(event) => { if (event.pointerType === "mouse") setActiveLocation((current) => current === location.id ? null : current); }}
                onFocus={() => setActiveLocation(location.id)}
                onBlur={() => setActiveLocation((current) => current === location.id ? null : current)}
                onClick={() => selectLocation(location.id, location.label, true)}
              >
                <span className="miami-map-halo" aria-hidden="true" />
                <span className="miami-map-label">{location.label}</span>
              </button>
            ))}
          </div>

          <div
            ref={zoneListRef}
            className="zone-list"
            aria-label="Zonas de servicio"
            onPointerDown={startZoneDrag}
            onPointerMove={moveZoneDrag}
            onPointerUp={endZoneDrag}
            onPointerCancel={endZoneDrag}
            onClickCapture={(event) => {
              if (!suppressZoneClick.current) return;
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            {serviceAreas.map((location) => (
              <button
                className={`zone-chip${highlightedLocation === location.id ? " is-active" : ""}`}
                key={location.id}
                ref={(element) => { zoneChipRefs.current[location.id] = element; }}
                type="button"
                aria-pressed={markedLocation === location.id}
                onClick={() => selectLocation(location.id, location.label, true)}
              >
                {location.label}
              </button>
            ))}

            {customZone ? (
              <button
                className="zone-chip zone-custom-value is-active"
                type="button"
                onClick={() => { setCustomZone(""); setZoneDraft(""); setLocation(undefined); }}
                aria-label={`Quitar ${customZone}`}
              >
                {customZone} ×
              </button>
            ) : editingZone ? (
              <form
                className="zone-custom-editor"
                onSubmit={saveZone}
                onPointerDown={(event) => event.stopPropagation()}
                onPointerMove={(event) => event.stopPropagation()}
                onPointerUp={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                <input
                  autoFocus
                  value={zoneDraft}
                  onChange={(event) => setZoneDraft(event.target.value)}
                  placeholder="Escribe tu zona…"
                  aria-label="Escribe tu zona"
                  inputMode="text"
                  enterKeyHint="done"
                  autoComplete="address-level2"
                  maxLength={80}
                />
                <button type="submit" aria-label="Guardar zona">✓</button>
              </form>
            ) : (
              <button className="zone-chip zone-custom-trigger" type="button" onClick={() => setEditingZone(true)}>+ Otra zona</button>
            )}
          </div>

          <section className="signature-area" aria-live="polite">
            <div className="signature-area-copy">
              <p className="signature-eyebrow">{selectedArea ? `SIGNATURE BY AREA · ${selectedArea.label}` : "SIGNATURE BY AREA"}</p>
              <h3>{selectedArea ? selectedArea.signature.name : "ELIGE TU ZONA. DESCUBRE SU TRAGO."}</h3>
              <small>{selectedArea ? "Tu zona activa una propuesta distinta, inspirada en el lugar de tu evento." : "Cada punto activa un cóctel signature inspirado en esa parte de Miami."}</small>
            </div>
            <div className={`signature-cocktail-art is-${displayArea.id}`} key={displayArea.id}>
              <Image
                src={displayArea.signature.image}
                alt={selectedArea ? `Cóctel ${displayArea.signature.name}, inspirado en ${displayArea.label}` : `Ejemplo de cóctel signature: ${displayArea.signature.name}`}
                fill
                sizes="(max-width: 400px) 44vw, 176px"
              />
            </div>
          </section>

          <div className="timing-card">
            <span>PLAN AHEAD</span>
            <strong>Reserva recomendada con al menos 2 semanas de anticipación.</strong>
            <p>Eso no garantiza disponibilidad: la fecha se confirma después de revisar tu solicitud.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
