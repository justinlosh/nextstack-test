import type { LayoutAreaProps, ContentBlock } from "./types"
import { BlockRegistry } from "./block-registry"

export default function LayoutArea({ area, pageConfig }: LayoutAreaProps) {
  if (!area || !area.blocks || area.blocks.length === 0) {
    return null
  }

  // Apply area styles
  const areaStyles = area.styles || {}
  const areaClassName = area.className || ""

  return (
    <div
      className={`layout-area layout-area-${area.type} ${areaClassName}`}
      style={areaStyles}
      data-area-id={area.id}
      data-area-type={area.type}
    >
      {area.blocks.map((block: ContentBlock) => {
        // Get the block component
        const BlockComponent = BlockRegistry.getBlock(block.type)

        // If the block component doesn't exist, render a placeholder
        if (!BlockComponent) {
          return (
            <div key={block.id} className="layout-block-error" data-block-id={block.id} data-block-type={block.type}>
              <p>Block type not found: {block.type}</p>
            </div>
          )
        }

        // Apply block overrides from page config
        let resolvedBlock = { ...block }
        if (pageConfig?.blocks && pageConfig.blocks[block.id]) {
          resolvedBlock = {
            ...resolvedBlock,
            ...pageConfig.blocks[block.id],
          }
        }

        // Render the block
        return (
          <div
            key={block.id}
            className={`layout-block layout-block-${block.type} ${block.className || ""}`}
            style={block.styles || {}}
            data-block-id={block.id}
            data-block-type={block.type}
          >
            <BlockComponent block={resolvedBlock} pageConfig={pageConfig} />
          </div>
        )
      })}
    </div>
  )
}
