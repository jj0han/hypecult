import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de envio e entrega | Hypecult.",
  description:
    "Prazos de produção e entrega, áreas atendidas, rastreamento e procedimentos em caso de atrasos ou extravio de produtos da Hypecult.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <header className="mb-10 space-y-2 border-b border-border pb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Política de envio e entrega
        </h1>
        <p className="text-muted-foreground text-sm">
          Última atualização: 12 de abril de 2026.
        </p>
      </header>

      <article className="text-foreground space-y-8 text-sm leading-relaxed md:text-[15px]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Modelo de produção</h2>
          <p>
            A Hypecult opera no modelo <em>print-on-demand</em>: cada produto é
            produzido individualmente após a confirmação do pagamento do pedido.
            A produção é realizada pelo nosso parceiro{" "}
            <strong>Gelato AS</strong>, com instalações em múltiplos países, o
            que nos permite enviar a partir do centro de produção mais próximo
            do endereço de entrega.
          </p>
          <p>
            Por ser produzido sob encomenda, nenhum produto fica em estoque
            pronto — isso é o que garante personalização de alta qualidade e
            reduz o desperdício.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. Prazo de produção</h2>
          <p>
            O prazo de produção é de <strong>2 a 5 dias úteis</strong> após a
            confirmação do pagamento, dependendo do tipo de produto e da
            disponibilidade da instalação de produção. Produtos com maior
            complexidade de impressão podem requerer até 7 dias úteis.
          </p>
          <p>
            O prazo de produção <strong>não está incluído</strong> no prazo de
            entrega indicado no checkout — ambos são somados para o prazo total
            estimado.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. Prazo de entrega</h2>
          <p>
            O prazo de entrega é estimado no momento da compra com base no
            endereço informado e na modalidade de frete selecionada. Os prazos
            abaixo são estimativas para entrega em território brasileiro após a
            saída do centro de produção:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Frete padrão:</strong> 5 a 12 dias úteis (capitais e
              regiões metropolitanas) / 7 a 20 dias úteis (demais localidades).
            </li>
            <li>
              <strong>Frete expresso:</strong> 2 a 5 dias úteis (disponível para
              regiões selecionadas, conforme exibido no checkout).
            </li>
          </ul>
          <p>
            Os prazos são estimativas e podem variar em razão de feriados,
            greves, condições climáticas adversas ou congestionamento logístico.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Áreas atendidas</h2>
          <p>
            Realizamos entregas em todo o território nacional, incluindo
            capitais, regiões metropolitanas e interior. Não realizamos entregas
            internacionais no momento.
          </p>
          <p>
            Para algumas localidades com acesso restrito (ilhas, áreas remotas,
            zonas rurais), o prazo de entrega pode ser superior ao estimado e o
            frete expresso pode não estar disponível.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Custo de frete</h2>
          <p>
            O custo do frete é calculado automaticamente com base no endereço de
            entrega, no peso/dimensões do pedido e na modalidade selecionada,
            sendo exibido de forma transparente antes da conclusão do pagamento.
          </p>
          <p>
            Pedidos que utilizem cupons de <strong>frete grátis</strong> válidos
            terão o custo de frete integralmente dispensado, conforme as
            condições do cupom.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Rastreamento do pedido</h2>
          <p>
            Após o despacho do pedido, você receberá um e-mail com o código de
            rastreamento e o link para acompanhamento. O rastreamento também
            está disponível na área &quot;Meus Pedidos&quot; da sua conta.
          </p>
          <p>
            O código de rastreamento pode levar até 48 horas para ser atualizado
            nos sistemas da transportadora após o despacho.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            7. Endereço de entrega incorreto ou incompleto
          </h2>
          <p>
            A Hypecult não se responsabiliza por atrasos ou não-entrega
            decorrentes de endereço incorreto, incompleto ou desatualizado
            informado pelo consumidor. Verifique cuidadosamente os dados de
            entrega antes de concluir o pedido.
          </p>
          <p>
            Caso perceba um erro no endereço <strong>antes do despacho</strong>,
            entre em contacto imediatamente pelo e-mail{" "}
            <strong>suporte@hypecult.com.br</strong>. Após o despacho, a
            alteração de endereço não é garantida e pode gerar custos adicionais
            de reenvio a cargo do consumidor.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            8. Tentativas de entrega e ausência do destinatário
          </h2>
          <p>
            A transportadora realizará até 3 (três) tentativas de entrega em
            dias úteis consecutivos. Em caso de insucesso nas tentativas, o
            pacote será encaminhado para a agência mais próxima, onde ficará
            disponível por até 7 (sete) dias corridos. Após esse prazo, o
            produto será devolvido ao remetente.
          </p>
          <p>
            Em caso de devolução por ausência do destinatário, um novo envio
            poderá ser realizado mediante pagamento das despesas de reenvio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">9. Atrasos e extravio</h2>
          <p>
            Se o prazo estimado de entrega tiver expirado e o pedido não tiver
            sido entregue, entre em contacto pelo e-mail{" "}
            <strong>suporte@hypecult.com.br</strong> para que possamos acionar a
            transportadora e apurar a situação.
          </p>
          <p>
            Em caso de comprovado extravio, a Hypecult providenciará o reenvio
            do produto sem custo adicional ou o reembolso integral, conforme
            preferência do consumidor, em conformidade com o CDC.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">10. Embalagem</h2>
          <p>
            Os produtos são embalados de forma adequada para suportar o processo
            de transporte. Em caso de danos visíveis na embalagem no momento da
            entrega, recomendamos recusar o recebimento e registar a ocorrência
            com a transportadora. Em seguida, entre em contacto conosco pelo
            e-mail <strong>suporte@hypecult.com.br</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">11. Contacto</h2>
          <p>
            Para qualquer dúvida sobre envio e entrega, contacte-nos pelo e-mail{" "}
            <strong>suporte@hypecult.com.br</strong>.
          </p>
        </section>
      </article>
    </div>
  );
}
