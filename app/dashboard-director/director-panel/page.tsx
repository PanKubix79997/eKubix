"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  surname: string;
  login: string;
  role: string;
}

export default function DirectorPanel() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<{ name: string; surname: string }>({
    name: "",
    surname: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ===============================
     POBIERZ ZALOGOWANEGO DYREKTORA
  =============================== */
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          setCurrentUser({ name: data.name, surname: data.surname });
        }
      } catch {
        /* ignorujemy */
      }
    }
    fetchMe();
  }, []);

  /* ===============================
     POBIERZ UŻYTKOWNIKÓW SZKOŁY
  =============================== */
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/director/users", {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Błąd pobierania użytkowników");
          setUsers([]);
          return;
        }

        setUsers(data.users || []);
      } catch {
        setError("Błąd serwera");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  /* ===============================
     USUWANIE UŻYTKOWNIKA
  =============================== */
  const handleDelete = async (_id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to konto?")) return;

    try {
      const res = await fetch(`/api/director/users?userId=${_id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Nie udało się usunąć konta");
        return;
      }

      setUsers((prev) => prev.filter((u) => u._id !== _id));
    } catch {
      alert("Błąd serwera");
    }
  };

  /* ===============================
     RENDER
  =============================== */
  return (
    <div className="min-h-screen flex flex-col bg-yellow-200">
      {/* HEADER */}
      <header className="flex justify-between items-center p-4 bg-yellow-300">
        <h1 className="text-xl font-bold">Panel dyrektorski</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm">
            Zalogowano jako: <b>{currentUser.name} {currentUser.surname}</b>
          </span>

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
        <div className="flex justify-end mb-4">
          <button
            onClick={() =>
              router.push("/dashboard-director/director-panel/add-user")
            }
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Dodaj konto
          </button>
        </div>

        {loading ? (
          <p>Ładowanie kont...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : users.length === 0 ? (
          <p>Brak kont w tej szkole</p>
        ) : (
          <table className="w-full bg-white rounded shadow border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Imię</th>
                <th className="border p-2 text-left">Nazwisko</th>
                <th className="border p-2 text-left">Login</th>
                <th className="border p-2 text-left">Rola</th>
                <th className="border p-2 text-left">Akcja</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="border p-2">{user.name}</td>
                  <td className="border p-2">{user.surname}</td>
                  <td className="border p-2">{user.login}</td>
                  <td className="border p-2">{user.role}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-yellow-300 text-center p-4 text-sm border-t">
        eKubix © – wszelkie prawa zastrzeżone
      </footer>
    </div>
  );
}
