// Placeholder form behaviour: shows the thank-you message and sends nothing.
// Replace the body of the submit handler with a fetch() to your form backend
// (for example MailerLite or Formspree) and only show the message on success.
(function () {
  var form = document.getElementById("join-form");
  var status = document.getElementById("join-status");
  if (!form || !status) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    form.hidden = true;
    status.hidden = false;
  });
})();
