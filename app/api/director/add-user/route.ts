import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

interface NewUser {
  name: string;
  surname: string;
  role: "student" | "teacher" | "director";
  login: string;
  password: string;
  school: string;
  subjects?: string[];
  class?: string;
  createdAt: Date;
}

interface AddUserBody {
  firstName: string;
  lastName: string;
  role: "student" | "teacher" | "director";
  login: string;
  password: string;
  subjects?: string[];
  class?: string;
}

async function getCurrentDirector(req: Request) {
  const cookie = req.headers.get("cookie");
  const token = cookie?.match(/ekubix_token=([^;]+)/)?.[1];
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
    const body: AddUserBody = await req.json();
    const { firstName, lastName, role, login, password, subjects, class: className } = body;

    if (!firstName || !lastName || !role || !login || !password) {
      return NextResponse.json({ message: "Brak wymaganych danych" }, { status: 400 });
    }

    if (!["student", "teacher", "director"].includes(role)) {
      return NextResponse.json({ message: "Nieprawidłowa rola" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const existing = await db.collection("users").findOne({ login, school: director.school });
    if (existing) return NextResponse.json({ message: "Użytkownik z tym loginem już istnieje" }, { status: 400 });

    const newUser: NewUser = {
      name: firstName,
      surname: lastName,
      role,
      login,
      password,
      school: director.school,
      createdAt: new Date(),
      subjects: role === "student" ? (Array.isArray(subjects) ? subjects : []) : undefined,
      class: role === "student" ? className || "" : undefined,
    };

    const result = await db.collection("users").insertOne(newUser);

    return NextResponse.json({ message: "Konto dodane pomyślnie", id: result.insertedId }, { status: 200 });
  } catch (err: unknown) {
    console.error("ADD USER API ERROR:", err);
    const message = err instanceof Error ? err.message : "Błąd serwera";
    const status = message.includes("Brak uprawnień") || message.includes("Nie jesteś zalogowany") ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}
