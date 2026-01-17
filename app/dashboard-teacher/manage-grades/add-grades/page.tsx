"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";

const gradeOptions = ["1", "2", "3", "4", "5", "6", "+", "-", "bz"];
const categoryOptions = [
  "Odpowiedź ustna",
  "Sprawdzian",
  "Kartkówka",
  "Przygotowanie do lekcji",
  "Inny",
  "proponowana śródroczna",
  "proponowana roczna",
  "Śródroczna",
  "roczna",
];

export default function AddGradesPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId") ?? "";
  const studentClass = searchParams.get("class") ?? "";
  const subject = searchParams.get("subject") ?? "";

  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const grade = formData.get("grade") as string;
    const category = formData.get("category") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    try {
      const res = await fetch("/api/grades/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          class: studentClass,
          subject,
          grade,
          category,
          title,
          content,
        }),
      });

      const data = await res.json();
      setStatusMessage(res.ok ? "Ocena dodana pomyślnie!" : data?.message || "Błąd serwera");
    } catch (err) {
      console.error(err);
      setStatusMessage("Błąd serwera");
    }
  };

  return (
    <div className="min-h-screen bg-yellow-200 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Dodaj ocenę dla ucznia</h1>

        {statusMessage && (
          <div className="mb-4 p-2 rounded bg-green-200 text-green-800">{statusMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-bold">Ocena</label>
            <select name="grade" required className="border p-2 rounded w-full">
              <option value="">Wybierz</option>
              {gradeOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-bold">Kategoria</label>
            <select name="category" required className="border p-2 rounded w-full">
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-bold">Tytuł</label>
            <input name="title" type="text" required className="border p-2 rounded w-full" />
          </div>

          <div>
            <label className="block mb-1 font-bold">Treść</label>
            <textarea name="content" rows={4} required className="border p-2 rounded w-full" />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white font-bold p-2 rounded hover:bg-blue-600 transition"
          >
            Dodaj ocenę
          </button>
        </form>
      </div>
    </div>
  );
}
