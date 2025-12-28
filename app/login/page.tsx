"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false); // true = błąd, false = sukces
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    // Sprawdzenie internetu
    if (!navigator.onLine) {
      setMessage(
        "Wygląda na to, że nie masz połączenia z internetem. Połącz się z internetem i spróbuj ponownie."
      );
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
        credentials: "include",
      });

      const contentType = res.headers.get("content-type");
      let data: any = {};

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Serwer zwrócił niepoprawną odpowiedź");
      }

      // Sprawdzenie błędów logowania
      if (!res.ok) {
        // Jeśli serwer zwraca konkretną informację o haśle
        if (data.code === "INVALID_PASSWORD") {
          setMessage("Login i/lub hasło jest nieprawidłowe. Jeśli nie pamiętasz hasła, skontaktuj się z administratorem w swojej szkole.");
        } else if (data.code === "USER_NOT_FOUND") {
          setMessage("Nie znaleziono użytkownika");
        } else {
          setMessage(data.message || "Nie udało się zalogować");
        }
        setIsError(true);
        return;
      }

      // Sukces
      setMessage("Zalogowano poprawnie. Trwa przekierowanie na dashboard...");
      setIsError(false);

      setTimeout(() => {
        switch (data.role) {
          case "admin":
            router.push("/dashboard-admin");
            break;
          case "teacher":
            router.push("/dashboard-teacher");
            break;
          case "student":
            router.push("/dashboard-student");
            break;
          case "director":
            router.push("/dashboard-director");
            break;
          default:
            router.push("/");
        }
      }, 500);
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Błąd serwera – spróbuj ponownie później");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-200">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Zaloguj się</h1>

        {message && (
          <div
            className={`mb-4 p-2 rounded ${
              isError
                ? "bg-red-100 text-red-800" // błąd → czerwony
                : "bg-green-100 text-green-800" // sukces → zielony
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className={`bg-blue-500 text-white p-2 rounded ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>
      </div>
    </div>
  );
}
