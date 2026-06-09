```javascript
import { NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const { paymentId } = await request.json();
    const piSecret = process.env.PI_APP_SECRET;

    const paymentRes = await axios.get(`https://api.minepi.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Key ${piSecret}` },
    });
    const payment = paymentRes.data;

    let metadata;
    try {
      metadata = JSON.parse(payment.metadata);
    } catch {
      return NextResponse.json({ error: "بيانات الدفع غير صالحة" }, { status: 400 });
    }
    const { serviceId } = metadata;

    const serviceDoc = await db.collection("services").doc(serviceId).get();
    if (!serviceDoc.exists) {
      return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 });
    }
    const service = serviceDoc.data();

    // مقارنة نصية لتجنب أخطاء الفاصلة العائمة
    if (String(payment.amount) !== String(service.price)) {
      return NextResponse.json({ error: "تلاعب بالسعر - تم الرفض" }, { status: 400 });
    }

    return NextResponse.json({ success: true, service });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```
