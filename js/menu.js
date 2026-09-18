(function () {
  var tabs = document.querySelectorAll(".tab");
  var groups = document.querySelectorAll(".menu-group");
  var searchInput = document.getElementById("menu-search");
  var searchEmpty = document.getElementById("search-empty");

  function applyCategoryFilter(category) {
    groups.forEach(function (group) {
      var match = category === "all" || group.getAttribute("data-category") === category;
      group.hidden = !match;
      if (match) {
        group.querySelectorAll(".menu-card").forEach(function (card) {
          card.hidden = false;
        });
      }
    });
    searchEmpty.hidden = true;
  }

  function activeCategory() {
    var active = document.querySelector(".tab.active");
    return active ? active.getAttribute("data-category") : "all";
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("active");
        t.setAttribute("aria-pressed", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-pressed", "true");

      searchInput.value = "";
      applyCategoryFilter(tab.getAttribute("data-category"));
    });
  });

  searchInput.addEventListener("input", function () {
    var query = searchInput.value.trim().toLowerCase();

    if (!query) {
      applyCategoryFilter(activeCategory());
      return;
    }

    var anyVisible = false;

    groups.forEach(function (group) {
      group.hidden = false;
      var groupHasMatch = false;

      group.querySelectorAll(".menu-card").forEach(function (card) {
        var btn = card.querySelector(".card-photo-btn");
        var name = (btn.getAttribute("data-name") || "").toLowerCase();
        var desc = (btn.getAttribute("data-desc") || "").toLowerCase();
        var isMatch = name.indexOf(query) !== -1 || desc.indexOf(query) !== -1;
        card.hidden = !isMatch;
        if (isMatch) {
          groupHasMatch = true;
          anyVisible = true;
        }
      });

      group.hidden = !groupHasMatch;
    });

    searchEmpty.hidden = anyVisible;
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

  // Tap a menu photo to expand a detail view (name, price, description,
  // and optional category/vegetarian/ingredients/allergens when present).
  var overlay = document.getElementById("detail-overlay");
  var panel = overlay.querySelector(".detail-panel");
  var closeBtn = document.getElementById("detail-close");
  var detailPhoto = document.getElementById("detail-photo");
  var detailCategory = document.getElementById("detail-category");
  var detailName = document.getElementById("detail-name");
  var detailPrice = document.getElementById("detail-price");
  var detailTags = document.getElementById("detail-tags");
  var detailDesc = document.getElementById("detail-desc");
  var ingredientsWrap = document.getElementById("detail-ingredients-wrap");
  var ingredientsText = document.getElementById("detail-ingredients");
  var allergensWrap = document.getElementById("detail-allergens-wrap");
  var allergensText = document.getElementById("detail-allergens");
  var lastTrigger = null;

  function openDetail(trigger) {
    lastTrigger = trigger;
    detailPhoto.src = trigger.getAttribute("data-photo");
    detailPhoto.alt = trigger.getAttribute("data-name");
    detailCategory.textContent = trigger.getAttribute("data-category") || "";
    detailName.textContent = trigger.getAttribute("data-name");
    detailPrice.textContent = trigger.getAttribute("data-price");
    detailTags.hidden = trigger.getAttribute("data-veg") !== "true";
    detailDesc.textContent = trigger.getAttribute("data-desc");

    var ingredients = trigger.getAttribute("data-ingredients");
    ingredientsWrap.hidden = !ingredients;
    ingredientsText.textContent = ingredients || "";

    var allergens = trigger.getAttribute("data-allergens");
    allergensWrap.hidden = !allergens;
    allergensText.textContent = allergens || "";

    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeDetail() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (lastTrigger) {
      lastTrigger.focus();
    }
  }

  document.querySelectorAll(".card-photo-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openDetail(btn);
    });
  });

  closeBtn.addEventListener("click", closeDetail);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      closeDetail();
    }
  });

  panel.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) {
      closeDetail();
    }
  });

  // Restaurant info panel
  var infoOverlay = document.getElementById("info-overlay");
  var infoPanel = infoOverlay.querySelector(".detail-panel");
  var infoOpenBtn = document.getElementById("info-open");
  var infoCloseBtn = document.getElementById("info-close");

  function openInfo() {
    infoOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    infoCloseBtn.focus();
  }

  function closeInfo() {
    infoOverlay.hidden = true;
    document.body.style.overflow = "";
    infoOpenBtn.focus();
  }

  infoOpenBtn.addEventListener("click", openInfo);
  infoCloseBtn.addEventListener("click", closeInfo);

  infoOverlay.addEventListener("click", function (e) {
    if (e.target === infoOverlay) {
      closeInfo();
    }
  });

  infoPanel.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !infoOverlay.hidden) {
      closeInfo();
    }
  });
})();
