function pad(value) {
  return String(value).padStart(2, "0");
}

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function storeUtmParams() {
  const params = new URLSearchParams(window.location.search);
  const utmKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ];

  utmKeys.forEach((key) => {
    const value = params.get(key);
    if (value) {
      setCookie(key, value, 30);
    }
  });
}

storeUtmParams();

function updateCountdown() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const diff = end - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  document
    .querySelectorAll('[data-countdown="hours"]')
    .forEach((element) => (element.textContent = pad(hours)));
  document
    .querySelectorAll('[data-countdown="minutes"]')
    .forEach((element) => (element.textContent = pad(minutes)));
  document
    .querySelectorAll('[data-countdown="seconds"]')
    .forEach((element) => (element.textContent = pad(seconds)));
}

updateCountdown();
setInterval(updateCountdown, 1000);

const reviewForm = document.getElementById("review-form");
const reviewNotice = document.getElementById("reviewNotice");
const reviewsGrid = document.querySelector(".reviews-grid");

if (reviewForm && reviewNotice && reviewsGrid) {
  reviewForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(reviewForm);
    const submitButton = reviewForm.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = "\u041d\u0430\u0434\u0441\u0438\u043b\u0430\u043d\u043d\u044f...";
    reviewNotice.hidden = true;

    try {
      const response = await fetch("submit_review.php", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.message || "\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u043d\u0430\u0434\u0456\u0441\u043b\u0430\u0442\u0438 \u0432\u0456\u0434\u0433\u0443\u043a"
        );
      }

      const reviewCard = document.createElement("article");
      reviewCard.className = "review-card";
      reviewCard.innerHTML = `
        <div class="review-card__top">
          <strong>${escapeHtml(data.review.name)}</strong>
          <span>${escapeHtml(data.review.time)}</span>
        </div>
        <div class="stars">${escapeHtml(data.review.rating)}</div>
        <p>${escapeHtml(data.review.message)}</p>
      `;

      reviewsGrid.prepend(reviewCard);
      reviewForm.reset();
      reviewNotice.textContent =
        "\u0414\u044f\u043a\u0443\u0454\u043c\u043e! \u0412\u0430\u0448 \u0432\u0456\u0434\u0433\u0443\u043a \u0443\u0441\u043f\u0456\u0448\u043d\u043e \u0434\u043e\u0434\u0430\u043d\u043e.";
      reviewNotice.hidden = false;
    } catch (error) {
      reviewNotice.textContent = error.message;
      reviewNotice.hidden = false;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "\u041d\u0430\u0434\u0456\u0441\u043b\u0430\u0442\u0438";
    }
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const stickyCta = document.getElementById("stickyCta");
const videoSection = document.querySelector(".video-section");
const orderSection = document.querySelector("#order");
const videoStory = document.getElementById("videoStory");

if (videoStory) {
  const videoSrc = videoStory.dataset.src || "";

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!videoStory.src && videoSrc) {
            videoStory.src = videoSrc;
          }
          return;
        }

        if (videoStory.src) {
          videoStory.removeAttribute("src");
        }
      },
      { threshold: 0.45 }
    );

    videoObserver.observe(videoStory);
  } else {
    if (videoSrc) {
      videoStory.src = videoSrc;
    }
  }
}

if (stickyCta && videoSection && orderSection) {
  function updateStickyCta() {
    const orderRect = orderSection.getBoundingClientRect();
    const insideOrderBlock =
      orderRect.top < window.innerHeight && orderRect.bottom > 0;

    const shouldShow = window.scrollY > 160 && !insideOrderBlock;
    stickyCta.classList.toggle("sticky-cta--hidden", !shouldShow);
  }

  window.addEventListener("scroll", updateStickyCta, { passive: true });
  window.addEventListener("resize", updateStickyCta);
  updateStickyCta();
}
