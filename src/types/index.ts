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

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      listings: { Row: Listing; Insert: Partial<Listing>; Update: Partial<Listing> };
      offers: { Row: Offer; Insert: Partial<Offer>; Update: Partial<Offer> };
      transactions: {
        Row: Transaction;
        Insert: Partial<Transaction>;
        Update: Partial<Transaction>;
      };
      escrow: { Row: Escrow; Insert: Partial<Escrow>; Update: Partial<Escrow> };
      escrow_logs: {
        Row: EscrowLog;
        Insert: Partial<EscrowLog>;
        Update: Partial<EscrowLog>;
      };
      messages: { Row: Message; Insert: Partial<Message>; Update: Partial<Message> };
      ratings: { Row: Rating; Insert: Partial<Rating>; Update: Partial<Rating> };
      otp_codes: { Row: OtpCode; Insert: Partial<OtpCode>; Update: Partial<OtpCode> };
    };
  };
}
