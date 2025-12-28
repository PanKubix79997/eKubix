import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// Funkcja pomocnicza – pobiera aktualnego zalogowanego dyrektora
async function getCurrentDirector(req: Request) {
  const cookie = req.headers.get("cookie");
  const match = cookie?.match(/ekubix_token=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token) throw new Error("Nie jesteś zalogowany");

  const payload = jwt.verify(token, JWT_SECRET) as { id: string; role: string };

  if (payload.role !== "director") throw new Error("Brak uprawnień");

  const client = await clientPromise;
  const db = client.db("eKubix");
  const director = await db.collection("users").findOne({ _id: new ObjectId(payload.id) });

  if (!director) throw new Error("Nie znaleziono dyrektora");

  return director;
}

export async function POST(req: Request) {
  try {
    const director = await getCurrentDirector(req);
    const body = await req.json();

    const { firstName, lastName, role, login, password, subjects, class: className } = body;

    // Walidacja podstawowa
    if (!firstName || !lastName || !role || !login || !password) {
      return NextResponse.json({ message: "Brak wymaganych danych" }, { status: 400 });
    }

    if (!["student", "teacher", "director"].includes(role)) {
      return NextResponse.json({ message: "Nieprawidłowa rola" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    // Sprawdź, czy login już istnieje w tej samej szkole
    const existing = await db.collection("users").findOne({ login, school: director.school });
    if (existing) {
      return NextResponse.json({ message: "Użytkownik z tym loginem już istnieje" }, { status: 400 });
    }

    const newUser: any = {
      name: firstName,
      surname: lastName,
      role,
      login,
      password,
      school: director.school, // automatycznie przypisana szkoła dyrektora
      createdAt: new Date(),
    };

    if (role === "student") {
      newUser.subjects = Array.isArray(subjects) ? subjects : [];
      newUser.class = className || "";
    }

    const result = await db.collection("users").insertOne(newUser);

    return NextResponse.json({ message: "Konto dodane pomyślnie", id: result.insertedId }, { status: 200 });
  } catch (err: any) {
    console.error("ADD USER API ERROR:", err);
    const status = err.message.includes("Brak uprawnień") || err.message.includes("Nie jesteś zalogowany") ? 401 : 500;
    return NextResponse.json({ message: err.message || "Błąd serwera" }, { status });
  }
}
