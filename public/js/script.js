// Home page product slider function
// Function to initialize slider navigation
function initializeSliderNavigation(sliderId, prevButtonId, nextButtonId) {
  const slider = document.getElementById(sliderId);
  const prevButton = document.getElementById(prevButtonId);
  const nextButton = document.getElementById(nextButtonId);

  // Button navigation
  prevButton.addEventListener("click", () => {
      slider.scrollBy({
          left: -slider.clientWidth * 0.8, // Scroll 80% of visible width
          behavior: "smooth",
      });
  });

  nextButton.addEventListener("click", () => {
      slider.scrollBy({
          left: slider.clientWidth * 0.8, // Scroll 80% of visible width
          behavior: "smooth",
      });
  });

  // Function to update button states
  function updateButtonStates() {
      const scrollLeft = Math.ceil(slider.scrollLeft); // Round up to handle fractional values
      const maxScrollLeft = slider.scrollWidth - slider.clientWidth; // Maximum scrollable distance

      // Disable left button if scrolled to the start
      prevButton.disabled = scrollLeft <= 0;

      // Disable right button if scrolled to the end
      nextButton.disabled = scrollLeft >= maxScrollLeft;
  }

  // Listen to scroll events and update button states
  slider.addEventListener("scroll", updateButtonStates);

  // Initial button state update on page load
  updateButtonStates();
}

// Initialize sliders
initializeSliderNavigation("featuredSlider", "featuredPrevButton", "featuredNextButton");
initializeSliderNavigation("latestSlider", "latestPrevButton", "latestNextButton");


//Profile icon clickable function
const profileIcon = document.getElementById("profileIcon");
const dropdownMenu = document.getElementById("dropdownMenu");

profileIcon.addEventListener("click", () => {
    dropdownMenu.classList.toggle("show");
});

document.addEventListener("click", (event) => {
    if (!profileIcon.contains(event.target)) {
        dropdownMenu.classList.remove("show");
    }
});