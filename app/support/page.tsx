"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ReCAPTCHA from "react-google-recaptcha";

/* ===================== KRAJE ===================== */
const countries = [
  "Wybierz","Polska","Portugalia","Niemcy","Francja","Hiszpania",
  "Włochy","Belgia","Holandia","Czechy","Słowacja","Słowenia",
  "Węgry","Austria","Chorwacja","Dania","Szwecja","Norwegia",
  "Finlandia","Estonia","Łotwa","Litwa","Irlandia","Malta"
];

/* ===================== REGIONY ===================== */
const regions: Record<string, string[]> = {
  Polska: ["Wybierz","Dolnośląskie","Kujawsko-Pomorskie","Lubelskie","Lubuskie",
    "Łódzkie","Małopolskie","Mazowieckie","Opolskie","Podkarpackie",
    "Podlaskie","Pomorskie","Śląskie","Świętokrzyskie","Warmińsko-Mazurskie",
    "Wielkopolskie","Zachodniopomorskie"
  ],
  Portugalia: ["Wybierz","Aveiro","Beja","Braga","Bragança","Castelo Branco","Coimbra",
    "Évora","Faro","Guarda","Leiria","Lisboa","Portalegre","Porto","Santarém",
    "Setúbal","Viana do Castelo","Vila Real","Viseu"
  ],
  Niemcy: ["Wybierz","Badenia-Wirtembergia","Bawaria","Berlin","Brandenburgia","Brema",
    "Hamburg","Hesja","Meklemburgia-Pomorze Przednie","Dolna Saksonia",
    "Nadrenia Północna-Westfalia","Nadrenia-Palatynat","Saarland","Saksonia",
    "Saksonia-Anhalt","Szlezwik-Holsztyn","Turyngia"
  ],
  Francja: ["Wybierz","Île-de-France","Normandia","Bretania","Nowa Akwitania",
    "Occitanie","Grand Est","Hauts-de-France","Korsyka"
  ],
  Hiszpania: ["Wybierz","Andaluzja","Aragonia","Asturia","Baleary","Kantabria",
    "Kastylia-La Mancha","Kastylia i León","Katalonia","Galicja","Madryt",
    "Murcja","Navarra","La Rioja","Walenia","Kraj Basków"
  ],
  Włochy: ["Wybierz","Abruzja","Kalabria","Kampania","Emilia-Romania","Lacjum","Liguria",
    "Lombardia","Marki","Piemont","Apulia","Sardynia","Sycylia","Toskania",
    "Umbria","Wenecja Euganejska"
  ],
  Belgia: ["Wybierz","Flandria","Walonia","Bruksela"],
  Holandia: ["Wybierz","Drenthe","Flevoland","Fryzja","Gelderland","Groningen","Limburg",
    "Brabancja Północna","Holandia Północna","Holandia Południowa","Utrecht","Zelandia"
  ],
  Czechy: ["Wybierz","Praga","Środkowoczeski","Południowoczeski","Pilzneński","Ustecki",
    "Liberecki","Kralowohradecki","Pardubicki","Wysoczyna","Południowomorawski",
    "Ołomuniecki","Morawsko-Śląski","Zliński"
  ],
  Słowacja: ["Wybierz","Bratysławski","Trnawski","Trenczyński","Nitrianski","Żyliński",
    "Bańskobystrzycki","Preszowski","Koszycki"
  ],
  Irlandia: ["Wybierz","Connacht","Leinster","Munster","Ulster"],
  Malta: ["Wybierz","Malta","Gozo"]
};

/* ===================== KOMPONENT ===================== */
export default function SupportPage() {
  const [reason, setReason] = useState("");
  const isRegister = reason === "zakładanie dziennika eKubix";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [registerReason, setRegisterReason] = useState("");
  const [peselDigits, setPeselDigits] = useState("");
  const [nip, setNip] = useState("");
  const [regon, setRegon] = useState("");
  const [country, setCountry] = useState("Wybierz");
  const [region, setRegion] = useState("Wybierz");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [plan, setPlan] = useState("miesięcznie");
  const [availableRegions, setAvailableRegions] = useState<string[]>(["Wybierz"]);

  const [agreeData, setAgreeData] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    if (isRegister) {
      setAvailableRegions(regions[country] || ["Wybierz"]);
      setRegion("Wybierz");
    }
  }, [country, isRegister]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeData) { alert("Musisz wyrazić zgodę na przetwarzanie danych osobowych"); return; }
    if (!acceptTerms) { alert("Musisz zaakceptować regulamin eKubix"); return; }
    if (!captchaToken) { alert("Potwierdź, że nie jesteś robotem"); return; }
    if (email !== confirmEmail) { alert("Adresy email nie są takie same"); return; }

    const body = {
      reason,
      firstName,
      lastName,
      email,
      phone,
      title: isRegister ? null : title,
      description: isRegister ? null : description,
      schoolName,
      birthDate,
      registerReason,
      peselDigits,
      nip: isRegister ? nip : null,
      regon: isRegister ? regon : null,
      country,
      region,
      city,
      street,
      postalCode,
      plan: isRegister ? plan : null,
      agreeData,
      acceptTerms,
      captchaToken
    };

    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) { alert("Błąd serwera"); return; }
    alert("Zgłoszenie wysłane poprawnie");
  };

  return (
    <main className="min-h-screen bg-yellow-200 flex flex-col items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-lg space-y-4"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          Pomoc techniczna eKubix
        </h1>

        {/* TYPOWY SELECT */}
        <label className="font-semibold">Wybierz typ zgłoszenia</label>
        <select
          className="border p-2 rounded w-full"
          value={reason}
          onChange={e => setReason(e.target.value)}
          required
        >
          <option value="">Wybierz</option>
          <option>błąd techniczny</option>
          <option>zgłoszenie usterki</option>
          <option>zakładanie dziennika eKubix</option>
          <option>inny problem</option>
        </select>

        {/* POZOSTAŁE POLA */}
        <label>Imię</label>
        <input className="border p-2 rounded w-full" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        <label>Nazwisko</label>
        <input className="border p-2 rounded w-full" value={lastName} onChange={e => setLastName(e.target.value)} required />
        <label>{isRegister ? "Adres email dyrektora" : "Adres email"}</label>
        <input type="email" className="border p-2 rounded w-full" value={email} onChange={e => setEmail(e.target.value)} required />
        <label>Potwierdź adres email</label>
        <input type="email" className="border p-2 rounded w-full" value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)} required />
        <label>{isRegister ? "Numer telefonu dyrektora" : "Numer telefonu"}</label>
        <input className="border p-2 rounded w-full" value={phone} onChange={e => setPhone(e.target.value)} required />

        {!isRegister && (
          <>
            <label>Tytuł zgłoszenia</label>
            <input className="border p-2 rounded w-full" value={title} onChange={e => setTitle(e.target.value)} required />
            <label>Treść zgłoszenia</label>
            <textarea className="border p-2 rounded w-full" value={description} onChange={e => setDescription(e.target.value)} required />
          </>
        )}

        {isRegister && (
          <>
            <label>Nazwa placówki</label>
            <input className="border p-2 rounded w-full" value={schoolName} onChange={e => setSchoolName(e.target.value)} required />
            <label>Data urodzenia dyrektora</label>
            <input type="date" className="border p-2 rounded w-full" value={birthDate} onChange={e => setBirthDate(e.target.value)} required />
            <label>Powód założenia dziennika</label>
            <input className="border p-2 rounded w-full" value={registerReason} onChange={e => setRegisterReason(e.target.value)} required />
            <label>Ostatnie 4 cyfry PESEL</label>
            <input maxLength={4} className="border p-2 rounded w-full" value={peselDigits} onChange={e => setPeselDigits(e.target.value.replace(/\D/g,""))} required />
            <label>NIP placówki</label>
            <input maxLength={10} className="border p-2 rounded w-full" value={nip} onChange={e => setNip(e.target.value.replace(/\D/g,""))} required />
            <label>REGON placówki</label>
            <input maxLength={9} className="border p-2 rounded w-full" value={regon} onChange={e => setRegon(e.target.value.replace(/\D/g,""))} required />
            <label>Kraj</label>
            <select className="border p-2 rounded w-full" value={country} onChange={e => setCountry(e.target.value)} required>
              {countries.map(c => <option key={c}>{c}</option>)}
            </select>
            <label>Województwo / region</label>
            <select className="border p-2 rounded w-full" value={region} onChange={e => setRegion(e.target.value)} required>
              {availableRegions.map(r => <option key={r}>{r}</option>)}
            </select>
            <label>Miejscowość</label>
            <input className="border p-2 rounded w-full" value={city} onChange={e => setCity(e.target.value)} required />
            <label>Ulica</label>
            <input className="border p-2 rounded w-full" value={street} onChange={e => setStreet(e.target.value)} required />
            <label>Kod pocztowy</label>
            <input className="border p-2 rounded w-full" value={postalCode} onChange={e => setPostalCode(e.target.value)} required />
            <label>Plan</label>
            <select className="border p-2 rounded w-full" value={plan} onChange={e => setPlan(e.target.value)}>
              <option value="miesięcznie">Miesięcznie 56,98 zł</option>
              <option value="rocznie">Rocznie 479,95 zł</option>
            </select>
          </>
        )}

        {/* ===================== CHECKBOXY ===================== */}
        <div className="flex flex-col space-y-2 mt-4">
          <label>
            <input type="checkbox" checked={agreeData} onChange={e => setAgreeData(e.target.checked)} />
            {" "}Wyrażam zgodę na przetwarzanie danych osobowych
          </label>
          <label>
            <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} />
            {" "}Akceptuję <a href="/terms" className="text-blue-600 underline">regulamin eKubix</a>
          </label>
        </div>

        {/* ===================== CAPTCHA ===================== */}
        <div className="mt-4">
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onChange={(token: string | null) => setCaptchaToken(token)}
          />
        </div>

        {/* ===================== PRZYCISK ===================== */}
        <button className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 mt-4">
          Wyślij zgłoszenie
        </button>
      </form>

      <div className="mt-6 flex justify-center">
        <Image src="/ekubix2.png" alt="ekubix2" width={500} height={500} className="object-contain" />
      </div>

      <footer className="mt-auto border-t border-black text-center py-4">
        eKubix © – wszelkie prawa zastrzeżone
      </footer>
    </main>
  );
}
