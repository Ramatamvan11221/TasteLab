"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createCategory, updateCategory, deleteCategory } from "@/actions/catalog.actions";

interface CategoryManagerProps {
  categories: { id: string; name: string; slug: string }[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function handleCreate() {
    if (!newName.trim()) return;
    startTransition(async () => {
      const result = await createCategory({ name: newName.trim() });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setNewName("");
      toast.success("Kategori ditambahkan.");
      router.refresh();
    });
  }

  function handleUpdate(id: string) {
    if (!editName.trim()) return;
    startTransition(async () => {
      const result = await updateCategory(id, { name: editName.trim() });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setEditingId(null);
      toast.success("Kategori diperbarui.");
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Hapus kategori ini?")) return;
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Kategori dihapus.");
      router.refresh();
    });
  }

  return (
    <Card className="p-6">
      <div className="flex gap-2">
        <Input
          placeholder="Nama kategori baru..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <Button onClick={handleCreate} disabled={isPending}>
          <Plus className="size-4" /> Tambah
        </Button>
      </div>

      <ul className="mt-6 divide-y-2 divide-tastelab-black/10">
        {categories.length === 0 && (
          <p className="py-4 text-sm text-tastelab-black/50">Belum ada kategori.</p>
        )}
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between gap-3 py-3">
            {editingId === cat.id ? (
              <>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleUpdate(cat.id)}>
                    <Check className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                    <X className="size-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span className="font-bold">{cat.name}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingId(cat.id);
                      setEditName(cat.name);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
