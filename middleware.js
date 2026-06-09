```javascript
import { NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // السماح لمسارات المصادقة والدفع بالمرور دون JWT
  if (pathname === "/api/auth/pi" || pathname === "/api/pi/approve" || pathname === "/api/pi/complete") {
    return NextResponse.next();
  }

  // فحص JWT لبقية مسارات API
  if (pathname.startsWith("/api/")) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "غير مصرح به" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "رمز غير صالح" }, { status: 401 });
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user", JSON.stringify(decoded));
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
```