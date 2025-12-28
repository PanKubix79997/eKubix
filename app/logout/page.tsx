"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();
  const [message, setMessage] = useState(
    "Dziękujemy za skorzystanie z serwisu eKubix.\nTrwa wylogowywanie z eKubix..."
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      })
        .then(res => res.json())
        .then(() => {
          setMessage(
            "Wylogowano pomyślnie.\nZapraszamy ponownie!"
          );

          setTimeout(() => {
            router.push("/");
          }, 5000);
        })
        .catch(() => {
          setMessage("Wystąpił błąd podczas wylogowywania.");
        });
    }, 2000); // ⏳ 2 sekundy opóźnienia

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-yellow-200 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded shadow max-w-md text-center whitespace-pre-line">
        <p className="text-lg font-semibold">{message}</p>
      </div>
    </div>
  );
}
