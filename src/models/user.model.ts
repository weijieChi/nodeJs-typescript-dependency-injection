export interface User {
  id: number;
  username: string;
  email?: string;
  password: string; // hashed by bcryptjs
}
