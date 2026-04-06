import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="GTM Dashboard"' },
    });
  }

  try {
    const base64Credentials = authHeader.split(" ")[1];
    const credentials = atob(base64Credentials);
    const [, ...passwordParts] = credentials.split(":");
    const password = passwordParts.join(":");

    if (password !== process.env.DASHBOARD_PASSWORD) {
      return new NextResponse("Invalid credentials", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="GTM Dashboard"' },
      });
    }
  } catch {
    return new NextResponse("Invalid credentials", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="GTM Dashboard"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
