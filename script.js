// Placeholder form behaviour: shows the thank-you message and sends nothing.
// Replace the body of the submit handler with a fetch() to your form backend
// (for example MailerLite or Formspree) and only show the message on success.
// Each form names its thank-you block in data-status.
(function () {
  var forms = document.querySelectorAll("form[data-status]");
  forms.forEach(function (form) {
    var status = document.getElementById(form.getAttribute("data-status"));
    if (!status) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      form.hidden = true;
      status.hidden = false;
    });
  });
})();
