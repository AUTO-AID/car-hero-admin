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
  userId?: string | any;
  providerId?: string | any;
  bankAccount?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}
