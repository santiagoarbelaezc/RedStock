export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  branchId: number;
  branch_id?: number;
  branch_name?: string;
  branchName?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}
