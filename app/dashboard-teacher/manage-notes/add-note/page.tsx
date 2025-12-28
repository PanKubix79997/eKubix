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

  // Pobierz dane ucznia i nauczyciela
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Pobranie ucznia
        const studentRes = await fetch(`/api/teacher/students?class=${selectedClass}`);
        const studentData = await studentRes.json();
        const foundStudent = studentData.students.find((s: Student) => s._id === studentId);
        setStudent(foundStudent || null);

        // Pobranie nauczyciela
        const teacherRes = await fetch("/api/me");
        const teacherData = await teacherRes.json();
        if (teacherData.name && teacherData.surname) {
          setTeacher({
            name: teacherData.name,
            surname: teacherData.surname
          });
        } else {
          setTeacher(null);
        }
      } catch (err) {
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
          teacher: { name: teacher.name, surname: teacher.surname }
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
      <div className="min-h-screen flex items-center justify-center">
        Ładowanie danych...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-200 p-6">
      <h1 className="text-xl font-bold mb-4">Dodaj uwagę</h1>

      {student ? (
        <div className="mb-4">
          <div>Uczeń: <b>{student.name} {student.surname}</b></div>
          <div>Klasa: <b>{selectedClass}</b></div>
        </div>
      ) : (
        <div className="mb-4 text-red-600">Nie znaleziono ucznia.</div>
      )}

      {teacher && (
        <div className="mb-4">
          Nauczyciel: <b>{teacher.name} {teacher.surname}</b>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <input
          type="text"
          placeholder="Tytuł uwagi"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="p-2 rounded border"
          required
        />

        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="p-2 rounded border"
        >
          <option value="pozytywna">Pozytywna</option>
          <option value="negatywna">Negatywna</option>
        </select>

        <textarea
          placeholder="Treść uwagi"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="p-2 rounded border"
          rows={5}
          required
        />

        {/* Pole nauczyciela – tylko do podglądu */}
        <input
          type="text"
          value={teacher ? `${teacher.name} ${teacher.surname}` : ""}
          className="p-2 rounded border bg-gray-100 cursor-not-allowed"
          readOnly
        />

        <button
          type="submit"
          disabled={!student || !teacher}
          className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${!student || !teacher ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Dodaj uwagę
        </button>

        {message && (
          <div className={isError ? "text-red-600 mt-2" : "text-green-600 mt-2"}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
