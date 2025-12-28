import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

/**
 * Node.js runtime wymagany dla jsonwebtoken
 */
export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET!;

// Mapowanie ról → dashboard
const roleToDashboard: Record<string, string> = {
  admin: "/dashboard-admin",
  student: "/dashboard-student",
  teacher: "/dashboard-teacher",
  director: "/dashboard-director",
};

// Publiczne strony (bez logowania)
const publicPaths = ["/", "/login", "/support","/terms"];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname.replace(/\/$/, "") || "/";
  const token = req.cookies.get("ekubix_token")?.value;

  // ======================
  // 1️⃣ Strony publiczne
  // ======================
  if (publicPaths.includes(pathname)) {
    if (pathname === "/login" && token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        const dashboard = roleToDashboard[payload.role?.toLowerCase()];
        if (dashboard) {
          url.pathname = dashboard;
          return NextResponse.redirect(url);
        }
      } catch {
        // niepoprawny token → pozwól wejść
      }
    }
    return NextResponse.next();
  }

  // ======================
  // 2️⃣ Brak tokenu → /login
  // ======================
  if (!token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ======================
  // 3️⃣ Weryfikacja tokena
  // ======================
  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const role = String(payload.role || "").toLowerCase();
  const allowedDashboard = roleToDashboard[role];

  if (!allowedDashboard) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ======================
  // 4️⃣ Blokada cudzych dashboardów
  // ======================
  if (
    pathname.startsWith("/dashboard-") &&
    !pathname.startsWith(`/dashboard-${role}`)
  ) {
    url.pathname = allowedDashboard;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * ======================
 * 5️⃣ MATCHER — KLUCZOWA ZMIANA
 * ======================
 * Middleware NIE DOTYKA:
 * - obrazów
 * - fontów
 * - css/js
 * - _next/*
 * - api/*
 */
export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|woff|woff2|ttf|otf)).*)",
  ],
};
