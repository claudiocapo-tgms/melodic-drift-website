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
