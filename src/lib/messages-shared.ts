import type { Message } from "@/types";

/** Client-safe message types — no server imports. */
export interface MessageWithSender extends Message {
  sender: {
    id: string;
    display_name: string;
  } | null;
}
