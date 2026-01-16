"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type TermEvent = {
  subject: string;
  category: string;
  date: string;
  title: string;
  content: string;
  teacher: string;
};

export default function ViewTerminationsPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState(""); // Imię i nazwisko
  const [firstName, setFirstName] = useState(""); // Imię tylko do komunikatu
  const [events, setEvents] = useState<TermEvent[]>([]);

  // Pobierz dane zalogowanego ucznia
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const name = data.name || "";
        const surname = data.surname || "";
        setFullName(`${name} ${surname}`);
        setFirstName(name);
      })
      .catch(() => {
        setFullName("");
        setFirstName("");
      });
  }, []);

  // Pobierz wydarzenia dla klasy ucznia
  useEffect(() => {
    fetch("/api/student/terms", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.events)) setEvents(data.events);
        else setEvents([]);
      })
      .catch(() => setEvents([]));
  }, []);

  return (
    <div className="min-h-screen bg-yellow-200 text-black font-semibold">
      {/* HEADER */}
      <header className="flex justify-between items-center p-4 bg-yellow-300 font-semibold text-black">
        <h1 className="text-xl font-bold">Wydarzenia dla ucznia: {firstName}</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">
            Zalogowano jako: <b>{fullName}</b>{" "}
            <span className="relative group cursor-pointer text-blue-600 hover:text-green-600 font-bold">
              u?
              <span className="absolute left-0 top-full mt-1 w-64 p-2 rounded bg-green-100 text-green-800 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-semibold z-10 shadow">
                Nie jesteś uczniem? W takim razie powinieneś zalogować się na konto bez literki u.
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
      <main className="p-6 text-black font-semibold">
        {events.length === 0 ? (
          <p>Brak wydarzeń dla {firstName}</p>
        ) : (
          <div className="bg-white p-6 rounded shadow">
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
          </div>
        )}
      </main>
    </div>
  );
}
