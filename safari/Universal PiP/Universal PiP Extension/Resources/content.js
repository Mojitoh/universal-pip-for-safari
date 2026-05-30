(() => {
  if (globalThis.__universalPipLoaded) return;
  globalThis.__universalPipLoaded = true;

  const api = globalThis.browser || globalThis.chrome;
  const BUTTON_CLASS = "universal-pip-button";
  const BUTTON_SIZE = 34;
  const EDGE_INSET = 12;
  const VISIBILITY_MS = 2200;

  const DEFAULT_SETTINGS = {
    autoPauseOtherVideos: false,
    includeTinyVideos: false,
    minimumArea: 9600,
    position: "top-right",
    respectDisablePictureInPicture: false,
    showInlineButton: true
  };

  let settings = { ...DEFAULT_SETTINGS };
  const trackedVideos = new Map();
  let scanTimer = 0;

  const icon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.25" y="5" width="17.5" height="13.5" rx="2.25" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <rect x="12.2" y="11" width="6.1" height="4.2" rx="0.9" fill="currentColor"/>
    </svg>`;

  function loadSettings() {
    if (!api?.storage?.sync) return Promise.resolve();

    return api.storage.sync.get(DEFAULT_SETTINGS).then((stored) => {
      settings = { ...DEFAULT_SETTINGS, ...stored };
    }).catch(() => {});
  }

  function isEditableTarget(target) {
    if (!target) return false;
    const tagName = target.tagName?.toLowerCase();
    return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
  }

  function getVideoRect(video) {
    const rect = video.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return null;
    return rect;
  }

  function isUsableVideo(video) {
    if (!(video instanceof HTMLVideoElement)) return false;
    if (!settings.respectDisablePictureInPicture) {
      video.disablePictureInPicture = false;
      video.removeAttribute("disablepictureinpicture");
    } else if (video.disablePictureInPicture) {
      return false;
    }

    const rect = getVideoRect(video);
    if (!rect) return false;
    if (!settings.includeTinyVideos && rect.width * rect.height < settings.minimumArea) return false;

    const style = getComputedStyle(video);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
    if (!video.currentSrc && !video.src && !video.srcObject && video.readyState === HTMLMediaElement.HAVE_NOTHING) return false;

    return true;
  }

  function scoreVideo(video) {
    const rect = getVideoRect(video);
    if (!rect) return -1;

    let score = rect.width * rect.height;
    if (!video.paused && !video.ended) score *= 3;
    if (video.muted) score *= 0.92;
    if (document.pictureInPictureElement === video || video.webkitPresentationMode === "picture-in-picture") score *= 4;
    return score;
  }

  function bestVideo() {
    return [...document.querySelectorAll("video")]
      .filter(isUsableVideo)
      .sort((a, b) => scoreVideo(b) - scoreVideo(a))[0] || null;
  }

  function buttonPoint(rect) {
    const maxLeft = Math.max(EDGE_INSET, window.innerWidth - BUTTON_SIZE - EDGE_INSET);
    const maxTop = Math.max(EDGE_INSET, window.innerHeight - BUTTON_SIZE - EDGE_INSET);
    const leftPositions = {
      "top-left": rect.left + EDGE_INSET,
      "bottom-left": rect.left + EDGE_INSET,
      "top-right": rect.right - BUTTON_SIZE - EDGE_INSET,
      "bottom-right": rect.right - BUTTON_SIZE - EDGE_INSET
    };
    const topPositions = {
      "top-left": rect.top + EDGE_INSET,
      "top-right": rect.top + EDGE_INSET,
      "bottom-left": rect.bottom - BUTTON_SIZE - EDGE_INSET,
      "bottom-right": rect.bottom - BUTTON_SIZE - EDGE_INSET
    };

    return {
      left: Math.min(Math.max(EDGE_INSET, leftPositions[settings.position] ?? leftPositions["top-right"]), maxLeft),
      top: Math.min(Math.max(EDGE_INSET, topPositions[settings.position] ?? topPositions["top-right"]), maxTop)
    };
  }

  function updateButton(video) {
    const state = trackedVideos.get(video);
    if (!state) return;

    const rect = getVideoRect(video);
    if (!rect || !isUsableVideo(video) || !settings.showInlineButton) {
      state.button.hidden = true;
      return;
    }

    const point = buttonPoint(rect);
    state.button.hidden = false;
    state.button.style.left = `${Math.round(point.left)}px`;
    state.button.style.top = `${Math.round(point.top)}px`;
  }

  function showButtonTemporarily(video) {
    const state = trackedVideos.get(video);
    if (!state) return;

    state.button.dataset.visible = "true";
    clearTimeout(state.visibleTimer);
    state.visibleTimer = setTimeout(() => {
      state.button.dataset.visible = "false";
    }, VISIBILITY_MS);
  }

  function videoAtPoint(clientX, clientY) {
    return [...document.querySelectorAll("video")]
      .filter((video) => {
        if (!isUsableVideo(video)) return false;
        const rect = getVideoRect(video);
        return rect &&
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom;
      })
      .sort((a, b) => scoreVideo(b) - scoreVideo(a))[0] || null;
  }

  function pauseOtherVideos(currentVideo) {
    if (!settings.autoPauseOtherVideos) return;
    for (const video of document.querySelectorAll("video")) {
      if (video !== currentVideo && !video.paused) video.pause();
    }
  }

  async function togglePiP(video = bestVideo()) {
    if (!video) return false;

    pauseOtherVideos(video);

    if (typeof video.webkitSetPresentationMode === "function" && video.webkitSupportsPresentationMode?.("picture-in-picture")) {
      const nextMode = video.webkitPresentationMode === "picture-in-picture" ? "inline" : "picture-in-picture";
      video.webkitSetPresentationMode(nextMode);
      showButtonTemporarily(video);
      return true;
    }

    if (document.pictureInPictureElement === video) {
      await document.exitPictureInPicture();
      return true;
    }

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    }

    if (typeof video.requestPictureInPicture === "function") {
      await video.requestPictureInPicture();
      showButtonTemporarily(video);
      return true;
    }

    return false;
  }

  function makeButton(video) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = BUTTON_CLASS;
    button.title = "Picture in Picture";
    button.setAttribute("aria-label", "Picture in Picture");
    button.innerHTML = icon;

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      togglePiP(video).catch(() => {});
    }, true);

    document.documentElement.append(button);
    return button;
  }

  function trackVideo(video) {
    if (trackedVideos.has(video)) return;
    const state = {
      button: makeButton(video),
      raf: 0,
      visibleTimer: 0
    };
    trackedVideos.set(video, state);

    const scheduleUpdate = () => {
      cancelAnimationFrame(state.raf);
      state.raf = requestAnimationFrame(() => updateButton(video));
    };

    const reveal = () => {
      scheduleUpdate();
      showButtonTemporarily(video);
    };

    video.addEventListener("mouseenter", reveal, true);
    video.addEventListener("mousemove", reveal, true);
    video.addEventListener("play", reveal, true);
    video.addEventListener("loadedmetadata", scheduleUpdate, true);
    video.addEventListener("resize", scheduleUpdate, true);
    video.addEventListener("leavepictureinpicture", reveal, true);
    video.addEventListener("enterpictureinpicture", reveal, true);
    video.addEventListener("webkitpresentationmodechanged", reveal, true);

    updateButton(video);
  }

  function cleanupRemovedVideos() {
    for (const [video, state] of trackedVideos) {
      if (video.isConnected && document.documentElement.contains(video)) continue;
      clearTimeout(state.visibleTimer);
      cancelAnimationFrame(state.raf);
      state.button.remove();
      trackedVideos.delete(video);
    }
  }

  function scan() {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(() => {
      if (settings.showInlineButton) {
        for (const video of document.querySelectorAll("video")) {
          if (isUsableVideo(video)) trackVideo(video);
        }
      }
      cleanupRemovedVideos();
      requestAnimationFrame(() => {
        for (const video of document.querySelectorAll("video")) updateButton(video);
      });
    }, 80);
  }

  new MutationObserver(scan).observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true
  });

  window.addEventListener("scroll", scan, true);
  window.addEventListener("resize", scan, true);
  document.addEventListener("fullscreenchange", scan, true);
  document.addEventListener("mousemove", (event) => {
    const video = videoAtPoint(event.clientX, event.clientY);
    if (!video) return;
    trackVideo(video);
    updateButton(video);
    showButtonTemporarily(video);
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || isEditableTarget(event.target)) return;
    if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.code === "KeyP") {
      event.preventDefault();
      togglePiP().catch(() => {});
    }
  }, true);

  api?.runtime?.onMessage?.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "universal-pip:toggle-best-video") return false;
    togglePiP()
      .then((ok) => sendResponse({ ok }))
      .catch((error) => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  });

  loadSettings().then(scan);
})();
