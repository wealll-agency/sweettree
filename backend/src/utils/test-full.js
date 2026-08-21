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
    console.log("HashText:", hashText);
    
    // 1. HMAC SHA256 (Current)
    await testHash("HMAC-SHA256 (values no sep)", crypto.createHmac('sha256', Buffer.from(secureHashKey, 'utf8')).update(hashText).digest('hex').toLowerCase());
    
    // 2. SHA-256 (values + secretKey)
    await testHash("SHA256 (values no sep + key)", crypto.createHash('sha256').update(hashText + secureHashKey).digest('hex').toLowerCase());
    
    // 3. SHA-256 (secretKey + values)
    await testHash("SHA256 (key + values no sep)", crypto.createHash('sha256').update(secureHashKey + hashText).digest('hex').toLowerCase());
    
    console.log("All tests finished.");
}
run();
