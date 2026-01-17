"use client";

import { useState } from "react";

/* ===================== DANE ===================== */
const subjectsList = [
  "Matematyka",
  "Język polski",
  "Przyroda",
  "Geografia",
  "Biologia",
  "Doradztwo zawodowe",
  "Edukacja zdrowotna",
  "Wychowanie fizyczne",
  "Zajęcia opiekuńczo-wychowawcze",
  "Fizyka",
  "Chemia" ,
  "edukacja do bezpieczeństwa" ,
  "wiedza o społeczeńswie" ,
  "Muzyka" ,
  "PLastyka" ,
  "zajęcia Wyrównawcze" ,
  "zajęcia dodatkowe" ,
  "Informatyka" ,
  "język angielski" ,
  "język niemiecki"
];

const classesList = [
  "Wybierz",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "1 klasa liceum",
  "2 klasa liceum",
  "3 klasa liceum",
  "4 klasa liceum",
  "Klasa maturalna"
];

/* ===================== KOMPONENT ===================== */
export default function AddUserPage() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "admin" | "director">("student");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [school, setSchool] = useState("");

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("Wybierz");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  /* ===================== HANDLERY ===================== */
  const handleSubjectChange = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const body: any = {
      name,
      surname,
      role,
      login,
      password,
    };

    if (role !== "admin") {
      body.school = school;
    }

    if (role === "student") {
      body.subjects = selectedSubjects;
      body.class = selectedClass;
    }

    try {
      const res = await fetch("/api/admin/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setSuccess(false);
        setMessage(data.message || "Błąd podczas dodawania użytkownika");
        return;
      }

      setSuccess(true);
      setMessage("Użytkownik został dodany pomyślnie!");

      /* reset formularza */
      setName("");
      setSurname("");
      setRole("student");
      setLogin("");
      setPassword("");
      setSchool("");
      setSelectedSubjects([]);
      setSelectedClass("Wybierz");

    } catch {
      setSuccess(false);
      setMessage("Błąd serwera");
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="min-h-screen bg-yellow-200 flex items-center justify-center font-semibold text-black">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Dodaj nowego użytkownika
        </h1>

        {message && (
          <div
            className={`mb-4 p-2 rounded font-bold ${
              success
                ? "bg-green-200 text-green-800"
                : "bg-red-200 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Imię"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border p-2 rounded font-bold"
          />

          <input
            type="text"
            placeholder="Nazwisko"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
            className="border p-2 rounded font-bold"
          />

          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value as any);
              if (e.target.value === "admin") setSchool("");
            }}
            className="border p-2 rounded font-bold"
          >
            <option value="student">Student</option>
            <option value="teacher">Nauczyciel</option>
            <option value="director">Dyrektor</option>
            <option value="admin">Admin</option>
          </select>

          <input
            type="text"
            placeholder="Login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            className="border p-2 rounded font-bold"
          />

          <input
            type="text"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border p-2 rounded font-bold"
          />

          {/* SZKOŁA – ZNIKA DLA ADMINA */}
          {role !== "admin" && (
            <input
              type="text"
              placeholder="Szkoła"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              required
              className="border p-2 rounded font-bold"
            />
          )}

          {/* DODATKOWE POLA DLA STUDENTA */}
          {role === "student" && (
            <>
              <div>
                <label className="font-bold">Przedmioty</label>
                <div className="flex flex-wrap gap-2 border p-2 rounded max-h-40 overflow-auto font-bold">
                  {subjectsList.map((s) => (
                    <label key={s} className="flex items-center gap-1 font-bold">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(s)}
                        onChange={() => handleSubjectChange(s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold">Klasa</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="border p-2 rounded w-full font-bold"
                >
                  {classesList.map((cls) => (
                    <option key={cls} value={cls} className="font-bold">
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 font-bold"
          >
            Dodaj użytkownika
          </button>
        </form>
      </div>
    </div>
  );
}
