"use client";

import { TaxonomyCrudTable } from "@/components/admin/taxonomy-crud-table";

export default function Page() {
  return (
    <TaxonomyCrudTable
      kind="category"
      title="Categorias de vitrine"
      description="Nomes exibidos no select de categoria na edição do produto."
      newButtonLabel="Crie uma categoria com o botão +"
      dialogCreateTitle="Nova categoria"
      dialogEditTitle="Editar categoria"
      deleteConfirmTitle="Excluir esta categoria? Os produtos vinculados ficarão sem categoria de vitrine."
    />
  );
}
