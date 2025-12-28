"use client";

import { useState, useEffect } from "react";

type Grade = {
  subject: string;
  grade: string;
  date: string;
  title: string;
  content: string;
};

export default function ViewGradesPage() {
  const [userName, setUserName] = useState("");
  const [grades, setGrades] = useState<Grade[]>([]);

  // Pobierz imię zalogowanego ucznia
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUserName(data.name))
      .catch(() => setUserName(""));
  }, []);

  // Pobierz oceny ucznia
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
    <div className="min-h-screen bg-yellow-200 p-6">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-4">
          Zobacz swoje oceny {userName}
        </h2>

        {grades.length === 0 ? (
          <p>Brak ocen</p>
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
    </div>
  );
}
