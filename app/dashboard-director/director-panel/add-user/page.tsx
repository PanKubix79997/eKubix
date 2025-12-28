"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const subjects = [
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
  "Chemia",
];

const classes = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8",
  "1 liceum", "2 liceum", "3 liceum", "4 liceum", "klasa maturalna"
];

export default function AddUserPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("student");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [school, setSchool] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Pobranie danych zalogowanego dyrektora
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Brak autoryzacji");
        return res.json();
      })
      .then(data => setSchool(data.school || ""))
      .catch(() => setSchool(""));
  }, []);

  const handleSubjectChange = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const body: any = { firstName, lastName, role, login, password, school };
    if (role === "student") {
      body.subjects = selectedSubjects;
      body.class = selectedClass;
    }

    try {
      const res = await fetch("/api/director/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMessage(data.message || "Błąd serwera");
        return;
      }

      setStatusMessage("Konto dodane pomyślnie");
      setTimeout(() => router.push("/dashboard-director/director-panel"), 1000);
    } catch {
      setStatusMessage("Błąd serwera");
    }
  };

  return (
    <div className="min-h-screen bg-yellow-200 p-6 flex justify-center items-start">
      <div className="bg-white p-6 rounded shadow max-w-xl w-full">
        <h2 className="text-lg font-bold mb-4 text-center">Dodaj użytkownika</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Imię */}
          <div>
            <label className="block font-semibold mb-1">Imię</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="p-2 border w-full rounded"
              required
            />
          </div>

          {/* Nazwisko */}
          <div>
            <label className="block font-semibold mb-1">Nazwisko</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="p-2 border w-full rounded"
              required
            />
          </div>

          {/* Rola */}
          <div>
            <label className="block font-semibold mb-1">Rola</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="p-2 border w-full rounded"
            >
              <option value="student">Student</option>
              <option value="teacher">Nauczyciel</option>
              <option value="director">Dyrektor</option>
            </select>
          </div>

          {/* Login */}
          <div>
            <label className="block font-semibold mb-1">Login</label>
            <input
              type="text"
              value={login}
              onChange={e => setLogin(e.target.value)}
              className="p-2 border w-full rounded"
              required
            />
          </div>

          {/* Hasło */}
          <div>
            <label className="block font-semibold mb-1">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="p-2 border w-full rounded"
              required
            />
          </div>

          {/* Szkoła */}
          <div>
            <label className="block font-semibold mb-1">Szkoła</label>
            <input
              type="text"
              value={school}
              readOnly
              className="p-2 border w-full rounded bg-gray-100"
            />
          </div>

          {/* Przedmioty i klasa tylko dla studenta */}
          {role === "student" && (
            <>
              <div>
                <label className="block font-semibold mb-1">Przedmioty</label>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto border p-2 rounded">
                  {subjects.map(subject => (
                    <label key={subject} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject)}
                        onChange={() => handleSubjectChange(subject)}
                      />
                      {subject}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Klasa</label>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="p-2 border w-full rounded"
                  required
                >
                  <option value="">Wybierz klasę</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="bg-green-500 text-white p-3 rounded hover:bg-green-600"
          >
            Dodaj użytkownika
          </button>

          {statusMessage && (
            <div className="text-center text-green-600 mt-2">{statusMessage}</div>
          )}
        </form>
      </div>
    </div>
  );
}
