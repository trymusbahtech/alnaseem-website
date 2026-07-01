// Shared interactions for all static pages.
(function () {
  "use strict";

  document.documentElement.classList.add("js-enabled");

  var body = document.body;
  var drawer = document.querySelector("[data-drawer]");
  var openDrawer = document.querySelector("[data-open-drawer]");
  var closeDrawer = document.querySelector("[data-close-drawer]");
  var backdrop = document.querySelector("[data-drawer-backdrop]");

  function setDrawer(open) {
    body.classList.toggle("drawer-open", open);
    if (drawer) {
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
    }
  }

  if (openDrawer) {
    openDrawer.addEventListener("click", function () {
      setDrawer(true);
    });
  }

  [closeDrawer, backdrop].forEach(function (item) {
    if (item) {
      item.addEventListener("click", function () {
        setDrawer(false);
      });
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setDrawer(false);
    }
  });

  document.querySelectorAll(".drawer-nav a, .drawer-actions a").forEach(function (link) {
    link.addEventListener("click", function () {
      setDrawer(false);
    });
  });

  var revealItems = document.querySelectorAll(".fade-up");
  revealItems.forEach(function (item, index) {
    item.style.setProperty("--reveal-index", String(index % 6));
  });

  if ("IntersectionObserver" in window && revealItems.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "180px 0px 180px 0px", threshold: 0.01 });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });

    window.setTimeout(function () {
      revealItems.forEach(function (item) {
        item.classList.add("is-visible");
      });
    }, 1800);
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  var counters = document.querySelectorAll("[data-counter]");
  function animateCounter(counter) {
    if (counter.getAttribute("data-counted") === "true") return;
    counter.setAttribute("data-counted", "true");
    var target = Number(counter.getAttribute("data-counter") || "0");
    var suffix = counter.getAttribute("data-suffix") || "";
    var duration = 1200;
    var start = null;

    function tick(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.floor(target * eased);
      counter.textContent = value.toLocaleString("en-US") + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    }

    window.requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window && counters.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "180px 0px 180px 0px", threshold: 0.1 });

    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });

    window.setTimeout(function () {
      counters.forEach(animateCounter);
    }, 1800);
  } else {
    counters.forEach(animateCounter);
  }

  window.setTimeout(function () {
    document.querySelectorAll('img[loading="lazy"]').forEach(function (image) {
      if (image.complete && image.naturalWidth > 0) return;
      var source = image.getAttribute("src");
      image.setAttribute("loading", "eager");
      if (source) image.src = source;
    });
  }, 1400);

  document.querySelectorAll("[data-slider]").forEach(function (slider) {
    var track = slider.querySelector("[data-slider-track]");
    var sliderScope = slider.parentElement || slider;
    var next = slider.querySelector("[data-slider-next]") || sliderScope.querySelector("[data-slider-next]");
    var prev = slider.querySelector("[data-slider-prev]") || sliderScope.querySelector("[data-slider-prev]");
    if (!track) return;

    function move(direction) {
      var amount = track.clientWidth * 0.72;
      var rtl = document.documentElement.dir === "rtl";
      track.scrollBy({
        left: rtl ? -amount * direction : amount * direction,
        behavior: "smooth"
      });
    }

    if (next) next.addEventListener("click", function () { move(1); });
    if (prev) prev.addEventListener("click", function () { move(-1); });
  });

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    var slides = slider.querySelectorAll("img");
    if (slides.length < 2) return;
    var current = 0;
    slides[current].classList.add("is-active");
    window.setInterval(function () {
      slides[current].classList.remove("is-active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("is-active");
    }, 5200);
  });

  var galleryItems = Array.prototype.slice.call(document.querySelectorAll("[data-gallery-item]"));
  if (galleryItems.length) {
    var isRtl = document.documentElement.dir === "rtl";
    var galleryIndex = 0;
    var activeGalleryTrigger = null;
    var touchStartX = 0;

    var lightbox = document.createElement("div");
    lightbox.className = "gallery-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = [
      '<div class="gallery-lightbox-panel">',
      '<button class="gallery-lightbox-btn gallery-lightbox-close" type="button" aria-label="' + (isRtl ? "إغلاق" : "Close") + '">×</button>',
      '<button class="gallery-lightbox-btn gallery-lightbox-prev" type="button" aria-label="' + (isRtl ? "السابق" : "Previous") + '">' + (isRtl ? "›" : "‹") + '</button>',
      '<button class="gallery-lightbox-btn gallery-lightbox-next" type="button" aria-label="' + (isRtl ? "التالي" : "Next") + '">' + (isRtl ? "‹" : "›") + '</button>',
      '<div class="gallery-lightbox-image-wrap"><img class="gallery-lightbox-image" alt=""></div>',
      '<div class="gallery-lightbox-meta"><p class="gallery-lightbox-title"></p><span class="gallery-lightbox-counter"></span></div>',
      '</div>'
    ].join("");
    document.body.appendChild(lightbox);

    var lightboxImage = lightbox.querySelector(".gallery-lightbox-image");
    var lightboxTitle = lightbox.querySelector(".gallery-lightbox-title");
    var lightboxCounter = lightbox.querySelector(".gallery-lightbox-counter");
    var closeGallery = lightbox.querySelector(".gallery-lightbox-close");
    var prevGallery = lightbox.querySelector(".gallery-lightbox-prev");
    var nextGallery = lightbox.querySelector(".gallery-lightbox-next");
    var imageWrap = lightbox.querySelector(".gallery-lightbox-image-wrap");

    function setGalleryImage(index) {
      galleryIndex = (index + galleryItems.length) % galleryItems.length;
      var item = galleryItems[galleryIndex];
      var image = item.querySelector("img");
      var source = item.getAttribute("data-gallery-src") || (image ? image.getAttribute("src") : "");
      var title = item.getAttribute("data-gallery-title") || (image ? image.getAttribute("alt") : "");

      lightboxImage.src = source;
      lightboxImage.alt = title;
      lightboxTitle.textContent = title;
      lightboxCounter.textContent = String(galleryIndex + 1) + " / " + String(galleryItems.length);
    }

    function openGallery(index, trigger) {
      activeGalleryTrigger = trigger || galleryItems[index];
      setGalleryImage(index);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("gallery-open");
      closeGallery.focus();
    }

    function closeGalleryView() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("gallery-open");
      if (activeGalleryTrigger) activeGalleryTrigger.focus();
    }

    function showNextGallery() {
      setGalleryImage(galleryIndex + 1);
    }

    function showPrevGallery() {
      setGalleryImage(galleryIndex - 1);
    }

    galleryItems.forEach(function (item, index) {
      item.addEventListener("click", function () {
        openGallery(index, item);
      });
    });

    closeGallery.addEventListener("click", closeGalleryView);
    nextGallery.addEventListener("click", showNextGallery);
    prevGallery.addEventListener("click", showPrevGallery);

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeGalleryView();
    });

    document.addEventListener("keydown", function (event) {
      if (!lightbox.classList.contains("is-open")) return;
      if (event.key === "Escape") closeGalleryView();
      if (event.key === "ArrowRight") {
        if (isRtl) showPrevGallery();
        else showNextGallery();
      }
      if (event.key === "ArrowLeft") {
        if (isRtl) showNextGallery();
        else showPrevGallery();
      }
    });

    imageWrap.addEventListener("pointerdown", function (event) {
      touchStartX = event.clientX;
    });

    imageWrap.addEventListener("pointerup", function (event) {
      var delta = event.clientX - touchStartX;
      if (Math.abs(delta) < 45) return;
      if (delta > 0) {
        if (isRtl) showNextGallery();
        else showPrevGallery();
      } else if (isRtl) {
        showPrevGallery();
      } else {
        showNextGallery();
      }
    });
  }

  document.querySelectorAll("[data-back-to-top]").forEach(function (button) {
    function syncBackToTop() {
      button.classList.toggle("is-visible", window.scrollY > 520);
    }

    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", syncBackToTop, { passive: true });
    syncBackToTop();
  });

  document.querySelectorAll(".faq-question").forEach(function (button) {
    button.addEventListener("click", function () {
      var item = button.closest(".faq-item");
      var answer = item ? item.querySelector(".faq-answer") : null;
      if (!item || !answer) return;
      var isOpen = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var buttons = group.querySelectorAll("[data-filter]");
    var scopeSelector = group.getAttribute("data-filter-scope");
    var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    var items = scope ? scope.querySelectorAll("[data-category]") : [];

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter");
        buttons.forEach(function (btn) { btn.classList.remove("is-active"); });
        button.classList.add("is-active");
        items.forEach(function (item) {
          var matches = value === "all" || item.getAttribute("data-category") === value;
          item.classList.toggle("hidden", !matches);
        });
      });
    });
  });

  document.querySelectorAll("[data-search]").forEach(function (input) {
    var targetSelector = input.getAttribute("data-search");
    var target = document.querySelector(targetSelector);
    var items = target ? target.querySelectorAll("[data-search-text]") : [];
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      items.forEach(function (item) {
        var text = item.getAttribute("data-search-text").toLowerCase();
        item.classList.toggle("hidden", query.length > 0 && text.indexOf(query) === -1);
      });
    });
  });

  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var valid = true;
      form.querySelectorAll(".error-text").forEach(function (error) {
        error.remove();
      });

      form.querySelectorAll("[required]").forEach(function (field) {
        var fieldValid = true;
        if (field.type === "file") {
          fieldValid = field.files && field.files.length > 0;
        } else {
          fieldValid = field.value.trim().length > 0;
        }

        if (field.type === "email" && field.value.trim()) {
          fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        }

        if (!fieldValid) {
          valid = false;
          var error = document.createElement("span");
          error.className = "error-text";
          error.textContent = form.getAttribute("data-error") || "Please complete this field.";
          field.insertAdjacentElement("afterend", error);
        }
      });

      var message = form.querySelector(".form-message");
      if (valid && message) {
        message.classList.add("is-visible");
        form.reset();
      }
    });
  });
})();
