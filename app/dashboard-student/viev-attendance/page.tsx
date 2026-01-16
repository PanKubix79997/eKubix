"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AttendanceEntry = {
  date: string;
  subject: string;
  status:
    | "Obecny"
    | "Nieobecny"
    | "Spóźniony"
    | "Zwolniony"
    | "Nieobecność usprawiedliwiona";
};

export default function StudentAttendancePage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState(""); // tylko imię
  const [fullName, setFullName] = useState("");   // imię + nazwisko

  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 pobranie imienia + nazwiska (do "Zalogowano jako")
  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(data => {
        setFirstName(data.name || "");
        setFullName(`${data.name || ""} ${data.surname || ""}`);
      })
      .catch(() => {
        setFirstName("");
        setFullName("");
      });
  }, []);

  // 🔹 pobranie frekwencji
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch("/api/students/attendance", {
          credentials: "include",
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Błąd pobierania danych");
        }

        const data = await res.json();
        setAttendance(Array.isArray(data.attendance) ? data.attendance : []);
        setMessage("");
      } catch (err: any) {
        setMessage(err.message || "Brak danych");
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <div className="min-h-screen bg-yellow-200 text-black font-semibold">
      {/* HEADER */}
      <header className="flex justify-between items-center p-4 bg-yellow-300">
        <h1 className="text-xl font-bold">
          Zobacz swoją frekwencję {firstName}
        </h1>

        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">
            Zalogowano jako: <b>{fullName}</b>{" "}
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
      <main className="p-6">
        {message && (
          <div className="text-red-600 font-bold mb-4">{message}</div>
        )}

        {loading ? (
          <p>Ładowanie frekwencji...</p>
        ) : attendance.length === 0 ? (
          <p>Brak zapisanej frekwencji.</p>
        ) : (
          <div className="bg-white p-6 rounded shadow">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Data</th>
                  <th className="border p-2 text-left">Przedmiot</th>
                  <th className="border p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((entry, idx) => (
                  <tr key={idx} className="bg-gray-50">
                    <td className="border p-2">{entry.date}</td>
                    <td className="border p-2">{entry.subject}</td>
                    <td
                      className={`border p-2 font-semibold ${
                        entry.status === "Obecny"
                          ? "text-green-600"
                          : entry.status === "Nieobecny"
                          ? "text-red-600"
                          : "text-orange-600"
                      }`}
                    >
                      {entry.status}
                    </td>
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
