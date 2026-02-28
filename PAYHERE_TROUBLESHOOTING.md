# PayHere Integration Troubleshooting Guide

## ✅ Changes Made

### 1. Fixed Hash Mismatch Issue (CRITICAL)
**Problem:** Frontend was sending different values to PayHere than what was used to generate the hash.

**Fix:** Updated `checkOut.jsx` to use ALL values from `hashData` (backend response) instead of mixing with local `paymentData`.

### 2. Enhanced Debugging
Added comprehensive logging to track:
- Hash generation components
- Merchant credentials (partially masked)
- All fields being sent to PayHere

### 3. Improved Validation
- Check for missing merchant credentials
- Validate order exists before creating payment
- Consistent amount formatting

---

## 🔍 How to Test

### Step 1: Check Environment Variables
```bash
cd backend
cat .env
```

Verify you have:
```
PAYHERE_MERCHANT_ID=1234210
PAYHERE_MERCHANT_SECRET=MzM1NDc3NjcwNjIwNzk5MzkzMjc5MTIxNjE5MDAzMjQ3OTI4NzIz
```

### Step 2: Verify Sandbox vs Live Mode

**Current setup:** SANDBOX mode
- URL: `https://sandbox.payhere.lk/pay/checkout`
- Merchant ID: `1234210` (looks like test ID)

**If using LIVE credentials:** Change in `checkOut.jsx` line 197:
```javascript
form.action = "https://www.payhere.lk/pay/checkout"; // LIVE
```

### Step 3: Test Payment Flow

1. Start backend:
   ```bash
   cd backend
   npm start
   ```

2. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Create an order and initiate payment

4. **Check backend logs** for:
   ```
   === PAYMENT HASH GENERATION ===
   Merchant ID: 1234210
   Order ID: CBC00001
   Amount (formatted): 1000.00
   Currency: LKR
   Generated Hash: XXXXXX...
   ```

5. **Check browser console** for:
   ```
   === PAYHERE FORM DATA ===
   Hash Data from Backend: {...}
   Final fields being sent to PayHere: {...}
   ```

---

## 🚨 Common Issues & Fixes

### Issue: "Payment request was rejected"

**Checklist:**
- [ ] Amount is formatted as `"X.XX"` (e.g., `"1000.00"`)
- [ ] Currency is uppercase: `"LKR"`
- [ ] Merchant ID matches environment variable
- [ ] Using correct URL (sandbox vs live)
- [ ] All required fields present
- [ ] Hash generated correctly

### Issue: Hash verification fails

**Debug steps:**
1. Check backend logs for hash generation components
2. Verify merchant secret hasn't changed
3. Ensure no extra whitespace in order ID or amount
4. Confirm amount hasn't been modified after hash generation

### Issue: Domain not allowed

**Fix:** Add your domain in PayHere dashboard:
1. Login to PayHere merchant dashboard
2. Go to Settings → Domains
3. Add:
   - `http://localhost:5173` (frontend dev)
   - `http://localhost:3000` (backend dev)
   - Your production domains

---

## 📝 PayHere Hash Formula

```
MD5(
  merchant_id + 
  order_id + 
  amount + 
  currency + 
  MD5(merchant_secret).toUpperCase()
).toUpperCase()
```

**Example:**
```javascript
// Input
merchant_id: "1234210"
order_id: "CBC00001"
amount: "1000.00"
currency: "LKR"
merchant_secret: "MzM1NDc3..."

// Step 1: Hash secret
hashedSecret = MD5("MzM1NDc3...").toUpperCase()

// Step 2: Generate payment hash
hashString = "1234210" + "CBC00001" + "1000.00" + "LKR" + hashedSecret
hash = MD5(hashString).toUpperCase()
```

---

## 🔐 Security Checklist

- [ ] Never expose `PAYHERE_MERCHANT_SECRET` to frontend
- [ ] Always generate hash on backend
- [ ] Validate notify webhook hash
- [ ] Use HTTPS in production
- [ ] Add domain whitelist in PayHere dashboard

---

## 📞 Still Having Issues?

1. **Enable verbose logging:**
   - Backend logs show hash generation details
   - Frontend console shows all form fields

2. **Check PayHere dashboard:**
   - View failed transaction logs
   - Verify merchant account is active
   - Check domain settings

3. **Test with PayHere test cards:**
   - Card: 4916217501611292
   - Expiry: Any future date
   - CVV: 123
   - 3DS: 1234

4. **Contact PayHere support:**
   - Email: support@payhere.lk
   - Provide: merchant ID, order ID, timestamp
