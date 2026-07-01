"use client";

import { cn } from "@/5-shared/lib/utils";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import { useEffect } from "react";

interface RichTextEditorProps {
  /** Current HTML value. */
  value: string;
  onChange: (html: string) => void;
  /** Re-mount key (e.g. active locale) so switching tabs resets content. */
  resetKey?: string;
  dir?: "ltr" | "rtl";
  translations?: TranslationDict;
}

export function RichTextEditor({ value, onChange, resetKey, dir = "ltr", translations }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // avoid SSR hydration mismatch in Next
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow" } }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-50 max-w-none px-4 py-3 focus:outline-none [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_a]:text-primary [&_a]:underline",
        dir,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // When the locale tab changes, swap the editor content to the new buffer.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || "") !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, editor]);

  const t = (key: string, fallback: string) => resolveTranslation(translations, key, fallback);

  if (!editor) return null;

  return (
    <div className="rounded-[var(--radius)] border border-input bg-background overflow-hidden">
      <Toolbar editor={editor} t={t} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor, t }: { editor: Editor; t: (key: string, fallback: string) => string }) {
  const btn = (active: boolean) =>
    cn(
      "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
      active && "bg-muted text-foreground",
    );

  function setLink() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(t("link-url", "Link URL"), prev ?? t("link-placeholder", "https://"));
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-1.5 py-1">
      <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} title={t("bold", "Bold")}>
        <Bold className="h-4 w-4" />
      </button>
      <button type="button" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} title={t("italic", "Italic")}>
        <Italic className="h-4 w-4" />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button type="button" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title={t("heading-2", "Heading 2")}>
        <Heading2 className="h-4 w-4" />
      </button>
      <button type="button" className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title={t("heading-3", "Heading 3")}>
        <Heading3 className="h-4 w-4" />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button type="button" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} title={t("bullet-list", "Bullet list")}>
        <List className="h-4 w-4" />
      </button>
      <button type="button" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title={t("numbered-list", "Numbered list")}>
        <ListOrdered className="h-4 w-4" />
      </button>
      <button type="button" className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()} title={t("quote", "Quote")}>
        <Quote className="h-4 w-4" />
      </button>
      <button type="button" className={btn(editor.isActive("link"))} onClick={setLink} title={t("link", "Link")}>
        <LinkIcon className="h-4 w-4" />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />
      <button type="button" className={btn(false)} onClick={() => editor.chain().focus().undo().run()} title={t("undo", "Undo")}>
        <Undo2 className="h-4 w-4" />
      </button>
      <button type="button" className={btn(false)} onClick={() => editor.chain().focus().redo().run()} title={t("redo", "Redo")}>
        <Redo2 className="h-4 w-4" />
      </button>
    </div>
  );
}
