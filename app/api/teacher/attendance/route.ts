import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const selectedClass = searchParams.get("class");
    const subject = searchParams.get("subject");

    if (!selectedClass || !subject) return NextResponse.json({ students: [] });

    const client = await clientPromise;
    const db = client.db();

    const students = await db
      .collection("users")
      .find({ role: "student", class: selectedClass })
      .project({ name: 1, surname: 1 })
      .toArray();

    const attendanceRecords = await db
      .collection("attendance")
      .find({
        class: selectedClass,
        subject,
        date: new Date().toISOString().split("T")[0],
      })
      .toArray();

    const studentsWithAttendance = students.map((s) => {
      const record = attendanceRecords.find(
        (r) => r.studentId.toString() === s._id.toString()
      );
      return {
        _id: s._id,
        name: s.name,
        surname: s.surname,
        attendance: record?.status || null,
      };
    });

    return NextResponse.json({ students: studentsWithAttendance });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ students: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { selectedClass, subject, date, studentsAttendance } = await req.json();
    if (!selectedClass || !subject || !date || !studentsAttendance) {
      return NextResponse.json({ message: "Nieprawidłowe dane" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const bulkOps = studentsAttendance.map((s: { studentId: string; status: string }) => ({
      updateOne: {
        filter: {
          studentId: new ObjectId(s.studentId),
          class: selectedClass,
          subject,
          date,
        },
        update: { $set: { status: s.status } },
        upsert: true,
      },
    }));

    if (bulkOps.length === 0) {
      return NextResponse.json(
        { message: "Nie sprawdzono wszystkim uczniom!" },
        { status: 400 }
      );
    }

    await db.collection("attendance").bulkWrite(bulkOps);

    return NextResponse.json({ message: "Frekwencja została zapisana pomyślnie!" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Błąd zapisywania frekwencji" },
      { status: 500 }
    );
  }
}
