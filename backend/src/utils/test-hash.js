import axios from 'axios';
import crypto from 'crypto';

const merchantId = "100000000007164";
const secureHashKey = "b056fb6726703dd3ce11b71d5e59a6a55b301ceb429ba869a77d189eb3c2c458";
const aggregatorID = "A100000000007164";

const basePayload = {
    merchantId,
    aggregatorID,
    merchantTranId: "TEST_" + Date.now(),
    amount: "100.00",
    returnURL: "http://localhost:7050/api/orders/icici-callback",
    payType: "0",
    txnDate: new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14)
};

async function testHash(methodName, hashValue) {
    const payload = { ...basePayload, secureHash: hashValue };
    try {
        const res = await axios.post('https://pgpayuat.icici.bank.in/tsp/pg/api/v2/initiateSale', payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.data.responseCode !== 'P1006') {
            console.log(`[SUCCESS] Method: ${methodName}`);
            console.log(res.data);
            process.exit(0);
        } else {
            console.log(`[FAILED] Method: ${methodName} - ${res.data.responseDescription}`);
        }
    } catch (e) {
        console.log(`[ERROR] Method: ${methodName} - ${e.message}`);
    }
}

async function run() {
    // Sorted keys for dynamic concatenation
    const sortedKeys = Object.keys(basePayload).sort();
    const valuesNoSep = sortedKeys.map(k => basePayload[k]).join('');
    const valuesPipeSep = sortedKeys.map(k => basePayload[k]).join('|');

    // 1. HMAC SHA256 (Current)
    await testHash("HMAC-SHA256 (values no sep)", crypto.createHmac('sha256', Buffer.from(secureHashKey, 'utf8')).update(valuesNoSep).digest('hex').toLowerCase());
    
    // 2. SHA-256 (values + secretKey)
    await testHash("SHA256 (values no sep + key)", crypto.createHash('sha256').update(valuesNoSep + secureHashKey).digest('hex').toLowerCase());
    
    // 3. SHA-256 (secretKey + values)
    await testHash("SHA256 (key + values no sep)", crypto.createHash('sha256').update(secureHashKey + valuesNoSep).digest('hex').toLowerCase());

    // 4. SHA-256 (values pipe sep + key)
    await testHash("SHA256 (values pipe sep + key)", crypto.createHash('sha256').update(valuesPipeSep + secureHashKey).digest('hex').toLowerCase());
    
    // 5. SHA-256 (key + values pipe sep)
    await testHash("SHA256 (key + values pipe sep)", crypto.createHash('sha256').update(secureHashKey + valuesPipeSep).digest('hex').toLowerCase());

    // 6. Specific fixed order: amount, merchantId, returnURL, merchantTranId
    // Some gateways use a fixed order.
    // Let's try: merchantId|merchantTranId|amount|returnURL
    // Or amount|returnURL|merchantId... this is too hard to brute force.

    console.log("All tested methods failed.");
}
run();
