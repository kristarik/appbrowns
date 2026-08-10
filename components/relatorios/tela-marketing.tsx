import { CheckCircle2, CircleDashed } from 'lucide-react';
import { Bloco } from './pecas';

export type EstadoFonte = {
  id: string;
  nome: string;
  configurado: boolean;
  detalhe: string;
  falta: string;
};

export const TelaMarketing = ({ fontes }: { fontes: EstadoFonte[] }) => (
  <div className="flex flex-col gap-4">
    <header>
      <h2 className="text-[15px] font-semibold tracking-tight text-texto">
        Relatório de marketing
      </h2>
      <p className="text-[12px] text-texto-suave">
        Depende de dados que vêm de fora do painel.
      </p>
    </header>

    <Bloco
      titulo="Fontes de dados"
      descricao="As credenciais já estão no servidor. Falta a leitura automática, que é o próximo passo."
    >
      <ul className="flex flex-col gap-4">
        {fontes.map((fonte) => (
          <li key={fonte.id} className="flex items-start gap-3">
            {fonte.configurado ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-sucesso" />
            ) : (
              <CircleDashed size={16} className="mt-0.5 shrink-0 text-texto-fraco" />
            )}

            <div className="min-w-0">
              <p className="text-[13px] font-medium text-texto">{fonte.nome}</p>
              <p className="text-[12px] text-texto-suave">{fonte.detalhe}</p>
              <p className="mt-0.5 text-[12px] text-texto-fraco">{fonte.falta}</p>
            </div>
          </li>
        ))}
      </ul>
    </Bloco>

    <Bloco titulo="O que este relatório vai mostrar">
      <ul className="flex flex-col gap-2">
        {[
          'Origem dos leads cruzada com quanto cada origem faturou',
          'Custo por lead e custo por venda no Google Ads',
          'Acessos ao site, páginas mais vistas e origem do tráfego',
          'Palavras que trazem visita no Search Console',
          'Campanhas que trazem lead mas não trazem venda',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2 text-[13px] text-texto-suave">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-texto-fraco" />
            {item}
          </li>
        ))}
      </ul>
    </Bloco>

    <p className="rounded-xl border border-borda bg-alerta-fraco px-4 py-3 text-[12px] text-alerta">
      O cruzamento entre anúncio e faturamento só existe se o campo Origem do lead for
      preenchido no cadastro. Sem ele, dá para ver cliques e visitas, mas não dá para saber
      quais viraram venda.
    </p>
  </div>
);
