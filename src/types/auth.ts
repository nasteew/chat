export interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
