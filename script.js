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
