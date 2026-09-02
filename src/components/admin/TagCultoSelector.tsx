import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Tag, X } from "lucide-react";
import {
  createTagGeral,
  createTagJovem,
  listTagsGerais,
  listTagsJovens,
} from "@/lib/resources";
import { useToast } from "@/hooks/use-toast";

interface TagItem {
  id: string;
  nome: string;
}

interface TagCultoSelectorProps {
  selectedTagId: string | null;
  onTagChange: (tagId: string | null) => void;
  tableName: "tags_jovens" | "tags_gerais";
  label?: string;
}

const TagCultoSelector = ({ selectedTagId, onTagChange, tableName, label = "Tag" }: TagCultoSelectorProps) => {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const isJovens = tableName === "tags_jovens";
  const accentClass = isJovens ? "purple" : "primary";
  const listTags = isJovens ? listTagsJovens : listTagsGerais;
  const createTag = isJovens ? createTagJovem : createTagGeral;

  useEffect(() => {
    const run = async () => {
      const { data, error } = await listTags();
      if (!error && data) setTags(data as any);
      setLoading(false);
    };
    run();
  }, [tableName]);

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;

    setCreating(true);
    try {
      const { data, error } = await createTag(name);

      if (error) {
        if (error.status === 409) {
          toast({ title: "Essa tag já existe", variant: "destructive" });
        } else {
          throw new Error(error.message);
        }
        return;
      }

      setTags((prev) => [...prev, data as TagItem].sort((a, b) => a.nome.localeCompare(b.nome)));
      onTagChange((data as TagItem).id);
      setNewTagName("");
      setShowNewTag(false);
      toast({ title: `Tag "${name}" criada!` });
    } catch (err: any) {
      toast({ title: "Erro ao criar tag", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label className="text-[hsl(220,30%,20%)]">{label}</Label>
        <div className="h-10 bg-[hsl(220,20%,96%)] rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-[hsl(220,30%,20%)] flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5" />
        {label}
      </Label>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onTagChange(selectedTagId === tag.id ? null : tag.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              selectedTagId === tag.id
                ? isJovens
                  ? "bg-purple-100 border-purple-400 text-purple-700"
                  : "bg-[hsl(var(--primary)/0.1)] border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                : isJovens
                  ? "bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,15%,45%)] hover:border-purple-300"
                  : "bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,15%,45%)] hover:border-[hsl(var(--primary)/0.5)]"
            }`}
          >
            {tag.nome}
            {selectedTagId === tag.id && <X className="w-3 h-3 inline ml-1.5 -mr-0.5" />}
          </button>
        ))}

        {!showNewTag && (
          <button
            type="button"
            onClick={() => setShowNewTag(true)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border border-dashed transition-all flex items-center gap-1 ${
              isJovens
                ? "border-purple-300 text-purple-500 hover:bg-purple-50"
                : "border-[hsl(var(--primary)/0.5)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)]"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Tag
          </button>
        )}
      </div>

      {showNewTag && (
        <div className="flex gap-2 mt-1">
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Nome da tag..."
            className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))] flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleCreateTag(); }
              if (e.key === "Escape") { setShowNewTag(false); setNewTagName(""); }
            }}
          />
          <Button
            type="button"
            size="sm"
            disabled={creating || !newTagName.trim()}
            onClick={handleCreateTag}
            className={isJovens ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white"}
          >
            {creating ? "..." : "Criar"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => { setShowNewTag(false); setNewTagName(""); }}
            className="border-[hsl(220,20%,85%)]"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TagCultoSelector;
