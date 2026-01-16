import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId, InsertOneResult } from "mongodb";

interface User {
  _id?: ObjectId;
  name: string;
  surname: string;
  role: "student" | "teacher" | "director" | "admin";
  login: string;
  password: string;
  school?: string;
  subjects?: string[];
  class?: string;
  createdAt: Date;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      surname,
      role,
      login,
      password,
      school,
      subjects,
      class: studentClass,
    } = body;

    // 🔒 PODSTAWOWE POLA – ZAWSZE
    if (!name || !surname || !role || !login || !password) {
      return NextResponse.json(
        { message: "Wypełnij wszystkie wymagane pola" },
        { status: 400 }
      );
    }

    // 🔒 SCHOOL – wymagane dla NIE-admina
    if (role !== "admin" && !school) {
      return NextResponse.json(
        { message: "Pole szkoła jest wymagane" },
        { status: 400 }
      );
    }

    // 🔒 STUDENT – dodatkowe wymagania
    if (role === "student") {
      if (!studentClass || !Array.isArray(subjects)) {
        return NextResponse.json(
          { message: "Uczeń musi mieć klasę i przedmioty" },
          { status: 400 }
        );
      }
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    // 🔒 Login unikalny
    const existing = await db.collection("users").findOne({ login });
    if (existing) {
      return NextResponse.json(
        { message: "Login już istnieje" },
        { status: 400 }
      );
    }

    // ✅ TWORZENIE UŻYTKOWNIKA
    const newUser: User = {
      name,
      surname,
      role,
      login,
      password,
      createdAt: new Date(),
    };

    if (role !== "admin") {
      newUser.school = school;
    }

    if (role === "student") {
      newUser.subjects = subjects;
      newUser.class = studentClass;
    }

    const result: InsertOneResult<User> =
      await db.collection<User>("users").insertOne(newUser);

    return NextResponse.json(
      {
        message: "Użytkownik dodany pomyślnie",
        userId: result.insertedId.toString(),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Błąd w /api/admin/users/add:", err);
    return NextResponse.json(
      { message: "Błąd serwera" },
      { status: 500 }
    );
  }
}
