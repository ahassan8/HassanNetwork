(() => {
  const EMAILJS_SERVICE_ID = "service_h7qiq8i";
  const EMAILJS_TEMPLATE_ID = "template_l1o0unm";
  const EMAILJS_PUBLIC_KEY = "aoGFP5Q0wIP69OaGx";

  const $ = (id) => document.getElementById(id);

  const setText = (el, text) => {
    if (!el) return;
    el.textContent = text || "";
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
        setText(inqStatus, "");
        setBtn(inqBtn, true, "Sending...");

        if (!forceRequired(footerInquiryForm)) {
          setText(inqStatus, "Please fill out all required fields.");
          setBtn(inqBtn, false, "Send");
          return;
        }

        if (!emailOk) {
          setText(inqStatus, "Email service is not ready. Check console for EmailJS script/init errors.");
          setBtn(inqBtn, false, "Send");
          return;
        }

        try {
          const res = await sendEmailJSForm(footerInquiryForm);
          console.log("Inquiry sent:", res);
          footerInquiryForm.reset();
          setText(inqStatus, "Sent. We’ll reach out shortly.");
        } catch (err) {
          console.error("Inquiry send failed:", err);
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
        setBtn(plansBtn, true, "Submitting...");

        const plan = (selectedPlan && String(selectedPlan.value || "").trim()) || "";
        if (!plan) {
          setText(plansStatus, "Please select a plan.");
          setBtn(plansBtn, false, "Submit");
          return;
        }

        if (!forceRequired(plansForm)) {
          setText(plansStatus, "Please fill out all required fields.");
          setBtn(plansBtn, false, "Submit");
          return;
        }

        if (!emailOk) {
          setText(plansStatus, "Email service is not ready. Check console for EmailJS script/init errors.");
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

          setText(plansStatus, "Submitted. We’ll reach out shortly.");
          closeOverlay(plansOverlay);
        } catch (err) {
          console.error("Plan booking send failed:", err);
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
        setBtn(quoteBtn, true, "Submitting...");

        if (!forceRequired(quoteForm)) {
          setText(quoteStatus, "Please fill out all required fields.");
          setBtn(quoteBtn, false, "Submit");
          return;
        }

        const selected = syncSelectedFeatures();
        if (!selected.length) {
          setText(quoteStatus, "Please select at least 1 feature.");
          setBtn(quoteBtn, false, "Submit");
          return;
        }

        if (!emailOk) {
          setText(quoteStatus, "Email service is not ready. Check console for EmailJS script/init errors.");
          setBtn(quoteBtn, false, "Submit");
          return;
        }

        try {
          const res = await sendEmailJSForm(quoteForm);
          console.log("Quote request sent:", res);

          quoteForm.reset();
          features.forEach((f) => f.classList.remove("selected"));
          if (selectedFeatures) selectedFeatures.value = "";

          setText(quoteStatus, "Submitted. We’ll reach out shortly.");
          closeOverlay(quoteOverlay);
        } catch (err) {
          console.error("Quote send failed:", err);
          setText(quoteStatus, "Could not submit. Please try again.");
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


