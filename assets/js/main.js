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

  document.querySelectorAll("[data-typewriter]").forEach(function (item) {
    var lineSource = item.getAttribute("data-typewriter-lines");
    var lines = lineSource ? lineSource.split("|").map(function (line) { return line.trim(); }).filter(Boolean) : [item.textContent.trim()];
    var text = lines.join(" ");
    var characters = Array.from(text);
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!text || reduceMotion) return;

    item.setAttribute("aria-label", text);
    item.textContent = "";
    item.classList.add("is-typing");

    lines.forEach(function (line) {
      var lineItem = document.createElement("span");
      item.appendChild(lineItem);
    });

    var lineItems = item.querySelectorAll("span");
    var typedIndex = 0;
    lines.forEach(function (line, lineIndex) {
      Array.from(line).forEach(function (character) {
        var currentIndex = typedIndex;
        typedIndex += 1;
        window.setTimeout(function () {
          lineItems.forEach(function (lineItem) {
            lineItem.classList.remove("is-current-line");
          });
          lineItems[lineIndex].classList.add("is-current-line");
          lineItems[lineIndex].textContent += character;
          if (currentIndex === characters.length - 1) {
            lineItems[lineIndex].classList.remove("is-current-line");
            item.classList.remove("is-typing");
            item.classList.add("typing-complete");
          }
        }, 520 + (currentIndex * 58));
      });

      if (lineIndex < lines.length - 1) {
        typedIndex += 1;
      }
    });

    if (!typedIndex) {
      window.setTimeout(function () {
          item.classList.remove("is-typing");
          item.classList.add("typing-complete");
      }, 520);
    }
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

  var allVideos = Array.prototype.slice.call(document.querySelectorAll("video"));
  allVideos.forEach(function (video) {
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
  });

  var autoplayVideos = allVideos.filter(function (video) {
    return video.closest(".hero-media") && (video.hasAttribute("autoplay") || !video.hasAttribute("controls"));
  });

  function prepareAutoplayVideo(video) {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("preload", video.getAttribute("preload") || "metadata");
    if (!video.hasAttribute("controls")) {
      video.removeAttribute("controls");
    }
  }

  function playAutoplayVideo(video) {
    if (!video || video.paused === false) return;
    prepareAutoplayVideo(video);
    var playAttempt = video.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.then(function () {
        video.classList.add("is-playing");
        video.classList.remove("is-video-fallback");
      }).catch(function () {
        video.classList.add("is-video-fallback");
      });
    } else {
      video.classList.add("is-playing");
    }
  }

  if (autoplayVideos.length) {
    autoplayVideos.forEach(function (video) {
      prepareAutoplayVideo(video);
      ["loadedmetadata", "loadeddata", "canplay"].forEach(function (eventName) {
        video.addEventListener(eventName, function () {
          playAutoplayVideo(video);
        }, { once: true });
      });
      playAutoplayVideo(video);
    });

    ["touchstart", "pointerdown", "click"].forEach(function (eventName) {
      document.addEventListener(eventName, function () {
        autoplayVideos.forEach(playAutoplayVideo);
      }, { once: true, passive: true });
    });

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        autoplayVideos.forEach(playAutoplayVideo);
      }
    });
  }

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

  document.querySelectorAll("[data-service-booking]").forEach(function (booking) {
    var isEnglishBooking = document.documentElement.lang && document.documentElement.lang.toLowerCase().indexOf("en") === 0;
    var bookingText = isEnglishBooking ? {
      chooseDate: "Select date",
      chooseTime: "Select time",
      missingName: "Name not entered",
      missingPhone: "Mobile not entered",
      required: "This field is required.",
      confirmChoice: "Please confirm your choice."
    } : {
      chooseDate: "اختر التاريخ",
      chooseTime: "اختر الموعد",
      missingName: "لم يتم إدخال الاسم",
      missingPhone: "لم يتم إدخال الجوال",
      required: "هذا الحقل مطلوب.",
      confirmChoice: "برجاء تأكيد الاختيار."
    };
    var categoryButtons = booking.querySelectorAll("[data-booking-category]");
    var subservices = booking.querySelectorAll("[data-subservice]");
    var titleTarget = booking.querySelector("[data-booking-title]");
    var priceTarget = booking.querySelector("[data-booking-price]");
    var durationTarget = booking.querySelector("[data-booking-duration]");
    var detailTitle = booking.querySelector("[data-service-detail-title]");
    var detailText = booking.querySelector("[data-service-detail-text]");
    var detailPrep = booking.querySelector("[data-service-detail-prep]");
    var detailAfter = booking.querySelector("[data-service-detail-after]");
    var dateInput = booking.querySelector("#bookingDate");
    var paymentInputs = booking.querySelectorAll('input[name="paymentMethod"]');
    var bookingForm = booking.querySelector("[data-booking-form]");
    var paymentPreview = booking.querySelector("[data-payment-preview]");
    var paymentPanels = paymentPreview ? paymentPreview.querySelectorAll("[data-payment-panel]") : [];
    var bookingSteps = booking.querySelectorAll("[data-booking-step]");
    var stepIndicators = booking.querySelectorAll("[data-step-indicator]");
    var checkoutService = paymentPreview ? paymentPreview.querySelector("[data-checkout-service]") : null;
    var checkoutPriceItems = paymentPreview ? paymentPreview.querySelectorAll("[data-checkout-price]") : [];
    var checkoutDate = paymentPreview ? paymentPreview.querySelector("[data-checkout-date]") : null;
    var checkoutTime = paymentPreview ? paymentPreview.querySelector("[data-checkout-time]") : null;
    var checkoutPatient = paymentPreview ? paymentPreview.querySelector("[data-checkout-patient]") : null;
    var checkoutPhone = paymentPreview ? paymentPreview.querySelector("[data-checkout-phone]") : null;
    var installmentPriceItems = paymentPreview ? paymentPreview.querySelectorAll("[data-installment-price]") : [];
    var tamaraPriceItems = paymentPreview ? paymentPreview.querySelectorAll("[data-tamara-price]") : [];
    var completePaymentButtons = paymentPreview ? paymentPreview.querySelectorAll("[data-complete-payment]") : [];
    var bookingSuccess = booking.querySelector("[data-booking-success]");
    var successService = booking.querySelector("[data-success-service]");
    var successDate = booking.querySelector("[data-success-date]");
    var successTime = booking.querySelector("[data-success-time]");
    var successCode = booking.querySelector("[data-success-code]");
    var selectedService = booking.querySelector("[data-subservice].is-active") || subservices[0];
    var stepOrder = ["service", "details", "payment", "success"];

    function showStep(stepName, shouldScroll) {
      bookingSteps.forEach(function (step) {
        var isActive = step.getAttribute("data-booking-step") === stepName;
        step.classList.toggle("is-active", isActive);
        step.hidden = !isActive;
      });

      var activeIndex = stepOrder.indexOf(stepName);
      stepIndicators.forEach(function (indicator) {
        var indicatorStep = indicator.getAttribute("data-step-indicator");
        var indicatorIndex = stepOrder.indexOf(indicatorStep);
        indicator.classList.toggle("is-active", indicatorStep === stepName);
        indicator.classList.toggle("is-done", indicatorIndex > -1 && indicatorIndex < activeIndex);
      });

      if (shouldScroll !== false) {
        booking.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    function setSelectedService(service) {
      if (!service) return;
      selectedService = service;
      subservices.forEach(function (item) {
        item.classList.toggle("is-active", item === service);
      });
      syncBookingSummary();
    }

    function getSelectedPayment() {
      var selected = booking.querySelector('input[name="paymentMethod"]:checked');
      return selected ? selected.value : "online";
    }

    function syncBookingSummary() {
      var title = selectedService ? selectedService.getAttribute("data-title") || "" : "";
      var price = Number(selectedService ? selectedService.getAttribute("data-price") || "0" : "0");
      var duration = selectedService ? selectedService.getAttribute("data-duration") || "" : "";
      var details = selectedService ? selectedService.getAttribute("data-details") || "" : "";
      var prep = selectedService ? selectedService.getAttribute("data-prep") || "" : "";
      var after = selectedService ? selectedService.getAttribute("data-after") || "" : "";
      var dateValue = dateInput && dateInput.value ? dateInput.value : bookingText.chooseDate;
      var timeInput = booking.querySelector("#bookingTime");
      var timeValue = timeInput && timeInput.value ? timeInput.value : bookingText.chooseTime;
      var nameInput = booking.querySelector("#bookingName");
      var phoneInput = booking.querySelector("#bookingPhone");
      var patientValue = nameInput && nameInput.value.trim() ? nameInput.value.trim() : bookingText.missingName;
      var phoneValue = phoneInput && phoneInput.value.trim() ? phoneInput.value.trim() : bookingText.missingPhone;

      if (titleTarget) titleTarget.textContent = title;
      if (priceTarget) priceTarget.textContent = String(price);
      if (durationTarget) durationTarget.textContent = duration;
      if (detailTitle) detailTitle.textContent = title;
      if (detailText) detailText.textContent = details;
      if (detailPrep) detailPrep.textContent = prep;
      if (detailAfter) detailAfter.textContent = after;
      if (checkoutService) checkoutService.textContent = title;
      if (checkoutDate) checkoutDate.textContent = dateValue;
      if (checkoutTime) checkoutTime.textContent = timeValue;
      if (checkoutPatient) checkoutPatient.textContent = patientValue;
      if (checkoutPhone) checkoutPhone.textContent = phoneValue;
      if (successService) successService.textContent = title;
      if (successDate) successDate.textContent = dateValue;
      if (successTime) successTime.textContent = timeValue;
      checkoutPriceItems.forEach(function (item) {
        item.textContent = String(price);
      });
      installmentPriceItems.forEach(function (item) {
        item.textContent = String(Math.ceil(price / 4));
      });
      tamaraPriceItems.forEach(function (item) {
        item.textContent = String(Math.ceil(price / 3));
      });
    }

    function setCategory(category) {
      categoryButtons.forEach(function (button) {
        button.classList.toggle("is-active", button.getAttribute("data-booking-category") === category);
      });

      var firstVisible = null;
      subservices.forEach(function (service) {
        var matches = service.getAttribute("data-category") === category;
        service.classList.toggle("hidden", !matches);
        if (matches && !firstVisible) firstVisible = service;
      });
      setSelectedService(firstVisible);
    }

    function setPaymentPanel(method) {
      paymentPanels.forEach(function (panel) {
        panel.classList.toggle("is-active", panel.getAttribute("data-payment-panel") === method);
      });
    }

    if (dateInput) {
      var today = new Date();
      var timezoneOffset = today.getTimezoneOffset() * 60000;
      dateInput.min = new Date(today.getTime() - timezoneOffset).toISOString().split("T")[0];
      dateInput.addEventListener("change", syncBookingSummary);
    }

    var timeSelect = booking.querySelector("#bookingTime");
    if (timeSelect) {
      timeSelect.addEventListener("change", syncBookingSummary);
    }

    ["#bookingName", "#bookingPhone"].forEach(function (selector) {
      var field = booking.querySelector(selector);
      if (field) field.addEventListener("input", syncBookingSummary);
    });

    categoryButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        setCategory(button.getAttribute("data-booking-category"));
      });
    });

    subservices.forEach(function (service) {
      service.addEventListener("click", function () {
        setSelectedService(service);
      });
    });

    booking.querySelectorAll("[data-next-step]").forEach(function (button) {
      button.addEventListener("click", function () {
        syncBookingSummary();
        showStep(button.getAttribute("data-next-step"));
      });
    });

    booking.querySelectorAll("[data-prev-step]").forEach(function (button) {
      button.addEventListener("click", function () {
        showStep(button.getAttribute("data-prev-step"));
      });
    });

    function syncPaymentChoice() {
      paymentInputs.forEach(function (input) {
        var choice = input.closest(".payment-choice");
        if (choice) choice.classList.toggle("is-selected", input.checked);
      });
      setPaymentPanel(getSelectedPayment());
      syncBookingSummary();
    }

    paymentInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        syncPaymentChoice();
      });
    });

    function validateBookingForm() {
      if (!bookingForm) return true;
      var valid = true;
      bookingForm.querySelectorAll(".error-text").forEach(function (error) {
        error.remove();
      });

      bookingForm.querySelectorAll("[required]").forEach(function (field) {
        var value = field.value ? field.value.trim() : "";
        if (!value) {
          valid = false;
          var error = document.createElement("span");
          error.className = "error-text";
          error.textContent = bookingText.required;
          field.insertAdjacentElement("afterend", error);
        }
      });
      return valid;
    }

    function validatePaymentPanel() {
      var activePanel = paymentPreview ? paymentPreview.querySelector(".checkout-panel.is-active") : null;
      if (!activePanel) return true;
      var valid = true;
      activePanel.querySelectorAll(".error-text").forEach(function (error) {
        error.remove();
      });

      activePanel.querySelectorAll("[data-payment-required]").forEach(function (field) {
        var isCheckbox = field.type === "checkbox";
        var value = field.value ? field.value.trim() : "";
        var fieldValid = isCheckbox ? field.checked : value.length > 0;
        if (!fieldValid) {
          valid = false;
          var error = document.createElement("span");
          error.className = "error-text";
          error.textContent = isCheckbox ? bookingText.confirmChoice : bookingText.required;
          var target = isCheckbox ? field.closest("label") : field;
          target.insertAdjacentElement("afterend", error);
        }
      });
      return valid;
    }

    function showBookingSuccess() {
      if (!bookingSuccess) return;
      syncBookingSummary();
      if (successCode) {
        successCode.textContent = "NSM-" + String(Math.floor(1000 + Math.random() * 9000));
      }
      showStep("success");
    }

    if (bookingForm) {
      bookingForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!validateBookingForm()) return;
        syncBookingSummary();
        setPaymentPanel(getSelectedPayment());
        showStep("payment");
      });
    }

    completePaymentButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (!validateBookingForm()) return;
        if (!validatePaymentPanel()) return;
        showBookingSuccess();
      });
    });

    try {
      var requestedCategory = new URLSearchParams(window.location.search).get("category");
      if (requestedCategory && booking.querySelector('[data-booking-category="' + requestedCategory + '"]')) {
        setCategory(requestedCategory);
      } else {
        setSelectedService(selectedService);
      }
    } catch (error) {
      setSelectedService(selectedService);
    }

    syncPaymentChoice();
    showStep("service", false);
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
