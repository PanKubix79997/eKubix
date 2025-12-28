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

export default function TeacherTermsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  const subjectsPerClass: Record<string, string[]> = {
    "0": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "1": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "2": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "3": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "4": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "5": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "6": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "7": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "8": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "1 liceum": ["Matematyka","Język polski","Fizyka","Chemia","Biologia","Geografia","Historia","Język angielski"],
    "2 liceum": ["Matematyka","Język polski","Fizyka","Chemia","Biologia","Geografia","Historia","Język angielski"],
    "3 liceum": ["Matematyka","Język polski","Fizyka","Chemia","Biologia","Geografia","Historia","Język angielski"],
    "4 liceum": ["Matematyka","Język polski","Fizyka","Chemia","Biologia","Geografia","Historia","Język angielski"],
    "klasa maturalna": ["Matematyka","Język polski","Fizyka","Chemia","Biologia","Geografia","Historia","Język angielski"],
  };

  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(data => setUserName(`${data.name} ${data.surname}`))
      .catch(() => setUserName(""));
  }, []);

  const handleCheckTerms = async () => {
    if (!selectedClass) return;
    setSubjects(subjectsPerClass[selectedClass] || []);
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
      const res = await fetch(`/api/teacher/terms?eventId=${eventId}`, { method: "DELETE" });
      if (res.ok) handleCheckTerms();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-bold">Terminarz wydarzeń</div>
        <div className="flex items-center gap-4">
          <span>Zalogowano jako: {userName}</span>
          <button onClick={() => router.push("/account-settings")} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Ustawienia konta</button>
          <button onClick={() => router.push("/logout")} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Wyloguj się</button>
        </div>
      </div>

      <div className="mb-4 flex gap-4 items-center">
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="p-2 rounded border">
          <option value="">Wybierz klasę</option>
          {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
        </select>

        <button
          onClick={handleCheckTerms}
          disabled={!selectedClass}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Sprawdź terminarz
        </button>

        {subjects.length > 0 && (
          <>
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="p-2 rounded border">
              <option value="">Wybierz przedmiot</option>
              {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>

            {selectedSubject && (
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={() => router.push(`/dashboard-teacher/manage-termination/add-term/?subject/${selectedSubject}`)}
              >
                Dodaj
              </button>
            )}
          </>
        )}
      </div>

      <table className="w-full border-collapse border border-gray-400 bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Data</th>
            <th className="border px-2 py-1">Przedmiot</th>
            <th className="border px-2 py-1">Kategoria</th>
            <th className="border px-2 py-1">Tytuł</th>
            <th className="border px-2 py-1">Treść</th>
            <th className="border px-2 py-1">Nauczyciel</th>
            <th className="border px-2 py-1">Akcja</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr><td colSpan={7} className="text-center py-4">Brak wydarzeń</td></tr>
          ) : events.map(ev => (
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
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDeleteEvent(ev._id)}
                  >
                    Usuń
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
