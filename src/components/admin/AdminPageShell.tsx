import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminPageShellProps {
  title: string;
  description: string;
  onAdd?: () => void;
  addLabel?: string;
  children?: React.ReactNode;
}

const AdminPageShell = ({ title, description, onAdd, addLabel, children }: AdminPageShellProps) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(220,30%,20%)]">{title}</h1>
          <p className="text-[hsl(220,15%,55%)]">{description}</p>
        </div>
        {onAdd && (
          <Button
            onClick={onAdd}
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {addLabel || "Adicionar"}
          </Button>
        )}
      </div>
      {children || (
        <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-12 text-center">
          <p className="text-[hsl(220,15%,55%)]">Nenhum item cadastrado ainda.</p>
          {onAdd && (
            <Button
              onClick={onAdd}
              variant="outline"
              className="mt-4 border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {addLabel || "Adicionar primeiro item"}
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export default AdminPageShell;
