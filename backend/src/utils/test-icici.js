import axios from 'axios';
import crypto from 'crypto';

const merchantId = "100000000007164";
const secureHashKey = "b056fb6726703dd3ce11b71d5e59a6a55b301ceb429ba869a77d189eb3c2c458";
const aggregatorID = "A100000000007164";

const generateHash = (payload) => {
    const keys = Object.keys(payload).sort();
    let str = '';
    for (const key of keys) {
        if (key !== 'secureHash' && payload[key] !== null && payload[key] !== '') {
            str += payload[key];
        }
    }
    const hmac = crypto.createHmac('sha256', Buffer.from(secureHashKey, 'utf8'));
    hmac.update(str);
    return hmac.digest('hex').toLowerCase();
};

async function testField() {
    const payload = {
        merchantId,
        aggregatorID,
        merchantTxnNo: "TEST_" + Date.now(), // Changed from merchantTranId
        amount: "100.00",
        returnURL: "http://localhost:7050/api/orders/icici-callback",
        payType: "0",
        txnDate: new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14)
    };
    payload.secureHash = generateHash(payload);
    
    try {
        const res = await axios.post('https://pgpayuat.icici.bank.in/tsp/pg/api/v2/initiateSale', payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log(`[merchantTxnNo]:`, res.data.responseCode, res.data.responseDescription);
    } catch (e) {
        console.log(`[merchantTxnNo] Error:`, e.message);
    }
}
testField();
