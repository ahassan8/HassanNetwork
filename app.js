(() => {
  const $ = (id) => document.getElementById(id);

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

  const yearEl = $("year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const burger = $("burger");
  const navlinks = $("navlinks");

  if (burger && navlinks) {
    burger.addEventListener("click", () => {
      const open = navlinks.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function closeMobileNav() {
    if (!navlinks) return;

    if (navlinks.classList.contains("open")) {
      navlinks.classList.remove("open");

      if (burger) {
        burger.setAttribute("aria-expanded", "false");
      }
    }
  }

  function anchorOffset() {
    const header = document.querySelector(".header");
    const topbar = document.querySelector(".topbar");

    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const topbarHeight = topbar ? topbar.getBoundingClientRect().height : 0;

    return Math.round(headerHeight + topbarHeight + 16);
  }

  function scrollToId(id) {
    const el = document.getElementById(id);

    if (!el) return;

    const top =
      window.pageYOffset +
      el.getBoundingClientRect().top -
      anchorOffset();

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth"
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href") || "";

      if (href.length < 2) return;

      const id = href.slice(1);
      const target = document.getElementById(id);

      if (!target) return;

      event.preventDefault();

      closeMobileNav();
      scrollToId(id);
    });
  });

  const galleryPhotosInput = $("galleryPhotos");
  const galleryPhotosPreview = $("galleryPhotosPreview");

  let selectedGalleryFiles = [];

  function shortenFileName(name) {
    if (name.length <= 30) return name;

    const dotIndex = name.lastIndexOf(".");
    const extension = dotIndex !== -1 ? name.slice(dotIndex) : "";
    const baseName = dotIndex !== -1 ? name.slice(0, dotIndex) : name;

    return `${baseName.slice(0, 22)}...${extension}`;
  }

  function updateGalleryInputFiles() {
    if (!galleryPhotosInput) return;

    const dataTransfer = new DataTransfer();

    selectedGalleryFiles.forEach((file) => {
      dataTransfer.items.add(file);
    });

    galleryPhotosInput.files = dataTransfer.files;
  }

  function renderUploadedFiles() {
    if (!galleryPhotosPreview) return;

    galleryPhotosPreview.innerHTML = "";

    selectedGalleryFiles.forEach((file, index) => {
      const item = document.createElement("div");
      item.className = "uploaded-file-item";

      const icon = document.createElement("span");
      icon.className = "uploaded-file-icon";
      icon.textContent = "▣";

      const name = document.createElement("span");
      name.className = "uploaded-file-name";
      name.textContent = shortenFileName(file.name);
      name.title = file.name;

      const deleteButton = document.createElement("button");
      deleteButton.className = "uploaded-file-delete";
      deleteButton.type = "button";
      deleteButton.setAttribute(
        "aria-label",
        `Remove ${file.name}`
      );
      deleteButton.textContent = "🗑";

      deleteButton.addEventListener("click", () => {
        selectedGalleryFiles.splice(index, 1);

        updateGalleryInputFiles();
        renderUploadedFiles();
      });

      item.appendChild(icon);
      item.appendChild(name);
      item.appendChild(deleteButton);

      galleryPhotosPreview.appendChild(item);
    });
  }

  if (galleryPhotosInput && galleryPhotosPreview) {
    galleryPhotosInput.addEventListener("change", () => {
      const newFiles = Array.from(galleryPhotosInput.files);

      newFiles.forEach((file) => {
        const alreadyAdded = selectedGalleryFiles.some((existingFile) => {
          return (
            existingFile.name === file.name &&
            existingFile.size === file.size &&
            existingFile.lastModified === file.lastModified
          );
        });

        if (!alreadyAdded) {
          selectedGalleryFiles.push(file);
        }
      });

      updateGalleryInputFiles();
      renderUploadedFiles();
    });
  }

  const pricesYes = $("pricesYes");
  const pricesNo = $("pricesNo");
  const pricesArea = $("pricesArea");
  const addPriceBtn = $("addPriceBtn");

  function showPricesArea() {
    if (!pricesArea) return;

    pricesArea.classList.add("open");
  }

  function hidePricesArea() {
    if (!pricesArea) return;

    pricesArea.classList.remove("open");

    const rows = pricesArea.querySelectorAll(".price-input-row");

    rows.forEach((row, index) => {
      const input = row.querySelector("input");

      if (index === 0 && input) {
        input.value = "";
      }

      if (index > 0) {
        row.remove();
      }
    });
  }

  if (pricesYes) {
    pricesYes.addEventListener("change", () => {
      if (pricesYes.checked) {
        showPricesArea();
      }
    });
  }

  if (pricesNo) {
    pricesNo.addEventListener("change", () => {
      if (pricesNo.checked) {
        hidePricesArea();
      }
    });
  }

  if (addPriceBtn && pricesArea) {
    addPriceBtn.addEventListener("click", () => {
      const rows = pricesArea.querySelectorAll(".price-input-row");

      if (rows.length >= 20) return;

      const row = document.createElement("div");
      row.className = "price-input-row";

      const input = document.createElement("input");
      input.type = "text";
      input.name = "prices[]";
      input.placeholder = "Example: Service - $50";

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Remove";

      button.addEventListener("click", () => {
        row.remove();
      });

      row.appendChild(input);
      row.appendChild(button);

      pricesArea.appendChild(row);
    });
  }

  const websiteApplicationForm = $("websiteApplicationForm");
  const applicationStatus = $("applicationStatus");
  const submitButton = document.querySelector(".application-submit");

  if (websiteApplicationForm && applicationStatus) {
    websiteApplicationForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      applicationStatus.textContent = "Submitting application...";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }

      updateGalleryInputFiles();

      const formData = new FormData(websiteApplicationForm);

      try {
        const response = await fetch(
          "http://localhost:3000/api/website-application",
          {
            method: "POST",
            body: formData
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Submission failed");
        }

        applicationStatus.textContent =
          "Application submitted successfully. We will contact you within 24 hours.";

        websiteApplicationForm.reset();

        selectedGalleryFiles = [];

        if (galleryPhotosPreview) {
          galleryPhotosPreview.innerHTML = "";
        }

        hidePricesArea();
      } catch (error) {
        applicationStatus.textContent =
          "There was a problem submitting the application. Please try again.";
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Submit Application";
        }
      }
    });
  }

  const footerInquiryForm = $("footerInquiryForm");
  const inqBtn = $("inqBtn");
  const inqStatus = $("inqStatus");

  if (footerInquiryForm && inqStatus) {
    footerInquiryForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      setStatus(inqStatus, "Sending...", false);
      setBtn(inqBtn, true, "Sending...");

      const formData = new FormData(footerInquiryForm);

      try {
        const response = await fetch(
          "http://localhost:3000/api/footer-inquiry",
          {
            method: "POST",
            body: formData
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Inquiry failed");
        }

        footerInquiryForm.reset();

        setStatus(
          inqStatus,
          "Sent. We will reach out shortly.",
          true
        );
      } catch (error) {
        setStatus(
          inqStatus,
          "Could not send. Please try again.",
          false
        );
      } finally {
        setBtn(inqBtn, false, "Send");
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
    {
      threshold: 0.15
    }
  );

  document
    .querySelectorAll(".reveal,.slide-left,.slide-right")
    .forEach((el) => {
      observer.observe(el);
    });
})();





