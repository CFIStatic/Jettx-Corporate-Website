/**
 * Jettx Corporate Website — progressive enhancement.
 * Everything here is optional: the site is fully usable with JS disabled.
 */
(function () {
  "use strict";

  /* ---------------------------------------------------- mobile nav ----- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    // Close the menu when a link is followed on small screens.
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ------------------------------------------------ current year ------- */
  document.querySelectorAll("[data-current-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* --------------------------------------------- contact form ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  var status = form.querySelector(".form__status");

  function setError(field, message) {
    var slot = field.parentElement.querySelector(".field__error");
    if (slot) slot.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  }

  function validate() {
    var ok = true;
    var required = form.querySelectorAll("[data-required]");

    required.forEach(function (field) {
      var value = field.value.trim();
      var message = "";

      if (!value) {
        message = "This field is required.";
      } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        message = "Enter a valid email address.";
      }

      if (!setError(field, message)) ok = false;
    });

    return ok;
  }

  form.addEventListener("submit", function (event) {
    // No backend is wired up yet — see README for how to connect one.
    event.preventDefault();

    if (!validate()) {
      if (status) {
        status.hidden = false;
        status.textContent = "Please correct the highlighted fields and try again.";
      }
      var firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (status) {
      status.hidden = false;
      status.textContent =
        "Thanks — this form is not connected to a backend yet. " +
        "Please email hello@example.com in the meantime.";
    }
    form.reset();
  });
})();
