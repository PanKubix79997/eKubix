"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  _id: string;
  name: string;
  surname: string;
  login: string;
  role: string;
  school?: string;
};

export default function AdminPanel() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");

  // Pobieranie użytkowników
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        } else {
          setMessage("Nie udało się pobrać użytkowników");
        }
      } catch (err) {
        console.error(err);
        setMessage("Błąd serwera");
      }
    }
    fetchUsers();
  }, []);

  // Usuwanie użytkownika
  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to konto?")) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      setMessage(data.message);

      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      console.error(err);
      setMessage("Błąd serwera");
    }
  };

  return (
    <div className="min-h-screen bg-yellow-200 p-8 font-semibold text-black">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel administracyjny</h1>

        <button
          onClick={() => router.push("/dashboard-admin/admin-panel/add-user")}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-bold"
        >
          Dodaj konto
        </button>
      </div>

      {message && (
        <div className="mb-4 p-2 bg-green-200 text-green-800 rounded font-bold">
          {message}
        </div>
      )}

      <table className="w-full border border-gray-300 rounded bg-white">
        <thead className="bg-gray-100 font-bold">
          <tr>
            <th className="p-2 border">Imię</th>
            <th className="p-2 border">Nazwisko</th>
            <th className="p-2 border">Login</th>
            <th className="p-2 border">Rola</th>
            <th className="p-2 border">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="bg-gray-50 font-semibold">
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">{user.surname}</td>
              <td className="p-2 border">{user.login}</td>
              <td className="p-2 border">{user.role}</td>
              <td className="p-2 border">
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 font-bold"
                  onClick={() => handleDelete(user._id)}
                >
                  Usuń
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
