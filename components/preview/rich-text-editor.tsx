"use client"

import { useState, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  ImageIcon,
  LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
} from "lucide-react"
import { cn } from "../../lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
}: RichTextEditorProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [showImageInput, setShowImageInput] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        allowBase64: true,
        inline: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  const addImage = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl("")
      setShowImageInput(false)
    }
  }

  const addLink = () => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl("")
      setShowLinkInput(false)
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className={cn("border rounded-md", className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-muted" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-muted" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowImageInput(!showImageInput)}
          className={showImageInput ? "bg-muted" : ""}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLinkInput(!showLinkInput)}
          className={showLinkInput || editor.isActive("link") ? "bg-muted" : ""}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showImageInput && (
        <div className="p-2 border-b flex items-center gap-2">
          <Input
            type="text"
            placeholder="Enter image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="text-sm"
          />
          <Button size="sm" onClick={addImage}>
            Add
          </Button>
        </div>
      )}

      {showLinkInput && (
        <div className="p-2 border-b flex items-center gap-2">
          <Input
            type="text"
            placeholder="Enter link URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="text-sm"
          />
          <Button size="sm" onClick={addLink}>
            Add
          </Button>
        </div>
      )}

      <EditorContent editor={editor} className="prose prose-sm max-w-none p-4" />
    </div>
  )
}
