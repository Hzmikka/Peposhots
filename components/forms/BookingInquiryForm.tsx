"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { usePepoExperience, type PepoPreferences } from "@/components/peposhots/PepoExperienceContext";
import { BookingConfirmation, type SubmittedEventSummary } from "@/components/booking/BookingConfirmation";
import { barSetups } from "@/data/barSetups";
import { drinks } from "@/data/drinks";
import { eventPaths } from "@/data/eventPaths";

type Status = "idle" | "submitting" | "success" | "error";
type FieldErrors = Record<string, string>;
type BookingFields = {
  name: string; phone: string; email: string; eventDate: string; eventType: string;
  guestRange: string; location: string; serviceNeeded: string; venueHasBar: string;
  schedule: string; setting: string; message: string;
};

const emptyFields: BookingFields = {
  name: "", phone: "", email: "", eventDate: "", eventType: "", guestRange: "",
  location: "", serviceNeeded: "", venueHasBar: "", schedule: "", setting: "", message: ""
};

function localDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function preferenceValues(preferences: PepoPreferences): Partial<BookingFields> {
  const event = eventPaths.find((item) => item.id === preferences.eventPath);
  const selectedBar = barSetups.find((item) => item.id === preferences.preferredBarSetup);
  return {
    eventType: event?.label ?? "",
    location: preferences.location ?? "",
    serviceNeeded: selectedBar ? "Bartender" : "",
    venueHasBar: selectedBar?.id === "venue" ? "Sí" : selectedBar ? "No" : "",
    message: ""
  };
}

export function BookingInquiryForm() {
  const { preferences, setFavoriteDrinks } = usePepoExperience();
  const [fields, setFields] = useState<BookingFields>(() => ({ ...emptyFields, ...preferenceValues(preferences) }));
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3>(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState<SubmittedEventSummary | null>(null);
  const dirtyFields = useRef(new Set<keyof BookingFields>());
  const confirmationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefill = preferenceValues(preferences);
    setFields((current) => {
      const next = { ...current };
      (Object.keys(prefill) as Array<keyof BookingFields>).forEach((key) => {
        if (!dirtyFields.current.has(key)) next[key] = prefill[key] ?? "";
      });
      return next;
    });
  }, [preferences]);

  const minDate = useMemo(() => localDateInput(new Date()), []);

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const key = event.target.name as keyof BookingFields;
    dirtyFields.current.add(key);
    setFields((current) => ({ ...current, [key]: event.target.value }));
  }

  function validateStep(step: number) {
    const nextErrors: FieldErrors = {};
    if (step === 0) {
      if (!fields.eventDate) nextErrors.eventDate = "Selecciona una fecha.";
      else if (fields.eventDate < minDate) nextErrors.eventDate = "Selecciona una fecha de hoy en adelante.";
      if (!fields.eventType) nextErrors.eventType = "Selecciona el tipo de evento.";
      if (!fields.guestRange) nextErrors.guestRange = "Selecciona un rango.";
      if (fields.location.trim().length < 2) nextErrors.location = "Escribe ciudad o ZIP.";
    }
    if (step === 1) {
      if (!fields.serviceNeeded) nextErrors.serviceNeeded = "Selecciona el servicio.";
      if (!fields.venueHasBar) nextErrors.venueHasBar = "Selecciona una opción.";
    }
    if (step === 2) {
      if (fields.name.trim().length < 2) nextErrors.name = "Escribe tu nombre.";
      if (fields.phone.replace(/\D/g, "").length < 7) nextErrors.phone = "Usa un teléfono válido.";
      if (!/^\S+@\S+\.\S+$/.test(fields.email)) nextErrors.email = "Usa un email válido.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goToStep(step: 0 | 1 | 2 | 3) {
    setDirection(step < currentStep ? "back" : "forward");
    setCurrentStep(step);
    setErrors({});
    setStatus("idle");
    setMessage("");
  }

  function nextStep() {
    if (currentStep < 3 && !validateStep(currentStep)) return;
    goToStep((currentStep + 1) as 1 | 2 | 3);
  }

  const favoriteDrinks = (preferences.favoriteDrinks ?? [])
    .map((id) => drinks.find((drink) => drink.id === id))
    .filter((drink): drink is (typeof drinks)[number] => Boolean(drink));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    for (const step of [0, 1, 2] as const) {
      if (!validateStep(step)) {
        setDirection("back");
        setCurrentStep(step);
        setStatus("idle");
        setMessage("");
        return;
      }
    }
    const formData = new FormData(event.currentTarget);
    const payload = {
      ...fields,
      favoriteDrinks: favoriteDrinks.map((drink) => drink.name),
      company: String(formData.get("company") || ""),
      context: preferences
    };
    setStatus("submitting"); setErrors({}); setMessage("");

    try {
      const response = await fetch("/api/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) { setErrors(result.errors || {}); throw new Error(result.message || "No pudimos enviar tu solicitud."); }
      setSummary({ eventType: payload.eventType, eventDate: payload.eventDate, guestRange: payload.guestRange, location: payload.location, serviceNeeded: payload.serviceNeeded });
      setStatus("success");
      window.setTimeout(() => confirmationRef.current?.focus(), 40);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No pudimos enviar tu solicitud.");
    }
  }

  if (status === "success" && summary) return <div className="booking-card-scroll" ref={confirmationRef} tabIndex={-1}><BookingConfirmation summary={summary} /></div>;
  const fieldError = (name: string) => errors[name] ? <span className="field-error">{errors[name]}</span> : null;

  return (
    <form className="booking-form" onSubmit={submit} noValidate>
      <div className="booking-form-topline">
        <div className="booking-form-heading"><span>CHECK YOUR DATE</span><strong>{currentStep === 0 ? "Cuéntanos sobre tu evento" : currentStep === 1 ? "Tu servicio" : currentStep === 2 ? "Tus datos" : "Revisar"}</strong></div>
        <span className="booking-progress">0{currentStep + 1} / 04</span>
      </div>
      <div key={currentStep} className={`booking-step is-${direction}`}>
        {currentStep === 0 ? (
          <section className="booking-form-section" aria-labelledby="booking-event-title">
            <h3 id="booking-event-title">TU EVENTO</h3>
            <div className="booking-form-grid">
              <label>Fecha del evento<input name="eventDate" value={fields.eventDate} onChange={updateField} type="date" min={minDate} required aria-invalid={Boolean(errors.eventDate)} />{fieldError("eventDate")}</label>
              <label>Tipo de evento<select name="eventType" value={fields.eventType} onChange={updateField} required><option value="" disabled>Selecciona</option><option>BODA / FORMAL</option><option>GRADUACIÓN</option><option>CUMPLEAÑOS / PRIVADO</option><option>CORPORATIVO</option><option>Otro</option></select>{fieldError("eventType")}</label>
              <label>Invitados aproximados<select name="guestRange" value={fields.guestRange} onChange={updateField} required><option value="" disabled>Selecciona</option><option>Menos de 50</option><option>50–100</option><option>101–200</option><option>200+</option><option>Aún no sé</option></select>{fieldError("guestRange")}</label>
              <label>Ciudad o ZIP<input name="location" value={fields.location} onChange={updateField} required placeholder="Miami Beach, 33139…" aria-invalid={Boolean(errors.location)} />{fieldError("location")}</label>
            </div>
            <div className="booking-actions is-single"><button type="button" className="booking-next" onClick={nextStep}>Siguiente →</button></div>
          </section>
        ) : currentStep === 1 ? (
          <section className="booking-form-section" aria-labelledby="booking-service-title">
            <h3 id="booking-service-title">TU SERVICIO</h3>
            <div className="booking-form-grid">
              <label>Servicio<select name="serviceNeeded" value={fields.serviceNeeded} onChange={updateField} required><option value="" disabled>Selecciona</option><option>Bartender</option><option>Mesero</option><option>Bartender + mesero</option><option>Aún no sé</option></select>{fieldError("serviceNeeded")}</label>
              <label>¿El venue ya tiene barra?<select name="venueHasBar" value={fields.venueHasBar} onChange={updateField} required><option value="" disabled>Selecciona</option><option>Sí</option><option>No</option><option>No estoy seguro</option></select>{fieldError("venueHasBar")}</label>
              <label>Horario aproximado<input name="schedule" value={fields.schedule} onChange={updateField} placeholder="6:00 PM – 11:00 PM" /></label>
              <label>Interior / exterior<select name="setting" value={fields.setting} onChange={updateField}><option value="">Selecciona</option><option>Interior</option><option>Exterior</option><option>Ambos</option><option>No estoy seguro</option></select></label>
            </div>
            {favoriteDrinks.length ? <div className="booking-drinks"><h4>TUS TRAGOS</h4><div className="booking-tags">{favoriteDrinks.slice(0, 3).map((drink) => <button key={drink.id} type="button" onClick={() => setFavoriteDrinks((items) => items.filter((id) => id !== drink.id))} aria-label={`Quitar ${drink.name}`}>{drink.name} ×</button>)}{favoriteDrinks.length > 3 ? <span>+{favoriteDrinks.length - 3} más</span> : null}</div></div> : null}
            <div className="booking-actions"><button type="button" className="booking-back" onClick={() => goToStep(0)}>← Atrás</button><button type="button" className="booking-next" onClick={nextStep}>Siguiente →</button></div>
          </section>
        ) : currentStep === 2 ? (
          <section className="booking-form-section" aria-labelledby="booking-personal-title">
            <h3 id="booking-personal-title">TUS DATOS</h3>
            <div className="booking-form-grid">
              <label>Tu nombre<input name="name" value={fields.name} onChange={updateField} autoComplete="name" required aria-invalid={Boolean(errors.name)} />{fieldError("name")}</label>
              <label>Teléfono<input name="phone" value={fields.phone} onChange={updateField} type="tel" autoComplete="tel" required aria-invalid={Boolean(errors.phone)} />{fieldError("phone")}</label>
              <label>Email<input name="email" value={fields.email} onChange={updateField} type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} />{fieldError("email")}</label>
              <label>Comentarios / detalles<textarea name="message" value={fields.message} onChange={updateField} rows={2} maxLength={1200} placeholder="Algo más que debamos saber…" /></label>
            </div>
            <div className="booking-actions"><button type="button" className="booking-back" onClick={() => goToStep(1)}>← Atrás</button><button type="button" className="booking-next" onClick={nextStep}>Revisar</button></div>
          </section>
        ) : (
          <section className="booking-review" aria-label="Revisar solicitud">
            <ReviewGroup title="TU EVENTO" step={0} onEdit={goToStep} items={[["Fecha", fields.eventDate], ["Tipo", fields.eventType], ["Invitados", fields.guestRange], ["Zona", fields.location]]} />
            <ReviewGroup title="TU SERVICIO" step={1} onEdit={goToStep} items={[["Servicio", fields.serviceNeeded], ["Barra", fields.venueHasBar], ["Horario", fields.schedule || "—"], ["Espacio", fields.setting || "—"], ["Tragos", favoriteDrinks.map((drink) => drink.name).join(", ") || "—"]]} />
            <ReviewGroup title="TUS DATOS" step={2} onEdit={goToStep} items={[["Nombre", fields.name], ["Teléfono", fields.phone], ["Email", fields.email]]} />
            <p className="booking-privacy-note">Al enviar, PepoShots usará estos datos para responder a tu solicitud. <a href="/privacy" target="_blank" rel="noreferrer">Privacidad</a>.</p>
            <div className="booking-actions"><button type="button" className="booking-back" onClick={() => goToStep(2)}>← Atrás</button><button className="booking-next" type="submit" disabled={status === "submitting"}>{status === "submitting" ? "Enviando…" : "Consultar fecha"}</button></div>
          </section>
        )}
      </div>
      <input className="hp-field" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {status === "error" ? <p className="form-error" role="alert">{message} <a href="tel:+17866067684">Llama al 786 606-7684.</a></p> : null}
    </form>
  );
}

function ReviewGroup({ title, step, items, onEdit }: { title: string; step: 0 | 1 | 2; items: string[][]; onEdit: (step: 0 | 1 | 2 | 3) => void }) {
  return <section className="booking-review-group"><header><h3>{title}</h3><button type="button" onClick={() => onEdit(step)}>Editar</button></header><dl>{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
}
