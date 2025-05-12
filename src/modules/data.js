export async function loadData() {
  // In a real application, this would fetch data from an API
  // For this example, we'll return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: "Item 1", value: 100 },
        { id: 2, name: "Item 2", value: 200 },
        { id: 3, name: "Item 3", value: 300 },
        { id: 4, name: "Item 4", value: 400 },
        { id: 5, name: "Item 5", value: 500 },
      ])
    }, 500)
  })
}
