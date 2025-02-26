export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  payload: {
    token: string;
    role: string;
  };
}

export interface RegisterRequest {
  username: string;
  currentCompany: string;
  password: string;
  role: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  payload: {
    firstName: string;
    lastName: string;
    roles: string;
  };
}
