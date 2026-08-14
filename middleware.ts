import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const authHeader = req.headers.get("authorization");

    if (authHeader) {
      try {
        const authValue = authHeader.split(" ")[1] || "";
        // Use standard web API 'atob' instead of Node 'Buffer'
        const decoded = atob(authValue);
        const [username, password] = decoded.split(":");

        const validUser = process.env.ADMIN_USERNAME;
        const validPass = process.env.ADMIN_PASSWORD;

        if (username === validUser && password === validPass) {
          return NextResponse.next();
        }
      } catch (err) {
        console.error("Middleware auth decoding error:", err);
      }
    }

    // Trigger browser auth prompt
    return new NextResponse("Authentication Required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Access Required"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};