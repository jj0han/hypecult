import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de uso | Hypecult.",
  description:
    "Condições gerais de uso da plataforma Hypecult, incluindo regras de conta, propriedade intelectual e limitações de responsabilidade.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <header className="mb-10 space-y-2 border-b border-border pb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Termos de uso</h1>
        <p className="text-muted-foreground text-sm">
          Última atualização: 12 de abril de 2026.
        </p>
      </header>

      <article className="text-foreground space-y-8 text-sm leading-relaxed md:text-[15px]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Aceitação dos termos</h2>
          <p>
            Ao acessar ou utilizar o site <strong>hypecult.com.br</strong> e
            seus subdomínios (doravante &quot;Plataforma&quot;), o utilizador
            declara ter lido, compreendido e aceite integralmente os presentes
            Termos de Uso (&quot;Termos&quot;). Caso não concorde com qualquer
            disposição destes Termos, pedimos que não utilize a Plataforma.
          </p>
          <p>
            Estes Termos regem a relação entre a <strong>Hypecult</strong>{" "}
            (&quot;nós&quot;, &quot;nosso&quot; ou &quot;Empresa&quot;) e o
            utilizador (&quot;você&quot; ou &quot;usuário&quot;), em complemento
            às nossas políticas específicas de privacidade, cookies, envio e
            trocas/devoluções/reembolsos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. Elegibilidade</h2>
          <p>
            A Plataforma é destinada a pessoas com capacidade civil plena, nos
            termos do Código Civil Brasileiro. Menores de 18 (dezoito) anos
            somente poderão realizar compras com assistência ou representação de
            seus responsáveis legais, que serão solidariamente responsáveis
            pelas transações efetuadas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. Conta de usuário</h2>
          <p>
            Para acessar determinadas funcionalidades da Plataforma é necessário
            criar uma conta. Você é responsável por:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Fornecer informações verdadeiras, precisas e atualizadas no
              cadastro;
            </li>
            <li>
              Manter a confidencialidade das suas credenciais de acesso (e-mail
              e senha);
            </li>
            <li>
              Todas as ações realizadas sob a sua conta, incluindo compras
              efetuadas por terceiros que tenham obtido acesso às suas
              credenciais.
            </li>
          </ul>
          <p>
            Em caso de suspeita de uso não autorizado da sua conta,
            notifique-nos imediatamente pelo e-mail{" "}
            <strong>suporte@hypecult.com.br</strong>. Reservamo-nos o direito de
            suspender ou encerrar contas que violem estes Termos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            4. Uso permitido da plataforma
          </h2>
          <p>Ao utilizar a Plataforma, você compromete-se a não:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Utilizar a Plataforma para fins ilícitos ou em desconformidade com
              a legislação brasileira;
            </li>
            <li>
              Tentar acessar áreas restritas, sistemas ou dados sem autorização;
            </li>
            <li>Transmitir vírus, malware ou qualquer código malicioso;</li>
            <li>
              Realizar scraping ou extração automatizada de dados sem
              autorização prévia e por escrito;
            </li>
            <li>
              Publicar avaliações, comentários ou conteúdo falso, difamatório ou
              enganoso;
            </li>
            <li>
              Revender produtos adquiridos na Plataforma sem autorização
              expressa da Empresa.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Produtos e preços</h2>
          <p>
            A Hypecult é uma plataforma de <em>print-on-demand</em>: todos os
            produtos são produzidos individualmente após a confirmação do
            pedido. Os preços exibidos são em reais (BRL) e incluem impostos
            aplicáveis, salvo indicação em contrário.
          </p>
          <p>
            Reservamo-nos o direito de alterar preços a qualquer momento.
            Alterações de preço não afetam pedidos já confirmados e pagos.
            Eventuais erros de preço serão comunicados ao consumidor antes da
            conclusão da compra, podendo o pedido ser cancelado sem ônus.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            6. Pedidos e contrato de compra
          </h2>
          <p>
            O contrato de compra e venda considera-se celebrado no momento em
            que a Empresa confirma o pagamento do pedido por e-mail. A
            confirmação do pedido pelo sistema não constitui, por si só,
            aceitação definitiva, reservando-nos o direito de recusar ou
            cancelar pedidos em situações justificadas (e.g., indisponibilidade
            de produto, suspeita de fraude).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">7. Propriedade intelectual</h2>
          <p>
            Todo o conteúdo da Plataforma — incluindo, mas não limitado a,
            logotipos, marcas, textos, imagens, layout, código-fonte e design —
            é de propriedade exclusiva da Hypecult ou de seus licenciadores, e
            está protegido pela Lei nº 9.610/1998 (Lei de Direitos Autorais) e
            pela Lei nº 9.279/1996 (Lei de Propriedade Industrial).
          </p>
          <p>
            É vedada a reprodução, distribuição ou utilização de qualquer
            conteúdo da Plataforma sem autorização prévia e por escrito da
            Empresa.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            8. Limitação de responsabilidade
          </h2>
          <p>
            Na extensão permitida pela legislação brasileira, a Hypecult não se
            responsabiliza por:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Danos indiretos, lucros cessantes ou danos morais decorrentes do
              uso ou impossibilidade de uso da Plataforma;
            </li>
            <li>
              Interrupções temporárias do serviço por manutenção, falhas
              técnicas ou eventos fora do nosso controlo razoável (caso fortuito
              ou força maior);
            </li>
            <li>
              Atrasos de entrega decorrentes de causas imputáveis à
              transportadora ou a situações de força maior.
            </li>
          </ul>
          <p>
            Nada nestes Termos exclui ou limita os direitos do consumidor
            garantidos pelo Código de Defesa do Consumidor (Lei nº 8.078/1990).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">9. Políticas relacionadas</h2>
          <p>
            Estes Termos devem ser lidos em conjunto com as seguintes políticas,
            que integram o relacionamento contratual:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <a
                href="/policies/privacy-policy"
                className="underline underline-offset-4 hover:text-foreground/80"
              >
                Política de Privacidade
              </a>
            </li>
            <li>
              <a
                href="/policies/shipping-policy"
                className="underline underline-offset-4 hover:text-foreground/80"
              >
                Política de Envio e Entrega
              </a>
            </li>
            <li>
              <a
                href="/policies/refund-policy"
                className="underline underline-offset-4 hover:text-foreground/80"
              >
                Política de Trocas, Devoluções e Reembolsos
              </a>
            </li>
            <li>
              <a
                href="/policies/cookie-policy"
                className="underline underline-offset-4 hover:text-foreground/80"
              >
                Política de Cookies
              </a>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            10. Alterações a estes termos
          </h2>
          <p>
            Podemos atualizar estes Termos a qualquer momento. Alterações
            relevantes serão comunicadas por e-mail ou por aviso na Plataforma
            com pelo menos 10 (dez) dias de antecedência. A continuação do uso
            da Plataforma após a entrada em vigor das alterações constitui
            aceitação das novas condições.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">11. Lei aplicável e foro</h2>
          <p>
            Estes Termos são regidos pelas leis da República Federativa do
            Brasil. Para a resolução de conflitos que não possam ser resolvidos
            amigavelmente, fica eleito o foro da comarca de domicílio do
            consumidor, nos termos do art. 101, I, do CDC.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">12. Contacto</h2>
          <p>
            Para questões relacionadas a estes Termos, entre em contacto pelo
            e-mail <strong>suporte@hypecult.com.br</strong>.
          </p>
        </section>
      </article>
    </div>
  );
}
