export function formatData(data) {
  // Example data transformation
  return data.map((item) => ({
    ...item,
    name: item.name.toUpperCase(),
    formattedValue: `$${item.value.toFixed(2)}`,
  }))
}
