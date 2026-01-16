"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Grade = {
  subject: string;
  grade: string;
  date: string;
  title: string;
  content: string;
};

export default function ViewGradesPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [grades, setGrades] = useState<Grade[]>([]);

  // Pobierz dane użytkownika
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setName(data.name || "");
        setSurname(data.surname || "");
      })
      .catch(() => {
        setName("");
        setSurname("");
      });
  }, []);

  // Pobierz oceny
  useEffect(() => {
    fetch("/api/grades/received", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.grades)) {
          setGrades(data.grades);
        } else {
          setGrades([]);
        }
      })
      .catch(() => setGrades([]));
  }, []);

  return (
    <div className="min-h-screen bg-yellow-200 text-black font-semibold">
      {/* HEADER */}
      <header className="flex justify-between items-center p-4 bg-yellow-300">
        <h1 className="text-xl font-bold">
          Zobacz swoje oceny {name}
        </h1>

        <div className="flex items-center gap-4 text-sm font-semibold">
          <span>
            Zalogowano jako: <b>{name} {surname}</b>{" "}
            <span className="relative group cursor-pointer font-bold text-blue-600">
              u?
              <span className="absolute left-0 top-full mt-1 w-72 p-2 rounded bg-green-100 text-green-800 opacity-0 group-hover:opacity-100 transition-opacity text-xs shadow z-10">
                Nie jesteś uczniem? W takim razie powinieneś zalogować się na konto bez literki „u”.
              </span>
            </span>
          </span>

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
      </header>

      {/* CONTENT */}
      <main className="p-6">
        <div className="bg-white p-6 rounded shadow">
          {grades.length === 0 ? (
            <p className="font-semibold">Brak ocen</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Przedmiot</th>
                  <th className="border p-2 text-left">Ocena</th>
                  <th className="border p-2 text-left">Data</th>
                  <th className="border p-2 text-left">Tytuł</th>
                  <th className="border p-2 text-left">Opis</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g, index) => (
                  <tr key={index} className="bg-gray-50">
                    <td className="border p-2">{g.subject}</td>
                    <td className="border p-2 font-bold">{g.grade}</td>
                    <td className="border p-2">{g.date}</td>
                    <td className="border p-2">{g.title}</td>
                    <td className="border p-2">{g.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
