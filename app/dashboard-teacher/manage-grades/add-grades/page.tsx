"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const gradeOptions = ["1", "2", "3", "4", "5", "6", "+", "-"];
const categoryOptions = [
  "Odpowiedź ustna",
  "Sprawdzian",
  "Kartkówka",
  "Przygotowanie do lekcji",
  "Inny"
];

export default function AddGradesPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId") || "";
  const studentClass = searchParams.get("class") || "";
  const subject = searchParams.get("subject") || "";

  const [grade, setGrade] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      if (res.ok) {
        setStatusMessage("Ocena dodana pomyślnie!");
        setGrade("");
        setCategory(categoryOptions[0]);
        setTitle("");
        setContent("");
      } else {
        setStatusMessage(data.message || "Błąd serwera");
      }
    } catch {
      setStatusMessage("Błąd serwera");
    }
  };

  return (
    <div className="min-h-screen bg-yellow-200 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Dodaj ocenę dla ucznia
        </h1>

        {statusMessage && (
          <div className="mb-4 p-2 rounded bg-green-200 text-green-800">
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-semibold">Ocena</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Wybierz</option>
              {gradeOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Kategoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Tytuł oceny</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Treść oceny</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Dodaj ocenę
          </button>
        </form>
      </div>
    </div>
  );
}
