```javascript
import { NextResponse } from "next/server";
import axios from "axios";
import { db, admin } from "@/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const { paymentId, txid } = await request.json();
    const piSecret = process.env.PI_APP_SECRET;

    await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      { txid },
      { headers: { Authorization: `Key ${piSecret}` } }
    );

    const paymentRes = await axios.get(`https://api.minepi.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Key ${piSecret}` },
    });
    const payment = paymentRes.data;
    const metadata = JSON.parse(payment.metadata);
    const { serviceId, buyerUsername } = metadata;

    const orderId = `${buyerUsername}_${serviceId}_${paymentId}`;
    await db.collection("orders").doc(orderId).set({
      buyerUsername,
      serviceId,
      paymentId,
      amount: parseFloat(payment.amount),
      status: "completed",
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection("services").doc(serviceId).update({
      boughtCount: admin.firestore.FieldValue.increment(1),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```
