import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de cookies | Hypecult.",
  description:
    "Saiba quais cookies a Hypecult utiliza, para que servem e como gerenciá-los ou desativá-los.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <header className="mb-10 space-y-2 border-b border-border pb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Política de cookies
        </h1>
        <p className="text-muted-foreground text-sm">
          Última atualização: 12 de abril de 2026.
        </p>
      </header>

      <article className="text-foreground space-y-8 text-sm leading-relaxed md:text-[15px]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. O que são cookies?</h2>
          <p>
            Cookies são pequenos ficheiros de texto armazenados no seu
            dispositivo (computador, tablet ou telemóvel) quando visita um
            website. Eles permitem que o site recorde as suas preferências e
            acções ao longo do tempo, melhorando a experiência de navegação.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. Como utilizamos cookies</h2>
          <p>
            A Hypecult utiliza cookies e tecnologias similares (como{" "}
            <em>localStorage</em> e <em>sessionStorage</em>) para o
            funcionamento adequado da Plataforma, para fins analíticos e para
            recordar as suas preferências. Não utilizamos cookies para
            publicidade comportamental direcionada de terceiros.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            3. Categorias de cookies utilizados
          </h2>

          <div className="space-y-5">
            <div className="rounded-lg border border-border p-4 space-y-2">
              <h3 className="font-semibold">
                3.1 Cookies estritamente necessários
              </h3>
              <p>
                Estes cookies são essenciais para o funcionamento da Plataforma
                e não podem ser desativados. Incluem cookies de sessão de
                autenticação (NextAuth), gestão do carrinho de compras e
                preferências básicas de segurança. Sem eles, o site não funciona
                corretamente.
              </p>
              <p className="text-muted-foreground">
                <strong>Base legal:</strong> Legítimo interesse / execução do
                serviço — não requerem consentimento.
              </p>
            </div>

            <div className="rounded-lg border border-border p-4 space-y-2">
              <h3 className="font-semibold">3.2 Cookies de preferências</h3>
              <p>
                Permitem que o site recorde escolhas que fez (como o tema
                claro/escuro da interface). Sem eles, terá de redefinir as suas
                preferências a cada visita.
              </p>
              <p className="text-muted-foreground">
                <strong>Base legal:</strong> Consentimento (LGPD, art. 7º, I).
              </p>
            </div>

            <div className="rounded-lg border border-border p-4 space-y-2">
              <h3 className="font-semibold">3.3 Cookies analíticos</h3>
              <p>
                Recolhem informações sobre como os visitantes utilizam a
                Plataforma (páginas visitadas, tempo de sessão, origem do
                tráfego). Os dados são utilizados de forma agregada e
                anonimizada para melhorar o desempenho e a usabilidade do site.
              </p>
              <p className="text-muted-foreground">
                <strong>Base legal:</strong> Legítimo interesse (LGPD, art. 7º,
                IX) — pode recusar através das configurações do seu navegador.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Cookies de terceiros</h2>
          <p>
            Ao fazer login com a sua conta Google, o Google pode definir cookies
            no seu dispositivo de acordo com a sua{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground/80"
            >
              Política de Privacidade
            </a>
            . Não temos controlo sobre esses cookies de terceiros.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            5. Como gerir ou desativar cookies
          </h2>
          <p>
            Pode gerir as preferências de cookies diretamente através das
            definições do seu navegador. A maioria dos navegadores permite-lhe:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Ver os cookies armazenados e apagá-los individualmente;</li>
            <li>Bloquear cookies de terceiros;</li>
            <li>Bloquear cookies de sites específicos;</li>
            <li>Bloquear todos os cookies.</li>
          </ul>
          <p>
            Consulte as instruções do seu navegador para saber como proceder:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground/80"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/pt-BR/kb/gerencie-configuracoes-de-armazenamento-local-de-s"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground/80"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground/80"
              >
                Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/pt-br/windows/excluir-e-gerenciar-cookies-168dab11-0753-043d-7c16-ede5947fc64d"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground/80"
              >
                Microsoft Edge
              </a>
            </li>
          </ul>
          <p>
            Atenção: desativar cookies estritamente necessários pode impedir o
            funcionamento correto da Plataforma, incluindo o login e o carrinho
            de compras.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Retenção</h2>
          <p>
            Os cookies de sessão são eliminados automaticamente quando fecha o
            navegador. Os cookies persistentes têm prazos de validade variáveis:
            os cookies de autenticação têm duração de 30 (trinta) dias; os
            cookies de preferências têm duração de 1 (um) ano.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            7. Relação com a política de privacidade
          </h2>
          <p>
            Esta Política de Cookies complementa a nossa{" "}
            <a
              href="/policies/privacy-policy"
              className="underline underline-offset-4 hover:text-foreground/80"
            >
              Política de Privacidade
            </a>
            , onde encontrará informações detalhadas sobre o tratamento de dados
            pessoais, os seus direitos como titular e como exercê-los.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            8. Alterações a esta política
          </h2>
          <p>
            Podemos actualizar esta Política de Cookies periodicamente. A data
            de &quot;última atualização&quot; no topo deste documento indica a
            versão vigente. Recomendamos que consulte esta página regularmente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">9. Contacto</h2>
          <p>
            Dúvidas sobre cookies ou privacidade podem ser enviadas para{" "}
            <strong>privacidade@hypecult.com.br</strong>.
          </p>
        </section>
      </article>
    </div>
  );
}
