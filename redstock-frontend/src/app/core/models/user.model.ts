export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  branch_id: number;
  branch_name?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}
