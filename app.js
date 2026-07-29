(() => {
  const form = document.getElementById("scorecard");
  const steps = Array.from(form.querySelectorAll(".step"));
  const total = steps.length;

  const stepLabel = document.getElementById("stepLabel");
  const sectionLabel = document.getElementById("sectionLabel");
  const progressFill = document.getElementById("progressFill");
  const progressTrack = document.querySelector(".progress-track");
  const progressDots = document.getElementById("progressDots");
  const progressWrap = document.getElementById("progressWrap");

  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  const navActions = document.getElementById("navActions");

  const resultPanel = document.getElementById("resultPanel");
  const resultLabel = document.getElementById("resultLabel");
  const resultDetail = document.getElementById("resultDetail");

  const submitted = document.getElementById("submitted");
  const submittedTitle = document.getElementById("submittedTitle");
  const submittedBody = document.getElementById("submittedBody");
  const finalResult = document.getElementById("finalResult");
  const finalLabel = document.getElementById("finalLabel");
  const finalDetail = document.getElementById("finalDetail");
  const editAgain = document.getElementById("editAgain");
  const startOver = document.getElementById("startOver");

  let current = 0;

  const copy = {
    green: {
      label: "Green · Auto-approved",
      detail: "Individual + department + business. You can start.",
    },
    amber: {
      label: "Amber · Sent for approval",
      detail: "Sent to the bench initiatives owner. Highly likely approved.",
    },
    red: {
      label: "Red · Sent for review",
      detail: "Sent to the bench initiatives owner. Not a flat no: expect a redirect.",
    },
  };

  progressDots.innerHTML = steps.map(() => "<span></span>").join("");
  const dots = Array.from(progressDots.children);

  function value(name) {
    const el = form.elements.namedItem(name);
    if (!el) return "";
    if (el instanceof RadioNodeList) return el.value || "";
    if (el.type === "checkbox") return el.checked;
    return (el.value || "").trim();
  }

  function score() {
    const individual = value("individual").length > 0;
    const department = value("department");
    const business = value("business");
    if (!individual || !department || !business) return null;

    const teamYes = department === "yes";
    const businessYes = business === "yes";
    if (teamYes && businessYes) return "green";
    if (businessYes) return "amber";
    return "red";
  }

  function paintResult() {
    const tone = score();
    if (!tone) {
      resultPanel.hidden = true;
      return;
    }
    resultPanel.hidden = false;
    resultPanel.dataset.tone = tone;
    resultLabel.textContent = copy[tone].label;
    resultDetail.textContent = copy[tone].detail;
  }

  function validateStep(index) {
    const step = steps[index];
    const required = Array.from(step.querySelectorAll("[required]"));
    for (const el of required) {
      if (!(el.value || "").trim()) {
        el.focus();
        step.classList.remove("shake");
        void step.offsetWidth;
        step.classList.add("shake");
        return false;
      }
    }

    if (index === 4 && !value("department")) {
      step.classList.remove("shake");
      void step.offsetWidth;
      step.classList.add("shake");
      return false;
    }
    if (index === 5 && !value("business")) {
      step.classList.remove("shake");
      void step.offsetWidth;
      step.classList.add("shake");
      return false;
    }
    if (index === 6 && !value("client")) {
      step.classList.remove("shake");
      void step.offsetWidth;
      step.classList.add("shake");
      return false;
    }
    return true;
  }

  function showStep(index) {
    current = index;
    steps.forEach((step, i) => {
      step.hidden = i !== current;
    });

    const pct = ((current + 1) / total) * 100;
    progressFill.style.width = `${pct}%`;
    progressTrack.setAttribute("aria-valuenow", String(Math.round(pct)));
    stepLabel.textContent = `Step ${current + 1} of ${total}`;
    sectionLabel.textContent = steps[current].dataset.section || "";

    dots.forEach((dot, i) => {
      dot.classList.toggle("done", i < current);
      dot.classList.toggle("current", i === current);
    });

    backBtn.hidden = current === 0;
    nextBtn.textContent = current === total - 1 ? "See result" : "Continue";

    paintResult();

    const focusable = steps[current].querySelector("input, textarea");
    if (focusable) focusable.focus();
  }

  function finish() {
    const tone = score() || "red";
    const title = value("title") || "Your initiative";

    form.hidden = true;
    navActions.hidden = true;
    progressWrap.hidden = true;
    resultPanel.hidden = true;
    submitted.hidden = false;

    finalResult.dataset.tone = tone;
    finalLabel.textContent = copy[tone].label;
    finalDetail.textContent = copy[tone].detail;

    submittedTitle.textContent =
      tone === "green" ? "You're good to go" : "Sent for approval";

    const messages = {
      green: `"${title}" is auto-approved. Move into Run. Chess-clock while you're on it.`,
      amber: `"${title}" has been sent to the bench initiatives owner for approval. Amber means highly likely, with a bit of visibility first.`,
      red: `"${title}" has been sent to the bench initiatives owner for review. Expect a "not this, but this" redirect, not a silent no.`,
    };
    submittedBody.textContent = messages[tone];
    submitted.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  nextBtn.addEventListener("click", () => {
    if (!validateStep(current)) return;
    if (current === total - 1) {
      finish();
      return;
    }
    showStep(current + 1);
  });

  backBtn.addEventListener("click", () => {
    if (current === 0) return;
    showStep(current - 1);
  });

  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    if (event.target.tagName === "TEXTAREA") return;
    event.preventDefault();
    nextBtn.click();
  });

  form.addEventListener("change", paintResult);
  form.addEventListener("input", paintResult);

  editAgain.addEventListener("click", () => {
    submitted.hidden = true;
    form.hidden = false;
    navActions.hidden = false;
    progressWrap.hidden = false;
    showStep(total - 1);
  });

  startOver.addEventListener("click", () => {
    form.reset();
    submitted.hidden = true;
    form.hidden = false;
    navActions.hidden = false;
    progressWrap.hidden = false;
    showStep(0);
  });

  showStep(0);
})();
