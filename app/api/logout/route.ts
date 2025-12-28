import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.set("ekubix_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // usuwa cookie
    });

    return NextResponse.json(
      { message: "Wylogowano pomyślnie" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Błąd wylogowania" },
      { status: 500 }
    );
  }
}
