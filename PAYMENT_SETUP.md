# Payment Process Setup

## Environment Variables Required

Make sure your `.env` file contains:
```
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_merchant_secret
```

## API Endpoints

### 1. Create Payment Hash
**POST** `/api/payment/create-payment`

Request body:
```json
{
  "orderId": "CBC00001",
  "amount": "1000.00"
}
```

Response:
```json
{
  "merchant_id": "1234210",
  "order_id": "CBC00001",
  "amount": "1000.00",
  "currency": "LKR",
  "hash": "GENERATED_HASH",
  "items": "Customer Name",
  "first_name": "Customer",
  "last_name": "Name",
  "email": "customer@email.com",
  "phone": "0771234567",
  "address": "Customer Address"
}
```

### 2. Payment Notification (PayHere Callback)
**POST** `/api/payment/notify`

This endpoint receives automatic notifications from PayHere when payment status changes.

### 3. Payment Return
**GET** `/api/payment/return?order_id=CBC00001`

User is redirected here after completing payment on PayHere.

### 4. Payment Cancel
**GET** `/api/payment/cancel?order_id=CBC00001`

User is redirected here if they cancel the payment.

### 5. Get Payment Status
**GET** `/api/payment/status/:orderId`

Response:
```json
{
  "orderId": "CBC00001",
  "status": "Paid",
  "amount": 1000,
  "date": "2026-02-27T12:00:00.000Z"
}
```

## Payment Flow

1. Customer creates an order via `/api/orders` endpoint
2. Frontend calls `/api/payment/create-payment` with orderId and amount
3. Frontend receives payment details including hash
4. Frontend redirects to PayHere with the payment details
5. PayHere processes payment and sends notification to `/api/payment/notify`
6. Customer is redirected to `/api/payment/return` or `/api/payment/cancel`
7. Order status is updated based on payment result

## Order Status Values

- `Pending` - Order created, payment not initiated
- `Pending Payment` - Payment initiated but not confirmed
- `Paid` - Payment successful
- `Payment Canceled` - Customer canceled payment
- `Payment Failed` - Payment failed
- `Chargedback` - Payment was charged back

## Frontend Integration Example

```javascript
// Step 1: Create order
const orderResponse = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "John Doe",
    address: "123 Main St",
    phone: "0771234567",
    products: [
      { productId: "PROD001", quantity: 2 }
    ]
  })
});

const order = await orderResponse.json();

// Step 2: Get payment details
const paymentResponse = await fetch('/api/payment/create-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: order.order.orderId,
    amount: order.order.total
  })
});

const payment = await paymentResponse.json();

// Step 3: Redirect to PayHere
// Use PayHere checkout integration with the payment details
```

## PayHere Integration

For sandbox testing:
- Sandbox URL: `https://sandbox.payhere.lk/pay/checkout`

For production:
- Production URL: `https://www.payhere.lk/pay/checkout`

Make sure to configure your PayHere merchant account with:
- Notify URL: `https://yourdomain.com/api/payment/notify`
- Return URL: `https://yourdomain.com/api/payment/return`
- Cancel URL: `https://yourdomain.com/api/payment/cancel`
