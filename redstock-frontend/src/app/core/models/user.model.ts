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
  token: string;
  user: User;
}
