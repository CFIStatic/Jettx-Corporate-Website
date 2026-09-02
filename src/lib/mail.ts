export type Folder = "inbox" | "sent";

export type MailMessage = {
  id: string;
  folder: Folder;
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  subject: string;
  body: string;
  sentAt: string;
  unread: boolean;
};

export const STORAGE_KEY = "jettx-inbox-v1";
export const JETTX_NAME = "Jettx";
export const JETTX_EMAIL = "hello@jettx";

export const defaultMessages: MailMessage[] = [
  {
    id: "welcome",
    folder: "inbox",
    fromName: JETTX_NAME,
    fromEmail: JETTX_EMAIL,
    toName: "You",
    toEmail: "you@local",
    subject: "Welcome",
    body: "Your Jettx inbox is live.\n\nOpen Compose to send a message. Replies stay in this inbox so you can preview the flow.",
    sentAt: "2026-09-02T03:42:00.000Z",
    unread: true,
  },
  {
    id: "line-open",
    folder: "inbox",
    fromName: JETTX_NAME,
    fromEmail: JETTX_EMAIL,
    toName: "You",
    toEmail: "you@local",
    subject: "Line is open",
    body: "This is the company inbox on the Jettx site.\n\nNothing extra on this page yet — logo up top, mail down here.",
    sentAt: "2026-09-02T03:07:00.000Z",
    unread: true,
  },
];

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const delta = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

const listeners = new Set<() => void>();
let snapshot: MailMessage[] = defaultMessages;

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeMail(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMailServerSnapshot() {
  return defaultMessages;
}

export function getMailSnapshot() {
  return snapshot;
}

export function loadStoredMessages(): MailMessage[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultMessages;
    const parsed = JSON.parse(raw) as MailMessage[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultMessages;
    return parsed;
  } catch {
    return defaultMessages;
  }
}

export function hydrateMailFromStorage() {
  snapshot = loadStoredMessages();
  emit();
}

export function writeMail(
  updater: (current: MailMessage[]) => MailMessage[],
) {
  snapshot = updater(snapshot);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  emit();
}
