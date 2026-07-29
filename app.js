(() => {
  const form = document.getElementById("scorecard");
  const stepNodes = Array.from(form.querySelectorAll(".step"));
  const stepById = Object.fromEntries(stepNodes.map((step) => [step.dataset.id, step]));

  const stepLabel = document.getElementById("stepLabel");
  const sectionLabel = document.getElementById("sectionLabel");
  const progressFill = document.getElementById("progressFill");
  const progressTrack = document.querySelector(".progress-track");
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
  const backlogList = document.getElementById("backlogList");
  const backlogDetail = document.getElementById("backlogDetail");
  const backlogIdInput = document.getElementById("backlogId");

  let path = [];
  let current = 0;
  let selectedBacklogId = "";

  const backlog = [
    {
      id: "build-to-learn",
      title: "Build to Learn · Discover module",
      owner: "Vinh Ly",
      sponsor: "Rich Giddings",
      estimate: "5–8 days",
      northStar: ["Product-led growth", "Projects → products"],
      summary: "Package Build to Learn as a short Discover module with a real brief, so bench time teaches product craft the studio can reuse.",
      department: "Product / Discover",
      whyNow: "Turns preference into priority: people practise the same muscle Leap needs for PLG.",
      status: "Ready to claim",
    },
    {
      id: "trampoline",
      title: "Trampoline · white-label CMS",
      owner: "Alex / Tina",
      sponsor: "Ian Reynolds",
      estimate: "3–6 days",
      northStar: ["~15% margin", "Retain & grow accounts"],
      summary: "Finish Figma and tidy unused components so Leap can pitch and reuse a white-label CMS faster.",
      department: "Design / Engineering",
      whyNow: "Reusable product asset that shortens delivery and protects margin.",
      status: "In progress · help welcome",
    },
    {
      id: "hsbc-fs",
      title: "HSBC FS capability pack",
      owner: "Vinh Ly",
      sponsor: "Rich Giddings",
      estimate: "2–4 days",
      northStar: ["Retain & grow accounts", "Product-led growth"],
      summary: "Vertical mapping sheet and bios for wealth / PB / HNW so Leap can show FS depth for the HSBC conversation.",
      department: "Product",
      whyNow: "Direct new-business pull. Studio-wide vertical proof.",
      status: "Urgent · claim a row",
    },
    {
      id: "vault",
      title: "Vault overhaul",
      owner: "Fletch",
      sponsor: "Engineering leadership",
      estimate: "4–7 days",
      northStar: ["Projects → products", "~15% margin"],
      summary: "Finish remaining UI so Vault becomes a studio tool people actually use, not a paused side build.",
      department: "Engineering",
      whyNow: "Internal product that cuts search time and raises craft quality.",
      status: "Paused · needs owner time",
    },
    {
      id: "blackbeard",
      title: "Blackbeard · AI state prediction",
      owner: "Jimmy + Vik",
      sponsor: "Brian",
      estimate: "1–2 weeks",
      northStar: ["Product-led growth", "Projects → products"],
      summary: "Lock Q4/Q1 scope for AI state prediction so the experiment can ship as a bounded product slice.",
      department: "Engineering / AI",
      whyNow: "Frontier craft that can productise into client-facing capability.",
      status: "Scoping",
    },
    {
      id: "skills-matrix",
      title: "Skills matrix / radar",
      owner: "Eng leadership",
      sponsor: "Ian Reynolds",
      estimate: "3–5 days",
      northStar: ["Retain & grow accounts", "Product-led growth"],
      summary: "Map studio skills against vertical and capability needs so bench redirects have a clear home.",
      department: "Engineering / Talent",
      whyNow: "Feeds the scorecard backlog and SLT visibility on capacity.",
      status: "Scoping",
    },
  ];

  const copy = {
    green: {
      label: "Green · Auto-approved",
      detail: "Individual + department + business. You can start.",
    },
    amber: {
      label: "Amber · Sent for review",
      detail: "Sent to the bench initiatives owner. In the meantime, you're good to go.",
    },
    red: {
      label: "Red · Sent for review",
      detail: "Sent to the bench initiatives owner. Not a flat no: expect a redirect.",
    },
  };

  function value(name) {
    const el = form.elements.namedItem(name);
    if (!el) return "";
    if (el instanceof RadioNodeList) return el.value || "";
    if (el.type === "checkbox") return el.checked;
    return (el.value || "").trim();
  }

  function askType() {
    return value("type") || "project";
  }

  function isBacklogPath() {
    return askType() === "backlog";
  }

  function buildPath() {
    if (isBacklogPath()) {
      return ["type", "backlog", "backlog-confirm", "logistics"];
    }
    return ["type", "title", "description", "individual", "department", "business", "client", "logistics"];
  }

  function selectedItem() {
    return backlog.find((item) => item.id === selectedBacklogId) || null;
  }

  function initiativeTitle() {
    if (isBacklogPath()) {
      return selectedItem()?.title || "Backlog initiative";
    }
    return value("title") || "Your initiative";
  }

  function score() {
    if (isBacklogPath()) {
      return selectedBacklogId ? "green" : null;
    }

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
    const onVectors = ["individual", "department", "business", "client", "backlog-confirm", "logistics"].includes(path[current]);
    if (!tone || !onVectors) {
      resultPanel.hidden = true;
      return;
    }
    resultPanel.hidden = false;
    resultPanel.dataset.tone = tone;
    resultLabel.textContent = copy[tone].label;
    resultDetail.textContent = isBacklogPath()
      ? "Curated backlog pick. Already aligned to Leap's north star."
      : copy[tone].detail;
  }

  function renderBacklogList() {
    backlogList.innerHTML = backlog
      .map((item) => {
        const selected = item.id === selectedBacklogId ? " selected" : "";
        const metrics = item.northStar.map((m) => `<span class="chip">${m}</span>`).join("");
        return `
          <button type="button" class="backlog-card${selected}" role="option" aria-selected="${item.id === selectedBacklogId}" data-id="${item.id}">
            <div class="backlog-card-top">
              <span class="backlog-status">${item.status}</span>
              <span class="backlog-estimate">${item.estimate}</span>
            </div>
            <h3>${item.title}</h3>
            <p class="backlog-summary">${item.summary}</p>
            <div class="backlog-meta">
              <div><span class="meta-label">Owner</span><span>${item.owner}</span></div>
              <div><span class="meta-label">Sponsor</span><span>${item.sponsor}</span></div>
              <div><span class="meta-label">Department</span><span>${item.department}</span></div>
            </div>
            <div class="backlog-chips">
              <span class="meta-label">North star</span>
              ${metrics}
            </div>
          </button>
        `;
      })
      .join("");
  }

  function renderBacklogDetail() {
    const item = selectedItem();
    if (!item) {
      backlogDetail.innerHTML = `<p class="lede">Pick an initiative from the backlog first.</p>`;
      return;
    }
    backlogDetail.innerHTML = `
      <div class="backlog-card-top">
        <span class="backlog-status">${item.status}</span>
        <span class="backlog-estimate">${item.estimate}</span>
      </div>
      <h3>${item.title}</h3>
      <p class="backlog-summary">${item.summary}</p>
      <div class="backlog-meta detail-grid">
        <div><span class="meta-label">Initiative owner</span><span>${item.owner}</span></div>
        <div><span class="meta-label">Sponsor</span><span>${item.sponsor}</span></div>
        <div><span class="meta-label">Department</span><span>${item.department}</span></div>
        <div><span class="meta-label">Estimate</span><span>${item.estimate}</span></div>
      </div>
      <div class="backlog-chips">
        <span class="meta-label">Helps north star</span>
        ${item.northStar.map((m) => `<span class="chip">${m}</span>`).join("")}
      </div>
      <p class="backlog-why"><span class="meta-label">Why now</span>${item.whyNow}</p>
    `;
  }

  function shake(step) {
    step.classList.remove("shake");
    void step.offsetWidth;
    step.classList.add("shake");
  }

  function validateCurrent() {
    const id = path[current];
    const step = stepById[id];

    if (id === "type") return true;

    if (id === "backlog") {
      if (!selectedBacklogId) {
        shake(step);
        return false;
      }
      return true;
    }

    if (id === "backlog-confirm") {
      if (!value("individualBacklog")) {
        step.querySelector("textarea")?.focus();
        shake(step);
        return false;
      }
      return true;
    }

    if (id === "title" && !value("title")) {
      step.querySelector("input")?.focus();
      shake(step);
      return false;
    }
    if (id === "description" && !value("description")) {
      step.querySelector("textarea")?.focus();
      shake(step);
      return false;
    }
    if (id === "individual" && !value("individual")) {
      step.querySelector("textarea")?.focus();
      shake(step);
      return false;
    }
    if (id === "department" && !value("department")) {
      shake(step);
      return false;
    }
    if (id === "business" && !value("business")) {
      shake(step);
      return false;
    }
    if (id === "client" && !value("client")) {
      shake(step);
      return false;
    }
    if (id === "logistics") {
      const estimate = Number(value("estimate"));
      if (!value("estimate") || Number.isNaN(estimate) || estimate <= 0 || !value("done")) {
        shake(step);
        return false;
      }
    }
    return true;
  }

  function showStep(index) {
    path = buildPath();
    current = Math.max(0, Math.min(index, path.length - 1));
    const id = path[current];

    stepNodes.forEach((step) => {
      step.hidden = step.dataset.id !== id;
    });

    if (id === "backlog") renderBacklogList();
    if (id === "backlog-confirm") renderBacklogDetail();

    const pct = ((current + 1) / path.length) * 100;
    progressFill.style.width = `${pct}%`;
    progressTrack.setAttribute("aria-valuenow", String(Math.round(pct)));
    stepLabel.textContent = `Step ${current + 1} of ${path.length}`;
    sectionLabel.textContent = stepById[id].dataset.section || "";

    backBtn.hidden = current === 0;
    nextBtn.textContent = current === path.length - 1 ? "See result" : "Continue";

    paintResult();

    const focusable = stepById[id].querySelector("input:not([type=hidden]):not([type=radio]), textarea, button.backlog-card");
    if (focusable) focusable.focus();
  }

  function finish() {
    const tone = score() || "red";
    const title = initiativeTitle();
    const item = selectedItem();

    form.hidden = true;
    navActions.hidden = true;
    progressWrap.hidden = true;
    resultPanel.hidden = true;
    submitted.hidden = false;

    finalResult.dataset.tone = tone;
    finalLabel.textContent = copy[tone].label;
    finalDetail.textContent = isBacklogPath()
      ? `Owner: ${item?.owner || "Backlog owner"} · North star: ${(item?.northStar || []).join(" · ")}`
      : copy[tone].detail;

    submittedTitle.textContent =
      tone === "green"
        ? "You're good to go"
        : tone === "amber"
          ? "You're good to go"
          : "Sent for review";

    const messages = {
      green: isBacklogPath()
        ? `"${title}" is a curated backlog pick. Auto-approved. Move into Run with ${item?.owner || "the initiative owner"}.`
        : `"${title}" is auto-approved. Move into Run. Chess-clock while you're on it.`,
      amber: `"${title}" has been sent to the bench initiatives owner to review. In the meantime, you're good to go. Start the chess-clock and treat it like a mini-project.`,
      red: `"${title}" has been sent to the bench initiatives owner for review. Expect a "not this, but this" redirect, not a silent no.`,
    };
    submittedBody.textContent = messages[tone];
    submitted.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  backlogList.addEventListener("click", (event) => {
    const card = event.target.closest(".backlog-card");
    if (!card) return;
    selectedBacklogId = card.dataset.id;
    backlogIdInput.value = selectedBacklogId;
    renderBacklogList();
  });

  nextBtn.addEventListener("click", () => {
    path = buildPath();
    if (!validateCurrent()) return;
    if (current === path.length - 1) {
      finish();
      return;
    }
    // If type just changed, rebuild path before advancing
    if (path[current] === "type") {
      path = buildPath();
      showStep(1);
      return;
    }
    showStep(current + 1);
  });

  backBtn.addEventListener("click", () => {
    path = buildPath();
    if (current === 0) return;
    showStep(current - 1);
  });

  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    if (event.target.tagName === "TEXTAREA") return;
    if (event.target.classList.contains("backlog-card")) return;
    event.preventDefault();
    nextBtn.click();
  });

  form.addEventListener("change", () => {
    if (askType() !== "backlog") {
      selectedBacklogId = "";
      backlogIdInput.value = "";
    }
    paintResult();
  });
  form.addEventListener("input", paintResult);

  editAgain.addEventListener("click", () => {
    submitted.hidden = true;
    form.hidden = false;
    navActions.hidden = false;
    progressWrap.hidden = false;
    path = buildPath();
    showStep(path.length - 1);
  });

  startOver.addEventListener("click", () => {
    form.reset();
    selectedBacklogId = "";
    backlogIdInput.value = "";
    submitted.hidden = true;
    form.hidden = false;
    navActions.hidden = false;
    progressWrap.hidden = false;
    showStep(0);
  });

  renderBacklogList();
  showStep(0);
})();
