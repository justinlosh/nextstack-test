import { formatData } from "./utils/formatters"

export function renderUI(data) {
  const appElement = document.getElementById("app")

  // Format the data for display
  const formattedData = formatData(data)

  // Create the main container
  const container = document.createElement("div")
  container.className = "container"

  // Create header
  const header = document.createElement("header")
  header.className = "header"

  const title = document.createElement("h1")
  title.textContent = "Frontend Build Pipeline Demo"
  header.appendChild(title)

  // Create main content
  const main = document.createElement("main")
  main.className = "main-content"

  const dataSection = document.createElement("section")
  dataSection.className = "data-section"

  const sectionTitle = document.createElement("h2")
  sectionTitle.textContent = "Data from API"
  dataSection.appendChild(sectionTitle)

  const dataList = document.createElement("ul")
  dataList.className = "data-list"

  formattedData.forEach((item) => {
    const listItem = document.createElement("li")
    listItem.textContent = item.name
    dataList.appendChild(listItem)
  })

  dataSection.appendChild(dataList)
  main.appendChild(dataSection)

  // Create footer
  const footer = document.createElement("footer")
  footer.className = "footer"
  footer.textContent = "© 2023 Frontend Build Pipeline"

  // Assemble the UI
  container.appendChild(header)
  container.appendChild(main)
  container.appendChild(footer)

  // Add to the DOM
  appElement.appendChild(container)
}
