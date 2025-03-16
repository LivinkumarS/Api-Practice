import { compare, hash } from "bcryptjs";
import { createHmac } from "crypto";

export const doHash = (value, salt) => {
  const result = hash(value, salt);
  return result;
};

export const doHashValidation = (value, hashedValue) => {
  const result = compare(value, hashedValue);
  return result;
};

export const hmacProcess = (value, key) => {
  const result = createHmac("sha256", key).update(value).digest("hex");
  return result;
};
