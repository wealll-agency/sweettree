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

async function run() {
    const payload = {
        merchantId,
        aggregatorID,
        merchantTranId: "TEST_" + Date.now(),
        amount: "100.00",
        returnURL: "http://localhost:7050/api/orders/icici-callback",
        payType: "0",
        txnDate: new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14)
    };
    payload.secureHash = generateHash(payload);
    
    // Test Production URLs
    const prodUrls = [
        'https://pgpay.icici.bank.in/tsp/pg/api/v2/initiateSale',
        'https://pgpay.icicibank.com/tsp/pg/api/v2/initiateSale',
        'https://pgpways.icicibank.com/tsp/pg/api/v2/initiateSale'
    ];

    for (const url of prodUrls) {
        try {
            console.log("Testing:", url);
            const res = await axios.post(url, payload, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log("Response:", res.data);
        } catch (e) {
            console.log("Error:", e.response?.data || e.message);
        }
    }
}
run();
