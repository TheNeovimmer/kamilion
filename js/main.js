(function () {
  "use strict";

  var themeKey = "kamilion-theme";
  var gsapReady = false;

  function waitForGSAP(callback, retries) {
    retries = retries || 0;
    if (typeof gsap !== "undefined" && gsap) {
      gsapReady = true;
      callback();
    } else if (retries < 20) {
      setTimeout(function () { waitForGSAP(callback, retries + 1); }, 100);
    }
  }

  function getPreferredTheme() {
    var saved = localStorage.getItem(themeKey);
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function applyTheme(theme) {
    var html = document.documentElement;
    if (theme === "light") {
      html.classList.remove("dark");
    } else {
      html.classList.add("dark");
    }
    localStorage.setItem(themeKey, theme);
  }

  function toggleTheme() {
    var html = document.documentElement;
    applyTheme(html.classList.contains("dark") ? "light" : "dark");
  }

  function bindThemeToggles() {
    document.querySelectorAll(".theme-toggle-btn").forEach(function (btn) {
      btn.removeEventListener("click", toggleTheme);
      btn.addEventListener("click", toggleTheme);
    });
  }

  function initTheme() {
    applyTheme(getPreferredTheme());
  }

  function handleNavScroll() {
    var nav = document.querySelector(".dynamic-island");
    if (!nav) return;
    window.requestAnimationFrame(function () {
      if (window.scrollY > 80) {
        nav.classList.add("shadow-2xl");
      } else {
        nav.classList.remove("shadow-2xl");
      }
    });
  }

  function initBackToTop() {
    var btn = document.querySelector(".back-to-top");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      btn.classList.toggle("visible", window.scrollY > 400);
    });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initMobileMenu() {
    var openBtn = document.querySelector(".mobile-menu-open");
    var closeBtn = document.querySelector(".mobile-menu-close");
    var overlay = document.querySelector(".mobile-menu-overlay");
    if (!openBtn || !overlay) return;
    function open() { overlay.classList.add("open"); document.body.style.overflow = "hidden"; }
    function close() { overlay.classList.remove("open"); document.body.style.overflow = ""; }
    openBtn.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    overlay.querySelectorAll("a").forEach(function (l) { l.addEventListener("click", close); });
  }

  function setActiveNavLink() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-page]").forEach(function (el) {
      if (el.getAttribute("data-page") === path) el.classList.add("active-link");
    });
  }

  function initBasicReveal() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          entry.target.querySelectorAll("[data-width]").forEach(function (b) {
            b.style.width = b.getAttribute("data-width");
          });
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { observer.observe(el); });
    return observer;
  }

  function initGSAPAnimations() {
    if (!gsapReady) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".hero-char").forEach(function (el, i) {
      gsap.from(el, {
        y: 120,
        opacity: 0,
        rotateX: -60,
        duration: 1.2,
        delay: i * 0.035 + 0.3,
        ease: "power4.out",
        scrollTrigger: { trigger: el.parentElement, start: "top 80%" }
      });
    });

    gsap.utils.toArray(".tilt-card").forEach(function (card) {
      gsap.from(card, {
        y: 80,
        opacity: 0,
        scale: 0.95,
        duration: 1.0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });

    gsap.utils.toArray(".reveal").forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        onEnter: function () {
          el.classList.add("active");
          el.querySelectorAll("[data-width]").forEach(function (b) {
            b.style.width = b.getAttribute("data-width");
          });
          animateCounterGSAP(el);
          ScrollTrigger.refresh();
        }
      });
    });

    gsap.utils.toArray("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target) || el.dataset.counted) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: function () {
          el.dataset.counted = "true";
          gsap.to(el, {
            innerText: target,
            duration: 1.5,
            ease: "power2.out",
            snap: { innerText: 1 },
            onUpdate: function () {
              el.textContent = Math.round(el.textContent);
            }
          });
        }
      });
    });

    gsap.utils.toArray(".parallax-scroll").forEach(function (el) {
      var speed = parseFloat(el.getAttribute("data-speed")) || 0.15;
      gsap.to(el, {
        y: function () { return window.innerHeight * speed * -0.3; },
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });

    gsap.utils.toArray(".stagger-in > *").forEach(function (el, i) {
      gsap.from(el, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1 + 0.2,
        ease: "power3.out",
        scrollTrigger: { trigger: el.parentElement, start: "top 80%" }
      });
    });

    ScrollTrigger.refresh();
  }

  function animateCounterGSAP(root) {
    root.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target) || el.dataset.counted) return;
      el.dataset.counted = "true";
      gsap.to(el, {
        innerText: target,
        duration: 1.5,
        ease: "power2.out",
        snap: { innerText: 1 },
        onUpdate: function () {
          el.textContent = Math.round(el.textContent);
        }
      });
    });
  }

  function initPageEntrance() {
    if (!gsapReady) return;
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".dynamic-island", { y: -60, opacity: 0, duration: 0.8 })
      .from(".hero-char, .hero-title-line", { y: 80, opacity: 0, stagger: 0.04, duration: 1.0 }, "-=0.4")
      .from(".hero-subtitle", { y: 30, opacity: 0, duration: 0.8 }, "-=0.6")
      .from(".hero-image", { scale: 0.9, opacity: 0, duration: 1.0 }, "-=0.4");
  }

  function initTiltCards() {
    document.querySelectorAll(".tilt-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var rx = ((y - cy) / cy) * -10;
        var ry = ((x - cx) / cx) * 10;
        card.style.transform = "perspective(1200px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) scale3d(1.03,1.03,1.03)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
      });
    });
  }

  var basicObserver = null;

  function initAll() {
    initTheme();
    bindThemeToggles();
    handleNavScroll();
    initBasicReveal();
    initTiltCards();
    initMobileMenu();
    setActiveNavLink();
    window.addEventListener("scroll", handleNavScroll);

    var html = document.documentElement;
    html.classList.add("transitioning");
    setTimeout(function () { html.classList.remove("transitioning"); }, 600);

    waitForGSAP(function () {
      initPageEntrance();
      initGSAPAnimations();
    });
  }

  $(function () {
    $("#navbar").load("partials/navbar.html", function () {
      bindThemeToggles();
      setActiveNavLink();
      handleNavScroll();
      initMobileMenu();
    });
    $("#footer").load("partials/footer.html", function () {
      bindThemeToggles();
      initBasicReveal();
    });
    $("body").append(
      '<div class="back-to-top"><span class="material-symbols-outlined text-primary" style="font-size:20px">arrow_upward</span></div>' +
      '<div class="loading-bar"></div>'
    );
    initBackToTop();

    var lb = document.querySelector(".loading-bar");
    if (lb) { lb.style.width = "100%"; setTimeout(function () { lb.style.opacity = "0"; }, 800); }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function (e) {
    if (!localStorage.getItem(themeKey)) applyTheme(e.matches ? "light" : "dark");
  });
})();
