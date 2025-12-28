"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SupportTicket {
  _id: string;
  reason: string;
  firstName: string;
  lastName: string;
  description: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  reasonForRegister?: string;
  peselDigits?: string;
  nip?: string;
  regon?: string;
  yearEstablished?: string;
  country?: string;
  voivodeship?: string;
  city?: string;
  street?: string;
  postalCode?: string;
  plan?: string;
  referral?: string;
  createdAt: string;
}

export default function CheckSupportPage() {
  const router = useRouter();
  const [currentAdmin, setCurrentAdmin] = useState<{ name: string; surname: string }>({ name: "", surname: "" });
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pobranie zalogowanego admina
  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(data => setCurrentAdmin({ name: data.name, surname: data.surname }))
      .catch(() => setCurrentAdmin({ name: "", surname: "" }));
  }, []);

  // Pobranie zgłoszeń
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch("/api/admin/support", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Błąd ładowania zgłoszeń");
          setTickets([]);
          return;
        }
        setTickets(data.tickets || []);
      } catch {
        setError("Błąd serwera");
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to zgłoszenie?")) return;

    try {
      const res = await fetch(`/api/admin/support?id=${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Błąd przy usuwaniu zgłoszenia");
        return;
      }
      setTickets(prev => prev.filter(t => t._id !== id));
    } catch {
      alert("Błąd serwera");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-yellow-200">
      {/* HEADER */}
      <header className="flex justify-between items-center p-4 bg-yellow-300">
        <h1 className="text-xl font-bold">Panel administracyjny – Zgłoszenia wsparcia</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm">
            Zalogowano jako: <b>{currentAdmin.name} {currentAdmin.surname}</b>
          </span>

          <button onClick={() => router.push("/account-settings")} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
            Ustawienia konta
          </button>

          <button onClick={() => router.push("/logout")} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
            Wyloguj się
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 p-6">
        {loading ? (
          <p>Ładowanie zgłoszeń...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : tickets.length === 0 ? (
          <p>Brak zgłoszeń</p>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => (
              <div key={ticket._id} className="bg-white p-4 rounded shadow border flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p><b>Imię i nazwisko:</b> {ticket.firstName} {ticket.lastName}</p>
                    <p><b>Przyczyna zgłoszenia:</b> {ticket.reason}</p>
                    {ticket.email && <p><b>Email:</b> {ticket.email}</p>}
                    {ticket.phone && <p><b>Numer telefonu:</b> {ticket.phone}</p>}
                    <p><b>Opis zgłoszenia:</b> {ticket.description}</p>
                    {ticket.reason === "zakładanie dziennika eKubix" && (
                      <>
                        <p><b>Data urodzenia dyrektora:</b> {ticket.birthDate}</p>
                        <p><b>Powód założenia dziennika:</b> {ticket.reasonForRegister}</p>
                        <p><b>Ostatnie 4 cyfry PESEL:</b> {ticket.peselDigits}</p>
                        <p><b>NIP:</b> {ticket.nip}</p>
                        <p><b>REGON:</b> {ticket.regon}</p>
                        <p><b>Rok założenia placówki:</b> {ticket.yearEstablished}</p>
                        <p><b>Kraj:</b> {ticket.country}</p>
                        <p><b>Województwo / region:</b> {ticket.voivodeship}</p>
                        <p><b>Miejscowość:</b> {ticket.city}</p>
                        <p><b>Ulica:</b> {ticket.street}</p>
                        <p><b>Kod pocztowy:</b> {ticket.postalCode}</p>
                        <p><b>Plan:</b> {ticket.plan}</p>
                        <p><b>Dowiedział się o eKubix od:</b> {ticket.referral}</p>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(ticket._id)}
                    className="text-red-500 hover:text-red-700 font-bold text-lg"
                    title="Usuń zgłoszenie"
                  >
                    🗑️
                  </button>
                </div>
                <p className="text-xs text-gray-500">Utworzono: {new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t text-center p-4 bg-yellow-300">
        eKubix © – wszelkie prawa zastrzeżone
      </footer>
    </div>
  );
}
