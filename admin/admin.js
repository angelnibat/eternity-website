
const editor = document.querySelector("#editor");
const loginCard = document.querySelector("#login-card");
const tokenInput = document.querySelector("#admin-token");
const loginStatus = document.querySelector("#login-status");
const saveStatus = document.querySelector("#save-status");

let token = sessionStorage.getItem("eternityAdminToken") || "";

function setStatus(element, message, type = "") {
  element.textContent = message;
  element.className = `status ${type}`.trim();
}

function fillForm(config) {
  [...editor.elements].forEach((field) => {
    if (!field.name || !(field.name in config)) return;
    if (field.type === "checkbox") {
      field.checked = Boolean(config[field.name]);
    } else {
      field.value = config[field.name] ?? "";
    }
  });
}

function readForm() {
  const config = {};
  [...editor.elements].forEach((field) => {
    if (!field.name) return;
    config[field.name] = field.type === "checkbox" ? field.checked : field.value.trim();
  });
  return config;
}

async function fetchConfig() {
  const response = await fetch("/api/config", {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (!response.ok) {
    throw new Error(response.status === 401 ? "Wrong admin password." : "Could not load dashboard data.");
  }

  return response.json();
}

async function unlock() {
  token = tokenInput.value.trim() || token;
  if (!token) {
    setStatus(loginStatus, "Enter your admin password.", "error");
    return;
  }

  setStatus(loginStatus, "Checking…");
  try {
    const config = await fetchConfig();
    sessionStorage.setItem("eternityAdminToken", token);
    fillForm(config);
    loginCard.hidden = true;
    editor.hidden = false;
  } catch (error) {
    setStatus(loginStatus, error.message, "error");
  }
}

document.querySelector("#unlock-button").addEventListener("click", unlock);
tokenInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") unlock();
});

editor.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus(saveStatus, "Saving…");

  try {
    const response = await fetch("/api/config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(readForm())
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Save failed.");

    setStatus(saveStatus, "Saved. Refresh the website to see the update.", "success");
  } catch (error) {
    setStatus(saveStatus, error.message, "error");
  }
});

if (token) {
  tokenInput.value = token;
  unlock();
}
