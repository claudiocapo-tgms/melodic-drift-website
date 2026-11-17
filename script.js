// Forms name their thank-you block in data-status.
// Each form is sent to its action URL (the footer form to MailerLite, the contact form to send-contact.php)
// and only shows the thank-you message when the server answers {"success": true}.
// Errors are read from {"errors": {...}} (MailerLite) or {"message": "..."} (send-contact.php).
(function () {
  document.querySelectorAll("form[data-status]").forEach(function (form) {
    var status = document.getElementById(form.getAttribute("data-status"));
    var error = document.getElementById(form.getAttribute("data-error") || "");
    if (!status) return;

    function done() {
      form.hidden = true;
      status.hidden = false;
    }

    function fail(message, button) {
      if (error) {
        error.textContent = message || "Something went wrong. Please try again in a moment.";
        error.hidden = false;
      }
      if (button) button.disabled = false;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var button = form.querySelector("button[type=submit]");
      if (error) error.hidden = true;
      if (button) button.disabled = true;

      fetch(form.action, { method: "POST", body: new FormData(form) })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data && data.success) {
            done();
            return;
          }
          var message = "";
          if (data && data.errors && data.errors.fields) {
            var first = Object.keys(data.errors.fields)[0];
            if (first) message = data.errors.fields[first][0];
          } else if (data && data.message) {
            message = data.message;
          }
          fail(message, button);
        })
        .catch(function () {
          fail("", button);
        });
    });
  });
})();

// Homepage: the hero title dissolves like smoke while you scroll down.
// Scroll progress drives opacity, upward drift, a noise displacement and a blur (see the #smoke filter in index.html).
(function () {
  var title = document.querySelector(".hero__title");
  var displace = document.getElementById("smoke-displace");
  var blur = document.getElementById("smoke-blur");
  if (!title || !displace || !blur) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var ticking = false;

  function update() {
    ticking = false;
    var distance = Math.max(window.innerHeight * 0.55, 1);
    var p = Math.min(Math.max(window.scrollY / distance, 0), 1);

    if (p < 0.005) {
      title.style.filter = "";
      title.style.opacity = "";
      title.style.transform = "";
      return;
    }

    var eased = p * p; // starts gently, then dissolves faster
    displace.setAttribute("scale", String(eased * 170));
    blur.setAttribute("stdDeviation", String(eased * 8));
    title.style.filter = "url(#smoke)";
    title.style.opacity = String(1 - Math.pow(p, 1.4));
    title.style.transform = "translate3d(0," + (-p * 70) + "px,0) scale(" + (1 + p * 0.05) + ")";
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  update();
})();

// Gallery: thumbnail videos play muted only while they are on screen (saves bandwidth and battery).
// With reduced motion they stay paused on their poster image.
(function () {
  var videos = document.querySelectorAll(".gallery video");
  if (!videos.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var v = entry.target;
      if (entry.isIntersecting) {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.35 });

  videos.forEach(function (v) { observer.observe(v); });
})();

// Gallery: previous/next buttons scroll the two-row slider.
(function () {
  var track = document.getElementById("gallery-track");
  if (!track) return;
  document.querySelectorAll(".gallery-nav__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var dir = Number(btn.getAttribute("data-dir"));
      track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: "smooth" });
    });
  });
})();

// Gallery: lightbox. Click a tile to view it large; arrows / swipe / keys move on, Esc closes.
(function () {
  var box = document.getElementById("lightbox");
  var stage = document.getElementById("lightbox-stage");
  var count = document.getElementById("lightbox-count");
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".gallery .tile"));
  if (!box || !stage || !tiles.length || typeof box.showModal !== "function") return;

  var index = 0;

  function show(i) {
    index = (i + tiles.length) % tiles.length;
    var tile = tiles[index];
    var src = tile.getAttribute("data-full");
    var isVideo = tile.classList.contains("tile--video");
    stage.textContent = "";
    var el;
    if (isVideo) {
      el = document.createElement("video");
      el.src = src;
      el.poster = tile.getAttribute("data-poster") || "";
      el.controls = true;
      el.autoplay = true;
      el.loop = true;
      el.playsInline = true;
    } else {
      el = document.createElement("img");
      el.src = src;
      el.alt = "Melodic Drift atmosphere";
    }
    stage.appendChild(el);
    count.textContent = (index + 1) + " / " + tiles.length;
    if (isVideo) {
      var p = el.play();
      if (p && p.catch) p.catch(function () {});
    }
  }

  function close() {
    box.close();
  }

  tiles.forEach(function (tile, i) {
    tile.addEventListener("click", function () {
      show(i);
      box.showModal();
    });
  });

  box.addEventListener("close", function () {
    stage.textContent = "";
    if (tiles[index]) tiles[index].focus({ preventScroll: true });
  });

  document.getElementById("lightbox-close").addEventListener("click", close);
  document.getElementById("lightbox-prev").addEventListener("click", function () { show(index - 1); });
  document.getElementById("lightbox-next").addEventListener("click", function () { show(index + 1); });

  // Click on the dark area (not on the media or buttons) closes.
  box.addEventListener("click", function (e) {
    if (e.target === box || e.target === stage) close();
  });

  box.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });

  var startX = null;
  box.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 60) show(index + (dx < 0 ? 1 : -1));
  });
})();
