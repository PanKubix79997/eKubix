"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClearEkubixPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmStep, setConfirmStep] = useState(0); 
  const [actionMessage, setActionMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (!res.ok) {
          setError("Nie jesteś zalogowany. Niektóre funkcje mogą być niedostępne.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setName(data.name);
        setSurname(data.surname);
      } catch {
        setError("Nie udało się pobrać danych użytkownika.");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const handleResetClick = () => {
    setConfirmStep(1);
    setActionMessage("Czy na pewno chcesz usunąć dziennik eKubix?");
  };

  const handleConfirm = async () => {
    if (confirmStep === 1) {
      setConfirmStep(2);
      setActionMessage(
        "Czy jesteś pewny? Ta operacja usunie całą bazę danych oprócz kont administratorów."
      );
    } else if (confirmStep === 2) {
      setConfirmStep(3);
      setActionMessage(
        "CZY NA PEWNO JESTEŚ PEWNY? TĘ OPERACJĘ NIE MOŻNA COFNĄĆ!"
      );
    } else if (confirmStep === 3) {
      setProcessing(true);
      try {
        const res = await fetch("/api/clear-ekubix", {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Błąd serwera");

        // Komunikat sukcesu
        setActionMessage("Baza danych wyczyszczona pomyślnie!");
        setConfirmStep(0);
      } catch (err: any) {
        console.error(err);
        setActionMessage(err.message || "Wystąpił błąd podczas kasowania bazy danych.");
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleCancel = () => {
    if (processing) return;
    setConfirmStep(0);
    setActionMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-yellow-200">
      {/* HEADER */}
      <header className="flex justify-between items-center p-4 bg-yellow-300">
        <h1 className="text-xl font-bold">Clear eKubix – Reset dziennika</h1>

        <div className="flex items-center gap-4">
          {loading ? (
            <span className="text-sm">Ładowanie danych...</span>
          ) : error ? (
            <span className="text-sm text-red-600">{error}</span>
          ) : (
            <span className="text-sm">
              Zalogowano jako: <b>{name} {surname}</b>
            </span>
          )}

          <button
            onClick={() => router.push("/account-settings")}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Ustawienia konta
          </button>

          <button
            onClick={() => router.push("/logout")}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Wyloguj się
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 p-8 flex flex-col items-center">
        {error && !loading && <div className="mb-4 text-red-600">{error}</div>}

        {confirmStep === 0 && (
          <button
            onClick={handleResetClick}
            className="bg-red-500 text-white p-3 rounded hover:bg-red-600"
          >
            Zresetuj dziennik eKubix
          </button>
        )}

        {confirmStep > 0 && (
          <div className="flex flex-col items-center gap-4 max-w-lg text-center">
            <p className={confirmStep === 3 ? "font-bold text-red-800 uppercase" : "text-red-800"}>
              {actionMessage}
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleConfirm}
                className={confirmStep === 3
                  ? "bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900 uppercase"
                  : "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"}
                disabled={processing}
              >
                TAK
              </button>
              <button
                onClick={handleCancel}
                className={confirmStep === 3
                  ? "bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 uppercase"
                  : "bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"}
                disabled={processing}
              >
                NIE
              </button>
            </div>
          </div>
        )}

        {/* Jeśli baza została wyczyszczona */}
        {confirmStep === 0 && actionMessage === "Baza danych wyczyszczona pomyślnie!" && (
          <p className="mt-4 text-green-800 font-bold">{actionMessage}</p>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t text-center p-4 bg-yellow-300">
        eKubix © – wszelkie prawa zastrzeżone
      </footer>
    </div>
  );
}
