import crypto from 'crypto';

const hashText = "000111A100000000007164100.00356narayan.kapase@phicommerce.com917709356362NarayanT_S00017575858875750https://pgpayuat.icicibank.com/tsp/pg/api/merchantSALE20241121115413";
const secretKey = "b056fb6726703dd3ce11b71d5e59a6a55b301ceb429ba869a77d189eb3c2c458";
const expectedHash = "205a2c1e897d3d654bbc92858b1da4929d0e2b1bbcedb781723f6db22768a10b";

const sha256_1 = crypto.createHash('sha256').update(hashText).digest('hex');
const sha256_2 = crypto.createHash('sha256').update(hashText + secretKey).digest('hex');
const sha256_3 = crypto.createHash('sha256').update(secretKey + hashText).digest('hex');
const hmac = crypto.createHmac('sha256', Buffer.from(secretKey, 'utf8')).update(hashText).digest('hex');

console.log("Expected:", expectedHash);
console.log("SHA256(text):", sha256_1);
console.log("SHA256(text+key):", sha256_2);
console.log("SHA256(key+text):", sha256_3);
console.log("HMAC-SHA256:", hmac);
