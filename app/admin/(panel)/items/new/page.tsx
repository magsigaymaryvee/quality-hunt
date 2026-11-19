// app/admin/(panel)/items/new/page.tsx  →  yoursite/admin/items/new
import ItemForm from "@/components/ItemForm";

export default function NewItemPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-[32px] font-extrabold">Add item</h1>
      <ItemForm />
    </div>
  );
}