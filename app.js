(() => {
  const API_BASE = "https://api.hassannetwork.com";

  const $ = (id) => document.getElementById(id);

  const designGalleryPhotos = [
    "images/herobarber.png",
    "images/herofence.png",
    "images/herofence2.png",
    "images/herolawn.png",
    "images/heropaint.png",
    "images/painttemp2.png"
  ];

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

  const designLightbox = $("designLightbox");
  const designLbImg = $("designLbImg");
  const designLbClose = $("designLbClose");
  const designLbPrev = $("designLbPrev");
  const designLbNext = $("designLbNext");
  const designMorePhotosBtn = $("designMorePhotosBtn");

  let activeDesignIndex = 0;

  function showDesignSlide() {
    if (!designLbImg || !designGalleryPhotos.length) return;

    designLbImg.src = designGalleryPhotos[activeDesignIndex];
  }

  function openDesignLightbox(index = 0) {
    if (!designLightbox || !designLbImg) return;

    activeDesignIndex = index;
    showDesignSlide();

    designLightbox.classList.add("open");
    designLightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  }

  function closeDesignLightbox() {
    if (!designLightbox) return;

    designLightbox.classList.remove("open");
    designLightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
  }

  function nextDesignSlide() {
    if (!designGalleryPhotos.length) return;

    activeDesignIndex = (activeDesignIndex + 1) % designGalleryPhotos.length;
    showDesignSlide();
  }

  function prevDesignSlide() {
    if (!designGalleryPhotos.length) return;

    activeDesignIndex =
      (activeDesignIndex - 1 + designGalleryPhotos.length) %
      designGalleryPhotos.length;

    showDesignSlide();
  }

  document.querySelectorAll(".design-gallery-item").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.galleryIndex || 0);
      openDesignLightbox(index);
    });
  });

  if (designMorePhotosBtn) {
    designMorePhotosBtn.addEventListener("click", () => {
      openDesignLightbox(0);
    });
  }

  if (designLbClose) {
    designLbClose.addEventListener("click", closeDesignLightbox);
  }

  if (designLbNext) {
    designLbNext.addEventListener("click", nextDesignSlide);
  }

  if (designLbPrev) {
    designLbPrev.addEventListener("click", prevDesignSlide);
  }

  if (designLightbox) {
    designLightbox.addEventListener("click", (event) => {
      if (event.target === designLightbox) {
        closeDesignLightbox();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!designLightbox || !designLightbox.classList.contains("open")) return;

    if (event.key === "Escape") closeDesignLightbox();
    if (event.key === "ArrowRight") nextDesignSlide();
    if (event.key === "ArrowLeft") prevDesignSlide();
  });

  document.querySelectorAll(".clock-only").forEach((input) => {
    const updateTimeState = () => {
      if (input.value) {
        input.classList.add("has-time");
      } else {
        input.classList.remove("has-time");
      }
    };

    input.addEventListener("click", () => {
      if (typeof input.showPicker === "function") {
        input.showPicker();
      } else {
        input.focus();
      }
    });

    input.addEventListener("focus", () => {
      if (typeof input.showPicker === "function") {
        try {
          input.showPicker();
        } catch (error) {
          input.focus();
        }
      }
    });

    input.addEventListener("change", updateTimeState);
    input.addEventListener("input", updateTimeState);

    updateTimeState();
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

  function fileToImage(file) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Image failed to load"));
      };

      image.src = url;
    });
  }

  async function compressImage(file) {
    if (!file.type.startsWith("image/")) return file;

    const image = await fileToImage(file);

    const maxWidth = 700;
    const maxHeight = 700;

    let width = image.width;
    let height = image.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.22);
    });

    if (!blob) return file;

    const cleanName = file.name.replace(/\.[^.]+$/, "");
    const compressedName = `${cleanName}.jpg`;

    return new File([blob], compressedName, {
      type: "image/jpeg",
      lastModified: Date.now()
    });
  }

  async function compressFiles(files) {
    const compressed = [];

    for (const file of files) {
      try {
        const newFile = await compressImage(file);
        compressed.push(newFile);
      } catch (error) {
        compressed.push(file);
      }
    }

    return compressed;
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

      const size = document.createElement("span");
      size.className = "uploaded-file-size";
      size.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;

      const deleteButton = document.createElement("button");
      deleteButton.className = "uploaded-file-delete";
      deleteButton.type = "button";
      deleteButton.setAttribute("aria-label", `Remove ${file.name}`);
      deleteButton.textContent = "🗑";

      deleteButton.addEventListener("click", () => {
        selectedGalleryFiles.splice(index, 1);

        updateGalleryInputFiles();
        renderUploadedFiles();
      });

      item.appendChild(icon);
      item.appendChild(name);
      item.appendChild(size);
      item.appendChild(deleteButton);

      galleryPhotosPreview.appendChild(item);
    });
  }

  if (galleryPhotosInput && galleryPhotosPreview) {
    galleryPhotosInput.addEventListener("change", async () => {
      const newFiles = Array.from(galleryPhotosInput.files);

      if (!newFiles.length) return;

      galleryPhotosPreview.innerHTML = "Compressing photos...";

      const compressedFiles = await compressFiles(newFiles);

      compressedFiles.forEach((file) => {
        const alreadyAdded = selectedGalleryFiles.some((existingFile) => {
          return existingFile.name === file.name && existingFile.size === file.size;
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
        const response = await fetch(`${API_BASE}/api/website-application`, {
          method: "POST",
          body: formData
        });

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

        document.querySelectorAll(".clock-only").forEach((input) => {
          input.classList.remove("has-time");
        });
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
        const response = await fetch(`${API_BASE}/api/footer-inquiry`, {
          method: "POST",
          body: formData
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Inquiry failed");
        }

        footerInquiryForm.reset();

        setStatus(inqStatus, "Sent. We will reach out shortly.", true);
      } catch (error) {
        setStatus(inqStatus, "Could not send. Please try again.", false);
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
