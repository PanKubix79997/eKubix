"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Student = {
  _id: string;
  name: string;
  surname: string;
};

const classes = [
  "0","1","2","3","4","5","6","7","8",
  "1 liceum","2 liceum","3 liceum","4 liceum","klasa maturalna"
];

export default function ManageNotesPage() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [userName, setUserName] = useState("");

  // Pobierz zalogowanego nauczyciela
  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(data => setUserName(`${data.name} ${data.surname}`))
      .catch(() => setUserName(""));
  }, []);

  // Pobierz uczniów po wybranej klasie
  const handleCheckStudents = async () => {
    if (!selectedClass) return;
    const res = await fetch(`/api/teacher/students?class=${selectedClass}`);
    const data = await res.json();
    setStudents(data.students || []);
  };

  return (
    <div className="min-h-screen bg-yellow-200 p-6">
      {/* Nagłówek */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-bold">Zarządzanie uwagami</div>
        <div className="flex items-center gap-4">
          <span>Zalogowano jako: {userName}</span>
          <button onClick={() => router.push("/account-settings")} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Ustawienia konta</button>
          <button onClick={() => router.push("/logout")} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Wyloguj się</button>
        </div>
      </div>

      {/* Wybór klasy */}
      <div className="mb-4 flex gap-4 items-center">
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="p-2 rounded border">
          <option value="">Wybierz klasę</option>
          {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
        </select>
        <button
          onClick={handleCheckStudents}
          disabled={!selectedClass}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Pokaż uczniów
        </button>
      </div>

      {/* Lista uczniów */}
      <table className="w-full border-collapse border border-gray-400 bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Imię</th>
            <th className="border px-2 py-1">Nazwisko</th>
            <th className="border px-2 py-1">Akcja</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student._id}>
              <td className="border px-2 py-1">{student.name}</td>
              <td className="border px-2 py-1">{student.surname}</td>
              <td className="border px-2 py-1">
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  onClick={() => router.push(`/dashboard-teacher/manage-notes/add-note?studentId=${student._id}&class=${selectedClass}`)}
                >
                  Dodaj uwagę
                </button>
              </td>
            </tr>
          ))}
          {students.length === 0 && selectedClass && (
            <tr>
              <td colSpan={3} className="text-center py-4">Brak uczniów w tej klasie.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
