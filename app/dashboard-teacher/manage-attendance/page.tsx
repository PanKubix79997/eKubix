"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const classes = [
  "0","1","2","3","4","5","6","7","8",
  "1 liceum","2 liceum","3 liceum","4 liceum","klasa maturalna"
];

const subjects = [
  "Matematyka",
  "Język polski",
  "Muzyka",
  "Plastyka",
  "Technika",
  "Wychowanie fizyczne",
  "Edukacja zdrowotna",
  "Biologia",
  "Geografia",
  "Chemia",
  "Fizyka",
  "Informatyka",
  "Język niemiecki",
  "Język angielski",
  "Zajęcia opiekuńczo-wychowawcze"
];

const statusOptions = [
  "Obecny",
  "Nieobecny",
  "Spóźniony",
  "Nieobecność usprawiedliwiona",
  "Zwolniony",
];

export default function ManageAttendancePage() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // Pobierz dane zalogowanego nauczyciela
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUserName(`${data.name} ${data.surname}`)) // 👈 imię i nazwisko
      .catch(() => setUserName(""));
  }, []);

  const handleCheckStudents = async () => {
    if (!selectedClass || !selectedSubject) return;

    try {
      const res = await fetch(
        `/api/teacher/attendance?class=${selectedClass}&subject=${selectedSubject}`
      );
      const data = await res.json();
      setStudents(data.students || []);
      setStatusMessage("");
    } catch {
      setStudents([]);
      setStatusMessage("Błąd pobierania uczniów");
    }
  };

  const handleSaveAttendance = async () => {
    const studentsAttendance = students
      .filter((s) => s.attendance)
      .map((s) => ({ studentId: s._id, status: s.attendance }));

    try {
      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedClass, subject: selectedSubject, date, studentsAttendance }),
      });
      const data = await res.json();
      setStatusMessage(data.message);
    } catch {
      setStatusMessage("Błąd zapisywania frekwencji");
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === studentId ? { ...s, attendance: status } : s))
    );
  };

  return (
    <div className="min-h-screen bg-yellow-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-bold">Sprawdź frekwencję</div>
        <div className="flex items-center gap-4">
          <span>Zalogowano jako: {userName}</span>
          <button
            onClick={() => router.push("/logout")}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Wyloguj się
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-4 items-center">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="p-2 rounded border"
        >
          <option value="">Wybierz klasę</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="p-2 rounded border"
        >
          <option value="">Wybierz przedmiot</option>
          {subjects.map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 rounded border"
        />

        <button
          onClick={handleCheckStudents}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Sprawdź uczniów
        </button>
      </div>

      {students.length > 0 && (
        <table className="w-full border-collapse border border-gray-400 bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">Imię</th>
              <th className="border px-2 py-1">Nazwisko</th>
              <th className="border px-2 py-1">Frekwencja</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id}>
                <td className="border px-2 py-1">{s.name}</td>
                <td className="border px-2 py-1">{s.surname}</td>
                <td className="border px-2 py-1 flex gap-2 flex-wrap">
                  {statusOptions.map((status) => (
                    <label key={status} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name={`attendance-${s._id}`}
                        checked={s.attendance === status}
                        onChange={() => handleStatusChange(s._id, status)}
                      />
                      {status}
                    </label>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {students.length > 0 && (
        <div className="mt-4">
          <button
            onClick={handleSaveAttendance}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Zapisz frekwencję
          </button>
        </div>
      )}

      {statusMessage && <div className="mt-4 text-lg text-center">{statusMessage}</div>}
    </div>
  );
}
