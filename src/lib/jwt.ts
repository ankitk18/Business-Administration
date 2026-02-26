import jwt from "jsonwebtoken"

/**
 * Interface defining the structure of the data stored inside the JWT.
 */
export interface JwtPayload {
  userId: string;
  companyId: string;
  role: string;
  departmentId?: string;
}

// Ensure the secret is loaded from environment variables
const JWT_SECRET = process.env.JWT_SECRET!

/**
 * Generates a signed JWT for a user.
 * @param payload - The user data to be encoded (ID, company, and role).
 * @returns A signed string valid for 7 days.
 */
export function generateToken(payload: JwtPayload) {
  return jwt.sign(payload,JWT_SECRET,{ expiresIn: "7d",})
}

/**
 * Synchronously verifies a JWT and returns the decoded payload.
 * @param token - The string token received from cookies or headers.
 * @returns The decoded JwtPayload if valid.
 * @throws Error if the token is expired or the signature is invalid.
 */
export function verifyToken(token: string) {
  return jwt.verify(token,JWT_SECRET) as JwtPayload
}
