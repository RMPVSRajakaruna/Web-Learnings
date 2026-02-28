import crypto from "crypto";

/**
 * Generate PayHere payment hash
 * 
 * PayHere hash formula:
 * MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase()).toUpperCase()
 * 
 * CRITICAL: 
 * - amount must be formatted as "X.XX" (e.g., "1000.00")
 * - currency must be uppercase (e.g., "LKR")
 * - Both MD5 hashes must be UPPERCASE
 */
const generateHash = (merchantId, orderId, amount, currency, merchantSecret) => {
  // Step 1: Hash the merchant secret and convert to uppercase
  const hashedSecret = crypto
    .createHash("md5")
    .update(merchantSecret)
    .digest("hex")
    .toUpperCase();

  // Step 2: Create the payment hash
  const hashString = merchantId + orderId + amount + currency + hashedSecret;
  
  console.log('Hash String Components:');
  console.log('  merchantId:', merchantId);
  console.log('  orderId:', orderId);
  console.log('  amount:', amount);
  console.log('  currency:', currency);
  console.log('  hashedSecret (first 10):', hashedSecret.substring(0, 10));
  console.log('  Full hash string:', hashString);

  const hash = crypto
    .createHash("md5")
    .update(hashString)
    .digest("hex")
    .toUpperCase();

  console.log('  Final hash:', hash);

  return hash;
};

export default generateHash;