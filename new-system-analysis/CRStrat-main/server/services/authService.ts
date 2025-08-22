import bcrypt from "bcryptjs";
import type { InsertUser, User } from "@shared/supabase-schema";
import { z } from "zod";
import type { IStorage } from "../storage";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

export class AuthService {
  constructor(private storage: IStorage) {}

  async register(data: RegisterData): Promise<User> {
    // Check if user already exists
    const existingUser = await this.storage.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const existingUsername = await this.storage.getUserByUsername(data.username);
    if (existingUsername) {
      throw new Error("Username already taken");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.storage.createUser({
      email: data.email,
      username: data.username,
      password: hashedPassword,
    });

    return user;
  }

  async login(data: LoginData): Promise<User> {
    // Find user by email
    const user = await this.storage.getUserByEmail(data.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.storage.getUser(id);
  }
}