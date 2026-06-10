```javascript
import { NextResponse } from "next/server";
import { db, admin } from "@/lib/firebaseAdmin";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

export async function GET() {
  try {
    const snapshot = await db.collection("services").orderBy("created_at", "desc").get();
    const services = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(services);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userHeader = request.headers.get("x-user");
    if (!userHeader) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    const { username: seller_id } = JSON.parse(userHeader);

    const { title, titleEn, description, descriptionEn, price, category, image } = await request.json();

    if (!title || !price || parseFloat(price) < 0.01) {
      return NextResponse.json({ error: "السعر يجب أن يكون 0.01 Pi على الأقل" }, { status: 400 });
    }
    if (title.length > 100) return NextResponse.json({ error: "العنوان طويل جداً" }, { status: 400 });

    const cleanTitle = purify.sanitize(title);
    const cleanTitleEn = titleEn ? purify.sanitize(titleEn) : "";
    const cleanDesc = purify.sanitize(description);
    const cleanDescEn = descriptionEn ? purify.sanitize(descriptionEn) : "";

    const docRef = await db.collection("services").add({
      title: cleanTitle,
      titleEn: cleanTitleEn,
      description: cleanDesc,
      descriptionEn: cleanDescEn,
      price: parseFloat(price),
      category,
      image,
      seller_id,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}
```
