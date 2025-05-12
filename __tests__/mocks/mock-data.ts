// Mock data for testing

// Page mock data
export const mockPage = {
  id: "page-1",
  title: "Test Page",
  content: "<p>This is a test page content with <strong>formatting</strong>.</p>",
  createdAt: "2023-01-01T12:00:00Z",
  updatedAt: "2023-01-02T12:00:00Z",
  slug: "test-page",
  featuredImage: "/placeholder.svg",
  excerpt: "This is a test page excerpt.",
  readingTime: 2,
}

export const mockPages = [
  mockPage,
  {
    id: "page-2",
    title: "Another Page",
    content: "<p>This is another test page.</p>",
    createdAt: "2023-01-03T12:00:00Z",
    updatedAt: "2023-01-04T12:00:00Z",
    slug: "another-page",
  },
  {
    id: "page-3",
    title: "Third Page",
    content: "<p>This is the third test page.</p>",
    createdAt: "2023-01-05T12:00:00Z",
    updatedAt: "2023-01-06T12:00:00Z",
    slug: "third-page",
    featuredImage: "/placeholder.svg",
  },
]

// Note mock data
export const mockNote = {
  id: "note-1",
  title: "Test Note",
  content: "# Test Note\n\nThis is a test note with **markdown**.",
  createdAt: "2023-01-01T12:00:00Z",
  updatedAt: "2023-01-02T12:00:00Z",
  tags: ["test", "example", "note"],
  excerpt: "This is a test note excerpt.",
}

export const mockNotes = [
  mockNote,
  {
    id: "note-2",
    title: "Another Note",
    content: "# Another Note\n\nThis is another test note.",
    createdAt: "2023-01-03T12:00:00Z",
    updatedAt: "2023-01-04T12:00:00Z",
    tags: ["example"],
  },
  {
    id: "note-3",
    title: "Third Note",
    content: "# Third Note\n\nThis is the third test note.",
    createdAt: "2023-01-05T12:00:00Z",
    updatedAt: "2023-01-06T12:00:00Z",
    tags: ["test", "note"],
  },
]

// Form mock data
export const mockForm = {
  id: "form-1",
  name: "Test Form",
  description: "This is a test form.",
  createdAt: "2023-01-01T12:00:00Z",
  updatedAt: "2023-01-02T12:00:00Z",
  fields: [
    {
      id: "field-1",
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "Enter your name",
    },
    {
      id: "field-2",
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "Enter your email",
    },
    {
      id: "field-3",
      name: "message",
      label: "Message",
      type: "textarea",
      required: false,
      placeholder: "Enter your message",
    },
  ],
  submitButtonText: "Submit Form",
}

export const mockForms = [
  mockForm,
  {
    id: "form-2",
    name: "Contact Form",
    description: "Contact us using this form.",
    createdAt: "2023-01-03T12:00:00Z",
    updatedAt: "2023-01-04T12:00:00Z",
    fields: [
      {
        id: "field-1",
        name: "name",
        label: "Name",
        type: "text",
        required: true,
      },
      {
        id: "field-2",
        name: "email",
        label: "Email",
        type: "email",
        required: true,
      },
    ],
  },
]

// Submission mock data
export const mockSubmission = {
  id: "submission-1",
  formId: "form-1",
  createdAt: "2023-01-10T12:00:00Z",
  ip: "127.0.0.1",
  data: {
    name: "John Doe",
    email: "john@example.com",
    message: "This is a test submission.",
  },
}

export const mockSubmissions = [
  mockSubmission,
  {
    id: "submission-2",
    formId: "form-1",
    createdAt: "2023-01-11T12:00:00Z",
    ip: "127.0.0.2",
    data: {
      name: "Jane Smith",
      email: "jane@example.com",
      message: "Another test submission.",
    },
  },
]

// Media mock data
export const mockMedia = {
  id: "media-1",
  title: "Test Image",
  description: "This is a test image.",
  url: "/placeholder.svg",
  type: "image",
  createdAt: "2023-01-01T12:00:00Z",
  size: 1024,
  dimensions: "800x600",
}

export const mockMediaItems = [
  mockMedia,
  {
    id: "media-2",
    title: "Test Video",
    description: "This is a test video.",
    url: "/test-video.mp4",
    type: "video",
    createdAt: "2023-01-02T12:00:00Z",
    size: 10240,
  },
  {
    id: "media-3",
    title: "Test PDF",
    description: "This is a test PDF.",
    url: "/test-document.pdf",
    type: "pdf",
    createdAt: "2023-01-03T12:00:00Z",
    size: 2048,
  },
]

// Mock transformations
export const mockTransformation = (data: any) => {
  return {
    ...data,
    transformed: true,
  }
}
