(() => {
  const EMAILJS_SERVICE_ID = "service_h7qiq8i";
  const EMAILJS_TEMPLATE_ID = "template_l1o0unm";
  const EMAILJS_PUBLIC_KEY = "aoGFP5Q0wIP69OaGx";

  const $ = (id) => document.getElementById(id);

  const setText = (el, text) => {
    if (!el) return;
    el.textContent = text || "";
  };

  const setStatus = (el, text, isSuccess) => {
    if (!el) return;
    el.textContent = text || "";
    el.style.color = isSuccess ? "#16a34a" : "";
  };

  const setBtn = (btn, disabled, text) => {
    if (!btn) return;
    btn.disabled = !!disabled;
    if (typeof text === "string") btn.textContent = text;
  };

  const ensureEmailJS = () => {
    if (!window.emailjs) {
      console.error("EmailJS not found. Did you add the EmailJS script tag before app.js?");
      return false;
    }
    try {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      return true;
    } catch (e) {
      console.error("EmailJS init failed:", e);
      return false;
    }
  };

  const forceRequired = (formEl) => {
    if (!formEl) return false;

    const required = Array.from(formEl.querySelectorAll("[required]"));
    for (const el of required) {
      const type = (el.getAttribute("type") || "").toLowerCase();

      if (type === "checkbox" && !el.checked) {
        el.focus();
        return false;
      }

      if (type === "radio") {
        const name = el.getAttribute("name");
        if (!name) continue;
        const checked = formEl.querySelector(`input[type="radio"][name="${CSS.escape(name)}"]:checked`);
        if (!checked) {
          el.focus();
          return false;
        }
        continue;
      }

      const val = (el.value || "").trim();
      if (!val) {
        el.focus();
        return false;
      }

      if (type === "email") {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        if (!ok) {
          el.focus();
          return false;
        }
      }
    }

    return true;
  };

  const openOverlay = (overlay) => {
    if (!overlay) return;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeOverlay = (overlay) => {
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const sendEmailJSForm = async (formEl) => {
    if (!window.emailjs) throw new Error("EmailJS not loaded");
    return await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formEl);
  };

  const showToast = (toastEl, titleEl, textEl, title, text) => {
    if (!toastEl) return;
    setText(titleEl, title);
    setText(textEl, text);
    toastEl.classList.add("show");
    clearTimeout(toastEl.__hideTimer);
    toastEl.__hideTimer = setTimeout(() => {
      toastEl.classList.remove("show");
    }, 4500);
  };

  const hideToast = (toastEl) => {
    if (!toastEl) return;
    toastEl.classList.remove("show");
    clearTimeout(toastEl.__hideTimer);
    toastEl.__hideTimer = null;
  };

  const init = () => {
    const yearEl = $("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const emailOk = ensureEmailJS();

    const burger = $("burger");
    const navlinks = $("navlinks");

    if (burger && navlinks) {
      burger.addEventListener("click", () => {
        const open = navlinks.classList.toggle("open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    const closeMobileNavIfOpen = () => {
      if (!navlinks) return;
      if (navlinks.classList.contains("open")) {
        navlinks.classList.remove("open");
        if (burger) burger.setAttribute("aria-expanded", "false");
      }
    };

    const anchorOffset = () => {
      const header = document.querySelector(".header");
      const topbar = document.querySelector(".topbar");
      const h = header ? header.getBoundingClientRect().height : 0;
      const t = topbar ? topbar.getBoundingClientRect().height : 0;
      return Math.round(h + t + 16);
    };

    const scrollToId = (id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = window.pageYOffset + el.getBoundingClientRect().top - anchorOffset();
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    };

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href") || "";
        if (href.length < 2) return;
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        closeMobileNavIfOpen();
        scrollToId(id);
      });
    });

    const plansOverlay = $("plansOverlay");
    const quoteOverlay = $("quoteOverlay");

    const bindOpen = (el, overlay, isLink) => {
      if (!el || !overlay) return;
      el.addEventListener("click", (e) => {
        if (isLink) e.preventDefault();
        openOverlay(overlay);
      });
    };

    bindOpen($("openPlansNav"), plansOverlay);
    bindOpen($("openPlansHero"), plansOverlay);
    bindOpen($("openPlansFooter"), plansOverlay, true);

    bindOpen($("openQuoteTop"), quoteOverlay);
    bindOpen($("openQuoteFooter"), quoteOverlay, true);

    const closePlans = $("closePlans");
    const closeQuote = $("closeQuote");

    if (closePlans) closePlans.addEventListener("click", () => closeOverlay(plansOverlay));
    if (closeQuote) closeQuote.addEventListener("click", () => closeOverlay(quoteOverlay));

    if (plansOverlay) {
      plansOverlay.addEventListener("click", (e) => {
        if (e.target === plansOverlay) closeOverlay(plansOverlay);
      });
    }

    if (quoteOverlay) {
      quoteOverlay.addEventListener("click", (e) => {
        if (e.target === quoteOverlay) closeOverlay(quoteOverlay);
      });
    }

    window.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (plansOverlay && plansOverlay.classList.contains("open")) closeOverlay(plansOverlay);
      if (quoteOverlay && quoteOverlay.classList.contains("open")) closeOverlay(quoteOverlay);
    });

    const planBtns = Array.from(document.querySelectorAll("[data-plan-open]"));
    const planPicks = Array.from(document.querySelectorAll(".planPick"));
    const selectedPlan = $("selectedPlan");
    const selectedPlanPrice = $("selectedPlanPrice");

    const clearPlanSelected = () => planPicks.forEach((b) => b.classList.remove("selected"));

    const selectPlan = (name) => {
      const match = planPicks.find((p) => (p.dataset.plan || "") === name);
      if (!match) return false;
      clearPlanSelected();
      match.classList.add("selected");
      if (selectedPlan) selectedPlan.value = match.dataset.plan || "";
      if (selectedPlanPrice) selectedPlanPrice.value = match.dataset.price || "";
      return true;
    };

    planBtns.forEach((b) => {
      b.addEventListener("click", () => {
        openOverlay(plansOverlay);
        selectPlan(b.getAttribute("data-plan-open") || "");
      });
    });

    planPicks.forEach((btn) => {
      btn.addEventListener("click", () => selectPlan(btn.dataset.plan || ""));
    });

    const features = Array.from(document.querySelectorAll(".feat"));
    const selectedFeatures = $("selectedFeatures");

    const syncSelectedFeatures = () => {
      const selected = features
        .filter((f) => f.classList.contains("selected"))
        .map((f) => f.dataset.feature || "")
        .filter(Boolean);

      if (selectedFeatures) selectedFeatures.value = selected.join(", ");
      return selected;
    };

    features.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("selected");
        syncSelectedFeatures();
      });
    });

    const footerInquiryForm = $("footerInquiryForm");
    const inqBtn = $("inqBtn");
    const inqStatus = $("inqStatus");

    if (footerInquiryForm) {
      footerInquiryForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        setStatus(inqStatus, "", false);
        setBtn(inqBtn, true, "Sending...");

        if (!forceRequired(footerInquiryForm)) {
          setStatus(inqStatus, "Please fill out all required fields.", false);
          setBtn(inqBtn, false, "Send");
          return;
        }

        if (!emailOk) {
          setStatus(inqStatus, "Email service is not ready. Check console for EmailJS script/init errors.", false);
          setBtn(inqBtn, false, "Send");
          return;
        }

        try {
          const res = await sendEmailJSForm(footerInquiryForm);
          console.log("Inquiry sent:", res);
          footerInquiryForm.reset();
          setStatus(inqStatus, "Sent. We’ll reach out shortly.", true);
        } catch (err) {
          console.error("Inquiry send failed:", err);
          setStatus(inqStatus, "Could not send. Please try again.", false);
        } finally {
          setBtn(inqBtn, false, "Send");
        }
      });
    }

    const plansForm = $("plansForm");
    const plansBtn = $("plansBtn");
    const plansStatus = $("plansStatus");
    const plansToast = $("plansToast");
    const plansToastTitle = $("plansToastTitle");
    const plansToastText = $("plansToastText");
    const plansToastClose = $("plansToastClose");

    if (plansToastClose) plansToastClose.addEventListener("click", () => hideToast(plansToast));

    if (plansForm) {
      plansForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setStatus(plansStatus, "", false);
        hideToast(plansToast);
        setBtn(plansBtn, true, "Submitting...");

        const plan = (selectedPlan && String(selectedPlan.value || "").trim()) || "";
        if (!plan) {
          setStatus(plansStatus, "Please select a plan.", false);
          setBtn(plansBtn, false, "Submit");
          return;
        }

        if (!forceRequired(plansForm)) {
          setStatus(plansStatus, "Please fill out all required fields.", false);
          setBtn(plansBtn, false, "Submit");
          return;
        }

        if (!emailOk) {
          setStatus(plansStatus, "Email service is not ready. Check console for EmailJS script/init errors.", false);
          setBtn(plansBtn, false, "Submit");
          return;
        }

        try {
          const res = await sendEmailJSForm(plansForm);
          console.log("Plan booking sent:", res);

          plansForm.reset();
          clearPlanSelected();
          if (selectedPlan) selectedPlan.value = "";
          if (selectedPlanPrice) selectedPlanPrice.value = "";

          setStatus(plansStatus, "Submitted Successfully, We’ll reach out shortly.", true);
          const mb = plansOverlay ? plansOverlay.querySelector(".modalBody") : null;
          if (mb) mb.scrollTo({ top: mb.scrollTop, behavior: "smooth" });
        } catch (err) {
          console.error("Plan booking send failed:", err);
          setStatus(plansStatus, "Could not submit. Please try again.", false);
          showToast(plansToast, plansToastTitle, plansToastText, "Error", "Could not submit. Please try again.");
        } finally {
          setBtn(plansBtn, false, "Submit");
        }
      });
    }

    const quoteForm = $("quoteForm");
    const quoteBtn = $("quoteBtn");
    const quoteStatus = $("quoteStatus");
    const quoteToast = $("quoteToast");
    const quoteToastTitle = $("quoteToastTitle");
    const quoteToastText = $("quoteToastText");
    const quoteToastClose = $("quoteToastClose");

    if (quoteToastClose) quoteToastClose.addEventListener("click", () => hideToast(quoteToast));

    if (quoteForm) {
      quoteForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setStatus(quoteStatus, "", false);
        hideToast(quoteToast);
        setBtn(quoteBtn, true, "Submitting...");

        if (!forceRequired(quoteForm)) {
          setStatus(quoteStatus, "Please fill out all required fields.", false);
          setBtn(quoteBtn, false, "Submit");
          return;
        }

        const selected = syncSelectedFeatures();
        if (!selected.length) {
          setStatus(quoteStatus, "Please select at least 1 feature.", false);
          setBtn(quoteBtn, false, "Submit");
          return;
        }

        if (!emailOk) {
          setStatus(quoteStatus, "Email service is not ready. Check console for EmailJS script/init errors.", false);
          setBtn(quoteBtn, false, "Submit");
          return;
        }

        try {
          const res = await sendEmailJSForm(quoteForm);
          console.log("Quote request sent:", res);

          quoteForm.reset();
          features.forEach((f) => f.classList.remove("selected"));
          if (selectedFeatures) selectedFeatures.value = "";

          setStatus(quoteStatus, "Submitted Successfully, We’ll reach out shortly.", true);
          const mb = quoteOverlay ? quoteOverlay.querySelector(".modalBody") : null;
          if (mb) mb.scrollTo({ top: mb.scrollTop, behavior: "smooth" });
        } catch (err) {
          console.error("Quote send failed:", err);
          setStatus(quoteStatus, "Could not submit. Please try again.", false);
          showToast(quoteToast, quoteToastTitle, quoteToastText, "Error", "Could not submit. Please try again.");
        } finally {
          setBtn(quoteBtn, false, "Submit");
        }
      });
    }

    const templatesGrid = $("templatesGrid");
    const lightbox = $("lightbox");
    const lbImg = $("lbImg");
    const lbClose = $("lbClose");
    const lbPrev = $("lbPrev");
    const lbNext = $("lbNext");

    let galleryItems = [];
    let currentIndex = -1;

    const getImgSrcFromCard = (card) => {
      const img = card.querySelector("img");
      if (img && img.getAttribute("src")) return img.getAttribute("src");
      const bg = card.querySelector(".img");
      if (bg) {
        const s = window.getComputedStyle(bg).backgroundImage || "";
        const m = s.match(/url\(["']?(.*?)["']?\)/i);
        if (m && m[1]) return m[1];
      }
      return "";
    };

    const openLightboxAt = (idx) => {
      if (!lightbox || !lbImg) return;
      if (idx < 0 || idx >= galleryItems.length) return;
      currentIndex = idx;
      const src = getImgSrcFromCard(galleryItems[currentIndex]);
      if (!src) return;
      lbImg.setAttribute("src", src);
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
      if (!lightbox) return;
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lbImg) lbImg.setAttribute("src", "");
      currentIndex = -1;
    };

    const stepLightbox = (dir) => {
      if (!galleryItems.length) return;
      const next = (currentIndex + dir + galleryItems.length) % galleryItems.length;
      openLightboxAt(next);
    };

    if (templatesGrid && lightbox) {
      galleryItems = Array.from(templatesGrid.querySelectorAll(".tcard, .gcard"));
      galleryItems.forEach((card, idx) => {
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.addEventListener("click", () => openLightboxAt(idx));
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightboxAt(idx);
          }
        });
      });

      if (lbClose) lbClose.addEventListener("click", closeLightbox);
      if (lbPrev) lbPrev.addEventListener("click", () => stepLightbox(-1));
      if (lbNext) lbNext.addEventListener("click", () => stepLightbox(1));

      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
      });

      window.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") stepLightbox(-1);
        if (e.key === "ArrowRight") stepLightbox(1);
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".reveal,.slide-left,.slide-right").forEach((el) => observer.observe(el));
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();






