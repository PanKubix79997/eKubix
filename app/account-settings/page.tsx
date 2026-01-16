"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountSettingsPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  // Pobierz dane użytkownika
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data?.name && data?.surname) {
          setFullName(`${data.name} ${data.surname}`);
        }
      })
      .catch(() => setFullName(""));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      setStatusMessage("Uzupełnij wszystkie pola hasła.");
      setStatusType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage("Nowe hasła nie są takie same.");
      setStatusType("error");
      return;
    }

    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage(data.message || "Błąd zmiany hasła");
        setStatusType("error");
        return;
      }

      setStatusMessage("Hasło zostało zmienione pomyślnie.");
      setStatusType("success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setStatusMessage("Błąd serwera");
      setStatusType("error");
    }
  };

  return (
    <div className="min-h-screen bg-yellow-200 p-6 text-black font-semibold">
      <div className="bg-white p-6 rounded shadow max-w-xl mx-auto text-black font-semibold">
        <h2 className="text-lg font-bold mb-6">Ustawienia konta</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-bold mb-1">
              Imię i nazwisko
            </label>
            <input
              type="text"
              value={fullName}
              readOnly
              className="p-2 border w-full rounded bg-gray-100 font-semibold text-black"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Stare hasło</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="p-2 border w-full rounded font-semibold text-black"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Nowe hasło</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="p-2 border w-full rounded font-semibold text-black"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">
              Potwierdź nowe hasło
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="p-2 border w-full rounded font-semibold text-black"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-bold"
          >
            Zmień hasło
          </button>

          {statusMessage && (
            <div
              className={`text-center text-sm mt-2 font-bold ${
                statusType === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {statusMessage}
            </div>
          )}
        </form>

        <button
          onClick={() => router.back()}
          className="mt-6 text-sm text-blue-600 hover:underline font-bold"
        >
          ← Wróć
        </button>
      </div>
    </div>
  );
}
