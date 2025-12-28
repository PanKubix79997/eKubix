"use client";

import { useEffect, useState } from "react";

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
  const [studentName, setStudentName] = useState("");
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

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

        setStudentName(data.studentName || "");
        setAttendance(Array.isArray(data.attendance) ? data.attendance : []);
        setMessage("");
      } catch (err: any) {
        console.error(err);
        setMessage(err.message || "Brak danych");
        setStudentName("");
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <div className="min-h-screen bg-yellow-200 p-6">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-4">
          Zobacz swoją frekwencję {studentName}
        </h2>

        {message && (
          <div className="text-red-600 font-semibold mb-4">
            {message}
          </div>
        )}

        {loading ? (
          <p>Ładowanie frekwencji...</p>
        ) : attendance.length === 0 ? (
          <p>Brak zapisanej frekwencji.</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}
