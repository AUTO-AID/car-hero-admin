export interface Admin {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  avatar?: string;
  lastLoginAt?: string;
}

export interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
