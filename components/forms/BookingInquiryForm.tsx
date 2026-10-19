"use client";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { usePepoExperience, type PepoPreferences } from "@/components/peposhots/PepoExperienceContext";
import { BookingConfirmation, type SubmittedEventSummary } from "@/components/booking/BookingConfirmation";
import { barSetups } from "@/data/barSetups";
import { drinks } from "@/data/drinks";
import { FavoriteDrinksDialog } from "@/components/peposhots/FavoriteDrinksDialog";
import { eventPaths } from "@/data/eventPaths";
import { localDateKey, validateBookingInquiry } from "@/lib/bookingValidation";
import { BOOKING_DRAFT_KEY, bookingFieldLimits, readBookingDraft, stepForErrors, bartenderReferenceApplies, formatEventDate, type BookingFields } from "@/lib/bookingSupport";
import { getScrollContainer, getScrollScale, getScrollTop, getStickyHeaderHeight, getVisibleBounds, setScrollTop } from "@/lib/scrolling";
type Status = "idle" | "submitting" | "success" | "error";
type FieldErrors = Record<string, string>;
const emptyFields: BookingFields = {
    name: "", phone: "", email: "", eventDate: "", eventType: "", guestRange: "",
    location: "", serviceNeeded: "", venueHasBar: "", schedule: "", setting: "", message: ""
};
function preferenceValues(preferences: PepoPreferences): Partial<BookingFields> {
    const event = eventPaths.find((item) => item.id === preferences.eventPath);
    const selectedBar = barSetups.find((item) => item.id === preferences.preferredBarSetup);
    return {
        guestRange: event?.label ?? "",
        location: preferences.location ?? "",
        serviceNeeded: selectedBar ? "Bartender" : "",
        venueHasBar: selectedBar?.id === "venue" ? "Sí" : "",
        message: ""
    };
}
export function BookingInquiryForm({ onDetailsChange }: { onDetailsChange?: (fields: BookingFields) => void } = {}) {
    const { t, language } = useI18n();
    const { preferences, setFavoriteDrinks, setEventPath, setLocation, setPreferredBarSetup } = usePepoExperience();
    const [fields, setFields] = useState<BookingFields>(() => ({ ...emptyFields, ...preferenceValues(preferences) }));
    const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3>(0);
    const [direction, setDirection] = useState<"forward" | "back">("forward");
    const [status, setStatus] = useState<Status>("idle");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [message, setMessage] = useState("");
    const [summary, setSummary] = useState<SubmittedEventSummary | null>(null);
    const dirtyFields = useRef(new Set<keyof BookingFields>());
    const confirmationRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const favoritesDialog = useRef<HTMLDialogElement>(null);
    const previousStep = useRef(currentStep);
    const completed = status === "success";
    useEffect(() => { onDetailsChange?.(fields); }, [fields, onDetailsChange]);
    const [draftReady, setDraftReady] = useState(false);
    const draftSubmitted = useRef(false);
    const submissionInFlight = useRef(false);
    const previousPreferences = useRef(preferences);
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(BOOKING_DRAFT_KEY);
            const draft = saved ? readBookingDraft(JSON.parse(saved)) : null;
            if (draft) {
                setFields((current) => ({ ...current, ...draft.fields }));
                dirtyFields.current = new Set(draft.dirty);
                setCurrentStep(draft.step);
            } else sessionStorage.removeItem(BOOKING_DRAFT_KEY);
        } catch { /* A blocked or damaged draft does not block the form. */ }
        setDraftReady(true);
    }, []);
    useEffect(() => {
        if (!draftReady || completed) return;
        const save = () => {
            if (draftSubmitted.current) return;
            try {
                sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify({ version: 1, savedAt: Date.now(), fields, step: currentStep, dirty: [...dirtyFields.current] }));
            } catch { /* The form remains usable without storage. */ }
        };
        const timer = window.setTimeout(save, 250);
        window.addEventListener("pagehide", save);
        return () => { window.clearTimeout(timer); window.removeEventListener("pagehide", save); };
    }, [fields, currentStep, draftReady, completed]);
    useEffect(() => {
        const form = formRef.current;
        const card = form?.closest<HTMLElement>(".tray-service-card");
        const shell = form?.closest<HTMLElement>(".page-shell");
        if (!form || !card || !shell)
            return;
        const root = getScrollContainer(form);
        let frame = 0;
        const update = () => {
            frame = 0;
            const field = document.activeElement;
            const editing = field instanceof HTMLElement && form.contains(field) && field.matches("input, select, textarea");
            shell.dataset.bookingEditing = String(editing);
            card.classList.toggle("is-editing", editing);
            const bounds = getVisibleBounds(root);
            const visibleTop = bounds.top + getStickyHeaderHeight(form);
            const scale = getScrollScale(root);
            card.style.setProperty("--booking-visible-height", `${Math.max(180, (bounds.bottom - bounds.top - 24) / scale)}px`);
            if (!editing || !(field instanceof HTMLElement))
                return;
            const rect = field.getBoundingClientRect();
            const formRect = form.getBoundingClientRect();
            const priceHeight = form.querySelector(".booking-selection-note")?.getBoundingClientRect().height ?? 0;
            const innerTop = Math.max(visibleTop, formRect.top) + priceHeight + 12;
            const innerBottom = Math.min(bounds.bottom, formRect.bottom) - 12;
            if (rect.bottom > innerBottom)
                form.scrollTop += (rect.bottom - innerBottom) / scale;
            else if (rect.top < innerTop)
                form.scrollTop -= (innerTop - rect.top) / scale;
            const visible = field.getBoundingClientRect();
            if (visible.bottom > bounds.bottom - 12)
                setScrollTop(root, getScrollTop(root) + (visible.bottom - bounds.bottom + 12) / scale);
            else if (visible.top < visibleTop + 12)
                setScrollTop(root, getScrollTop(root) + (visible.top - visibleTop - 12) / scale);
        };
        const schedule = () => { if (!frame)
            frame = window.requestAnimationFrame(update); };
        form.addEventListener("focusin", schedule);
        form.addEventListener("focusout", schedule);
        window.addEventListener("resize", schedule);
        window.visualViewport?.addEventListener("resize", schedule);
        window.visualViewport?.addEventListener("scroll", schedule);
        return () => {
            window.cancelAnimationFrame(frame);
            form.removeEventListener("focusin", schedule);
            form.removeEventListener("focusout", schedule);
            window.removeEventListener("resize", schedule);
            window.visualViewport?.removeEventListener("resize", schedule);
            window.visualViewport?.removeEventListener("scroll", schedule);
            delete shell.dataset.bookingEditing;
        };
    }, [completed]);
    useEffect(() => {
        if (previousStep.current === currentStep)
            return;
        previousStep.current = currentStep;
        const form = formRef.current;
        form?.scrollTo({ top: 0, behavior: "instant" });
        form?.querySelector<HTMLElement>(".booking-form-heading strong")?.focus({ preventScroll: true });
        if (form) {
            const root = getScrollContainer(form);
            const bounds = getVisibleBounds(root);
            const visibleTop = bounds.top + getStickyHeaderHeight(form);
            const top = form.getBoundingClientRect().top;
            if (top < visibleTop + 12 || top > bounds.bottom - 100) {
                setScrollTop(root, getScrollTop(root) + (top - visibleTop - 12) / getScrollScale(root));
            }
        }
    }, [currentStep]);
    useEffect(() => {
        const firstError = Object.keys(errors)[0];
        const field = firstError ? formRef.current?.elements.namedItem(firstError) : null;
        if (field instanceof HTMLElement)
            field.focus();
    }, [errors]);
    useEffect(() => {
        const prefill = preferenceValues(preferences);
        const guestChanged = previousPreferences.current.eventPath !== preferences.eventPath && Boolean(prefill.guestRange);
        const locationChanged = previousPreferences.current.location !== preferences.location;
        setFields((current) => {
            const next = { ...current };
            (Object.keys(prefill) as Array<keyof BookingFields>).forEach((key) => {
                const explicitGuestChange = key === "guestRange" && guestChanged;
                const explicitLocationChange = key === "location" && locationChanged;
                if (!dirtyFields.current.has(key) || explicitGuestChange || explicitLocationChange)
                    next[key] = prefill[key] ?? "";
            });
            return next;
        });
        previousPreferences.current = preferences;
    }, [preferences]);
    const minDate = useMemo(() => localDateKey(new Date()), []);
    function updateField(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const key = event.target.name as keyof BookingFields;
        dirtyFields.current.add(key);
        const value = event.target.value;
        setFields((current) => ({ ...current, [key]: value }));
        if (key === "guestRange") setEventPath(eventPaths.find((path) => path.label === value)?.id);
        if (key === "location") setLocation(value);
    }
    function validateStep(step: number) {
        const result = validateBookingInquiry(fields);
        const all = result.ok ? {} : result.errors;
        const nextErrors = Object.fromEntries(Object.entries(all).filter(([name, error]) => stepForErrors({ [name]: error }) === step));
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }
    function goToStep(step: 0 | 1 | 2 | 3) {
        if (submissionInFlight.current) return;
        setDirection(step < currentStep ? "back" : "forward");
        setCurrentStep(step);
        setErrors({});
        setStatus("idle");
        setMessage("");
    }
    function nextStep() {
        if (currentStep < 3 && !validateStep(currentStep))
            return;
        goToStep((currentStep + 1) as 1 | 2 | 3);
    }
    const favoriteDrinks = (preferences.favoriteDrinks ?? [])
        .map((id) => drinks.find((drink) => drink.id === id))
        .filter((drink): drink is (typeof drinks)[number] => Boolean(drink));
    const selectedEvent = eventPaths.find((event) => event.label === fields.guestRange);
    const selectedBar = barSetups.find((bar) => bar.id === preferences.preferredBarSetup);
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submissionInFlight.current || draftSubmitted.current || completed) return;
        if (currentStep < 3) {
            nextStep();
            return;
        }
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
        const checked = validateBookingInquiry(fields);
        if (!checked.ok) return;
        const payload = {
            ...checked.data,
            favoriteDrinks: favoriteDrinks.map((drink) => drink.name),
            company: String(formData.get("company") || ""),
            context: { ...preferences, language }
        };
        submissionInFlight.current = true;
        setStatus("submitting");
        setErrors({});
        setMessage("");
        try {
            const response = await fetch("/api/booking", { method: "POST", headers: { "Content-Type": "application/json", "Accept-Language": language }, body: JSON.stringify(payload) });
            const result = await response.json().catch(() => null);
            if (!response.ok || result?.ok !== true) {
                const fieldErrors = result?.errors && typeof result.errors === "object" ? result.errors : {};
                setErrors(fieldErrors);
                if (Object.keys(fieldErrors).length) {
                    setDirection("back");
                    setCurrentStep(stepForErrors(fieldErrors));
                }
                throw new Error(result?.message || t("No pudimos enviar tu solicitud. Inténtalo de nuevo o contáctanos."));
            }
            setSummary({ eventType: payload.eventType, eventDate: payload.eventDate, guestRange: payload.guestRange, location: payload.location, serviceNeeded: payload.serviceNeeded });
            draftSubmitted.current = true;
            try { sessionStorage.removeItem(BOOKING_DRAFT_KEY); } catch { /* Optional storage. */ }
            setStatus("success");
            window.setTimeout(() => confirmationRef.current?.focus(), 40);
        }
        catch (error) {
            setStatus("error");
            setMessage(error instanceof TypeError ? t("No pudimos conectar. Tus datos siguen aquí; vuelve a intentarlo.") : error instanceof Error ? error.message : t("No pudimos enviar tu solicitud. Inténtalo de nuevo o contáctanos."));
        }
        finally {
            submissionInFlight.current = false;
        }
    }
    if (status === "success" && summary)
        return <div className="booking-card-scroll" ref={confirmationRef} tabIndex={-1}><BookingConfirmation summary={summary}/></div>;
    const fieldError = (name: string) => errors[name] ? <span id={`booking-error-${name}`} className="field-error">{t(errors[name])}</span> : null;
    const fieldAccessibility = (name: string) => ({ id: `booking-field-${name}`, "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `booking-error-${name}` : undefined });
    return (<form ref={formRef} className="booking-form" onSubmit={submit} aria-busy={status === "submitting"} noValidate>
      <div className="booking-form-topline">
        <div className="booking-form-heading"><span>{t("CONSULTA TU FECHA")}</span><strong tabIndex={-1}>{t(currentStep === 0 ? "Cuéntanos sobre tu evento" : currentStep === 1 ? "Tu servicio" : currentStep === 2 ? "Tus datos" : "Revisar")}</strong></div>
        <span className="booking-progress">{t("0")}{currentStep + 1}{t(" / 04")}</span>
      </div>
      {selectedEvent ? (<p className="booking-selection-note" aria-live="polite">
          {t(selectedEvent.label)} · {bartenderReferenceApplies(fields.serviceNeeded)
              ? selectedEvent.price === null ? t("Cotización personalizada") : t("Base de bartenders: ${price} · hasta 4 h", { price: selectedEvent.price.toLocaleString("en-US") })
              : t("Este servicio requiere cotización; la tarifa de bartenders no es el total.")}
        </p>) : null}
      {Object.keys(errors).length ? <p className="booking-error-summary" role="alert">{t("Revisa los campos marcados para continuar.")}</p> : null}
      <div key={currentStep} className={`booking-step is-${direction}`}>
        {currentStep === 0 ? (<section className="booking-form-section" aria-labelledby="booking-event-title">
            <h3 id="booking-event-title">{t("TU EVENTO")}</h3>
            <div className="booking-form-grid">
              <label>{t("Fecha del evento")}<input name="eventDate" {...fieldAccessibility("eventDate")} value={fields.eventDate} onChange={updateField} type="date" min={minDate} required/>{fieldError("eventDate")}</label>
              <label>{t("Tipo de evento")}<select name="eventType" {...fieldAccessibility("eventType")} value={fields.eventType} onChange={updateField} required><option value="" disabled>{t("Selecciona")}</option><option value="BODA / FORMAL">{t("BODA / FORMAL")}</option><option value="GRADUACIÓN">{t("GRADUACI\u00D3N")}</option><option value="CUMPLEAÑOS / PRIVADO">{t("CUMPLEA\u00D1OS / PRIVADO")}</option><option value="CORPORATIVO">{t("CORPORATIVO")}</option><option value="Otro">{t("Otro")}</option></select>{fieldError("eventType")}</label>
              <label>{t("Invitados aproximados")}<select name="guestRange" {...fieldAccessibility("guestRange")} value={fields.guestRange} onChange={updateField} required><option value="" disabled>{t("Selecciona")}</option>{eventPaths.map((path) => <option key={path.id} value={path.label}>{t(path.label)}</option>)}<option value="Aún no sé">{t("A\u00FAn no s\u00E9")}</option></select>{fieldError("guestRange")}</label>
              <label>{t("Ciudad o ZIP")}<input name="location" {...fieldAccessibility("location")} maxLength={bookingFieldLimits.location} value={fields.location} onChange={updateField} required placeholder={t("Miami Beach, 33139\u2026")}/>{fieldError("location")}</label>
            </div>
            <div className="booking-actions is-single"><button type="button" className="booking-next" onClick={nextStep}>{t("Siguiente \u2192")}</button></div>
          </section>) : currentStep === 1 ? (<section className="booking-form-section" aria-labelledby="booking-service-title">
            <h3 id="booking-service-title">{t("TU SERVICIO")}</h3>
            {selectedBar ? (<p className="booking-bar-note">
                <strong>{t(selectedBar.title)}</strong>
                {selectedBar.logisticsNote ? <span>{t(selectedBar.logisticsNote)}</span> : null}
                <a className="booking-inline-action" href="#bar-setups">{t("Cambiar barra")}</a>{" · "}
                <button type="button" className="booking-inline-action" onClick={() => setPreferredBarSetup(undefined)}>{t("Sin preferencia de barra")}</button>
              </p>) : null}
            <div className="booking-form-grid">
              <label>{t("Servicio")}<select name="serviceNeeded" {...fieldAccessibility("serviceNeeded")} value={fields.serviceNeeded} onChange={updateField} required><option value="" disabled>{t("Selecciona")}</option><option value="Bartender">{t("Bartender")}</option><option value="Mesero">{t("Mesero")}</option><option value="Bartender + mesero">{t("Bartender + mesero")}</option><option value="Aún no sé">{t("A\u00FAn no s\u00E9")}</option></select>{fieldError("serviceNeeded")}</label>
              <label>{t("\u00BFEl lugar ya tiene barra?")}<select name="venueHasBar" {...fieldAccessibility("venueHasBar")} value={fields.venueHasBar} onChange={updateField} required><option value="" disabled>{t("Selecciona")}</option><option value="Sí">{t("S\u00ED")}</option><option value="No">{t("No")}</option><option value="No estoy seguro">{t("No estoy seguro")}</option></select>{fieldError("venueHasBar")}</label>
              <label>{t("Horario aproximado")}<input name="schedule" {...fieldAccessibility("schedule")} maxLength={bookingFieldLimits.schedule} value={fields.schedule} onChange={updateField} placeholder={t("6:00 PM \u2013 11:00 PM")}/></label>
              <label>{t("Interior / exterior")}<select name="setting" {...fieldAccessibility("setting")} value={fields.setting} onChange={updateField}><option value="">{t("Selecciona")}</option><option value="Interior">{t("Interior")}</option><option value="Exterior">{t("Exterior")}</option><option value="Ambos">{t("Ambos")}</option><option value="No estoy seguro">{t("No estoy seguro")}</option></select></label>
            </div>
            {favoriteDrinks.length ? <div className="booking-drinks"><h4>{t("TUS TRAGOS")}</h4><div className="booking-tags">{favoriteDrinks.slice(0, 3).map((drink) => <button key={drink.id} type="button" onClick={() => setFavoriteDrinks((items) => items.filter((id) => id !== drink.id))} aria-label={t("Quitar {name}", { name: drink.name })}>{drink.name}{t(" \u00D7")}</button>)}{favoriteDrinks.length > 3 ? <button type="button" aria-haspopup="dialog" aria-label={t("Ver los {count} cócteles seleccionados", { count: favoriteDrinks.length })} onClick={() => favoritesDialog.current?.showModal()}>+{favoriteDrinks.length - 3}</button> : null}</div></div> : null}
            <div className="booking-actions"><button type="button" className="booking-back" onClick={() => goToStep(0)}>{t("\u2190 Atr\u00E1s")}</button><button type="button" className="booking-next" onClick={nextStep}>{t("Siguiente \u2192")}</button></div>
          </section>) : currentStep === 2 ? (<section className="booking-form-section" aria-labelledby="booking-personal-title">
            <h3 id="booking-personal-title">{t("TUS DATOS")}</h3>
            <div className="booking-form-grid">
              <label>{t("Tu nombre")}<input name="name" {...fieldAccessibility("name")} maxLength={bookingFieldLimits.name} value={fields.name} onChange={updateField} autoComplete="name" required/>{fieldError("name")}</label>
              <label>{t("Tel\u00E9fono")}<input name="phone" {...fieldAccessibility("phone")} maxLength={bookingFieldLimits.phone} value={fields.phone} onChange={updateField} type="tel" autoComplete="tel" required/>{fieldError("phone")}</label>
              <label>{t("Email")}<input name="email" {...fieldAccessibility("email")} maxLength={bookingFieldLimits.email} value={fields.email} onChange={updateField} type="email" autoComplete="email" required/>{fieldError("email")}</label>
              <label>{t("Comentarios / detalles")}<textarea name="message" {...fieldAccessibility("message")} value={fields.message} onChange={updateField} rows={2} maxLength={1200} placeholder={t("Algo m\u00E1s que debamos saber\u2026")}/></label>
            </div>
            <div className="booking-actions"><button type="button" className="booking-back" onClick={() => goToStep(1)}>{t("\u2190 Atr\u00E1s")}</button><button type="button" className="booking-next" onClick={nextStep}>{t("Revisar")}</button></div>
          </section>) : (<section className="booking-review" aria-label={t("Revisar solicitud")}>
            <ReviewGroup title={t("TU EVENTO")} step={0} onEdit={goToStep} disabled={status === "submitting"} items={[["Fecha", fields.eventDate], ["Tipo", fields.eventType], ["Invitados", fields.guestRange], ["Zona", fields.location]]}/>
            <ReviewGroup title={t("TU SERVICIO")} step={1} onEdit={goToStep} disabled={status === "submitting"} items={[["Servicio", fields.serviceNeeded], ["Barra del lugar", fields.venueHasBar], ...(selectedBar ? [["Barra elegida", selectedBar.title]] : []), ...(selectedBar?.logisticsNote ? [["Transporte", selectedBar.logisticsNote]] : []), ["Horario", fields.schedule || "—"], ["Espacio", fields.setting || "—"], ["Tragos", favoriteDrinks.map((drink) => drink.name).join(", ") || "—"]]}/>
            <ReviewGroup title={t("TUS DATOS")} step={2} onEdit={goToStep} disabled={status === "submitting"} items={[["Nombre", fields.name], ["Teléfono", fields.phone], ["Email", fields.email], ["Comentarios", fields.message || "—"]]}/>
            <p className="booking-privacy-note">{t("Al enviar, PepoShots usar\u00E1 estos datos para responder a tu solicitud. ")}<a href="/privacy" target="_blank" rel="noreferrer">{t("Privacidad")}</a>{t(".")}</p>
            <div className="booking-actions"><button type="button" className="booking-back" disabled={status === "submitting"} onClick={() => goToStep(2)}>{t("\u2190 Atr\u00E1s")}</button><button className="booking-next" type="submit" disabled={status === "submitting"}>{t(status === "submitting" ? "Enviando…" : "Consultar fecha")}</button></div>
          </section>)}
      </div>
      <FavoriteDrinksDialog dialogRef={favoritesDialog} />
      <input className="hp-field" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
      {status === "error" ? <p className="form-error" role="alert">{t(message)} <a href="tel:+17866067684">{t("Llama al 786 606-7684.")}</a></p> : null}
    </form>);
}
function ReviewGroup({ title, step, items, onEdit, disabled }: {
    title: string;
    step: 0 | 1 | 2;
    items: string[][];
    onEdit: (step: 0 | 1 | 2 | 3) => void;
    disabled?: boolean;
}) {
    const { t, language } = useI18n();
    const translatedValues = new Set(["Tipo", "Invitados", "Servicio", "Barra del lugar", "Barra elegida", "Espacio", "Transporte"]);
    return <section className="booking-review-group"><header><h3>{title}</h3><button type="button" disabled={disabled} onClick={() => onEdit(step)}>{t("Editar")}</button></header><dl>{items.map(([label, value]) => <div key={label}><dt>{t(label)}</dt><dd>{label === "Fecha" ? formatEventDate(value, language) : translatedValues.has(label) ? t(value) : value}</dd></div>)}</dl></section>;
}
