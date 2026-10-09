"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import { Markdown } from "tiptap-markdown";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  ListChecks,
  Link as LinkIcon,
  Quote,
  Code,
  Minus,
  Undo2,
  Redo2,
  Table as TableIcon,
  AlignLeft,
  Eraser,
} from "lucide-react";
import { useEffect } from "react";

type CardDescriptionEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function CardDescriptionEditor({
  value,
  onChange,
}: CardDescriptionEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit,
      Markdown.configure({
        html: true, // Allows parsing of existing HTML tags safely
        linkify: true, // Auto-converts text URLs to links
      }),
      Underline,

      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),

      Placeholder.configure({
        placeholder: "Describe this task...",
      }),

      TaskList,

      TaskItem.configure({
        nested: true,
      }),

      Table.configure({
        resizable: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      TableRow,
      TableHeader,
      TableCell,
    ],

    content: value,

    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown());
    },
  });

  useEffect(() => {
    if (!editor) return;

    // Only update the editor if the value changed externally
    // and does not match the editor's current internal state
    const currentContent = value.includes("<")
      ? editor.getHTML()
      : editor.storage.markdown.getMarkdown();

    if (value !== currentContent && value !== "") {
      // The second argument 'false' prevents cursor jumping
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;

    const url = window.prompt("Enter URL", previousUrl || "https://");

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({
        rows: 3,
        cols: 3,
        withHeaderRow: true,
      })
      .run();
  };

  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{
        backgroundColor: "var(--color-input-bg)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Toolbar */}

      <div
        className="flex flex-wrap items-center gap-1 border-b p-2"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-column-bg)",
        }}
      >
        {/* Bold */}

        <EditorButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={15} />
        </EditorButton>

        {/* Italic */}

        <EditorButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={15} />
        </EditorButton>

        {/* Underline */}

        <EditorButton
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={15} />
        </EditorButton>

        <ToolbarDivider />

        {/* Heading 1 */}

        <EditorButton
          title="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 size={16} />
        </EditorButton>

        {/* Heading 2 */}

        <EditorButton
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 size={16} />
        </EditorButton>

        <ToolbarDivider />

        {/* Bullet list */}

        <EditorButton
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </EditorButton>

        {/* Numbered list */}

        <EditorButton
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </EditorButton>

        {/* Checklist */}

        <EditorButton
          title="Checklist"
          active={editor.isActive("taskList")}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <ListChecks size={16} />
        </EditorButton>

        <ToolbarDivider />

        {/* Link */}

        <EditorButton
          title="Add link"
          active={editor.isActive("link")}
          onClick={addLink}
        >
          <LinkIcon size={15} />
        </EditorButton>

        {/* Blockquote */}

        <EditorButton
          title="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={15} />
        </EditorButton>

        {/* Code */}

        <EditorButton
          title="Inline code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code size={15} />
        </EditorButton>

        {/* Horizontal rule */}

        <EditorButton
          title="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={15} />
        </EditorButton>

        <ToolbarDivider />

        {/* Table */}

        <EditorButton title="Insert table" onClick={addTable}>
          <TableIcon size={15} />
        </EditorButton>

        {/* Alignment */}

        <EditorButton
          title="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft size={15} />
        </EditorButton>

        <ToolbarDivider />

        {/* Undo */}

        <EditorButton
          title="Undo"
          active={editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={15} />
        </EditorButton>

        {/* Redo */}

        <EditorButton
          title="Redo"
          active={editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={15} />
        </EditorButton>

        {/* Clear */}

        <EditorButton
          title="Clear formatting"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        >
          <Eraser size={15} />
        </EditorButton>
      </div>

      {/* Editor */}

      <div className="card-description-scroll">
        <EditorContent
          editor={editor}
          className="card-description-editor prose max-w-none p-4 focus:outline-none"
        />
      </div>
    </div>
  );
}

/*
 * ============================================================
 * TOOLBAR BUTTON
 * ============================================================
 */

type EditorButtonProps = {
  children: React.ReactNode;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function EditorButton({
  children,
  title,
  active = false,
  disabled = false,
  onClick,
}: EditorButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        backgroundColor: active ? "var(--color-primary)" : "transparent",

        color: active ? "white" : "var(--color-text-secondary)",
      }}
    >
      {children}
    </button>
  );
}

/*
 * ============================================================
 * TOOLBAR DIVIDER
 * ============================================================
 */

function ToolbarDivider() {
  return (
    <div
      className="mx-1 h-5 w-px"
      style={{
        backgroundColor: "var(--color-border)",
      }}
    />
  );
}
