```javascript
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function GET(request) {
  const userHeader = request.headers.get("x-user");
  if (!userHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { username } = JSON.parse(userHeader);

  try {
    const ordersSnap = await db.collection("orders").where("buyerUsername", "==", username).get();
    const orders = ordersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```
