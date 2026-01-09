import { useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
} from "lucide-react";
import { locationApi } from "../api/locations/locationApi";

const Toolbar = ({ editor }) => {
  const imageInputRef = useRef(null);

  const addImage = useCallback(async () => {
    const input = imageInputRef.current;
    if (!input) return;

    input.onchange = async () => {
      if (!input.files?.length) return;

      const file = input.files[0];
      try {
        const res = await locationApi.uploadImages([file]);
        const url = res.data.images[0]?.url;
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Tải ảnh lên thất bại. Vui lòng thử lại.");
      }
    };

    input.click();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const ToggleButton = ({ onClick, isActive, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors duration-150 ${
        isActive
          ? "bg-indigo-100 text-indigo-600"
          : "hover:bg-gray-200 text-gray-600"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-t-lg bg-gray-50">
      <input
        type="file"
        ref={imageInputRef}
        className="hidden"
        accept="image/*"
      />
      <ToggleButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className="w-5 h-5" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className="w-5 h-5" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline"
      >
        <UnderlineIcon className="w-5 h-5" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough className="w-5 h-5" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="w-5 h-5" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List className="w-5 h-5" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOrdered className="w-5 h-5" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote className="w-5 h-5" />
      </ToggleButton>
      <ToggleButton onClick={addImage} title="Add Image">
        <ImageIcon className="w-5 h-5" />
      </ToggleButton>
    </div>
  );
};

const RichTextEditor = ({
  label,
  id,
  required = false,
  content,
  onChange,
  placeholder,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Image,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose max-w-none p-3 border border-t-0 border-gray-300 rounded-b-lg focus:outline-none min-h-[150px]",
      },
    },
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Set placeholder and list styles using CSS
  const customStyles = `
    .prose p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: #adb5bd;
      pointer-events: none;
      height: 0;
    }
    .prose ul, .prose ol {
      padding-left: 1.5rem;
    }
    .prose ul {
      list-style-type: disc;
    }
    .prose ol {
      list-style-type: decimal;
    }
  `;

  return (
    <div className="flex flex-col">
      <style>{customStyles}</style>
      <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div id={id}>
        <Toolbar editor={editor} />
        <EditorContent editor={editor} data-placeholder={placeholder} />
      </div>
    </div>
  );
};

export default RichTextEditor;
