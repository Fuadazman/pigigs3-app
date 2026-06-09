```javascript
import { NextResponse } from "next/server";
import { validatePiAccessToken } from "@/lib/validatePiToken";
import { signToken } from "@/lib/jwt";
import { db } from "@/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const { accessToken } = await request.json();
    if (!accessToken) {
      return NextResponse.json({ error: "رمز الوصول مطلوب" }, { status: 400 });
    }

    const piUser = await validatePiAccessToken(accessToken);
    if (!piUser || !piUser.username) {
      return NextResponse.json({ error: "فشل التحقق من Pi" }, { status: 401 });
    }

    const username = piUser.username;
    const userRef = db.collection("users").doc(username);
    await userRef.set({ username, lastLogin: new Date() }, { merge: true });

    const jwtToken = signToken({ username });
    return NextResponse.json({ token: jwtToken, username });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}
```
