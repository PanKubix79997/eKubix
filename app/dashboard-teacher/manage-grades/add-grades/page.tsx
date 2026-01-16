type PageProps = {
  searchParams: {
    studentId?: string;
    class?: string;
    subject?: string;
  };
};

const gradeOptions = ["1", "2", "3", "4", "5", "6", "+", "-", "bz"];
const categoryOptions = [
  "Odpowiedź ustna",
  "Sprawdzian",
  "Kartkówka",
  "Przygotowanie do lekcji",
  "Inny",
  "proponowana śródroczna",
  "proponowana roczna",
  "Śródroczna",
  "roczna",
];

export default function AddGradesPage({ searchParams }: PageProps) {
  const studentId = searchParams.studentId ?? "";
  const studentClass = searchParams.class ?? "";
  const subject = searchParams.subject ?? "";

  async function addGrade(formData: FormData) {
    "use server";

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/grades/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        class: studentClass,
        subject,
        grade: formData.get("grade"),
        category: formData.get("category"),
        title: formData.get("title"),
        content: formData.get("content"),
      }),
    });
  }

  return (
    <div className="min-h-screen bg-yellow-200 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold text-black mb-6 text-center">
          Dodaj ocenę dla ucznia
        </h1>

        <form action={addGrade} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-bold text-black">Ocena</label>
            <select name="grade" required className="border p-2 rounded w-full">
              <option value="">Wybierz</option>
              {gradeOptions.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-bold text-black">Kategoria</label>
            <select name="category" required className="border p-2 rounded w-full">
              {categoryOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-bold text-black">Tytuł</label>
            <input name="title" required className="border p-2 rounded w-full" />
          </div>

          <div>
            <label className="block mb-1 font-bold text-black">Treść</label>
            <textarea
              name="content"
              required
              rows={4}
              className="border p-2 rounded w-full"
            />
          </div>

          <button className="bg-blue-500 text-white font-bold p-2 rounded">
            Dodaj ocenę
          </button>
        </form>
      </div>
    </div>
  );
}
