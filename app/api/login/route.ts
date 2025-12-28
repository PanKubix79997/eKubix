// app/api/login/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import type { MongoClient } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("Brak JWT_SECRET w .env");

export async function POST(req: Request) {
  try {
    // Pobranie danych z requestu
    const { login, password } = await req.json();

    if (!login || !password) {
      return NextResponse.json({ message: "Podaj login i hasło" }, { status: 400 });
    }

    // Połączenie z MongoDB
    const client: MongoClient = await clientPromise;
    const db = client.db("eKubix");

    // Szukamy użytkownika
    const user = await db.collection("users").findOne({ login });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: "Login i/lub hasło jest nieprawidłowe. Jeśli nie pamiętasz hasła, skontaktuj się z administratorem w swojej szkole." },
        { status: 401 }
      );
    }

    // Tworzymy token JWT ważny 1 dzień
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" } // 1 dzień
    );

    // Tworzymy odpowiedź JSON
    const res = NextResponse.json({
      message: "Zalogowano poprawnie",
      role: user.role,
    });

    // Ustawiamy token w HTTP-only cookie
    res.cookies.set("ekubix_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 dzień w sekundach
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err) {
    console.error("LOGIN API ERROR:", err);
    return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
  }
}
