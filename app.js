(() => {
  const API_BASE = "https://api.hassannetwork.com";

  const $ = (id) => document.getElementById(id);

const templatePhotos = {
  template1: [
    "images/herotemp.png",
    "images/herotemp.png",
    "images/herotemp.png"
  ],

  template2: [
    "images/paintingtemp.png",
    "images/paintingtemp.png",
    "images/paintingtemp.png"
  ],

  template3: [
    "images/painttemp2.png",
    "images/painttemp2.png",
    "images/painttemp2.png"
  ]
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

  const slideshow = document.createElement("div");
  slideshow.className = "template-lightbox";
  slideshow.innerHTML = `
    <div class="template-lightbox-backdrop"></div>
    <div class="template-lightbox-box">
      <button class="template-lightbox-close" type="button">×</button>
      <button class="template-lightbox-arrow template-lightbox-prev" type="button">‹</button>
      <img class="template-lightbox-img" src="" alt="Template preview">
      <button class="template-lightbox-arrow template-lightbox-next" type="button">›</button>
    </div>
  `;

  document.body.appendChild(slideshow);

  const slideshowImg = slideshow.querySelector(".template-lightbox-img");
  const slideshowClose = slideshow.querySelector(".template-lightbox-close");
  const slideshowPrev = slideshow.querySelector(".template-lightbox-prev");
  const slideshowNext = slideshow.querySelector(".template-lightbox-next");
  const slideshowBackdrop = slideshow.querySelector(".template-lightbox-backdrop");

  let currentSlides = [];
  let currentSlideIndex = 0;

  function showSlide() {
    if (!slideshowImg || !currentSlides.length) return;
    slideshowImg.src = currentSlides[currentSlideIndex];
  }

  function openSlideshow(images, startIndex = 0) {
    if (!images || !images.length) return;

    currentSlides = images;
    currentSlideIndex = startIndex;
    showSlide();

    slideshow.classList.add("open");
    document.body.classList.add("lightbox-open");
  }

  function closeSlideshow() {
    slideshow.classList.remove("open");
    document.body.classList.remove("lightbox-open");
  }

  function nextSlide() {
    if (!currentSlides.length) return;
    currentSlideIndex = (currentSlideIndex + 1) % currentSlides.length;
    showSlide();
  }

  function prevSlide() {
    if (!currentSlides.length) return;
    currentSlideIndex =
      (currentSlideIndex - 1 + currentSlides.length) % currentSlides.length;
    showSlide();
  }

  if (slideshowClose) slideshowClose.addEventListener("click", closeSlideshow);
  if (slideshowBackdrop) slideshowBackdrop.addEventListener("click", closeSlideshow);
  if (slideshowNext) slideshowNext.addEventListener("click", nextSlide);
  if (slideshowPrev) slideshowPrev.addEventListener("click", prevSlide);

  document.addEventListener("keydown", (event) => {
    if (!slideshow.classList.contains("open")) return;

    if (event.key === "Escape") closeSlideshow();
    if (event.key === "ArrowRight") nextSlide();
    if (event.key === "ArrowLeft") prevSlide();
  });

  function getTemplateKey(el) {
    const card = el.closest("[data-template]");
    const value =
      el.dataset.template ||
      el.dataset.templateKey ||
      (card ? card.dataset.template : "") ||
      "";

    if (templatePhotos[value]) return value;

    const text = (el.textContent || "").toLowerCase();

    if (text.includes("1")) return "template1";
    if (text.includes("2")) return "template2";
    if (text.includes("3")) return "template3";

    const index = Array.from(document.querySelectorAll(".template-card, [data-template]")).indexOf(card);

    if (index === 0) return "template1";
    if (index === 1) return "template2";
    if (index === 2) return "template3";

    return "template1";
  }

  document.querySelectorAll(".template-more, .more-photos, [data-more-photos]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = getTemplateKey(button);
      openSlideshow(templatePhotos[key], 0);
    });
  });

  document.querySelectorAll(".template-card img, .template-preview img, [data-template-image]").forEach((img) => {
    img.style.cursor = "pointer";

    img.addEventListener("click", () => {
      const key = getTemplateKey(img);
      const images = templatePhotos[key];
      const index = images.findIndex((src) => img.src.includes(src));

      openSlideshow(images, index >= 0 ? index : 0);
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

    const maxWidth = 1400;
    const maxHeight = 1400;

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
      canvas.toBlob(resolve, "image/jpeg", 0.72);
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
      size.textContent = `${(file.size / 1024 / 1024).toFixed(1)} MB`;

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
      if (pricesYes.checked) showPricesArea();
    });
  }

  if (pricesNo) {
    pricesNo.addEventListener("change", () => {
      if (pricesNo.checked) hidePricesArea();
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




