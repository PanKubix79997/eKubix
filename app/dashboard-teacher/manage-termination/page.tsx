"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Event = {
  _id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  subject: string;
  senderName: string;
  canDelete: boolean;
};

const classes = [
  "0","1","2","3","4","5","6","7","8",
  "1 liceum","2 liceum","3 liceum","4 liceum","klasa maturalna"
];

/* ✅ JEDNA WSPÓLNA LISTA PRZEDMIOTÓW */
const SUBJECTS = [
  "Matematyka",
  "Język polski",
  "Geografia",
  "Biologia",
  "Fizyka",
  "Chemia",
  "Historia",
  "Język angielski",
  "Doradztwo zawodowe",
  "Wychowanie fizyczne",
  "Zajęcia opiekuńczo-wychowawcze",
];

export default function TeacherTermsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(data => setUserName(`${data.name} ${data.surname}`))
      .catch(() => setUserName(""));
  }, []);

  const handleCheckTerms = async () => {
    if (!selectedClass) return;

    try {
      const res = await fetch(`/api/teacher/terms?class=${selectedClass}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch {
      setEvents([]);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await fetch(
        `/api/teacher/terms?eventId=${eventId}`,
        { method: "DELETE" }
      );
      if (res.ok) handleCheckTerms();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-yellow-200 p-6 font-semibold text-black">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-bold text-black">
          Terminarz wydarzeń
        </div>

        <div className="flex items-center gap-4">
          <span className="font-semibold text-black">
            Zalogowano jako: {userName}
          </span>

          <button
            onClick={() => router.push("/account-settings")}
            className="bg-blue-500 text-white font-bold px-3 py-1 rounded hover:bg-blue-600"
          >
            Ustawienia konta
          </button>

          <button
            onClick={() => router.push("/logout")}
            className="bg-red-500 text-white font-bold px-3 py-1 rounded hover:bg-red-600"
          >
            Wyloguj się
          </button>
        </div>
      </div>

      {/* FILTRY */}
      <div className="mb-4 flex gap-4 items-center">
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

        <button
          onClick={handleCheckTerms}
          disabled={!selectedClass}
          className="bg-blue-500 text-white font-bold px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Sprawdź terminarz
        </button>

        <select
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
          className="p-2 rounded border font-semibold text-black"
        >
          <option value="">Wybierz przedmiot</option>
          {SUBJECTS.map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>

        {selectedSubject && (
          <button
            className="bg-green-500 text-white font-bold px-4 py-2 rounded hover:bg-green-600"
            onClick={() =>
              router.push(
                `/dashboard-teacher/manage-termination/add-term/?subject=${selectedSubject}`
              )
            }
          >
            Dodaj
          </button>
        )}
      </div>

      {/* TABELA */}
      <table className="w-full border-collapse border border-gray-400 bg-white font-semibold text-black">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1 font-bold">Data</th>
            <th className="border px-2 py-1 font-bold">Przedmiot</th>
            <th className="border px-2 py-1 font-bold">Kategoria</th>
            <th className="border px-2 py-1 font-bold">Tytuł</th>
            <th className="border px-2 py-1 font-bold">Treść</th>
            <th className="border px-2 py-1 font-bold">Nauczyciel</th>
            <th className="border px-2 py-1 font-bold">Akcja</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4 font-semibold">
                Brak wydarzeń
              </td>
            </tr>
          ) : (
            events.map(ev => (
              <tr key={ev._id}>
                <td className="border px-2 py-1">{ev.date}</td>
                <td className="border px-2 py-1">{ev.subject}</td>
                <td className="border px-2 py-1">{ev.category}</td>
                <td className="border px-2 py-1">{ev.title}</td>
                <td className="border px-2 py-1">{ev.content}</td>
                <td className="border px-2 py-1">{ev.senderName}</td>
                <td className="border px-2 py-1">
                  {ev.canDelete && (
                    <button
                      className="bg-red-500 text-white font-bold px-2 py-1 rounded hover:bg-red-600"
                      onClick={() => handleDeleteEvent(ev._id)}
                    >
                      Usuń
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
