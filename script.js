const header = document.querySelector(".site-header");
const form = document.querySelector("#leadForm");
const steps = [...document.querySelectorAll(".wizard-step")];
const prevButton = document.querySelector("#prevStep");
const nextButton = document.querySelector("#nextStep");
const submitButton = document.querySelector("#submitLead");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const signalBox = document.querySelector("#signalBox");
const signalTitle = document.querySelector("#signalTitle");
const signalText = document.querySelector("#signalText");
const modal = document.querySelector("#resultModal");
const modalClose = document.querySelector(".modal-close");
const resultStatus = document.querySelector("#resultStatus");
const resultCopy = document.querySelector("#resultCopy");
const resultScore = document.querySelector("#resultScore");
const resultReasons = document.querySelector("#resultReasons");

let currentStep = 0;

function scoreLead() {
  const data = new FormData(form);
  const drivers = data.getAll("drivers");
  let score = 0;
  const reasons = [];

  if (data.get("consumption") === "mid") {
    score += 18;
    reasons.push("relevanter Stromverbrauch");
  }
  if (data.get("consumption") === "high") {
    score += 30;
    reasons.push("hoher Stromverbrauch");
  }
  if (drivers.includes("costs")) score += 12;
  if (drivers.includes("investment")) {
    score += 18;
    reasons.push("konkrete Investitionsentscheidung");
  }
  if (drivers.includes("pv-storage")) score += 14;
  if (drivers.includes("unclear-market")) {
    score += 16;
    reasons.push("fehlende Vergleichbarkeit");
  }
  if (data.get("data") === "full") {
    score += 16;
    reasons.push("belastbare Datenlage");
  }
  if (data.get("data") === "partial") score += 8;
  if (data.get("timeline") === "now") {
    score += 18;
    reasons.push("kurzer Entscheidungszeitraum");
  }
  if (data.get("timeline") === "quarter") score += 10;

  const normalized = Math.min(score, 100);
  const grade = normalized >= 70 ? "A" : normalized >= 42 ? "B" : "C";
  return { score: normalized, grade, reasons };
}

function updateSignal() {
  const hasInput = [...new FormData(form).keys()].length > 0;
  const result = scoreLead();
  signalBox.classList.toggle("is-hot", result.grade !== "C" && hasInput);

  if (!hasInput) {
    signalTitle.textContent = "Noch keine Bewertung";
    signalText.textContent = "Mit jeder Antwort wird klarer, wie stark der Handlungsdruck ist.";
    return;
  }

  signalTitle.textContent =
    result.grade === "A"
      ? "Starkes Modul-1-Signal"
      : result.grade === "B"
        ? "Prüfbares Potenzial"
        : "Orientierung sinnvoll";
  signalText.textContent = result.reasons.length
    ? `Aktuelle Signale: ${[...new Set(result.reasons)].join(", ")}.`
    : "Die Datenlage wird aufgebaut. Weitere Angaben schärfen die Bewertung.";
}

function showStep(index) {
  currentStep = Math.max(0, Math.min(index, steps.length - 1));
  steps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === currentStep));
  const percent = Math.round(((currentStep + 1) / steps.length) * 100);
  progressText.textContent = `Schritt ${currentStep + 1} von ${steps.length}`;
  progressBar.style.width = `${percent}%`;
  prevButton.disabled = currentStep === 0;
  nextButton.hidden = currentStep === steps.length - 1;
  submitButton.hidden = currentStep !== steps.length - 1;
  updateSignal();
}

function validateStep() {
  const active = steps[currentStep];
  const radios = [...active.querySelectorAll('input[type="radio"][required]')];
  const names = [...new Set(radios.map((input) => input.name))];
  for (const name of names) {
    if (!active.querySelector(`input[name="${name}"]:checked`)) {
      active.querySelector(`input[name="${name}"]`).reportValidity();
      return false;
    }
  }
  if (active.dataset.step === "2" && !active.querySelector('input[name="drivers"]:checked')) {
    const first = active.querySelector('input[name="drivers"]');
    first.setCustomValidity("Bitte mindestens einen Auslöser auswählen.");
    first.reportValidity();
    first.setCustomValidity("");
    return false;
  }
  return true;
}

function openResult() {
  const result = scoreLead();
  resultStatus.textContent =
    result.grade === "A"
      ? "Hohes Prüfpotenzial für Modul 1"
      : result.grade === "B"
        ? "Qualifizierte Vorprüfung"
        : "Erste Orientierung";
  resultCopy.textContent =
    result.grade === "A"
      ? "Die Angaben sprechen für eine zeitnahe Potenzialbewertung. Der nächste sinnvolle Schritt ist die strukturierte Datensichtung und eine wirtschaftliche Einordnung."
      : result.grade === "B"
        ? "Es gibt ausreichend Signale für eine Vorprüfung. Grid Balance sollte klären, ob aus den Daten eine belastbare Entscheidungsvorbereitung entstehen kann."
      : "Der Bedarf ist noch nicht entscheidungsreif. Sinnvoll ist zunächst eine saubere Daten- und Bedarfsklärung.";
  resultScore.textContent = `${result.score}/100`;
  const reasons = [...new Set(result.reasons)];
  resultReasons.innerHTML = reasons.length
    ? reasons.map((reason) => `<li>${reason}</li>`).join("")
    : "<li>Basisdaten für die erste Einordnung erfasst</li>";
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modalClose.focus();
}

window.addEventListener("scroll", () => {
  header.style.background = window.scrollY > 20 ? "rgba(7, 27, 36, .94)" : "rgba(7, 27, 36, .42)";
});

form.addEventListener("change", updateSignal);
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
