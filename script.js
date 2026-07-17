const header = document.querySelector(".site-header");
const form = document.querySelector("#leadForm");
const steps = [...document.querySelectorAll(".wizard-step")];
const prevButton = document.querySelector("#prevStep");
const nextButton = document.querySelector("#nextStep");
const submitButton = document.querySelector("#submitLead");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const liveScore = document.querySelector("#liveScore");
const scoreTitle = document.querySelector("#scoreTitle");
const scoreText = document.querySelector("#scoreText");
const modal = document.querySelector("#resultModal");
const modalClose = document.querySelector(".modal-close");
const resultStatus = document.querySelector("#resultStatus");
const resultCopy = document.querySelector("#resultCopy");
const resultScore = document.querySelector("#resultScore");
const resultReasons = document.querySelector("#resultReasons");

let currentStep = 0;

function scoreLead() {
  const data = new FormData(form);
  const risk = data.getAll("risk");
  let score = 0;
  const reasons = [];

  if (data.get("pressure") === "medium") {
    score += 18;
    reasons.push("Energiethema ist bereits Managementthema");
  }
  if (data.get("pressure") === "high") {
    score += 30;
    reasons.push("konkreter Entscheidungsdruck");
  }
  if (risk.includes("unclear")) {
    score += 14;
    reasons.push("Bedarf ist noch nicht entscheidungsreif");
  }
  if (risk.includes("offers")) {
    score += 18;
    reasons.push("Angebote sind schwer vergleichbar");
  }
  if (risk.includes("investment")) {
    score += 18;
    reasons.push("Investitionsrisiko vorhanden");
  }
  if (risk.includes("effect")) score += 12;
  if (data.get("data") === "medium") score += 10;
  if (data.get("data") === "strong") {
    score += 18;
    reasons.push("Datenbasis kann wirtschaftlich ausgewertet werden");
  }
  if (data.get("next") === "compare") score += 12;
  if (data.get("next") === "decide") {
    score += 18;
    reasons.push("Entscheidung soll vorbereitet werden");
  }

  const value = Math.min(score, 100);
  const grade = value >= 72 ? "A" : value >= 44 ? "B" : "C";
  return { value, grade, reasons };
}

function updateLiveScore() {
  const hasInput = [...new FormData(form).keys()].length > 0;
  const result = scoreLead();
  liveScore.classList.toggle("hot", hasInput && result.grade !== "C");

  if (!hasInput) {
    scoreTitle.textContent = "Noch neutral";
    scoreText.textContent = "Wählen Sie die Antworten aus. Das Profil reagiert sofort.";
    return;
  }

  scoreTitle.textContent =
    result.grade === "A" ? "Hohes Entscheidungsrisiko" : result.grade === "B" ? "Prüfbares Potenzial" : "Erst Klarheit schaffen";
  scoreText.textContent = result.reasons.length
    ? result.reasons.slice(0, 2).join(". ") + "."
    : "Die Situation ist noch nicht eindeutig. Weitere Angaben schärfen die Einordnung.";
}

function showStep(index) {
  currentStep = Math.max(0, Math.min(index, steps.length - 1));
  steps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === currentStep));
  const percent = Math.round(((currentStep + 1) / steps.length) * 100);
  progressText.textContent = `${currentStep + 1} / ${steps.length}`;
  progressBar.style.width = `${percent}%`;
  prevButton.disabled = currentStep === 0;
  nextButton.hidden = currentStep === steps.length - 1;
  submitButton.hidden = currentStep !== steps.length - 1;
  updateLiveScore();
}

function validateStep() {
  const active = steps[currentStep];
  const requiredRadio = [...active.querySelectorAll('input[type="radio"][required]')];
  const groups = [...new Set(requiredRadio.map((field) => field.name))];

  for (const group of groups) {
    if (!active.querySelector(`input[name="${group}"]:checked`)) {
      active.querySelector(`input[name="${group}"]`).reportValidity();
      return false;
    }
  }

  if (currentStep === 1 && !active.querySelector('input[name="risk"]:checked')) {
    const first = active.querySelector('input[name="risk"]');
    first.setCustomValidity("Bitte mindestens ein Risiko auswählen.");
    first.reportValidity();
    first.setCustomValidity("");
    return false;
  }
  return true;
}

function openResult() {
  const result = scoreLead();
  resultStatus.textContent =
    result.grade === "A" ? "Sofort Modul 1 prüfen" : result.grade === "B" ? "Potenzialdiagnose sinnvoll" : "Noch nicht entscheidungsreif";
  resultCopy.textContent =
    result.grade === "A"
      ? "Die Antworten zeigen klaren Kaufdruck. Der nächste Schritt ist keine allgemeine Beratung, sondern eine harte Potenzialbewertung mit Daten, Status quo und Stop/Go-Logik."
      : result.grade === "B"
        ? "Es gibt genug Signale für eine strukturierte Vorprüfung. Grid Balance sollte klären, ob daraus eine belastbare Entscheidungsgrundlage entstehen kann."
        : "Aktuell fehlt noch Schärfe. Sinnvoll ist zuerst eine knappe Klärung von Bedarf, Daten und Entscheidungsziel.";
  resultScore.textContent = `${result.value}/100`;
  const reasons = [...new Set(result.reasons)];
  resultReasons.innerHTML = reasons.length
    ? reasons.map((reason) => `<li>${reason}</li>`).join("")
    : "<li>Basisprofil erfasst</li>";
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modalClose.focus();
}

window.addEventListener("scroll", () => {
  header.style.background = window.scrollY > 20 ? "rgba(7,17,22,.94)" : "rgba(7,17,22,.72)";
});

form.addEventListener("change", updateLiveScore);
nextButton.addEventListener("click", () => {
  if (validateStep()) showStep(currentStep + 1);
});
prevButton.addEventListener("click", () => showStep(currentStep - 1));
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (validateStep()) openResult();
});
modalClose.addEventListener("click", () => {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
});
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }
});

showStep(0);
