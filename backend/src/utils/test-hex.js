import axios from 'axios';
import crypto from 'crypto';

const merchantId = "100000000007164";
const secureHashKey = "b056fb6726703dd3ce11b71d5e59a6a55b301ceb429ba869a77d189eb3c2c458";
const aggregatorID = "A100000000007164";

const basePayload = {
    addlParam1: "000",
    addlParam2: "111",
    aggregatorID,
    amount: "100.00",
    currencyCode: "356",
    customerEmailID: "test@gmail.com",
    customerMobileNo: "917709356362",
    customerName: "SweetTreeUser",
    merchantId,
    merchantTxnNo: "TEST_" + Date.now(),
    payType: "0",
    returnURL: "http://localhost:7050/api/orders/icici-callback",
    transactionType: "SALE",
    txnDate: new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14)
};

async function testHash(methodName, hashValue) {
    const payload = { ...basePayload, secureHash: hashValue };
    try {
        const res = await axios.post('https://pgpayuat.icici.bank.in/tsp/pg/api/v2/initiateSale', payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.data.responseCode !== 'P1006' || !res.data.responseDescription.includes('Secure hash does not match')) {
            console.log(`[SUCCESS/DIFFERENT ERROR] Method: ${methodName}`);
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
    const sortedKeys = Object.keys(basePayload).sort();
    const hashText = sortedKeys.map(k => basePayload[k]).join('');
    
    // Test HMAC-SHA256 with HEX decoded key
    const hexKeyBuffer = Buffer.from(secureHashKey, 'hex');
    const hash = crypto.createHmac('sha256', hexKeyBuffer).update(hashText).digest('hex').toLowerCase();
    
    await testHash("HMAC-SHA256 (hex key)", hash);

    // Let's also try SHA-256(HashText) but maybe there's something else
    console.log("Finished hex key test.");
}
run();
