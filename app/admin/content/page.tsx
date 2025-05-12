import { ContentList } from "@/components/content/content-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ContentDashboardPage() {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Content Management</h1>

      <Tabs defaultValue="pages">
        <TabsList className="mb-4">
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <ContentList
            contentType="page"
            title="Pages"
            description="Manage website pages"
            baseEditUrl="/admin/content"
          />
        </TabsContent>

        <TabsContent value="posts">
          <ContentList
            contentType="post"
            title="Blog Posts"
            description="Manage blog posts"
            baseEditUrl="/admin/content"
          />
        </TabsContent>

        <TabsContent value="products">
          <ContentList
            contentType="product"
            title="Products"
            description="Manage product listings"
            baseEditUrl="/admin/content"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
