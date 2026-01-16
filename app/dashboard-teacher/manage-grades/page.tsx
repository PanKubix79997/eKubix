"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Student = {
  _id: string;
  name: string;
  surname: string;
  grades: Record<string, string[]>;
  gradeIds: string[];
};

const classes = [
  "0","1","2","3","4","5","6","7","8",
  "1 liceum","2 liceum","3 liceum","4 liceum","klasa maturalna"
];

const subjectsPerClass: Record<string, string[]> = {};
classes.forEach(cls => {
  const basicSubjects = [
    "Matematyka","Język Polski","Edukacja zdrowotna","Geografia",
    "Wychowanie fizyczne","Doradztwo zawodowe",
    "Zajęcia opiekuńczo wychowawcze","muzyka","plastyka",
    "Edukacja do bezpieczeństwa","wiedza o społeczeństwie"
  ];
  const advancedSubjects = ["Fizyka","Chemia","Biologia","Przyroda"];
  const classNumber = parseInt(cls);
  const isAdvanced =
    (!isNaN(classNumber) && classNumber >= 7) ||
    cls.includes("liceum") ||
    cls.includes("maturalna");

  subjectsPerClass[cls] = isAdvanced
    ? [...basicSubjects, ...advancedSubjects]
    : basicSubjects;
});

export default function ManageGradesPage() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(data => setUserName(`${data.name} ${data.surname}`))
      .catch(() => setUserName(""));
  }, []);

  useEffect(() => {
    if (selectedClass && subjectsPerClass[selectedClass]) {
      setSubjects(subjectsPerClass[selectedClass]);
      setSelectedSubject("");
    } else setSubjects([]);
  }, [selectedClass]);

  const handleCheckGrades = async () => {
    if (!selectedClass || !selectedSubject) return;
    const res = await fetch(
      `/api/teacher/grades?class=${selectedClass}&subject=${selectedSubject}`
    );
    const data = await res.json();
    setStudents(data.students);
  };

  const handleDeleteGrade = async (gradeId: string) => {
    await fetch(`/api/teacher/grades?gradeId=${gradeId}`, { method: "DELETE" });
    handleCheckGrades();
  };

  return (
    <div className="min-h-screen bg-yellow-200 p-6 font-semibold text-black">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-bold">
          Witaj w dashboardzie
        </div>
        <div className="flex items-center gap-4 font-semibold">
          <span>Zalogowano jako: {userName}</span>
          <button
            onClick={() => router.push("/account-settings")}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 font-bold"
          >
            Ustawienia konta
          </button>
          <button
            onClick={() => router.push("/logout")}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 font-bold"
          >
            Wyloguj się
          </button>
        </div>
      </div>

      {/* FILTRY */}
      <div className="mb-4 flex gap-4 items-center font-semibold">
        <select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          className="p-2 rounded border font-semibold text-black"
        >
          <option value="">Wybierz klasę</option>
          {classes.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>

        <select
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
          className="p-2 rounded border font-semibold text-black"
          disabled={!selectedClass}
        >
          <option value="">Wybierz przedmiot</option>
          {subjects.map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>

        <button
          onClick={handleCheckGrades}
          disabled={!selectedClass || !selectedSubject}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 font-bold"
        >
          Sprawdź oceny
        </button>
      </div>

      {/* TABELA */}
      <table className="w-full border-collapse border border-gray-400 bg-white text-black">
        <thead>
          <tr className="bg-gray-200 font-bold">
            <th className="border px-2 py-1">Imię</th>
            <th className="border px-2 py-1">Nazwisko</th>
            <th className="border px-2 py-1">
              Oceny ({selectedSubject || "-"})
            </th>
            <th className="border px-2 py-1">Akcja</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student._id} className="font-semibold">
              <td className="border px-2 py-1">{student.name}</td>
              <td className="border px-2 py-1">{student.surname}</td>
              <td className="border px-2 py-1">
                {student.grades[selectedSubject]?.map((g, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 mr-2 font-bold">
                    {g}
                    <button
                      className="bg-red-500 text-white px-1 rounded hover:bg-red-600 font-bold"
                      onClick={() => handleDeleteGrade(student.gradeIds[idx])}
                    >
                      X
                    </button>
                  </span>
                )) || "-"}
              </td>
              <td className="border px-2 py-1">
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 font-bold"
                  onClick={() =>
                    router.push(
                      `/dashboard-teacher/manage-grades/add-grades?studentId=${student._id}&class=${selectedClass}&subject=${selectedSubject}`
                    )
                  }
                >
                  Dodaj ocenę
                </button>
              </td>
            </tr>
          ))}

          {students.length === 0 && selectedClass && selectedSubject && (
            <tr>
              <td colSpan={4} className="text-center py-4 font-bold">
                Brak uczniów lub ocen w tej klasie i przedmiocie.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
