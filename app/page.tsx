import Link from "next/link";
import Image from "next/image";
import { CheckSquare } from "lucide-react";

export default function HomePage() {
  const reasons = [
    "Nowoczesny i intuicyjny interfejs użytkownika",
    "Szybki dostęp do ocen i frekwencji",
    "Bezpieczne zarządzanie danymi uczniów",
    "Panel administracyjny dla szkoły",
    "Wsparcie dla nauczycieli i uczniów",
    "Responsywny design na każde urządzenie",
    "Przejrzysta komunikacja w jednym miejscu",
    "Łatwa konfiguracja konta",
    "Stały rozwój i nowe funkcje",
    "Stworzony z myślą o polskich szkołach",
  ];

  const opinions = [
    { name: "Anna K.", text: "Bardzo intuicyjny dziennik, wszystko jest pod ręką." },
    { name: "Marek P.", text: "W końcu nowoczesne rozwiązanie dla szkoły." },
    { name: "Julia S.", text: "Logowanie i sprawdzanie ocen jest banalnie proste." },
    { name: "Tomasz W.", text: "Świetny panel dla nauczyciela." },
    { name: "Katarzyna L.", text: "Dziennik wygląda profesjonalnie i działa szybko." },
    { name: "Paweł D.", text: "Duży plus za przejrzystość." },
    { name: "Natalia M.", text: "Wszystkie informacje w jednym miejscu." },
    { name: "Piotr Z.", text: "Nowoczesny wygląd i łatwa obsługa." },
    { name: "Ola B.", text: "Bardzo wygodne rozwiązanie." },
    { name: "Krzysztof R.", text: "Polecam każdej szkole." },
  ];

  return (
    <main className="min-h-screen bg-yellow-300 text-black flex flex-col">
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-6">
          Witaj w eKubix – nowoczesnym szkolnym dzienniku
        </h1>

        <div className="space-y-4 text-lg">
          <p>eKubix to innowacyjny dziennik szkolny stworzony z myślą o nowoczesnej edukacji.</p>
          <p>Naszym celem jest uproszczenie codziennego funkcjonowania szkół.</p>
          <p>Łączymy uczniów, nauczycieli oraz administrację w jednym systemie.</p>
          <p>Platforma została zaprojektowana z naciskiem na użyteczność.</p>
          <p>Dbamy o bezpieczeństwo oraz prywatność danych.</p>
          <p>eKubix rozwija się wraz z potrzebami szkół.</p>
          <p>System umożliwia szybki dostęp do najważniejszych informacji.</p>
          <p>Interfejs jest prosty i czytelny.</p>
          <p>Stawiamy na nowoczesne technologie webowe.</p>
          <p>Dzięki temu dziennik działa płynnie i niezawodnie.</p>
          <p>Rozwiązanie jest dostępne na komputerach i urządzeniach mobilnych.</p>
          <p>Nauczyciele oszczędzają czas na formalnościach.</p>
          <p>Uczniowie mają pełen wgląd w swoje postępy.</p>
          <p>Rodzice mogą być na bieżąco z informacjami.</p>
          <p>System wspiera komunikację w szkole.</p>
          <p>eKubix to przyszłość szkolnych dzienników.</p>
          <p>Projekt powstał z pasji do technologii.</p>
          <p>Nieustannie pracujemy nad ulepszeniami.</p>
          <p>Słuchamy opinii użytkowników.</p>
          <p>Tworzymy rozwiązanie dopasowane do realnych potrzeb.</p>
        </div>

        <h2 className="text-3xl font-semibold mt-12 mb-6">
          Dlaczego warto korzystać z eKubix?
        </h2>

        <ul className="space-y-3">
          {reasons.map((reason, index) => (
            <li key={index} className="flex items-center gap-3">
              <CheckSquare />
              <span>{reason}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-3xl font-semibold mt-12 mb-6">Opinie użytkowników</h2>

        <ul className="space-y-4">
          {opinions.map((opinion, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckSquare />
              <span>
                <strong>{opinion.name}</strong> – {opinion.text}
              </span>
            </li>
          ))}
        </ul>

        <h2 className="text-3xl font-semibold mt-12 mb-4">
          Jak zalogować się do eKubix,
          To Bardzo proste!
        </h2>

        <ol className="list-decimal list-inside space-y-2 text-lg">
          <li>krok 1 Odbierz kartke od wychowawcy lub dyrektora z loginem i hasłem do dziennika.</li>
          <li>krok 2 Kliknij poniższy przycisk "zaloguj się" i wprowadz otrzymane dane.</li>
          <li>krok 3 Ciesz się dostępem do eKubix.</li>
          <li>krok 4 Nie podawaj swoich danych osobom trzecim!</li>
          <li>krok 5 Gdyby dane do logowania były niepoprawne skontaktuj się z administratorem swojej szkoły.</li>
        </ol>

        <div className="mt-8">
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition"
          >
            Zaloguj się
          </Link>
        </div>

        {/* Tekst dla nowych szkół */}
        <div className="mt-12 text-center text-lg">
          A może jesteś dyrektorem nowej szkoły, której szkoła nie korzysta jeszcze z naszego dziennika eKubix? W takim razie{" "}
          <Link href="/support" className="text-blue-600 hover:underline">
            skontaktuj się z nami
          </Link>.
        </div>

        {/* Obrazek pod tekstem */}
        <div className="mt-6 flex justify-center">
          <Image
            src="/ekubix1.jpg"
            alt="ekubix1"
            width={200} // dopasuj rozmiar według potrzeby
            height={100}
            className="object-contain"
          />
        </div>
      </section>

      <footer className="mt-auto border-t border-black text-center py-4">
        eKubix © – wszelkie prawa zastrzeżone
      </footer>
    </main>
  );
}
