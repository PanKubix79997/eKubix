"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

type Student = {
  _id: string;
  name: string;
  surname: string;
};

type Teacher = {
  name: string;
  surname: string;
};

export default function AddNotesPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId") || "";
  const selectedClass = searchParams.get("class") || "";

  const [student, setStudent] = useState<Student | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("pozytywna");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const studentRes = await fetch(`/api/teacher/students?class=${selectedClass}`);
        const studentData = await studentRes.json();
        const foundStudent = studentData.students.find(
          (s: Student) => s._id === studentId
        );
        setStudent(foundStudent || null);

        const teacherRes = await fetch("/api/me");
        const teacherData = await teacherRes.json();
        if (teacherData.name && teacherData.surname) {
          setTeacher({ name: teacherData.name, surname: teacherData.surname });
        } else {
          setTeacher(null);
        }
      } catch {
        setStudent(null);
        setTeacher(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, selectedClass]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !teacher) return;

    try {
      const res = await fetch("/api/teacher/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          class: selectedClass,
          title,
          type,
          content,
          date: new Date().toISOString(),
          teacher: { name: teacher.name, surname: teacher.surname },
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "❌ Błąd dodawania uwagi");
        setIsError(true);
        return;
      }

      setMessage("✅ Uwaga została dodana poprawnie!");
      setIsError(false);
      setTitle("");
      setType("pozytywna");
      setContent("");
    } catch {
      setMessage("❌ Błąd serwera");
      setIsError(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black font-semibold">
        Ładowanie danych...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-200 p-6 text-black font-semibold">
      <h1 className="text-xl font-bold mb-4 text-black">
        Dodaj uwagę
      </h1>

      {student ? (
        <div className="mb-4 font-semibold text-black">
          <div>
            Uczeń: <b className="font-bold">{student.name} {student.surname}</b>
          </div>
          <div>
            Klasa: <b className="font-bold">{selectedClass}</b>
          </div>
        </div>
      ) : (
        <div className="mb-4 text-red-600 font-bold">
          Nie znaleziono ucznia.
        </div>
      )}

      {teacher && (
        <div className="mb-4 font-semibold text-black">
          Nauczyciel: <b className="font-bold">{teacher.name} {teacher.surname}</b>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-md font-semibold text-black"
      >
        <input
          type="text"
          placeholder="Tytuł uwagi"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="p-2 rounded border font-semibold text-black"
          required
        />

        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="p-2 rounded border font-semibold text-black"
        >
          <option value="pozytywna">Pozytywna</option>
          <option value="negatywna">Negatywna</option>
        </select>

        <textarea
          placeholder="Treść uwagi"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="p-2 rounded border font-semibold text-black"
          rows={5}
          required
        />

        <input
          type="text"
          value={teacher ? `${teacher.name} ${teacher.surname}` : ""}
          readOnly
          className="p-2 rounded border bg-gray-100 cursor-not-allowed font-semibold text-black"
        />

        <button
          type="submit"
          disabled={!student || !teacher}
          className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-bold ${
            !student || !teacher ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Dodaj uwagę
        </button>

        {message && (
          <div
            className={`mt-2 font-bold ${
              isError ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
