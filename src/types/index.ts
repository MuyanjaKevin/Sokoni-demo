export type ProfileTier =
  | "hustler"
  | "mover"
  | "grinder"
  | "elite"
  | "legend";

export type ListingCondition = "new" | "like_new" | "good" | "fair";

export type ListingStatus = "active" | "sold" | "paused" | "removed";

export type OfferStatus =
  | "pending"
  | "accepted"
  | "countered"
  | "declined"
  | "expired";

export type TransactionStatus =
  | "pending"
  | "escrowed"
  | "in_delivery"
  | "completed"
  | "disputed"
  | "refunded";

export type EscrowState =
  | "pending"
  | "held"
  | "released"
  | "refunded"
  | "frozen";

export interface Profile {
  id: string;
  phone: string;
  display_name: string;
  avatar_url: string | null;
  district: string | null;
  avg_rating: number;
  rating_count: number;
  hustle_points: number;
  tier: ProfileTier;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  asking_price: number;
  category: string;
  condition: ListingCondition;
  status: ListingStatus;
  photo_urls: string[];
  district: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface Offer {
  id: string;
  listing_id: string;
  buyer_id: string;
  proposed_price: number;
  status: OfferStatus;
  round: number;
  expires_at: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  listing_id: string;
  offer_id: string;
  buyer_id: string;
  seller_id: string;
  agreed_price: number;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
}

export interface Escrow {
  id: string;
  transaction_id: string;
  amount: number;
  state: EscrowState;
  created_at: string;
  updated_at: string;
}

export interface EscrowLog {
  id: string;
  transaction_id: string;
  from_state: string;
  to_state: string;
  actor: string;
  reason: string;
  created_at: string;
}

export interface Message {
  id: string;
  transaction_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Rating {
  id: string;
  transaction_id: string;
  rater_id: string;
  rated_id: string;
  stars: number;
  review: string | null;
  created_at: string;
}

export interface OtpCode {
  id: string;
  phone_hash: string;
  otp_hash: string;
  expires_at: string;
  used_at: string | null;
  attempt_count: number;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          phone: string;
          display_name: string;
          avatar_url?: string | null;
          district?: string | null;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
          district?: string | null;
          updated_at?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      listings: {
        Row: Listing;
        Insert: Omit<Listing, "id" | "created_at" | "deleted_at">;
        Update: Partial<Omit<Listing, "id" | "created_at">>;
        Relationships: [];
      };
      offers: {
        Row: Offer;
        Insert: Omit<Offer, "id" | "created_at">;
        Update: Partial<Omit<Offer, "id" | "created_at">>;
        Relationships: [];
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Transaction, "id" | "created_at">>;
        Relationships: [];
      };
      escrow: {
        Row: Escrow;
        Insert: Omit<Escrow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Escrow, "id" | "created_at">>;
        Relationships: [];
      };
      escrow_logs: {
        Row: EscrowLog;
        Insert: Omit<EscrowLog, "id" | "created_at">;
        Update: Partial<Omit<EscrowLog, "id" | "created_at">>;
        Relationships: [];
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at">;
        Update: Partial<Omit<Message, "id" | "created_at">>;
        Relationships: [];
      };
      ratings: {
        Row: Rating;
        Insert: Omit<Rating, "id" | "created_at">;
        Update: Partial<Omit<Rating, "id" | "created_at">>;
        Relationships: [];
      };
      otp_codes: {
        Row: OtpCode;
        Insert: {
          phone_hash: string;
          otp_hash: string;
          expires_at: string;
          attempt_count?: number;
        };
        Update: {
          used_at?: string | null;
          attempt_count?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
