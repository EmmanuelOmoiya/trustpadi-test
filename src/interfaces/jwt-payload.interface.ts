import { Types } from "mongoose";

export interface TokenData {
  user: string | Types.ObjectId;
  verified: boolean;
  first_name: string;
  last_name: string;
  followers_count: number;
  following_count: number;
  email: string;
  // iat: Date;
  // exp: Date;
}