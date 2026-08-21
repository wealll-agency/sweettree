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
        }
    } catch (e) {
        // ignore
    }
}

async function run() {
    const sortedKeys = Object.keys(basePayload).sort();
    
    // 1. key=value&key=value
    const kvString = sortedKeys.map(k => `${k}=${basePayload[k]}`).join('&');
    await testHash("HMAC-SHA256 (kv string)", crypto.createHmac('sha256', Buffer.from(secureHashKey, 'utf8')).update(kvString).digest('hex').toLowerCase());
    await testHash("SHA256 (kv string + key)", crypto.createHash('sha256').update(kvString + secureHashKey).digest('hex').toLowerCase());
    
    // 2. without returnURL in hash? Some gateways exclude returnURL.
    const keysNoUrl = sortedKeys.filter(k => k !== 'returnURL');
    const valuesNoUrl = keysNoUrl.map(k => basePayload[k]).join('');
    await testHash("HMAC-SHA256 (no returnURL)", crypto.createHmac('sha256', Buffer.from(secureHashKey, 'utf8')).update(valuesNoUrl).digest('hex').toLowerCase());

    console.log("Finished test 2.");
}
run();
