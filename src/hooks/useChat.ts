"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MessageWithSender } from "@/lib/messages-shared";
import type { ApiResponse } from "@/types";
import type { Message } from "@/types";

interface UseChatResult {
  messages: MessageWithSender[];
  loading: boolean;
  error: string | null;
  sending: boolean;
  sendMessage: (content: string) => Promise<boolean>;
  retry: () => void;
  scrollAnchorRef: React.RefObject<HTMLDivElement>;
}

function mapRealtimeRow(
  row: Message,
  participantNames: Record<string, string>,
): MessageWithSender {
  return {
    ...row,
    sender: {
      id: row.sender_id,
      display_name: participantNames[row.sender_id] ?? "User",
    },
  };
}

export function useChat(
  transactionId: string,
  userId: string,
  participantNames: Record<string, string>,
): UseChatResult {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const appendMessage = useCallback((message: MessageWithSender): void => {
    setMessages((previous) => {
      if (previous.some((item) => item.id === message.id)) {
        return previous;
      }
      return [...previous, message];
    });
  }, []);

  const loadMessages = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/messages?transaction_id=${transactionId}`,
      );
      const result = (await response.json()) as ApiResponse<MessageWithSender[]>;

      if (!result.success) {
        setError(result.error ?? "Could not load messages");
        setMessages([]);
        return;
      }

      setMessages(result.data ?? []);
    } catch {
      setError("Network error. Check your connection.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${transactionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `transaction_id=eq.${transactionId}`,
        },
        (payload) => {
          const row = payload.new as Message;
          if (row.sender_id === userId) {
            return;
          }
          appendMessage(mapRealtimeRow(row, participantNames));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [
    appendMessage,
    participantNames,
    supabase,
    transactionId,
    userId,
  ]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      const trimmed = content.trim();
      if (!trimmed) {
        return false;
      }

      setSending(true);

      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transaction_id: transactionId,
            content: trimmed,
          }),
        });

        const result = (await response.json()) as ApiResponse<MessageWithSender>;

        if (!result.success || !result.data) {
          setError(result.error ?? "Could not send message");
          return false;
        }

        appendMessage(result.data);
        setError(null);
        return true;
      } catch {
        setError("Could not send message");
        return false;
      } finally {
        setSending(false);
      }
    },
    [appendMessage, transactionId],
  );

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    retry: () => void loadMessages(),
    scrollAnchorRef,
  };
}
