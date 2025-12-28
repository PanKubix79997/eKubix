"use client";

import { useState, useEffect } from "react";

type Recipient = {
  _id: string;
  name: string;
  surname: string;
  role: string;
};

type Message = {
  _id: string;
  senderName: string;
  title: string;
  content: string;
  date: string;
};

export default function StudentMessagesPage() {
  const [userName, setUserName] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [inbox, setInbox] = useState<Message[]>([]);
  const [statusMessage, setStatusMessage] = useState("");

  // Pobierz zalogowanego ucznia
  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(data => setUserName(`${data.name} ${data.surname}`))
      .catch(() => setUserName(""));
  }, []);

  // Pobierz listę odbiorców (tylko nauczyciele i dyrektorzy z tej samej szkoły)
  useEffect(() => {
    fetch("/api/users/recipients-school/student")
      .then(res => res.json())
      .then(data => setRecipients(data.users || []))
      .catch(() => setRecipients([]));
  }, []);

  // Pobierz odebrane wiadomości
  const fetchInbox = async () => {
    try {
      const res = await fetch("/api/messages/received/student");
      const data = await res.json();
      if (Array.isArray(data.messages)) setInbox(data.messages);
      else setInbox([]);
    } catch {
      setInbox([]);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRecipient || !title || !content) {
      setStatusMessage("Wypełnij wszystkie pola oprócz nadawcy");
      return;
    }

    try {
      const res = await fetch("/api/messages/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedRecipient,
          title,
          content,
          date,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMessage("Wiadomość wysłana pomyślnie");
        setTitle("");
        setContent("");
        setSelectedRecipient("");
        await fetchInbox(); // odśwież skrzynkę
      } else {
        setStatusMessage(data.message || "Błąd serwera");
      }
    } catch {
      setStatusMessage("Błąd serwera");
    }
  };

  return (
    <div className="min-h-screen bg-yellow-200 p-6 flex gap-6">
      {/* Lewa kolumna: formularz */}
      <div className="flex-1 bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-4">Wyślij wiadomość</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-semibold">Nadawca</label>
            <input
              type="text"
              value={userName}
              readOnly
              className="p-2 rounded border w-full bg-gray-100"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Odbiorca</label>
            <select
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Wybierz</option>
              {recipients.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} {r.surname} ({r.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2 rounded border w-full"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Tytuł</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-2 rounded border w-full"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Treść wiadomości</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="p-2 rounded border w-full"
              rows={5}
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Wyślij wiadomość
          </button>
          {statusMessage && <div className="text-green-600 mt-2">{statusMessage}</div>}
        </form>
      </div>

      {/* Prawa kolumna: odebrane wiadomości */}
      <div className="flex-1 bg-white p-6 rounded shadow overflow-auto max-h-screen">
        <h2 className="text-lg font-bold mb-4">Odebrane wiadomości</h2>
        {inbox.length === 0 ? (
          <p>Brak wiadomości</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {inbox.map((msg) => (
              <li key={msg._id} className="border p-2 rounded bg-gray-50">
                <p>
                  <b>Nadawca:</b> {msg.senderName}
                </p>
                <p>
                  <b>Data:</b> {msg.date}
                </p>
                <p>
                  <b>Tytuł:</b> {msg.title}
                </p>
                <p>
                  <b>Treść:</b> {msg.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
