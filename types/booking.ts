export type BookingInquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  eventDate: string;
  eventTime?: string;
  eventType: string;
  customEventType?: string;
  zone: string;
  locationReference?: string;
  guestRange: string;
  needs: string[];
  cocktails: string[];
  supplyQuestions: string[];
  message?: string;
  createdAt: string;
  status: "inquiry";
};

export type BookingDraft = Omit<BookingInquiry, "id" | "createdAt" | "status">;
