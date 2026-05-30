const api = globalThis.browser || globalThis.chrome;

const DEFAULT_SETTINGS = {
  autoPauseOtherVideos: false,
  includeTinyVideos: false,
  keepScreenAwake: true,
  minimumArea: 9600,
  position: "top-right",
  respectDisablePictureInPicture: false,
  showInlineButton: true
};

const fields = Object.keys(DEFAULT_SETTINGS).filter((key) => key !== "minimumArea");
const status = document.querySelector("#status");

function setStatus(text) {
  status.textContent = text;
  clearTimeout(setStatus.timer);
  setStatus.timer = setTimeout(() => {
    status.textContent = "";
  }, 1600);
}

async function load() {
  const values = await api.storage.sync.get(DEFAULT_SETTINGS);
  for (const field of fields) {
    const element = document.getElementById(field);
    if (!element) continue;
    if (element.type === "checkbox") element.checked = Boolean(values[field]);
    else element.value = values[field];
  }
}

async function save() {
  const next = {};
  for (const field of fields) {
    const element = document.getElementById(field);
    next[field] = element.type === "checkbox" ? element.checked : element.value;
  }
  await api.storage.sync.set(next);
  setStatus("Saved");
}

for (const field of fields) {
  document.getElementById(field)?.addEventListener("change", save);
}

load().catch(() => setStatus("Could not load settings"));
