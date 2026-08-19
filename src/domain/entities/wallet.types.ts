export interface PlatformWallet {
  balance: number;
  totalEarnings?: number;
  totalPayouts?: number;
}

export interface Transaction {
  _id?: string;
  id?: string;
  amount: number;
  type: "deposit" | "withdraw" | "booking_payment" | "commission" | "payout" | string;
  status: "pending" | "completed" | "rejected" | string;
  userType?: "user" | "provider" | string;
  userId?: string | { _id?: string; id?: string; fullName?: string };
  providerId?: string | { _id?: string; id?: string; businessName?: string };
  bankAccount?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}
