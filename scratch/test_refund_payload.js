import axios from 'axios';
import { processICICIRefund } from '../backend/src/services/iciciService.js';
import crypto from 'crypto';

// Mock env vars needed for test
process.env.ICICI_MERCHANT_ID = 'TEST_MERCHANT_ID';
process.env.ICICI_REFUND_URL = 'http://localhost/mock-refund';
process.env.ICICI_SECURE_HASH_KEY = 'TEST_SECRET_KEY';

async function runTest() {
  const originalAxiosPost = axios.post;
  
  // Intercept post to print the payload
  axios.post = async (url, payload, options) => {
    console.log("==================================================");
    console.log("PAYLOAD SENT TO GATEWAY:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("==================================================");
    
    // Check if originalMerchantTranId is correct
    if (payload.originalMerchantTranId === 'TXN_ORIG_987654321') {
      console.log("✅ SUCCESS: originalMerchantTranId is correctly mapped! The fix works perfectly.");
    } else {
      console.log("❌ FAILED: originalMerchantTranId is NOT correctly mapped!");
    }

    // Return a mocked success response
    return {
      data: {
        ResponseCode: '0000',
        refundId: 'REF_GATEWAY_001',
        secureHash: 'mocked_hash'
      }
    };
  };

  try {
    const merchantTranId = 'REF_' + Date.now();
    const refundAmount = 500;
    const originalTxnId = 'GATEWAY_ORIG_1111';
    const originalMerchantTranId = 'TXN_ORIG_987654321';

    console.log("Initiating refund...");
    await processICICIRefund(merchantTranId, refundAmount, originalTxnId, originalMerchantTranId);
  } catch (err) {
    if (err.message !== 'Invalid Secure Hash in ICICI Refund Response') {
      console.error(err);
    }
  } finally {
    axios.post = originalAxiosPost;
  }
}

runTest();
