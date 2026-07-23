/* George Sebastian — portfolio interactions. No dependencies, no build. */
(function () {
  "use strict";

  /* ---- typewriter greeting (replaces react-type-animation) ---- */
  var GREETINGS = [
    "Hello!",
    "നമസ്കാരം!",
    "Bonjour!",
    "Hola!",
    "नमस्ते!",
    "Ciao!",
    "こんにちは!",
  ];
  var TYPE_MS = 90;
  var DELETE_MS = 45;
  var HOLD_MS = 2000;

  var typeEl = document.getElementById("typewriter");
  if (typeEl) {
    var gi = 0;
    var chars = Array.from(GREETINGS[0]);
    var pos = 0;
    var deleting = false;

    var tick = function () {
      if (!deleting) {
        pos++;
        typeEl.textContent = chars.slice(0, pos).join("");
        if (pos === chars.length) {
          deleting = true;
          setTimeout(tick, HOLD_MS);
          return;
        }
        setTimeout(tick, TYPE_MS);
      } else {
        pos--;
        typeEl.textContent = chars.slice(0, pos).join("");
        if (pos === 0) {
          deleting = false;
          gi = (gi + 1) % GREETINGS.length;
          chars = Array.from(GREETINGS[gi]);
        }
        setTimeout(tick, DELETE_MS);
      }
    };
    setTimeout(tick, 400);
  }

  /* ---- dark mode toggle (class on <html>, persisted) ---- */
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var dark = document.documentElement.classList.toggle("dark");
      try {
        localStorage.setItem("theme", dark ? "dark" : "light");
      } catch (e) {
        /* private mode */
      }
    });
  }

  /* ---- mobile menu ---- */
  var nav = document.getElementById("nav");
  var menuBtn = document.getElementById("menu-toggle");
  if (nav && menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
