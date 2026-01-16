"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardStudent() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/me");

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        setName(data.name);
        setSurname(data.surname);
      } catch {
        setError("Nie udało się pobrać danych użytkownika.");
      }
    };

    fetchMe();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-yellow-200 text-black font-semibold">
      {/* HEADER */}
      <header className="flex justify-between items-center p-4 bg-yellow-300">
        <h1 className="text-xl font-bold">
          Witaj w dashboardzie ucznia
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
      <main className="flex-1 p-8">
        <p className="text-lg mb-6 font-semibold">
          Witaj w dashboardzie – tu każdy dzień w szkole i w nauce jest łatwiejszy.
        </p>

        {error && (
          <div className="mb-4 text-red-600 font-bold">{error}</div>
        )}

        <div className="flex flex-col gap-4 max-w-md">
          <button
            onClick={() => router.push("/dashboard-student/viev-grades")}
            className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 font-bold"
          >
            Oceny
          </button>

          <button
            onClick={() => router.push("/dashboard-student/viev-attendance")}
            className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 font-bold"
          >
            Zobacz swoją frekwencję
          </button>

          <button
            onClick={() => router.push("/dashboard-student/viev-notes")}
            className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 font-bold"
          >
            Uwagi
          </button>

          <button
            onClick={() => router.push("/dashboard-student/messages")}
            className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 font-bold"
          >
            Wiadomości
          </button>

          <button
            onClick={() => router.push("/dashboard-student/viev-termination")}
            className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 font-bold"
          >
            Terminarz kartkówek i sprawdzianów
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t text-center p-4 bg-yellow-300 font-semibold">
        eKubix © – wszelkie prawa zastrzeżone
      </footer>
    </div>
  );
}
