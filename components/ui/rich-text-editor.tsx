"use client";

import {
  CodeSimpleIcon,
  Heading02FreeIcons,
  Heading03FreeIcons,
  LeftToRightListBulletFreeIcons,
  LeftToRightListNumberFreeIcons,
  LinkFreeIcons,
  TextBoldFreeIcons,
  TextItalicFreeIcons,
  TextUnderlineFreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ButtonGroup, ButtonGroupSeparator } from "./button-group";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  icon: IconSvgElement;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  icon,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
    >
      <HugeiconsIcon icon={icon} strokeWidth={2} size={16} />
    </Button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: RichTextEditorProps) {
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState(value ?? "");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
      Typography,
    ],
    content: value ?? "",
    editable: !disabled,
    onUpdate({ editor: e }) {
      const html = e.getHTML();
      const empty = e.isEmpty || html === "<p></p>" || html === "<p><br></p>";
      onChange(empty ? "" : html);
    },
    immediatelyRender: false,
  });

  // Sync external value changes into the editor (e.g. form reset)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value ?? "";
    if (current !== incoming && !isSourceMode) {
      editor.commands.setContent(incoming);
    }
  }, [value, editor, isSourceMode]);

  // Keep editor editable state in sync
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  const handleSourceToggle = useCallback(() => {
    if (!editor) return;

    if (!isSourceMode) {
      // Switching TO source: capture current HTML
      const html = editor.getHTML();
      const empty = editor.isEmpty || html === "<p></p>";
      setSourceHtml(empty ? "" : html);
      setIsSourceMode(true);
    } else {
      // Switching BACK from source: re-parse HTML into editor
      editor.commands.setContent(sourceHtml);
      const finalHtml = editor.getHTML();
      const empty =
        editor.isEmpty ||
        finalHtml === "<p></p>" ||
        finalHtml === "<p><br></p>";
      onChange(empty ? "" : finalHtml);
      setIsSourceMode(false);
    }
  }, [editor, isSourceMode, sourceHtml, onChange]);

  const handleLinkClick = useCallback(() => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("URL do link:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const editorFocusClass =
    "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50";

  return (
    <div
      className={cn(
        "rounded-xl border border-input transition-colors overflow-hidden",
        disabled && "cursor-not-allowed opacity-50",
        editorFocusClass,
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-input px-2 py-1">
        <ButtonGroup>
          <ToolbarButton
            title="Negrito"
            icon={TextBoldFreeIcons}
            isActive={editor?.isActive("bold")}
            disabled={disabled || isSourceMode}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            title="Itálico"
            icon={TextItalicFreeIcons}
            isActive={editor?.isActive("italic")}
            disabled={disabled || isSourceMode}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            title="Sublinhado"
            icon={TextUnderlineFreeIcons}
            isActive={editor?.isActive("underline")}
            disabled={disabled || isSourceMode}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          />
          <ButtonGroupSeparator />
          <ToolbarButton
            title="Título H2"
            icon={Heading02FreeIcons}
            isActive={editor?.isActive("heading", { level: 2 })}
            disabled={disabled || isSourceMode}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
          />
          <ToolbarButton
            title="Título H3"
            icon={Heading03FreeIcons}
            isActive={editor?.isActive("heading", { level: 3 })}
            disabled={disabled || isSourceMode}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 3 }).run()
            }
          />
          <ButtonGroupSeparator />
          <ToolbarButton
            title="Lista com marcadores"
            icon={LeftToRightListBulletFreeIcons}
            isActive={editor?.isActive("bulletList")}
            disabled={disabled || isSourceMode}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            title="Lista numerada"
            icon={LeftToRightListNumberFreeIcons}
            isActive={editor?.isActive("orderedList")}
            disabled={disabled || isSourceMode}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          />
          <ButtonGroupSeparator />
          <ToolbarButton
            title="Link"
            icon={LinkFreeIcons}
            isActive={editor?.isActive("link")}
            disabled={disabled || isSourceMode}
            onClick={handleLinkClick}
          />
          <ButtonGroupSeparator />
          <ToolbarButton
            title="HTML fonte"
            icon={CodeSimpleIcon}
            isActive={isSourceMode}
            disabled={disabled}
            onClick={handleSourceToggle}
          />
        </ButtonGroup>
      </div>

      {/* Editor / Source */}
      {isSourceMode ? (
        <Textarea
          value={sourceHtml}
          onChange={(e) => setSourceHtml(e.target.value)}
          rows={8}
          className={cn(
            "rounded-none rounded-b-xl border-0 font-mono text-xs focus-visible:ring-0 focus-visible:border-0",
            "min-h-32 resize-y"
          )}
          placeholder="<p>HTML aqui…</p>"
          disabled={disabled}
        />
      ) : (
        <EditorContent
          editor={editor}
          className={cn(
            "bg-input/30 prose prose-sm dark:prose-invert max-w-none px-3 py-2",
            "[&_.tiptap]:min-h-32 [&_.tiptap]:outline-none",
            "[&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground",
            "[&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
            "[&_.tiptap_p.is-editor-empty:first-child::before]:float-left",
            "[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none",
            "[&_.tiptap_p.is-editor-empty:first-child::before]:h-0"
          )}
        />
      )}
    </div>
  );
}
