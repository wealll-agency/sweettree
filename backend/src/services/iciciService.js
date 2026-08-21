import crypto from 'crypto';
import config from '../config/env.js';

/**
 * Generates an ICICI secureHash using SHA-256
 * 1. Excludes empty/null parameters and the 'secureHash' key itself
 * 2. Sorts parameter keys alphabetically
 * 3. Concatenates values without any separator
 * 4. Appends the ICICI_SECURE_HASH_KEY
 * 5. Hashes with SHA-256 and returns lowercase hex
 */
export const generateICICISecureHash = (params) => {
  const secretKey = config.ICICI.SECURE_HASH_KEY;
  if (!secretKey) {
    throw new Error('ICICI_SECURE_HASH_KEY is missing from environment variables');
  }

  // 1 & 2: Filter non-empty and sort keys
  const sortedKeys = Object.keys(params)
    .filter((key) => key !== 'secureHash' && params[key] !== null && params[key] !== undefined && params[key] !== '')
    .sort();

  // 3: Build the canonical concatenated string (only values)
  const canonicalString = sortedKeys.map((key) => params[key]).join('');

  // 4 & 5: Hash with SHA-256 (HashText + SecretKey)
  const hash = crypto.createHash('sha256');
  hash.update(canonicalString + secretKey);
  return hash.digest('hex').toLowerCase();
};

/**
 * Verifies the secureHash in an incoming ICICI callback/response
 */
export const verifyICICISecureHash = (responseParams) => {
  if (!responseParams || !responseParams.secureHash) return false;
  
  const generatedHash = generateICICISecureHash(responseParams);
  return generatedHash === responseParams.secureHash.toLowerCase();
};

/**
 * Initiates an ICICI Refund Request
 */
export const processICICIRefund = async (merchantTranId, refundAmount, originalTxnId) => {
  const merchantId = config.ICICI.MERCHANT_ID;
  const refundUrl = process.env.ICICI_REFUND_URL || 'https://pgpay.icicibank.com/pg/api/v2/refund';
  
  // Construct Refund Payload based on typical ICICI Server-to-Server Refund API specs
  const refundPayload = {
    merchantId,
    merchantTranId, // Often a new unique ID for the refund transaction itself, but sometimes original
    originalMerchantTranId: merchantTranId, 
    originalTxnId,
    amount: Number(refundAmount).toFixed(2),
    transactionType: 'REFUND'
  };

  refundPayload.secureHash = generateICICISecureHash(refundPayload);

  try {
    const response = await fetch(refundUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(refundPayload)
    });

    const data = await response.json();
    
    // Validate response hash
    if (!verifyICICISecureHash(data)) {
      throw new Error('Invalid Secure Hash in ICICI Refund Response');
    }

    if (data.ResponseCode === '0000' || data.ResponseCode === '0') {
      return { success: true, refundId: data.refundId || data.txnId, data };
    } else {
      return { success: false, message: data.message || 'Refund rejected by ICICI', data };
    }
  } catch (error) {
    console.error('ICICI Refund Error:', error);
    return { success: false, message: error.message };
  }
};
