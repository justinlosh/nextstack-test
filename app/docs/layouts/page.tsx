export default function LayoutsDocumentation() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Layout System Documentation</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="mb-4">
          The layout system allows you to dynamically render page structures based on configurations retrieved from the
          flat-file CMS. It supports various layout templates, each defined by a unique identifier and a corresponding
          structure specifying the arrangement of content blocks.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Architecture</h2>
        <p className="mb-4">The layout system consists of the following components:</p>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">
            <strong>Layout Manager:</strong> Orchestrates the rendering of templates and content blocks based on
            configurations.
          </li>
          <li className="mb-2">
            <strong>Template Registry:</strong> Manages the registration and retrieval of template components.
          </li>
          <li className="mb-2">
            <strong>Block Registry:</strong> Manages the registration and retrieval of content block components.
          </li>
          <li className="mb-2">
            <strong>Layout Context:</strong> Provides access to the current template and page configuration.
          </li>
          <li className="mb-2">
            <strong>Layout Area:</strong> Renders a group of content blocks within a template.
          </li>
          <li className="mb-2">
            <strong>Content Blocks:</strong> Render specific types of content, such as headers, footers, articles, etc.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Template Configuration</h2>
        <p className="mb-4">Templates are defined in the CMS with the following structure:</p>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto mb-4">
          {`{
  "id": "standard",
  "type": "standard",
  "name": "Standard Template",
  "description": "A standard template with header, main content, and footer",
  "areas": [
    {
      "id": "header",
      "type": "header",
      "blocks": [
        {
          "id": "main-header",
          "type": "header",
          "content": {
            "title": "Site Title",
            "links": [
              { "label": "Home", "url": "/" },
              { "label": "About", "url": "/about" },
              { "label": "Contact", "url": "/contact" }
            ]
          }
        }
      ]
    },
    {
      "id": "main",
      "type": "main",
      "blocks": [
        {
          "id": "main-content",
          "type": "article",
          "content": {
            "title": "Main Content",
            "body": "This is the main content area."
          }
        }
      ]
    },
    {
      "id": "footer",
      "type": "footer",
      "blocks": [
        {
          "id": "main-footer",
          "type": "footer",
          "content": {
            "copyright": "© 2023 Your Company",
            "links": [
              { "label": "Privacy", "url": "/privacy" },
              { "label": "Terms", "url": "/terms" }
            ]
          }
        }
      ]
    }
  ]
}`}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Page Configuration</h2>
        <p className="mb-4">Pages are defined in the CMS with the following structure:</p>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto mb-4">
          {`{
  "id": "home",
  "templateId": "standard",
  "title": "Home Page",
  "slug": "home",
  "areas": {
    "main": {
      "blocks": [
        {
          "id": "custom-content",
          "type": "article",
          "content": {
            "title": "Welcome to Our Site",
            "body": "This is the home page content."
          }
        }
      ]
    }
  },
  "blocks": {
    "main-header": {
      "content": {
        "title": "Custom Site Title"
      }
    }
  }
}`}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <p className="mb-4">
          To use the layout system in a page, import the LayoutManager component and pass the page ID:
        </p>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto mb-4">
          {`import LayoutManager from "../lib/layouts/layout-manager";

export default function Page({ params }) {
  const { slug } = params;
  
  // Find the page layout by slug
  const pageLayouts = await dataService.query(
    "pageLayout",
    (item) => item.slug === slug
  );
  
  if (!pageLayouts || pageLayouts.length === 0) {
    return notFound();
  }
  
  const pageLayout = pageLayouts[0];
  
  return <LayoutManager pageId={pageLayout.id} />;
}`}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Extending the System</h2>
        <h3 className="text-xl font-bold mb-2">Adding a New Template</h3>
        <p className="mb-4">
          To add a new template, create a new template component and register it in the template registry:
        </p>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto mb-4">
          {`// Create the template component
export default function CustomTemplate({ template, pageConfig }) {
  // Template implementation
}

// Register the template
TemplateRegistry.register("custom", CustomTemplate);`}
        </pre>

        <h3 className="text-xl font-bold mb-2">Adding a New Content Block</h3>
        <p className="mb-4">
          To add a new content block, create a new block component and register it in the block registry:
        </p>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto mb-4">
          {`// Create the block component
export default function CustomBlock({ block }) {
  // Block implementation
}

// Register the block
BlockRegistry.register("custom", CustomBlock);`}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
        <p className="mb-4">The layout system includes comprehensive error handling:</p>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">
            <strong>Missing Templates:</strong> If a template is not found, a fallback template is used.
          </li>
          <li className="mb-2">
            <strong>Invalid Templates:</strong> If a template is invalid, an error message is displayed.
          </li>
          <li className="mb-2">
            <strong>Missing Blocks:</strong> If a block is not found, a placeholder is displayed.
          </li>
          <li className="mb-2">
            <strong>Rendering Errors:</strong> An error boundary catches and displays errors during rendering.
          </li>
        </ul>
      </section>
    </div>
  )
}
