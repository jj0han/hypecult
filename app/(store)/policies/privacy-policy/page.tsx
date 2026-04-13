import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidade | Hypecult.",
  description:
    "Saiba como a Hypecult coleta, usa e protege os seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD).",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <header className="mb-10 space-y-2 border-b border-border pb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Política de privacidade
        </h1>
        <p className="text-muted-foreground text-sm">
          Última atualização: 12 de abril de 2026.
        </p>
      </header>

      <article className="text-foreground space-y-8 text-sm leading-relaxed md:text-[15px]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            1. Identificação do controlador
          </h2>
          <p>
            A <strong>Hypecult</strong> é a controladora dos dados pessoais
            tratados neste site, nos termos da Lei nº 13.709/2018 (Lei Geral de
            Proteção de Dados — &quot;LGPD&quot;). Em caso de dúvidas sobre o
            tratamento dos seus dados, entre em contacto pelo e-mail{" "}
            <strong>privacidade@hypecult.com.br</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. Dados pessoais coletados</h2>
          <p>
            Coletamos os seguintes dados pessoais de acordo com a finalidade de
            cada interação:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Cadastro e conta:</strong> nome completo, endereço de
              e-mail, CPF, senha (armazenada em hash bcrypt, nunca em texto
              claro) e, quando aplicável, imagem de perfil proveniente do login
              via Google.
            </li>
            <li>
              <strong>Endereços de entrega:</strong> logradouro, número,
              complemento, bairro, cidade, estado e CEP.
            </li>
            <li>
              <strong>Pedidos:</strong> itens adquiridos, valores, método de
              envio selecionado, status e histórico de pedidos.
            </li>
            <li>
              <strong>Navegação e uso:</strong> endereço IP, tipo de navegador,
              páginas visitadas e interações no site, coletados por meio de
              cookies e tecnologias similares (vide Política de Cookies).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            3. Finalidades e bases legais
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-4 text-left font-semibold">
                    Finalidade
                  </th>
                  <th className="py-2 text-left font-semibold">
                    Base legal (LGPD)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 pr-4">Criação e gestão de conta</td>
                  <td className="py-2">Execução de contrato (art. 7º, V)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    Processamento e entrega de pedidos
                  </td>
                  <td className="py-2">Execução de contrato (art. 7º, V)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    Cumprimento de obrigações legais e fiscais
                  </td>
                  <td className="py-2">Obrigação legal (art. 7º, II)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    Comunicações transacionais (confirmação de pedido, rastreio)
                  </td>
                  <td className="py-2">Execução de contrato (art. 7º, V)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    Marketing e comunicações promocionais
                  </td>
                  <td className="py-2">Consentimento (art. 7º, I)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    Melhoria do site e experiência do utilizador
                  </td>
                  <td className="py-2">Legítimo interesse (art. 7º, IX)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Prevenção a fraudes e segurança</td>
                  <td className="py-2">Legítimo interesse (art. 7º, IX)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            4. Compartilhamento de dados
          </h2>
          <p>
            Os seus dados pessoais podem ser compartilhados com as seguintes
            categorias de destinatários, estritamente para as finalidades
            indicadas:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Gelato AS (fornecedor de produção e logística):</strong>{" "}
              nome, endereço de entrega e dados do pedido são transmitidos para
              produção e envio dos produtos.
            </li>
            <li>
              <strong>Transportadoras:</strong> nome e endereço de entrega para
              fins de despacho e rastreamento.
            </li>
            <li>
              <strong>Prestadores de serviços de pagamento:</strong> dados
              necessários para processamento financeiro, em conformidade com as
              normas do Banco Central do Brasil.
            </li>
            <li>
              <strong>Autoridades públicas:</strong> quando exigido por lei,
              regulamento ou decisão judicial.
            </li>
          </ul>
          <p>
            Não vendemos, alugamos nem cedemos os seus dados pessoais a
            terceiros para fins comerciais próprios.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            5. Transferência internacional de dados
          </h2>
          <p>
            A Gelato AS está sediada na Noruega e pode processar dados em
            diferentes países. Asseguramos que tais transferências ocorrem com
            salvaguardas adequadas, em conformidade com o art. 33 da LGPD.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Retenção de dados</h2>
          <p>
            Os dados pessoais são conservados pelo prazo necessário para cumprir
            as finalidades indicadas nesta Política ou obrigações legais. Em
            regra:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Dados de conta: enquanto a conta estiver ativa.</li>
            <li>
              Dados de pedidos: pelo prazo mínimo de 5 (cinco) anos para fins
              fiscais e contábeis.
            </li>
            <li>
              Dados de navegação: conforme a política de retenção de cada
              ferramenta de analytics utilizada.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">7. Direitos do titular</h2>
          <p>Nos termos da LGPD (art. 18), você tem direito a:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Confirmar a existência de tratamento dos seus dados;</li>
            <li>Acessar os seus dados;</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
            <li>
              Solicitar anonimização, bloqueio ou eliminação de dados
              desnecessários ou tratados em desconformidade com a LGPD;
            </li>
            <li>Obter portabilidade dos seus dados;</li>
            <li>
              Revogar o consentimento a qualquer momento, sem prejuízo da
              licitude do tratamento anterior à revogação;
            </li>
            <li>
              Peticionar à Autoridade Nacional de Proteção de Dados (ANPD).
            </li>
          </ul>
          <p>
            Para exercer os seus direitos, envie uma solicitação para{" "}
            <strong>privacidade@hypecult.com.br</strong>. Responderemos no prazo
            de até 15 (quinze) dias úteis.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">8. Segurança da informação</h2>
          <p>
            Adotamos medidas técnicas e organizacionais adequadas para proteger
            os seus dados contra acesso não autorizado, perda, destruição ou
            divulgação indevida, incluindo criptografia de senhas, comunicação
            via HTTPS e controle de acesso baseado em funções.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">9. Cookies</h2>
          <p>
            Utilizamos cookies e tecnologias similares para funcionamento do
            site e análise de uso. Para saber mais, consulte nossa{" "}
            <a
              href="/policies/cookie-policy"
              className="underline underline-offset-4 hover:text-foreground/80"
            >
              Política de Cookies
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            10. Alterações a esta política
          </h2>
          <p>
            Esta Política pode ser atualizada periodicamente. Notificaremos
            alterações relevantes por e-mail ou mediante aviso no site. A data
            de &quot;última atualização&quot; no topo deste documento indica a
            versão vigente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">11. Contacto</h2>
          <p>
            Dúvidas, solicitações ou reclamações relacionadas à privacidade
            podem ser enviadas para <strong>privacidade@hypecult.com.br</strong>
            .
          </p>
        </section>
      </article>
    </div>
  );
}
