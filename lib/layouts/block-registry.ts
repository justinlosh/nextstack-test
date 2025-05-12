import type React from "react"
import HeaderBlock from "../components/blocks/header-block"
import FooterBlock from "../components/blocks/footer-block"
import HeroBlock from "../components/blocks/hero-block"
import ArticleBlock from "../components/blocks/article-block"
import SidebarBlock from "../components/blocks/sidebar-block"
import MediaBlock from "../components/blocks/media-block"
import TextBlock from "../components/blocks/text-block"
import CalloutBlock from "../components/blocks/callout-block"
import GalleryBlock from "../components/blocks/gallery-block"
import FormBlock from "../components/blocks/form-block"

// Block registry class
class BlockRegistryClass {
  private blocks: Map<string, React.ComponentType<any>> = new Map()

  constructor() {
    // Register default blocks
    this.register("header", HeaderBlock)
    this.register("footer", FooterBlock)
    this.register("hero", HeroBlock)
    this.register("article", ArticleBlock)
    this.register("sidebar", SidebarBlock)
    this.register("media", MediaBlock)
    this.register("text", TextBlock)
    this.register("callout", CalloutBlock)
    this.register("gallery", GalleryBlock)
    this.register("form", FormBlock)
  }

  // Register a block
  register(type: string, component: React.ComponentType<any>): void {
    this.blocks.set(type, component)
  }

  // Get a block by type
  getBlock(type: string): React.ComponentType<any> | null {
    return this.blocks.get(type) || null
  }

  // Check if a block exists
  hasBlock(type: string): boolean {
    return this.blocks.has(type)
  }

  // Get all registered block types
  getRegisteredTypes(): string[] {
    return Array.from(this.blocks.keys())
  }
}

// Export a singleton instance
export const BlockRegistry = new BlockRegistryClass()
