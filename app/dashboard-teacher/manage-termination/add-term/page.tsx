"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const classes = [
  "0","1","2","3","4","5","6","7","8",
  "1 liceum","2 liceum","3 liceum","4 liceum","klasa maturalna"
];

const categories = ["Sprawdzian", "Kartkówka", "Odpowiedź ustna", "Przygotowanie do lekcji", "Inny"];

export default function AddTermPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(categories[0]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const subjectsPerClass: Record<string, string[]> = {
    "0": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "1": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "2": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "3": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "4": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "5": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "6": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "7": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "8": ["Matematyka","Język polski","Geografia","Biologia","Doradztwo zawodowe","Wychowanie fizyczne","Fizyka","Chemia","Zajęcia opiekuńczo-wychowawcze"],
    "1 liceum": ["Matematyka","Język polski","Fizyka","Chemia","Biologia","Geografia","Historia","Język angielski"],
    "2 liceum": ["Matematyka","Język polski","Fizyka","Chemia","Biologia","Geografia","Historia","Język angielski"],
    "3 liceum": ["Matematyka","Język polski","Fizyka","Chemia","Biologia","Geografia","Historia","Język angielski"],
    "4 liceum": ["Matematyka","Język polski","Fizyka","Chemia","Biologia","Geografia","Historia","Język angielski"],
    "klasa maturalna": ["Matematyka","Język polski","Fizyka","Chemia","Biologia","Geografia","Historia","Język angielski"],
  };

  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(data => setUserName(`${data.name} ${data.surname}`))
      .catch(() => setUserName("Nieznany użytkownik"));
  }, []);

  useEffect(() => {
    setSubjects(selectedClass ? subjectsPerClass[selectedClass] : []);
    setSelectedSubject(""); // reset przedmiotu przy zmianie klasy
  }, [selectedClass]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClass || !selectedSubject || !title || !date || !category) {
      setStatusMessage("Wypełnij wszystkie pola.");
      return;
    }

    try {
      const res = await fetch("/api/teacher/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class: selectedClass,
          subject: selectedSubject,  // teraz faktyczny przedmiot
          category,                  // kategoria osobno
          title: title.slice(0, 50),
          content: content.slice(0, 1000),
          date
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setStatusMessage(data.message || "Błąd serwera");
        return;
      }

      setStatusMessage("Wydarzenie dodane pomyślnie");
      setTimeout(() => router.push("/dashboard-teacher/manage-termination"), 1000);
    } catch (err: any) {
      if (!navigator.onLine) {
        setStatusMessage("Brak połączenia z internetem. Spróbuj ponownie.");
      } else {
        setStatusMessage("Błąd serwera");
      }
    }
  };

  return (
    <div className="min-h-screen bg-yellow-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-bold">Dodaj wydarzenie do terminarza</div>
        <div className="flex items-center gap-4">
          <span>Zalogowano jako: {userName}</span>
          <button onClick={() => router.push("/account-settings")} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Ustawienia konta</button>
          <button onClick={() => router.push("/logout")} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Wyloguj się</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-xl mx-auto flex flex-col gap-4">
        <div>
          <label className="block font-semibold mb-1">Nadawca</label>
          <input type="text" value={userName} readOnly className="p-2 border w-full rounded bg-gray-100" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Klasa</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="p-2 border w-full rounded" required>
            <option value="">Wybierz klasę</option>
            {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
          </select>
        </div>

        {subjects.length > 0 && (
          <div>
            <label className="block font-semibold mb-1">Przedmiot</label>
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="p-2 border w-full rounded" required>
              <option value="">Wybierz przedmiot</option>
              {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block font-semibold mb-1">Data wydarzenia</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 border w-full rounded" required />
        </div>

        <div>
          <label className="block font-semibold mb-1">Kategoria</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="p-2 border w-full rounded" required>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Tytuł wydarzenia (max 50 znaków)</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="p-2 border w-full rounded" maxLength={50} required />
        </div>

        <div>
          <label className="block font-semibold mb-1">Treść wydarzenia (max 1000 znaków)</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="p-2 border w-full rounded" rows={5} maxLength={1000} required />
        </div>

        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Dodaj wydarzenie
        </button>

        {statusMessage && <div className="text-center text-green-600 mt-2">{statusMessage}</div>}
      </form>
    </div>
  );
}
