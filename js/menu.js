(function () {
  var tabs = document.querySelectorAll(".tab");
  var groups = document.querySelectorAll(".menu-group");

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("active");
        t.setAttribute("aria-pressed", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-pressed", "true");

      var category = tab.getAttribute("data-category");
      groups.forEach(function (group) {
        var match = category === "all" || group.getAttribute("data-category") === category;
        group.hidden = !match;
      });
    });
  });

  // Cards are fully visible by default (no-JS/base state). Only cards
  // below the fold at load get a "pre-reveal" hidden state, so a scroll
  // cascade plays as the user reaches them, without ever hiding content
  // behind a script that might fail to run.
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && "IntersectionObserver" in window) {
    var cards = document.querySelectorAll(".menu-card");
    var toReveal = [];

    cards.forEach(function (card, i) {
      var rect = card.getBoundingClientRect();
      var alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (!alreadyVisible) {
        card.classList.add("pre-reveal");
        card.style.transitionDelay = Math.min(i, 6) * 60 + "ms";
        toReveal.push(card);
      }
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.remove("pre-reveal");
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    toReveal.forEach(function (card) {
      io.observe(card);
    });
  }
})();
