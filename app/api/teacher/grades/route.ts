import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId, Document } from "mongodb";

type Grade = {
  _id: ObjectId;
  studentId: ObjectId;
  class: string;
  subject: string;
  grade: string;
  category: string;
  title: string;
  content: string;
  createdAt: Date;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const classParam = url.searchParams.get("class");
    const subject = url.searchParams.get("subject");

    if (!classParam || !subject) {
      return NextResponse.json({ message: "Brak klasy lub przedmiotu" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const students = await db.collection("users")
      .find({ role: "student", class: classParam })
      .toArray();

    const gradesDocs = await db.collection("grades")
      .find({ class: classParam, subject })
      .toArray();

    const grades: Grade[] = gradesDocs.map((g: Document) => ({
      _id: g._id,
      studentId: g.studentId,
      class: g.class,
      subject: g.subject,
      grade: g.grade,
      category: g.category,
      title: g.title,
      content: g.content,
      createdAt: g.createdAt,
    }));

    const studentsWithGrades = students.map(student => {
      const studentGrades = grades
        .filter(g => g.studentId.toString() === student._id.toString())
        .map(g => ({
          gradeId: g._id.toString(),
          grade: g.grade,
          category: g.category,
          title: g.title,
          content: g.content,
          createdAt: g.createdAt
        }));

      return {
        _id: student._id.toString(),
        name: student.name,
        surname: student.surname,
        grades: {
          [subject]: studentGrades.map(g => g.grade)
        },
        gradeIds: studentGrades.map(g => g.gradeId)
      };
    });

    return NextResponse.json({ students: studentsWithGrades }, { status: 200 });

  } catch (err) {
    console.error("Błąd GET /api/teacher/grades:", err);
    return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { studentId, class: cls, subject, grade, category, title, content } = await req.json();

    if (!studentId || !cls || !subject || !grade) {
      return NextResponse.json({ message: "Brak wymaganych danych" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    const newGrade: Omit<Grade, "_id"> = {
      studentId: new ObjectId(studentId),
      class: cls,
      subject,
      grade,
      category: category || "",
      title: title || "",
      content: content || "",
      createdAt: new Date()
    };

    const result = await db.collection("grades").insertOne(newGrade);

    return NextResponse.json({ message: "Ocena dodana pomyślnie", gradeId: result.insertedId.toString() }, { status: 201 });
  } catch (err) {
    console.error("Błąd POST /api/teacher/grades:", err);
    return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const gradeId = url.searchParams.get("gradeId");

    if (!gradeId) {
      return NextResponse.json({ message: "Brak gradeId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("eKubix");

    await db.collection("grades").deleteOne({ _id: new ObjectId(gradeId) });

    return NextResponse.json({ message: "Ocena usunięta pomyślnie" }, { status: 200 });
  } catch (err) {
    console.error("Błąd DELETE /api/teacher/grades:", err);
    return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
  }
}
