export function setupEventListeners() {
  // Example event listener for a button
  document.addEventListener("click", (event) => {
    if (event.target.matches(".data-list li")) {
      console.log("Item clicked:", event.target.textContent)
    }
  })

  // Example window event listeners
  window.addEventListener("resize", handleResize)
  window.addEventListener("scroll", handleScroll)
}

function handleResize() {
  // Throttle resize events for performance
  if (!window.resizeTimeout) {
    window.resizeTimeout = setTimeout(() => {
      window.resizeTimeout = null
      console.log("Window resized")
    }, 250)
  }
}

function handleScroll() {
  // Throttle scroll events for performance
  if (!window.scrollTimeout) {
    window.scrollTimeout = setTimeout(() => {
      window.scrollTimeout = null
      console.log("Window scrolled")
    }, 250)
  }
}
