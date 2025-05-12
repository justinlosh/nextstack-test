import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ContentFilter } from "@/components/content/core/content-filter"
import { mockPages } from "../../../mocks/mock-data"

// Mock the CollectionRenderer component
jest.mock("@/components/content/renderers/collection-renderer", () => ({
  CollectionRenderer: ({ collection }) => (
    <div data-testid="collection-renderer">
      {collection.length} items
      <ul>
        {collection.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  ),
}))

describe("ContentFilter", () => {
  const sortOptions = [
    { label: "Title", field: "title" },
    { label: "Date", field: "updatedAt" },
  ]

  const filterOptions = [
    {
      label: "Has Image",
      field: "featuredImage",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
  ]

  it("renders search input and buttons", () => {
    render(
      <ContentFilter items={mockPages} contentType="page" sortOptions={sortOptions} filterOptions={filterOptions} />,
    )

    expect(screen.getByPlaceholderText(/Search.../i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Search/i })).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: /Sort by.../i })).toBeInTheDocument()
  })

  it("filters items based on search query", async () => {
    render(<ContentFilter items={mockPages} contentType="page" searchFields={["title"]} />)

    // Initially all items should be displayed
    expect(screen.getByText("3 items")).toBeInTheDocument()
    expect(screen.getByText("Test Page")).toBeInTheDocument()
    expect(screen.getByText("Another Page")).toBeInTheDocument()
    expect(screen.getByText("Third Page")).toBeInTheDocument()

    // Search for "Another"
    fireEvent.change(screen.getByPlaceholderText(/Search.../i), { target: { value: "Another" } })
    fireEvent.submit(screen.getByRole("button", { name: /Search/i }).closest("form"))

    await waitFor(() => {
      expect(screen.getByText("1 items")).toBeInTheDocument()
      expect(screen.getByText("Another Page")).toBeInTheDocument()
      expect(screen.queryByText("Test Page")).not.toBeInTheDocument()
      expect(screen.queryByText("Third Page")).not.toBeInTheDocument()
    })
  })
})
