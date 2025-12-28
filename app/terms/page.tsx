"use client";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-yellow-200 flex flex-col items-center p-6">
      {/* Biała ramka z regulaminem */}
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Regulamin korzystania z eKubix</h1>

        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            1. Serwis eKubix przeznaczony jest wyłącznie dla zarejestrowanych placówek oświatowych. 
            Każda szkoła lub instytucja edukacyjna może założyć konto zgodnie z procedurą rejestracji.
          </p>
          <p>
            2. Użytkownicy zobowiązani są do przestrzegania przepisów prawa oraz regulaminu serwisu. 
            Niedozwolone jest korzystanie z serwisu w sposób naruszający prawa osób trzecich.
          </p>
          <p>
            3. Konto w serwisie może być założone wyłącznie przez uprawnione placówki edukacyjne. 
            Nieprzestrzeganie tego punktu skutkuje blokadą konta.
          </p>
          <p>
            4. Każdy użytkownik odpowiada za bezpieczeństwo swojego loginu i hasła. 
            W przypadku podejrzenia naruszenia bezpieczeństwa należy niezwłocznie skontaktować się z administracją.
          </p>
          <p>
            5. eKubix zastrzega sobie prawo do wprowadzania zmian w regulaminie. 
            Każda zmiana będzie publikowana na stronie serwisu.
          </p>
        </div>
      </div>

      {/* Prawa autorskie */}
      <footer className="mt-8 w-full text-center text-sm text-gray-700">
        <p> eKubix © – wszelkie prawa zastrzeżone</p>
        <p>Regulamin korzystania z serwisu</p>
      </footer>
    </main>
  );
}
