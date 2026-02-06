(() => {
  const EMAILJS_SERVICE_ID = "service_h7qiq8i";
  const EMAILJS_TEMPLATE_ID = "template_1100unm";
  const EMAILJS_PUBLIC_KEY = "a0GFP5QwTP690aGx";

  const $ = (id) => document.getElementById(id);

  const setText = (el, text) => {
    if (el) el.textContent = text || "";
  };

  const setBtn = (btn, disabled, text) => {
    if (!btn) return;
    btn.disabled = !!disabled;
    if (typeof text === "string") btn.textContent = text;
  };

  const blurActive = () => {
    const a = document.activeElement;
    if (a && typeof a.blur === "function") a.blur();
  };

  const openOverlay = (overlay) => {
    if (!overlay) return;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    overlay.removeAttribute("inert");
    document.body.style.overflow = "hidden";
  };

  const closeOverlay = (overlay) => {
    if (!overlay) return;
    blurActive();
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("inert", "");
    document.body.style.overflow = "";
  };

  const ensureEmailJS = () => {
    if (!window.emailjs) return false;
    try {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      return true;
    } catch (e) {
      console.error("EmailJS init failed:", e);
      return false;
    }
  };

  const requireValidForm = (formEl) => {
    if (!formEl) return false;

    const emailInputs = Array.from(formEl.querySelectorAll('input[type="email"]'));
    emailInputs.forEach((el) => {
      const v = String(el.value || "").trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      el.setCustomValidity(ok ? "" : "Please enter a valid email.");
    });

    const ok = formEl.reportValidity();
    emailInputs.forEach((el) => el.setCustomValidity(""));
    return ok;
  };

  const sendForm = async (formEl) => {
    if (!window.emailjs) throw new Error("EmailJS not loaded.");
    const res = await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formEl);
    return res;
  };

  const syncSelectedFeatures = () => {
    const features = Array.from(document.querySelectorAll(".feat"));
    const selectedFeatures = $("selectedFeatures");
    const selected = features
      .filter((f) => f.classList.contains("selected"))
      .map((f) => (f.dataset.feature || "").trim())
      .filter(Boolean);

    if (selectedFeatures) selectedFeatures.value = selected.join(", ");
    return selected;
  };

  const init = () => {
    const yearEl = $("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const emailReady = ensureEmailJS();
    console.log("EmailJS ready:", emailReady, {
      service: EMAILJS_SERVICE_ID,
      template: EMAILJS_TEMPLATE_ID
    });

    const burger = $("burger");
    const navlinks = $("navlinks");

    if (burger && navlinks) {
      burger.addEventListener("click", () => {
        const open = navlinks.classList.toggle("open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

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

    const closeMobileNavIfOpen = () => {
      if (!navlinks) return;
      if (navlinks.classList.contains("open")) {
        navlinks.classList.remove("open");
        if (burger) burger.setAttribute("aria-expanded", "false");
      }
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

    if (plansOverlay) plansOverlay.setAttribute("inert", "");
    if (quoteOverlay) quoteOverlay.setAttribute("inert", "");

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
        const p = (b.getAttribute("data-plan-open") || "").trim();
        openOverlay(plansOverlay);
        selectPlan(p);
      });
    });

    planPicks.forEach((btn) => {
      btn.addEventListener("click", () => {
        selectPlan((btn.dataset.plan || "").trim());
      });
    });

    const features = Array.from(document.querySelectorAll(".feat"));
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
        setText(inqStatus, "");
        if (!requireValidForm(footerInquiryForm)) return;

        setBtn(inqBtn, true, "Sending...");
        try {
          const r = await sendForm(footerInquiryForm);
          console.log("Footer Inquiry sent:", r);
          footerInquiryForm.reset();
          setText(inqStatus, "Sent. We’ll reach out shortly.");
        } catch (err) {
          console.error("Footer Inquiry error:", err);
          setText(inqStatus, "Could not send. Please try again.");
        } finally {
          setBtn(inqBtn, false, "Send");
        }
      });
    }

    const plansForm = $("plansForm");
    const plansBtn = $("plansBtn");
    const plansStatus = $("plansStatus");

    if (plansForm) {
      plansForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        setText(plansStatus, "");

        const plan = (selectedPlan && String(selectedPlan.value || "").trim()) || "";
        if (!plan) {
          setText(plansStatus, "Please select a plan.");
          return;
        }

        if (!requireValidForm(plansForm)) return;

        setBtn(plansBtn, true, "Submitting...");
        try {
          const r = await sendForm(plansForm);
          console.log("Plan Booking sent:", r);
          plansForm.reset();
          clearPlanSelected();
          if (selectedPlan) selectedPlan.value = "";
          if (selectedPlanPrice) selectedPlanPrice.value = "";
          setText(plansStatus, "Submitted. We’ll reach out shortly.");
          closeOverlay(plansOverlay);
        } catch (err) {
          console.error("Plan Booking error:", err);
          setText(plansStatus, "Could not submit. Please try again.");
        } finally {
          setBtn(plansBtn, false, "Submit");
        }
      });
    }

    const quoteForm = $("quoteForm");
    const quoteBtn = $("quoteBtn");
    const quoteStatus = $("quoteStatus");

    if (quoteForm) {
      quoteForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        setText(quoteStatus, "");

        const selected = syncSelectedFeatures();
        if (!selected.length) {
          setText(quoteStatus, "Please select at least 1 feature.");
          return;
        }

        if (!requireValidForm(quoteForm)) return;

        setBtn(quoteBtn, true, "Submitting...");
        try {
          const r = await sendForm(quoteForm);
          console.log("Free Quote sent:", r, { selected });
          quoteForm.reset();
          features.forEach((f) => f.classList.remove("selected"));
          const sf = $("selectedFeatures");
          if (sf) sf.value = "";
          setText(quoteStatus, "Submitted. We’ll reach out shortly.");
          closeOverlay(quoteOverlay);
        } catch (err) {
          console.error("Free Quote error:", err);
          setText(quoteStatus, "Could not send. Please try again.");
        } finally {
          setBtn(quoteBtn, false, "Submit");
        }
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

