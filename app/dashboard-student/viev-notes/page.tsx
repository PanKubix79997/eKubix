"use client";

import { useEffect, useState } from "react";

type Note = {
  _id: string;
  title: string;
  type: "pozytywna" | "negatywna";
  content: string;
  date: string;
  teacher: {
    name: string;
    surname: string;
  };
};

export default function ViewNotesPage() {
  const [userName, setUserName] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Pobierz imię ucznia
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data?.name) setUserName(data.name);
      })
      .catch(() => setUserName(""));
  }, []);

  // Pobierz uwagi ucznia
  useEffect(() => {
    fetch("/api/student/notes", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.notes)) {
          setNotes(data.notes);
        } else {
          setNotes([]);
        }
      })
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-yellow-200 p-6">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-4">
          Twoje uwagi {userName}
        </h2>

        {loading ? (
          <p>Ładowanie uwag...</p>
        ) : notes.length === 0 ? (
          <p>Brak uwag</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Data</th>
                <th className="border p-2 text-left">Typ</th>
                <th className="border p-2 text-left">Tytuł</th>
                <th className="border p-2 text-left">Treść</th>
                <th className="border p-2 text-left">Nauczyciel</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((n) => (
                <tr key={n._id} className="bg-gray-50">
                  <td className="border p-2">
                    {new Date(n.date).toLocaleDateString()}
                  </td>
                  <td
                    className={`border p-2 font-bold ${
                      n.type === "pozytywna"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {n.type}
                  </td>
                  <td className="border p-2">{n.title}</td>
                  <td className="border p-2">{n.content}</td>
                  <td className="border p-2">
                    {n.teacher?.name} {n.teacher?.surname}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
