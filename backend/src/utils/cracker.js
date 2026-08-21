import crypto from 'crypto';

const secureHashKey = "b056fb6726703dd3ce11b71d5e59a6a55b301ceb429ba869a77d189eb3c2c458";

const resObj = {
  responseCode: 'P1006',
  responseDescription: 'Invalid request: Secure hash does not match',
  merchantId: '100000000007164',
  aggregatorID: 'A100000000007164'
  // merchantTxnNo: null - ignored usually
};
const expectedHash = "21281828e4d2f26117276b303f0319a43850fc3e97f5cbdf685b4625d1b904fe";

function checkHash(str, name) {
    const sha256_post = crypto.createHash('sha256').update(str + secureHashKey).digest('hex').toLowerCase();
    const sha256_pre = crypto.createHash('sha256').update(secureHashKey + str).digest('hex').toLowerCase();
    const hmac = crypto.createHmac('sha256', Buffer.from(secureHashKey, 'utf8')).update(str).digest('hex').toLowerCase();
    
    if (sha256_post === expectedHash) console.log("MATCH! Algorithm: SHA256(str + key), format:", name);
    if (sha256_pre === expectedHash) console.log("MATCH! Algorithm: SHA256(key + str), format:", name);
    if (hmac === expectedHash) console.log("MATCH! Algorithm: HMAC-SHA256(key, str), format:", name);
}

// All permutations of keys
const keys = Object.keys(resObj);
function permute(arr) {
    if (arr.length <= 1) return [arr];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
        for (const p of permute(rest)) {
            result.push([arr[i], ...p]);
        }
    }
    return result;
}

const perms = permute(keys);
for (const p of perms) {
    // values joined without separator
    const str1 = p.map(k => resObj[k]).join('');
    checkHash(str1, "Concat without sep: " + p.join(','));
    
    // values joined with pipe
    const str2 = p.map(k => resObj[k]).join('|');
    checkHash(str2, "Concat with pipe: " + p.join(','));
    
    // keys=values joined with &
    const str3 = p.map(k => `${k}=${resObj[k]}`).join('&');
    checkHash(str3, "Key=Value with &: " + p.join(','));
}

// Also try without responseDescription
const keysNoDesc = keys.filter(k => k !== 'responseDescription');
for (const p of permute(keysNoDesc)) {
    const str1 = p.map(k => resObj[k]).join('');
    checkHash(str1, "NoDesc Concat: " + p.join(','));
    const str2 = p.map(k => resObj[k]).join('|');
    checkHash(str2, "NoDesc Pipe: " + p.join(','));
}

console.log("Local brute force complete.");
