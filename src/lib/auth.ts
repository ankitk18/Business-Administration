import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

/* 
This file handles all authentication helpers.
Includes:
  1. Password hashing (bcrypt)
  2. Password comparison
  3. JWT token generation
  4. JWT token verification
*/

// This is the structure of the JWT payload.
export interface JwtPayload {
  userId: string;
  companyId: string;
  role: string;
}

// Secret key used to sign tokens.
// Must be defined in .env
const JWT_SECRET = process.env.JWT_SECRET!

/**
 * HASH PASSWORD
 * Converts a plain password into a secure hash.
 */
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}


/**
 * COMPARE PASSWORD
 * Checks if the entered password matches the stored hash.
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
) {
  return bcrypt.compare(password, hashedPassword);
}


/**
 * GENERATE JWT TOKEN
 * Creates a signed JWT token for authenticated users.
 * This token will be sent to the client and used for
 * accessing protected routes.
 */
export function generateToken(payload: JwtPayload) {

  return jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: "7d", // user stays logged in for 7 days
    }
  )

}


/**
 * VERIFY JWT TOKEN
 * Verifies the token and returns the decoded user info.
 * If the token is invalid or expired, it will throw an error.
 */
export function verifyToken(token: string) {

  return jwt.verify(
    token,
    JWT_SECRET
  ) as JwtPayload

}
