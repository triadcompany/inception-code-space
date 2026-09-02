import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import ImageResize from "tiptap-extension-resize-image";
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Quote, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Minus, Heading1, Heading2, Heading3,
  Undo, Redo, Highlighter, RemoveFormatting, ImagePlus,
} from "lucide-react";
import { useEffect, useRef, useCallback } from "react";
import { uploadFile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const ToolbarButton = ({
  onClick, active, children, title, disabled,
}: { onClick: () => void; active?: boolean; children: React.ReactNode; title?: string; disabled?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-1.5 rounded transition-colors ${
      disabled ? "opacity-40 cursor-not-allowed" :
      active ? "bg-[hsl(220,20%,88%)] text-[hsl(220,30%,20%)]" : "text-[hsl(220,15%,45%)] hover:bg-[hsl(220,20%,93%)]"
    }`}
  >
    {children}
  </button>
);

const RichTextEditor = ({ content, onChange, placeholder = "Escreva aqui...", minHeight = "200px" }: RichTextEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const uploadingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-600 underline" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      ImageResize.configure({ inline: false }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none text-[hsl(220,30%,20%)]`,
        style: `min-height: ${minHeight}; padding: 12px;`,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content]);

  const uploadImage = useCallback(async (file: File) => {
    if (uploadingRef.current) return;
    uploadingRef.current = true;

    try {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Selecione um arquivo de imagem", variant: "destructive" });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Imagem muito grande (máx. 5MB)", variant: "destructive" });
        return;
      }

      const { data: uploaded, error } = await uploadFile("galeria", file, file.name);
      if (error || !uploaded) throw new Error(error?.message ?? "Falha no upload");

      if (editor) {
        editor.chain().focus().insertContent(`<img src="${uploaded.url}" />`).run();
        toast({ title: "Imagem inserida!" });
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({ title: "Erro ao enviar imagem", description: err.message, variant: "destructive" });
    } finally {
      uploadingRef.current = false;
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [editor, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
  };

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL do link:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const addImageUrl = () => {
    const url = window.prompt("URL da imagem:");
    if (url) {
      editor.chain().focus().insertContent(`<img src="${url}" />`).run();
    }
  };

  const sz = 15;

  return (
    <div className="border border-[hsl(220,20%,90%)] rounded-lg overflow-hidden bg-white">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[hsl(220,20%,90%)] bg-[hsl(220,20%,97%)]">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Desfazer"><Undo size={sz} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Refazer"><Redo size={sz} /></ToolbarButton>

        <div className="w-px h-5 bg-[hsl(220,20%,88%)] mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Negrito"><Bold size={sz} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Itálico"><Italic size={sz} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Sublinhado"><UnderlineIcon size={sz} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleMark("highlight").run()} active={editor.isActive("highlight")} title="Destaque"><Highlighter size={sz} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Limpar formatação"><RemoveFormatting size={sz} /></ToolbarButton>

        <div className="w-px h-5 bg-[hsl(220,20%,88%)] mx-1" />

        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Link"><LinkIcon size={sz} /></ToolbarButton>
        <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Inserir imagem (upload)"><ImagePlus size={sz} /></ToolbarButton>

        <div className="w-px h-5 bg-[hsl(220,20%,88%)] mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Título 1"><Heading1 size={sz} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Título 2"><Heading2 size={sz} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Título 3"><Heading3 size={sz} /></ToolbarButton>

        <div className="w-px h-5 bg-[hsl(220,20%,88%)] mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Lista"><List size={sz} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Lista numerada"><ListOrdered size={sz} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Citação"><Quote size={sz} /></ToolbarButton>

        <div className="w-px h-5 bg-[hsl(220,20%,88%)] mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Alinhar esquerda"><AlignLeft size={sz} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Centralizar"><AlignCenter size={sz} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Alinhar direita"><AlignRight size={sz} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justificar"><AlignJustify size={sz} /></ToolbarButton>

        <div className="w-px h-5 bg-[hsl(220,20%,88%)] mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Linha horizontal"><Minus size={sz} /></ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
