const form = document.querySelector("#leadForm");
const note = document.querySelector("#formNote");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  note.textContent = "Demo-Modus: Anfrage wäre erfasst. Produktive Übermittlung wird im nächsten Schritt verbunden.";
});
