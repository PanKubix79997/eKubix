"use client";

import { useState, useEffect } from "react";

type TermEvent = {
  subject: string;
  category: string;
  date: string;
  title: string;
  content: string;
  teacher: string;
};

export default function ViewTerminationsPage() {
  const [userName, setUserName] = useState("");
  const [events, setEvents] = useState<TermEvent[]>([]);

  // Pobierz dane zalogowanego ucznia
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUserName(data.name))
      .catch(() => setUserName(""));
  }, []);

  // Pobierz wydarzenia dla klasy ucznia
  useEffect(() => {
    fetch("/api/student/terms", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.events)) {
          setEvents(data.events);
        } else {
          setEvents([]);
        }
      })
      .catch(() => setEvents([]));
  }, []);

  return (
    <div className="min-h-screen bg-yellow-200 p-6">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-4">
          Wydarzenia dla ucznia: {userName}
        </h2>

        {events.length === 0 ? (
          <p>Brak wydarzeń</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Przedmiot</th>
                <th className="border p-2 text-left">Kategoria</th>
                <th className="border p-2 text-left">Data</th>
                <th className="border p-2 text-left">Tytuł</th>
                <th className="border p-2 text-left">Opis</th>
                <th className="border p-2 text-left">Nauczyciel</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev, index) => (
                <tr key={index} className="bg-gray-50">
                  <td className="border p-2">{ev.subject}</td>
                  <td className="border p-2 font-bold">{ev.category}</td>
                  <td className="border p-2">{ev.date}</td>
                  <td className="border p-2">{ev.title}</td>
                  <td className="border p-2">{ev.content}</td>
                  <td className="border p-2">{ev.teacher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
