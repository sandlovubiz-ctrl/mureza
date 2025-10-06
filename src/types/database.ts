export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type GenerationModel = 'V3_5' | 'V4' | 'V4_5';
export type TransactionType = 'purchase' | 'usage' | 'refund';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  token_balance: number;
  total_tokens_purchased: number;
  total_tokens_used: number;
  default_model: GenerationModel;
  auto_download: boolean;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  prompt: string;
  title: string | null;
  model: GenerationModel;
  duration_seconds: number;
  status: GenerationStatus;
  tokens_used: number;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  generation_id: string | null;
  transaction_type: TransactionType;
  token_amount: number;
  price_usd: number | null;
  stripe_payment_id: string | null;
  stripe_session_id: string | null;
  package_name: string | null;
  created_at: string;
}

export interface TokenPackage {
  id: string;
  name: string;
  description: string | null;
  token_amount: number;
  price_usd: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
}
