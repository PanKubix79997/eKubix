import { NextResponse } from "next/server"; 
import { cookies } from "next/headers";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
export const runtime = "nodejs";

interface ChangePasswordBody {
  oldPassword: string;
  newPassword: string;
}

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ekubix_token")?.value;
  if (!token) throw new Error("Nie jesteś zalogowany");

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    const client = await clientPromise;
    const db = client.db("eKubix");

    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.id) });
    if (!user) throw new Error("Nie znaleziono użytkownika");

    return user;
  } catch {
    throw new Error("Nieprawidłowy token");
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body: ChangePasswordBody = await req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ message: "Brak wymaganych danych" }, { status: 400 });
    }

    if (currentUser.password !== oldPassword) {
      return NextResponse.json({ message: "Stare hasło jest nieprawidłowe" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    await db.collection("users").updateOne(
      { _id: currentUser._id },
      { $set: { password: newPassword } }
    );

    return NextResponse.json({ message: "Hasło zostało zmienione" }, { status: 200 });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Błąd serwera";
    return NextResponse.json({ message }, { status: 500 });
  }
}
