"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  name?: string;
  surname?: string;
  role?: string;
}

export default function DashboardDirector() {
  const router = useRouter();
  const [user, setUser] = useState<User>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });

        if (!res.ok) {
          const data = await res.json();
          setError(data.message || "Nie jesteś zalogowany");
          return;
        }

        const data: User = await res.json();
        setUser(data);
      } catch {
        setError("Nie udało się pobrać danych użytkownika.");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-yellow-200">
      {/* HEADER */}
      <header className="flex justify-between items-center p-4 bg-yellow-300">
        <h1 className="text-xl font-bold">Witaj w dashboardzie dyrektora</h1>

        <div className="flex items-center gap-4">
          {loading ? (
            <span className="text-sm">Ładowanie danych...</span>
          ) : error ? (
            <span className="text-sm text-red-600">{error}</span>
          ) : (
            <span className="text-sm">
              Zalogowano jako: <b>{user.name} {user.surname}</b>
            </span>
          )}

          <button
            onClick={() => router.push("/account-settings")}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Ustawienia konta
          </button>

          <button
            onClick={() => router.push("/logout")}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Wyloguj się
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 p-8">
        {error && !loading && (
          <div className="mb-4 text-red-600">{error}</div>
        )}

        <div className="flex flex-col gap-4 max-w-md">
          <button
            onClick={() => router.push("/dashboard-director/director-panel")}
            className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
          >
            Panel dyrektorski
          </button>

          {/* NOWY PRZYCISK */}
          <button
            onClick={() => router.push("/dashboard-director/messages")}
            className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
          >
            Wiadomości
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t text-center p-4 bg-yellow-300">
        eKubix © – wszelkie prawa zastrzeżone
      </footer>
    </div>
  );
}
