import { useMemo, useState } from "react";

const USERS = [
  "Driver 1",
  "Driver 2",
  "Driver 3",
  "Driver 4",
  "Driver 5",
  "Driver 6",
  "Driver 7",
  "Driver 8",
  "Driver 9",
  "Driver 10",
  "Driver 11",
  "Driver 12",
  "Driver 13"
];

const BANK = [
  {
    id: 1,
    question: "Apa ibu kota Indonesia?",
    choices: ["Jakarta", "Bandung", "Surabaya", "Medan"],
    answer: 0,
  },
  {
    id: 2,
    question: "Berapa hasil 8 x 7?",
    choices: ["54", "56", "64", "48"],
    answer: 1,
  },
  {
    id: 3,
    question: "Planet terdekat dengan Matahari adalah...",
    choices: ["Venus", "Bumi", "Merkurius", "Mars"],
    answer: 2,
  },
  {
    id: 4,
    question: "Air membeku pada suhu...",
    choices: ["0°C", "10°C", "50°C", "100°C"],
    answer: 0,
  },
  {
    id: 5,
    question: "HTML digunakan untuk...",
    choices: [
      "Mengolah angka",
      "Menyusun struktur halaman web",
      "Mengedit video",
      "Membuat database",
    ],
    answer: 1,
  },
  {
    id: 6,
    question: "Warna campuran biru dan kuning adalah...",
    choices: ["Ungu", "Oranye", "Hijau", "Merah"],
    answer: 2,
  },
  {
    id: 7,
    question: "Satu lusin berjumlah...",
    choices: ["10", "12", "20", "24"],
    answer: 1,
  },
  {
    id: 8,
    question: "Hewan yang mengalami metamorfosis adalah...",
    choices: ["Kupu-kupu", "Kucing", "Ayam", "Sapi"],
    answer: 0,
  },
  {
    id: 9,
    question: "Ekstensi umum file Excel adalah...",
    choices: [".docx", ".pptx", ".xlsx", ".jpg"],
    answer: 2,
  },
  {
    id: 10,
    question: "Benua terbesar adalah...",
    choices: ["Afrika", "Asia", "Eropa", "Australia"],
    answer: 1,
  },
  {
    id: 11,
    question: "Power Automate digunakan untuk...",
    choices: [
      "Otomasi alur kerja",
      "Menggambar teknik",
      "Edit audio",
      "Membuat perangkat keras",
    ],
    answer: 0,
  },
  {
    id: 12,
    question: "OneDrive merupakan layanan...",
    choices: [
      "Peta",
      "Penyimpanan cloud",
      "Antivirus",
      "Mesin pencari",
    ],
    answer: 1,
  },
];

function randomFive() {
  const shuffledQuestions = [...BANK];

  for (
    let currentIndex = shuffledQuestions.length - 1;
    currentIndex > 0;
    currentIndex -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (currentIndex + 1)
    );

    [
      shuffledQuestions[currentIndex],
      shuffledQuestions[randomIndex],
    ] = [
      shuffledQuestions[randomIndex],
      shuffledQuestions[currentIndex],
    ];
  }

  return shuffledQuestions.slice(0, 5);
}

function createSubmissionId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `quiz-${Date.now()}`;
}

export default function App() {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [wrongAttempts, setWrongAttempts] = useState({});
  const [wrongChoices, setWrongChoices] = useState({});

  const [startedAt, setStartedAt] = useState("");
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return USERS.filter((name) =>
      name.toLowerCase().includes(keyword)
    );
  }, [search]);

  const currentQuestion = questions[questionIndex];
  const hasStarted = questions.length > 0;

  const score = useMemo(() => {
    return questions.reduce((total, question) => {
      const selectedAnswer = answers[question.id];
      const isCorrect = selectedAnswer === question.answer;

      return total + (isCorrect ? 1 : 0);
    }, 0);
  }, [questions, answers]);

  const totalWrongAttempts = useMemo(() => {
    return Object.values(wrongAttempts).reduce(
      (total, amount) => total + amount,
      0
    );
  }, [wrongAttempts]);

  function selectUser(name) {
    setUser(name);
    setSearch(name);
    setDropdownOpen(false);
  }

  function startQuiz() {
    if (!user || !USERS.includes(user)) {
      return;
    }

    const selectedQuestions = randomFive();

    setQuestions(selectedQuestions);
    setQuestionIndex(0);
    setAnswers({});
    setWrongAttempts({});
    setWrongChoices({});
    setStartedAt(new Date().toISOString());
    setFinished(false);
    setResult(null);
  }

  function selectAnswer(choiceIndex) {
    const question = questions[questionIndex];

    if (!question) {
      return;
    }

    const answerIsCorrect = choiceIndex === question.answer;
    const questionWrongChoices =
      wrongChoices[question.id] || [];

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [question.id]: choiceIndex,
    }));

    if (
      !answerIsCorrect &&
      !questionWrongChoices.includes(choiceIndex)
    ) {
      setWrongAttempts((previousAttempts) => ({
        ...previousAttempts,
        [question.id]:
          (previousAttempts[question.id] || 0) + 1,
      }));

      setWrongChoices((previousWrongChoices) => ({
        ...previousWrongChoices,
        [question.id]: [
          ...(previousWrongChoices[question.id] || []),
          choiceIndex,
        ],
      }));
    }
  }

  function isCurrentAnswerCorrect() {
    const question = questions[questionIndex];

    if (!question) {
      return false;
    }

    return answers[question.id] === question.answer;
  }

  function goToPreviousQuestion() {
    if (questionIndex === 0) {
      return;
    }

    setQuestionIndex(
      (previousIndex) => previousIndex - 1
    );
  }

  function goToNextQuestion() {
    if (!isCurrentAnswerCorrect()) {
      return;
    }

    if (questionIndex < questions.length - 1) {
      setQuestionIndex(
        (previousIndex) => previousIndex + 1
      );
    }
  }

  function submitQuiz() {
    if (!isCurrentAnswerCorrect()) {
      return;
    }

    const submittedAt = new Date().toISOString();

    const quizResult = {
      submissionId: createSubmissionId(),
      user,
      startedAt,
      submittedAt,
      score,
      totalQuestions: questions.length,
      wrongAttempts: totalWrongAttempts,
      status: "Selesai",
      answers: questions.map((question) => ({
        questionId: question.id,
        question: question.question,
        selectedAnswer:
          question.choices[answers[question.id]],
        correctAnswer:
          question.choices[question.answer],
        correct:
          answers[question.id] === question.answer,
        wrongAttempts:
          wrongAttempts[question.id] || 0,
      })),
    };

    try {
      const storedResults = localStorage.getItem(
        "quizResults"
      );

      const previousResults = storedResults
        ? JSON.parse(storedResults)
        : [];

      localStorage.setItem(
        "quizResults",
        JSON.stringify([
          ...previousResults,
          quizResult,
        ])
      );
    } catch (error) {
      console.error(
        "Penyimpanan lokal tidak tersedia:",
        error
      );
    }

    setResult(quizResult);
    setFinished(true);
  }

  function resetQuiz() {
    setSearch("");
    setUser("");
    setDropdownOpen(false);
    setQuestions([]);
    setQuestionIndex(0);
    setAnswers({});
    setWrongAttempts({});
    setWrongChoices({});
    setStartedAt("");
    setFinished(false);
    setResult(null);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-2xl">
        <header className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl font-bold text-white shadow-lg">
            ?
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Quiz Pengetahuan Umum
          </h1>

          <p className="mt-3 text-slate-500">
            5 pertanyaan acak dari {BANK.length} pertanyaan
          </p>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-xl sm:p-9">
          {!hasStarted && !finished && (
            <div className="space-y-5">
              <div className="relative">
                <label
                  htmlFor="user-search"
                  className="mb-2 block text-sm font-semibold"
                >
                  Pilih user
                </label>

                <input
                  id="user-search"
                  type="text"
                  autoComplete="off"
                  value={search}
                  placeholder="Cari nama user..."
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  onFocus={() => setDropdownOpen(true)}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setUser("");
                    setDropdownOpen(true);
                  }}
                />

                {dropdownOpen && (
                  <div className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((name) => (
                        <button
                          type="button"
                          key={name}
                          className="block w-full rounded-lg px-4 py-3 text-left transition hover:bg-indigo-50 hover:text-indigo-700"
                          onClick={() => selectUser(name)}
                        >
                          {name}
                        </button>
                      ))
                    ) : (
                      <p className="p-3 text-sm text-slate-500">
                        User tidak ditemukan.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {user && (
                <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                  User terpilih: <strong>{user}</strong>
                </div>
              )}

              <button
                type="button"
                disabled={!user}
                onClick={startQuiz}
                className="h-12 w-full rounded-xl bg-indigo-600 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                Mulai Quiz
              </button>

              <p className="text-center text-xs text-slate-400">
                Hanya user yang sudah terdaftar yang dapat
                mengikuti quiz.
              </p>
            </div>
          )}

          {hasStarted &&
            !finished &&
            currentQuestion && (
              <div>
                <div className="mb-3 text-sm text-slate-500">
                  Peserta: <strong>{user}</strong>
                </div>

                <div className="mb-4 flex items-center justify-between text-sm font-semibold text-indigo-700">
                  <span>
                    Pertanyaan {questionIndex + 1} dari{" "}
                    {questions.length}
                  </span>

                  <span>
                    {Math.round(
                      ((questionIndex + 1) /
                        questions.length) *
                        100
                    )}
                    %
                  </span>
                </div>

                <div className="mb-7 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                    style={{
                      width: `${
                        ((questionIndex + 1) /
                          questions.length) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <h2 className="mb-6 text-xl font-bold leading-relaxed">
                  {currentQuestion.question}
                </h2>

                <div className="grid gap-3">
                  {currentQuestion.choices.map(
                    (choice, choiceIndex) => {
                      const selected =
                        answers[currentQuestion.id] ===
                        choiceIndex;

                      const correct =
                        choiceIndex ===
                        currentQuestion.answer;

                      let choiceClass =
                        "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50";

                      if (selected && correct) {
                        choiceClass =
                          "border-emerald-600 bg-emerald-50 text-emerald-800";
                      }

                      if (selected && !correct) {
                        choiceClass =
                          "border-red-500 bg-red-50 text-red-800";
                      }

                      return (
                        <button
                          type="button"
                          key={choice}
                          onClick={() =>
                            selectAnswer(choiceIndex)
                          }
                          className={`rounded-xl border-2 p-4 text-left transition ${choiceClass}`}
                        >
                          <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold shadow-sm">
                            {String.fromCharCode(
                              65 + choiceIndex
                            )}
                          </span>

                          {choice}
                        </button>
                      );
                    }
                  )}
                </div>

                {answers[currentQuestion.id] !==
                  undefined && (
                  <div
                    className={`mt-5 rounded-xl p-4 text-sm font-semibold ${
                      isCurrentAnswerCorrect()
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {isCurrentAnswerCorrect()
                      ? "Jawaban benar. Silakan lanjut ke pertanyaan berikutnya."
                      : "Jawaban belum tepat. Silakan pilih jawaban lain sampai benar."}
                  </div>
                )}

                <div className="mt-7 flex gap-3">
                  <button
                    type="button"
                    disabled={questionIndex === 0}
                    onClick={goToPreviousQuestion}
                    className="h-11 flex-1 rounded-xl border border-slate-300 font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Kembali
                  </button>

                  {questionIndex <
                  questions.length - 1 ? (
                    <button
                      type="button"
                      disabled={
                        !isCurrentAnswerCorrect()
                      }
                      onClick={goToNextQuestion}
                      className="h-11 flex-1 rounded-xl bg-indigo-600 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                    >
                      Berikutnya
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={
                        !isCurrentAnswerCorrect()
                      }
                      onClick={submitQuiz}
                      className="h-11 flex-1 rounded-xl bg-emerald-600 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                    >
                      Kirim Jawaban
                    </button>
                  )}
                </div>
              </div>
            )}

          {finished && result && (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-600">
                OK
              </div>

              <p className="text-slate-500">
                Terima kasih, {result.user}
              </p>

              <h2 className="mt-2 text-4xl font-bold">
                Quiz Selesai
              </h2>

              <div className="my-7 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-indigo-50 p-5">
                  <p className="text-sm text-indigo-600">
                    Jawaban benar
                  </p>

                  <p className="mt-1 text-3xl font-bold text-indigo-800">
                    {result.score}/{result.totalQuestions}
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-50 p-5">
                  <p className="text-sm text-amber-700">
                    Percobaan salah
                  </p>

                  <p className="mt-1 text-3xl font-bold text-amber-800">
                    {result.wrongAttempts}
                  </p>
                </div>
              </div>

              <p className="mb-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                Hasil quiz telah disimpan sementara di browser.
                Integrasi Excel OneDrive akan ditambahkan pada
                tahap berikutnya.
              </p>

              <button
                type="button"
                onClick={resetQuiz}
                className="h-12 w-full rounded-xl bg-indigo-600 font-semibold text-white transition hover:bg-indigo-700"
              >
                Selesai dan Kembali
              </button>
            </div>
          )}
        </section>

        <p className="mt-5 text-center text-xs text-slate-400">
          Daftar user dan pertanyaan dapat diperbarui sesuai
          database perusahaan.
        </p>
      </div>
    </main>
  );
}