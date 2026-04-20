"use client";

import { TaxonomyCrudTable } from "@/components/admin/taxonomy-crud-table";

export default function Page() {
  return (
    <TaxonomyCrudTable
      kind="subcategory"
      title="Temas (subcategorias)"
      description="Temas usados no combobox da ficha do produto e nos filtros da busca."
      newButtonLabel="Crie um tema com o botão +"
      dialogCreateTitle="Novo tema"
      dialogEditTitle="Editar tema"
      deleteConfirmTitle="Excluir este tema? Ele será removido dos produtos que o utilizam."
    />
  );
}
