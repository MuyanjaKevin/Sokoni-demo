"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import type { MessageWithSender } from "@/lib/messages-shared";

interface ChatRoomProps {
  transactionId: string;
  userId: string;
  listingTitle: string;
  participantNames: Record<string, string>;
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: MessageWithSender;
  isOwn: boolean;
}): React.JSX.Element {
  const time = new Date(message.created_at).toLocaleTimeString("en-UG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm",
          isOwn
            ? "rounded-br-md bg-brand-primary text-white"
            : "rounded-bl-md bg-white text-brand-text ring-1 ring-black/5",
        )}
      >
        {!isOwn ? (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
            {message.sender?.display_name ?? "User"}
          </p>
        ) : null}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.content}
        </p>
        <p
          className={cn(
            "mt-1 text-right text-[10px]",
            isOwn ? "text-white/70" : "text-brand-muted",
          )}
        >
          {time}
        </p>
      </div>
    </div>
  );
}

function ChatSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={cn("flex", index % 2 === 0 ? "justify-start" : "justify-end")}
        >
          <Skeleton className="h-14 w-48 rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

export function ChatRoom({
  transactionId,
  userId,
  listingTitle,
  participantNames,
}: ChatRoomProps): React.JSX.Element {
  const [draft, setDraft] = useState("");
  const { messages, loading, error, sending, sendMessage, retry, scrollAnchorRef } =
    useChat(transactionId, userId, participantNames);

  async function handleSend(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const ok = await sendMessage(draft);
    if (ok) {
      setDraft("");
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] max-h-[720px] flex-col overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5">
      <header className="flex items-center gap-3 border-b border-black/5 bg-brand-primary px-4 py-3 text-white">
        <Link
          href={`/transactions/${transactionId}`}
          className="rounded-lg p-1 hover:bg-white/10"
          aria-label="Back to transaction"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{listingTitle}</p>
          <p className="text-xs text-white/80">Secure chat · Real-time</p>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden bg-brand-background">
        {loading ? (
          <ChatSkeleton />
        ) : error && messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-4">
            <ErrorState message={error} onRetry={retry} />
          </div>
        ) : (
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <p className="text-sm font-medium text-brand-text">
                  No messages yet
                </p>
                <p className="mt-1 max-w-xs text-xs text-brand-muted">
                  Say hello and coordinate delivery or pickup details.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === userId}
                />
              ))
            )}
            <div ref={scrollAnchorRef} />
          </div>
        )}

        {error && messages.length > 0 ? (
          <p className="bg-red-50 px-4 py-2 text-center text-xs text-brand-danger">
            {error}
          </p>
        ) : null}

        <form
          onSubmit={handleSend}
          className="flex gap-2 border-t border-black/5 bg-white p-3"
        >
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message…"
            maxLength={1000}
            disabled={sending}
            className="rounded-full border-input bg-brand-background"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !draft.trim()}
            className="h-8 w-8 shrink-0 rounded-full bg-brand-primary hover:bg-brand-primary/90"
            aria-label="Send message"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
