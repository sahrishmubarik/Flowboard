import crypto from "crypto";
import bcrypt from "bcryptjs";
export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export async  function passwordHashed(password:string){
  const saltRounds = 12;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
  
}