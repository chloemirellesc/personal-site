// ---------------------------------------------
// Site-wide interaction logic.
// Each init function checks for the elements it needs and quietly
// does nothing if they're not on the page, so this one file can be
// included everywhere.
// ---------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  initNotebook();
  initNav();
  initCityMap();
  initItemSurface();
  initWritingList();
  initPhotoGallery();
  initNotesFeed();
});

// ---------------------------------------------
// Homepage: notebook cover -> frame sequence -> page fade in
// ---------------------------------------------

function initNotebook() {
  const cover = document.getElementById("notebook-cover");
  const page = document.getElementById("notebook-page");
  const navLogo = document.getElementById("nav-logo");
  if (!cover || !page) return;

  cover.addEventListener("click", () => {
    // Fill window.NOTEBOOK_FRAMES with your real photographed frame
    // paths later (see README) — until then this just fades the
    // cover away directly.
    const frames = window.NOTEBOOK_FRAMES || [];

    if (frames.length > 0) {
      playFrames(frames, () => openPage(page, cover, navLogo));
    } else {
      openPage(page, cover, navLogo);
    }
  });
}

function playFrames(frames, onDone) {
  frames.forEach((src) => {
    const preload = new Image();
    preload.src = src;
  });

  const img = document.createElement("img");
  img.className = "notebook-frame";
  img.src = frames[0];
  document.body.appendChild(img);

  let i = 0;
  const FRAME_DELAY_MS = 120;
  const interval = setInterval(() => {
    i++;
    if (i >= frames.length) {
      clearInterval(interval);
      img.remove();
      onDone();
      return;
    }
    img.src = frames[i];
  }, FRAME_DELAY_MS);
}

function openPage(page, cover, navLogo) {
  cover.classList.add("is-closing");
  setTimeout(() => {
    cover.hidden = true;
    page.hidden = false;
    if (navLogo) navLogo.hidden = false;
    requestAnimationFrame(() => page.classList.add("is-visible"));
  }, 400);
}

// ---------------------------------------------
// Corner nav logo toggle
// ---------------------------------------------

function initNav() {
  const logo = document.getElementById("nav-logo");
  const flyout = document.getElementById("nav-flyout");
  if (!logo || !flyout) return;

  logo.addEventListener("click", (e) => {
    e.stopPropagation();
    flyout.hidden = !flyout.hidden;
  });

  document.addEventListener("click", (e) => {
    if (!flyout.hidden && !flyout.contains(e.target) && e.target !== logo) {
      flyout.hidden = true;
    }
  });
}

// ---------------------------------------------
// City map: renders buildings from window.CITY_BUILDINGS
// Each building: { title, href, left, top, color }
// left/top are percentages, color is any CSS color value (optional)
// ---------------------------------------------

function initCityMap() {
  const map = document.getElementById("city-map");
  if (!map) return;

  const buildings = window.CITY_BUILDINGS || [];

  buildings.forEach((b) => {
    const el = document.createElement("a");
    el.className = "building";
    el.href = b.href || "#";
    el.style.left = b.left + "%";
    el.style.top = b.top + "%";
    if (b.color) el.style.setProperty("--building-color", b.color);

    const label = document.createElement("span");
    label.className = "building-label";
    label.textContent = b.title || "";
    el.appendChild(label);

    map.appendChild(el);
  });
}

// ---------------------------------------------
// Item surface: draggable, randomized, tap-and-hold reveal
// (bookshelf / closet / kitchen pages)
// Reads window.PAGE_ITEMS: [{ id, title, text, rating, author? }]
// "author" is optional — bookshelf uses it, closet/kitchen/favorites
// don't need it and can just leave it out.
// ---------------------------------------------

function initItemSurface() {
  const surface = document.getElementById("item-surface");
  const card = document.getElementById("info-card");
  if (!surface || !card) return;

  const titleEl = document.getElementById("info-title");
  const authorEl = document.getElementById("info-author");
  const textEl = document.getElementById("info-text");
  const ratingEl = document.getElementById("info-rating");
  const items = window.PAGE_ITEMS || [];

  items.forEach((item) => {
    // A real img (not a CSS background) when the item has a "cover" —
    // used by bookshelf, so cutout covers keep their true silhouette
    // instead of being cropped into a square. Closet/kitchen items
    // have no "cover" field, so they render as the usual colored
    // square, unchanged.
    const el = document.createElement(item.cover ? "img" : "div");
    el.className = "item";
    if (item.cover) {
      el.src = item.cover;
      el.alt = "";
      // Images are natively draggable in the browser by default, which
      // fights with the custom pointer-based dragging below — turn it off.
      el.draggable = false;
    }
    el.style.left = 5 + Math.random() * 80 + "%";
    el.style.top = 8 + Math.random() * 65 + "%";
    el.style.setProperty("--rotate", (Math.random() * 16 - 8).toFixed(1) + "deg");
    el.dataset.id = item.id;
    surface.appendChild(el);

    makeDraggable(el);
    makeClickable(el, () => showInfoCard(card, titleEl, textEl, ratingEl, item, null, authorEl));
  });

  document.addEventListener("pointerdown", (e) => {
    if (!card.hidden && !card.contains(e.target) && !e.target.closest(".item")) {
      card.hidden = true;
    }
  });
}

const RATING_MAX = 5;

function starRating(rating) {
  const filled = Math.max(0, Math.min(RATING_MAX, rating));
  return "★".repeat(filled) + "☆".repeat(RATING_MAX - filled);
}

// anchorRect is optional — pass a getBoundingClientRect() result to
// pop the card up beside that element instead of the default fixed
// bottom-center spot. authorEl is optional too — only bookshelf's
// info card has one; pages without it just skip this.
function showInfoCard(card, titleEl, textEl, ratingEl, item, anchorRect, authorEl) {
  titleEl.textContent = item.title;
  if (authorEl) {
    authorEl.textContent = item.author || "";
    authorEl.hidden = !item.author;
  }
  textEl.textContent = item.text;
  ratingEl.textContent = starRating(item.rating);
  card.hidden = false;

  if (anchorRect) {
    positionCardNearAnchor(card, anchorRect);
  } else {
    card.classList.add("is-default");
    card.style.left = "";
    card.style.top = "";
    card.style.bottom = "";
    card.style.transform = "";
  }
}

function positionCardNearAnchor(card, anchorRect) {
  card.classList.remove("is-default");
  card.style.transform = "none";
  card.style.bottom = "auto";

  const margin = 14;
  const cardWidth = card.offsetWidth;
  const cardHeight = card.offsetHeight;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Prefer the right side of the book; flip to the left if it would
  // run off the edge of the screen.
  let left = anchorRect.right + margin;
  if (left + cardWidth > viewportWidth - margin) {
    left = anchorRect.left - cardWidth - margin;
  }
  left = Math.max(margin, left);

  let top = anchorRect.top;
  if (top + cardHeight > viewportHeight - margin) {
    top = viewportHeight - cardHeight - margin;
  }
  top = Math.max(margin, top);

  card.style.left = left + "px";
  card.style.top = top + "px";
}

// ---------------------------------------------
// Writing: editorial masthead list — large thumbnail beside title,
// date, and excerpt, whole row clickable. Reads
// window.WRITING_ENTRIES: [{ id, title, date, excerpt, href, image? }]
// "image" is an optional thumbnail photo path; without one, a
// rotating set of placeholder colors is used instead.
// ---------------------------------------------

function initWritingList() {
  const feed = document.getElementById("writing-feed");
  if (!feed) return;

  const entries = window.WRITING_ENTRIES || [];

  entries.forEach((entry, i) => {
    const row = document.createElement("a");
    row.className = "writing-row";
    row.href = entry.href || "#";

    const thumb = document.createElement("div");
    thumb.className = "writing-thumb";
    if (entry.image) {
      thumb.style.backgroundImage = `url(${entry.image})`;
    } else {
      thumb.style.background = THUMB_COLORS[i % THUMB_COLORS.length];
    }
    row.appendChild(thumb);

    const content = document.createElement("div");
    content.className = "writing-row-content";

    const title = document.createElement("p");
    title.className = "writing-title";
    title.textContent = entry.title;
    content.appendChild(title);

    if (entry.date) {
      const date = document.createElement("p");
      date.className = "writing-date";
      date.textContent = entry.date;
      content.appendChild(date);
    }

    if (entry.excerpt) {
      const excerpt = document.createElement("p");
      excerpt.className = "writing-excerpt";
      excerpt.textContent = entry.excerpt;
      content.appendChild(excerpt);
    }

    row.appendChild(content);
    feed.appendChild(row);
  });
}

// ---------------------------------------------
// Photography: numbered story frames in a grid. Each story holds a
// stack of photos you page through with arrows once clicked in.
// Reads window.PHOTO_STORIES:
// [{ id, title, description, shotOn, date, photos: [{ src, caption }] }]
// "src" is optional per photo — without one a colored placeholder
// is shown instead.
// ---------------------------------------------

let currentStory = null;
let currentPhotoIndex = 0;

function initPhotoGallery() {
  const grid = document.getElementById("photo-grid");
  const storyView = document.getElementById("story-view");
  if (!grid || !storyView) return;

  const stories = window.PHOTO_STORIES || [];

  stories.forEach((story, i) => {
    const tile = document.createElement("div");
    tile.className = "photo-story";

    const header = document.createElement("div");
    header.className = "photo-story-header";
    header.innerHTML =
      `<span class="photo-story-number">#${i + 1}</span>` +
      `<span class="photo-story-title">${story.title || ""}</span>`;
    tile.appendChild(header);

    const cover = story.photos && story.photos[0];
    const image = document.createElement("div");
    image.className = "photo-story-image";
    if (cover && cover.src) {
      image.style.backgroundImage = `url(${cover.src})`;
    } else {
      image.style.background = THUMB_COLORS[i % THUMB_COLORS.length];
      image.textContent = "photo";
    }
    tile.appendChild(image);

    if (story.description) {
      const desc = document.createElement("p");
      desc.className = "photo-story-description";
      desc.textContent = story.description;
      tile.appendChild(desc);
    }

    const meta = document.createElement("div");
    meta.className = "photo-story-meta";
    meta.innerHTML =
      `<span>${story.shotOn ? "Shot on: " + story.shotOn : ""}</span>` +
      `<span>${story.date || ""}</span>`;
    tile.appendChild(meta);

    tile.addEventListener("click", () => openStory(story, i));
    grid.appendChild(tile);
  });

  document.getElementById("story-close").addEventListener("click", closeStory);
  document.getElementById("story-prev").addEventListener("click", () => stepStory(-1));
  document.getElementById("story-next").addEventListener("click", () => stepStory(1));
  storyView.addEventListener("click", (e) => {
    if (e.target === storyView) closeStory();
  });
}

const THUMB_COLORS = [
  "var(--color-plum)",
  "var(--color-cobalt)",
  "var(--color-olive)",
  "var(--color-sage)",
  "var(--color-periwinkle)"
];

function openStory(story, index) {
  currentStory = story;
  currentPhotoIndex = 0;
  document.getElementById("story-number").textContent = "#" + (index + 1);
  document.getElementById("story-title").textContent = story.title || "";
  document.getElementById("story-shot-on").textContent = story.shotOn ? "Shot on: " + story.shotOn : "";
  document.getElementById("story-date").textContent = story.date || "";
  renderStoryPhoto();
  document.getElementById("story-view").hidden = false;
}

function stepStory(delta) {
  if (!currentStory) return;
  const total = currentStory.photos.length;
  currentPhotoIndex = (currentPhotoIndex + delta + total) % total;
  renderStoryPhoto();
}

function renderStoryPhoto() {
  const photo = currentStory.photos[currentPhotoIndex];
  const img = document.getElementById("story-image");
  const caption = document.getElementById("story-caption");

  if (photo.src) {
    img.src = photo.src;
    img.hidden = false;
  } else {
    img.hidden = true;
  }
  caption.textContent = photo.caption || "";

  const nav = document.querySelector(".story-nav");
  nav.style.setProperty("--photo-count", currentStory.photos.length);
}

function closeStory() {
  document.getElementById("story-view").hidden = true;
  currentStory = null;
}

// ---------------------------------------------
// chloé irl: small-thoughts feed, Notes-style. Reads
// window.NOTES_ENTRIES: [{ id, date, text, photo? }]
// "photo" is optional — omit it entirely for a text-only note.
// An empty photo object ({}) shows a placeholder; add "src" once
// you have a real image.
// ---------------------------------------------

function initNotesFeed() {
  const feed = document.getElementById("notes-feed");
  if (!feed) return;

  const notes = window.NOTES_ENTRIES || [];

  notes.forEach((note, i) => {
    const item = document.createElement("div");
    item.className = "note";

    if (note.date) {
      const date = document.createElement("p");
      date.className = "note-date";
      date.textContent = note.date;
      item.appendChild(date);
    }

    if (note.text) {
      const text = document.createElement("p");
      text.className = "note-text";
      text.textContent = note.text;
      item.appendChild(text);
    }

    if (note.video) {
      item.appendChild(buildNoteVideo(note.video, i));
    } else if (note.photo) {
      if (note.photo.src) {
        // Real img tag (not a CSS background) so portrait photos keep
        // their natural proportions instead of being cropped square.
        const photo = document.createElement("img");
        photo.className = "note-photo";
        photo.src = note.photo.src;
        photo.alt = "";
        item.appendChild(photo);
      } else {
        const photo = document.createElement("div");
        photo.className = "note-photo-placeholder";
        photo.style.background = THUMB_COLORS[i % THUMB_COLORS.length];
        item.appendChild(photo);
      }
    }

    feed.appendChild(item);
  });
}

function buildNoteVideo(video, i) {
  const wrap = document.createElement("div");
  wrap.className = "note-video";

  if (video.src) {
    const videoEl = document.createElement("video");
    videoEl.src = video.src;
    videoEl.controls = true;
    videoEl.playsInline = true;
    // Loads just enough to paint the first frame as a thumbnail,
    // without downloading the whole clip up front.
    videoEl.preload = "metadata";
    wrap.appendChild(videoEl);
  } else {
    wrap.classList.add("note-video-placeholder");
    wrap.style.background = THUMB_COLORS[i % THUMB_COLORS.length];
    wrap.textContent = "video";
  }

  return wrap;
}

function makeDraggable(el) {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  el.addEventListener("pointerdown", (e) => {
    dragging = true;
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    el.classList.add("is-dragging");
  });

  el.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const parentRect = el.parentElement.getBoundingClientRect();
    const left = e.clientX - parentRect.left - offsetX;
    const top = e.clientY - parentRect.top - offsetY;
    el.style.left = left + "px";
    el.style.top = top + "px";
  });

  const stopDragging = () => {
    dragging = false;
    el.classList.remove("is-dragging");
  };

  el.addEventListener("pointerup", stopDragging);
  el.addEventListener("pointercancel", stopDragging);
}

// Fires onClick when a press releases without moving past the
// tolerance — coexists with makeDraggable so a drag never also
// triggers the info box, and there's no artificial wait like a
// long-press would need.
function makeClickable(el, onClick) {
  const MOVE_TOLERANCE_PX = 8;
  let startX = 0;
  let startY = 0;
  let moved = false;

  el.addEventListener("pointerdown", (e) => {
    moved = false;
    startX = e.clientX;
    startY = e.clientY;
  });

  el.addEventListener("pointermove", (e) => {
    if (Math.abs(e.clientX - startX) > MOVE_TOLERANCE_PX || Math.abs(e.clientY - startY) > MOVE_TOLERANCE_PX) {
      moved = true;
    }
  });

  el.addEventListener("pointerup", () => {
    if (!moved) onClick();
  });
}
