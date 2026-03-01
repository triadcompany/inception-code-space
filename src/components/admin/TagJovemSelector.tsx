import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Tag, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TagJovem {
  id: string;
  nome: string;
}

interface TagJovemSelectorProps {
  selectedTagId: string | null;
  onTagChange: (tagId: string | null) => void;
}

const TagJovemSelector = ({ selectedTagId, onTagChange }: TagJovemSelectorProps) => {
  const [tags, setTags] = useState<TagJovem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from("tags_jovens" as any)
      .select("id, nome")
      .order("nome");
    if (!error && data) setTags(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;

    setCreating(true);
    try {
      const { data, error } = await (supabase
        .from("tags_jovens" as any)
        .insert({ nome: name })
        .select("id, nome")
        .single() as any);

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Essa tag já existe", variant: "destructive" });
        } else {
          throw error;
        }
        return;
      }

      setTags((prev) => [...prev, data as TagJovem].sort((a, b) => a.nome.localeCompare(b.nome)));
      onTagChange((data as TagJovem).id);
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
        <Label className="text-[hsl(220,30%,20%)]">Tag do Culto de Jovens</Label>
        <div className="h-10 bg-[hsl(220,20%,96%)] rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-[hsl(220,30%,20%)] flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5" />
        Tag do Culto de Jovens
      </Label>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onTagChange(selectedTagId === tag.id ? null : tag.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              selectedTagId === tag.id
                ? "bg-purple-100 border-purple-400 text-purple-700"
                : "bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,15%,45%)] hover:border-purple-300"
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
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-dashed border-purple-300 text-purple-500 hover:bg-purple-50 transition-all flex items-center gap-1"
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
            className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-purple-400 flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateTag();
              }
              if (e.key === "Escape") {
                setShowNewTag(false);
                setNewTagName("");
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            disabled={creating || !newTagName.trim()}
            onClick={handleCreateTag}
            className="bg-purple-600 hover:bg-purple-700 text-white"
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

export default TagJovemSelector;
