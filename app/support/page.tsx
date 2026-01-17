"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ReCAPTCHA from "react-google-recaptcha";

const countries = [
  "Wybierz","Polska","Portugalia","Niemcy","Francja","Hiszpania",
  "Włochy","Belgia","Holandia","Czechy","Słowacja","Słowenia",
  "Węgry","Austria","Chorwacja","Dania","Szwecja","Norwegia",
  "Finlandia","Estonia","Łotwa","Litwa","Irlandia","Malta"
];

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
      const updateRegions = () => {
        const newRegions = regions[country] || ["Wybierz"];
        setAvailableRegions(newRegions);
        setRegion("Wybierz");
      };
      updateRegions();
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
    <main className="min-h-screen bg-yellow-200 flex flex-col items-center p-6 font-semibold text-black">
      <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-lg space-y-4 font-bold">
        <h1 className="text-3xl font-bold text-center mb-6">
          Pomoc techniczna eKubix
        </h1>

        <label className="font-bold">Wybierz typ zgłoszenia</label>
        <select className="border p-2 rounded w-full font-bold text-black" value={reason} onChange={e => setReason(e.target.value)} required>
          <option value="">Wybierz</option>
          <option>błąd techniczny</option>
          <option>zgłoszenie usterki</option>
          <option>zakładanie dziennika eKubix</option>
          <option>inny problem</option>
        </select>

        <label className="font-bold">Imię</label>
        <input className="border p-2 rounded w-full font-bold text-black" value={firstName} onChange={e => setFirstName(e.target.value)} required />

        <label className="font-bold">Nazwisko</label>
        <input className="border p-2 rounded w-full font-bold text-black" value={lastName} onChange={e => setLastName(e.target.value)} required />

        <label className="font-bold">{isRegister ? "Adres email dyrektora" : "Adres email"}</label>
        <input type="email" className="border p-2 rounded w-full font-bold text-black" value={email} onChange={e => setEmail(e.target.value)} required />

        <label className="font-bold">Potwierdź adres email</label>
        <input type="email" className="border p-2 rounded w-full font-bold text-black" value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)} required />

        <label className="font-bold">{isRegister ? "Numer telefonu dyrektora" : "Numer telefonu"}</label>
        <input className="border p-2 rounded w-full font-bold text-black" value={phone} onChange={e => setPhone(e.target.value)} required />

        {!isRegister && (
          <>
            <label className="font-bold">Tytuł zgłoszenia</label>
            <input className="border p-2 rounded w-full font-bold text-black" value={title} onChange={e => setTitle(e.target.value)} required />
            <label className="font-bold">Treść zgłoszenia</label>
            <textarea className="border p-2 rounded w-full font-bold text-black" value={description} onChange={e => setDescription(e.target.value)} required />
          </>
        )}

        {isRegister && (
          <>
            <label className="font-bold">Nazwa placówki</label>
            <input className="border p-2 rounded w-full font-bold text-black" value={schoolName} onChange={e => setSchoolName(e.target.value)} required />
            <label className="font-bold">Data urodzenia dyrektora</label>
            <input type="date" className="border p-2 rounded w-full font-bold text-black" value={birthDate} onChange={e => setBirthDate(e.target.value)} required />
            <label className="font-bold">Powód założenia dziennika</label>
            <input className="border p-2 rounded w-full font-bold text-black" value={registerReason} onChange={e => setRegisterReason(e.target.value)} required />
            <label className="font-bold">Ostatnie 4 cyfry PESEL Dyrektora</label>
            <input maxLength={4} className="border p-2 rounded w-full font-bold text-black" value={peselDigits} onChange={e => setPeselDigits(e.target.value.replace(/\D/g,""))} required />
            <label className="font-bold">NIP placówki</label>
            <input maxLength={10} className="border p-2 rounded w-full font-bold text-black" value={nip} onChange={e => setNip(e.target.value.replace(/\D/g,""))} required />
            <label className="font-bold">REGON placówki</label>
            <input maxLength={9} className="border p-2 rounded w-full font-bold text-black" value={regon} onChange={e => setRegon(e.target.value)} required />
            <label className="font-bold">Kraj</label>
            <select className="border p-2 rounded w-full font-bold text-black" value={country} onChange={e => setCountry(e.target.value)} required>
              {countries.map(c => <option key={c}>{c}</option>)}
            </select>
            <label className="font-bold">Województwo / region</label>
            <select className="border p-2 rounded w-full font-bold text-black" value={region} onChange={e => setRegion(e.target.value)} required>
              {availableRegions.map(r => <option key={r}>{r}</option>)}
            </select>
            <label className="font-bold">Miejscowość</label>
            <input className="border p-2 rounded w-full font-bold text-black" value={city} onChange={e => setCity(e.target.value)} required />
            <label className="font-bold">Ulica</label>
            <input className="border p-2 rounded w-full font-bold text-black" value={street} onChange={e => setStreet(e.target.value)} required />
            <label className="font-bold">Kod pocztowy</label>
            <input className="border p-2 rounded w-full font-bold text-black" value={postalCode} onChange={e => setPostalCode(e.target.value)} required />
            <label className="font-bold">Plan</label>
            <select className="border p-2 rounded w-full font-bold text-black" value={plan} onChange={e => setPlan(e.target.value)}>
              <option value="miesięcznie">Miesięcznie 56,98 zł</option>
              <option value="rocznie">Rocznie 479,95 zł</option>
            </select>
          </>
        )}

        <div className="flex flex-col space-y-2 mt-4 font-bold">
          <label>
            <input type="checkbox" checked={agreeData} onChange={e => setAgreeData(e.target.checked)} />
            {" "}Wyrażam zgodę na przetwarzanie danych osobowych
          </label>
          <label>
            <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} />
            {" "}Akceptuję <a href="/terms" className="text-blue-600 underline">regulamin eKubix</a>
          </label>
        </div>

        <div className="mt-4">
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onChange={(token) => setCaptchaToken(token)}
          />
        </div>

        <button className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 mt-4 font-bold">
          Wyślij zgłoszenie
        </button>
      </form>

      <div className="mt-6 flex justify-center">
        <Image src="/ekubix2.png" alt="ekubix2" width={500} height={500} className="object-contain" />
      </div>

      <footer className="mt-auto border-t border-black text-center py-4 font-bold">
        eKubix © – wszelkie prawa zastrzeżone
      </footer>
    </main>
  );
}
