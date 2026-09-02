"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import {
  JETTX_EMAIL,
  JETTX_NAME,
  formatRelativeTime,
  formatTimestamp,
  getMailServerSnapshot,
  getMailSnapshot,
  hydrateMailFromStorage,
  initials,
  subscribeMail,
  writeMail,
  type Folder,
} from "@/lib/mail";

type ComposeDraft = {
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string;
};

const emptyDraft: ComposeDraft = {
  fromName: "",
  fromEmail: "",
  subject: "",
  body: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CLOCK_ORIGIN = Date.parse("2026-09-02T04:00:00.000Z");

export function Inbox() {
  const messages = useSyncExternalStore(
    subscribeMail,
    getMailSnapshot,
    getMailServerSnapshot,
  );
  const [folder, setFolder] = useState<Folder>("inbox");
  const [selectedId, setSelectedId] = useState<string | null>("welcome");
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState<ComposeDraft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(CLOCK_ORIGIN);
  const [mobileReading, setMobileReading] = useState(false);

  useEffect(() => {
    hydrateMailFromStorage();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(timer);
    };
  }, []);

  const visible = useMemo(
    () =>
      messages
        .filter((message) => message.folder === folder)
        .sort(
          (a, b) =>
            new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
        ),
    [messages, folder],
  );

  const selected =
    visible.find((message) => message.id === selectedId) ?? visible[0] ?? null;
  const unreadCount = messages.filter(
    (message) => message.folder === "inbox" && message.unread,
  ).length;

  function openMessage(id: string) {
    setSelectedId(id);
    setComposing(false);
    setMobileReading(true);
    writeMail((current) =>
      current.map((message) =>
        message.id === id ? { ...message, unread: false } : message,
      ),
    );
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fromEmail = draft.fromEmail.trim();
    const fromName = draft.fromName.trim() || fromEmail.split("@")[0] || "You";
    const subject = draft.subject.trim();
    const body = draft.body.trim();

    if (!EMAIL_PATTERN.test(fromEmail)) {
      setError("Enter a valid email so we know where to reply.");
      return;
    }
    if (!subject || !body) {
      setError("Subject and message are required.");
      return;
    }

    const sentAt = new Date().toISOString();
    const sentId = `sent-${crypto.randomUUID()}`;
    writeMail((current) => [
      {
        id: `reply-${crypto.randomUUID()}`,
        folder: "inbox",
        fromName: JETTX_NAME,
        fromEmail: JETTX_EMAIL,
        toName: fromName,
        toEmail: fromEmail,
        subject: `Re: ${subject}`,
        body: `Got it, ${fromName}.\n\nThis inbox is on the site for now, so your note is stored here. We will hook it up to a live mailbox next.`,
        sentAt: new Date(Date.now() + 400).toISOString(),
        unread: true,
      },
      {
        id: sentId,
        folder: "sent",
        fromName,
        fromEmail,
        toName: JETTX_NAME,
        toEmail: JETTX_EMAIL,
        subject,
        body,
        sentAt,
        unread: false,
      },
      ...current,
    ]);
    setDraft(emptyDraft);
    setError(null);
    setComposing(false);
    setFolder("sent");
    setSelectedId(sentId);
    setMobileReading(true);
  }

  return (
    <section className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-3 sm:px-4">
        <div className="flex items-center gap-1">
          <FolderTab
            label="Inbox"
            active={folder === "inbox" && !composing}
            badge={unreadCount}
            onClick={() => {
              setFolder("inbox");
              setComposing(false);
              setMobileReading(false);
              const first = messages.find(
                (message) => message.folder === "inbox",
              );
              setSelectedId(first?.id ?? null);
            }}
          />
          <FolderTab
            label="Sent"
            active={folder === "sent" && !composing}
            onClick={() => {
              setFolder("sent");
              setComposing(false);
              setMobileReading(false);
              const first = messages.find(
                (message) => message.folder === "sent",
              );
              setSelectedId(first?.id ?? null);
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setComposing(true);
            setError(null);
            setMobileReading(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-hot"
        >
          <ComposeIcon />
          Compose
        </button>
      </div>

      <div className="grid min-h-[min(40rem,calc(100dvh-12rem))] flex-1 md:grid-cols-[minmax(16rem,20rem)_1fr]">
        <aside
          className={`border-line md:block md:border-r ${
            mobileReading ? "hidden" : "block"
          }`}
        >
          {visible.length === 0 ? (
            <p className="px-5 py-10 text-sm text-muted">
              {folder === "sent" ? "Nothing sent yet." : "Inbox is empty."}
            </p>
          ) : (
            <ul className="divide-y divide-line" aria-label="Messages">
              {visible.map((message) => {
                const active = message.id === selected?.id && !composing;
                return (
                  <li key={message.id}>
                    <button
                      type="button"
                      onClick={() => openMessage(message.id)}
                      aria-current={active ? "true" : undefined}
                      className={`flex w-full gap-3 px-4 py-3.5 text-left transition-colors ${
                        active
                          ? "bg-panel-raised"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          message.unread
                            ? "bg-red text-white"
                            : "bg-white/10 text-zinc-200"
                        }`}
                      >
                        {initials(
                          folder === "sent" ? message.toName : message.fromName,
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span
                            className={`truncate text-sm ${
                              message.unread
                                ? "font-semibold text-white"
                                : "text-zinc-200"
                            }`}
                          >
                            {folder === "sent"
                              ? `To ${message.toName}`
                              : message.fromName}
                          </span>
                          <time
                            dateTime={message.sentAt}
                            className="shrink-0 text-[11px] text-muted"
                          >
                            {formatRelativeTime(message.sentAt, now)}
                          </time>
                        </span>
                        <span
                          className={`mt-0.5 block truncate text-sm ${
                            message.unread ? "text-zinc-100" : "text-zinc-400"
                          }`}
                        >
                          {message.subject}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted">
                          {message.body.split("\n")[0]}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <div
          className={`min-h-[28rem] bg-[#191919] ${
            mobileReading ? "block" : "hidden md:block"
          }`}
        >
          {composing ? (
            <form
              onSubmit={sendMessage}
              className="flex h-full flex-col gap-4 p-4 sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="text-sm text-muted md:hidden"
                  onClick={() => {
                    setComposing(false);
                    setMobileReading(false);
                  }}
                >
                  Back
                </button>
                <p className="text-sm font-medium">New message</p>
                <button
                  type="button"
                  className="hidden text-sm text-muted md:inline"
                  onClick={() => setComposing(false)}
                >
                  Cancel
                </button>
              </div>
              <label className="block text-xs uppercase tracking-[0.14em] text-muted">
                To
                <input
                  readOnly
                  value={`${JETTX_NAME} <${JETTX_EMAIL}>`}
                  className="mt-1 w-full rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-zinc-300"
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.14em] text-muted">
                Your name
                <input
                  value={draft.fromName}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      fromName: event.target.value,
                    }))
                  }
                  placeholder="Name"
                  className="mt-1 w-full rounded-lg border border-line bg-black/20 px-3 py-2 text-sm text-foreground outline-none transition focus:border-red focus:ring-2 focus:ring-red/30"
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.14em] text-muted">
                Your email
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={draft.fromEmail}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      fromEmail: event.target.value,
                    }))
                  }
                  placeholder="you@company.com"
                  className="mt-1 w-full rounded-lg border border-line bg-black/20 px-3 py-2 text-sm text-foreground outline-none focus:border-red focus:ring-2 focus:ring-red/30"
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.14em] text-muted">
                Subject
                <input
                  value={draft.subject}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      subject: event.target.value,
                    }))
                  }
                  placeholder="Subject"
                  className="mt-1 w-full rounded-lg border border-line bg-black/20 px-3 py-2 text-sm text-foreground outline-none focus:border-red focus:ring-2 focus:ring-red/30"
                />
              </label>
              <label className="flex min-h-0 flex-1 flex-col text-xs uppercase tracking-[0.14em] text-muted">
                Message
                <textarea
                  value={draft.body}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      body: event.target.value,
                    }))
                  }
                  placeholder="Write your message"
                  className="mt-1 min-h-36 w-full flex-1 resize-none rounded-lg border border-line bg-black/20 px-3 py-2 text-sm normal-case tracking-normal text-foreground outline-none focus:border-red focus:ring-2 focus:ring-red/30"
                />
              </label>
              {error ? <p className="text-sm text-red">{error}</p> : null}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-red px-5 py-2.5 text-sm font-medium text-white hover:bg-red-hot"
                >
                  Send
                </button>
              </div>
            </form>
          ) : selected ? (
            <article className="flex h-full flex-col p-4 sm:p-8">
              <button
                type="button"
                className="mb-4 text-left text-sm text-muted md:hidden"
                onClick={() => setMobileReading(false)}
              >
                Back to {folder}
              </button>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {selected.subject}
              </h2>
              <div className="mt-5 flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red text-sm font-semibold text-white">
                  {initials(selected.fromName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">
                    {selected.fromName}{" "}
                    <span className="font-normal text-muted">
                      &lt;{selected.fromEmail}&gt;
                    </span>
                  </p>
                  <p className="text-sm text-muted">
                    To {selected.toName} &lt;{selected.toEmail}&gt;
                  </p>
                </div>
                <time
                  dateTime={selected.sentAt}
                  className="shrink-0 text-xs text-muted"
                >
                  {formatTimestamp(selected.sentAt)}
                </time>
              </div>
              <p className="mt-8 whitespace-pre-wrap text-[15px] leading-7 text-zinc-200">
                {selected.body}
              </p>
            </article>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-sm text-muted">
              Select a message or compose a new one.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FolderTab({
  label,
  active,
  badge,
  onClick,
}: {
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-white/10 text-white"
          : "text-muted hover:bg-white/5 hover:text-zinc-200"
      }`}
    >
      {label}
      {badge ? (
        <span className="rounded-full bg-red px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function ComposeIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="h-3.5 w-3.5 fill-current"
    >
      <path d="M11.2 1.2a1.7 1.7 0 0 1 2.4 2.4L5.3 11.9 2 12.8l.9-3.3 8.3-8.3ZM2 14h12v1.2H2V14Z" />
    </svg>
  );
}
