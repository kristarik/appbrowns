import { ChartColumn, Megaphone } from 'lucide-react';

const BLOCOS = [
  {
    icone: ChartColumn,
    titulo: 'Comercial',
    descricao: 'Sai dos dados que o próprio funil gera. Depende só do banco.',
    itens: [
      'Conversão entre as nove etapas, para achar onde trava',
      'Atendimentos por interesse: aluguel, sob medida, ajuste',
      'Motivos de perda: preço, estoque, prazo, concorrência, sem retorno',
      'Sazonalidade por ocasião, com os picos de casamento e formatura',
      'Desempenho por atendente',
      'Faturamento por período',
    ],
  },
  {
    icone: Megaphone,
    titulo: 'Marketing',
    descricao: 'Precisa conectar Google Analytics e Google Ads antes de existir.',
    itens: [
      'Origem dos leads, cruzando com quanto cada origem faturou',
      'Custo por lead e custo por venda no Google Ads',
      'Acessos ao site, páginas mais vistas e origem do tráfego',
      'Campanhas que trazem lead mas não trazem venda',
    ],
  },
];

const PaginaRelatorios = () => (
  <div className="h-full overflow-y-auto p-5">
    <header className="pb-4">
      <h2 className="text-[15px] font-semibold tracking-tight text-texto">Relatórios</h2>
      <p className="text-[12px] text-texto-suave">
        Ainda não construídos. O que está previsto para cada frente:
      </p>
    </header>

    <div className="grid gap-4 lg:grid-cols-2">
      {BLOCOS.map((bloco) => {
        const Icone = bloco.icone;

        return (
          <section
            key={bloco.titulo}
            className="rounded-2xl border border-borda bg-superficie p-5"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-marca-fraca text-marca">
                <Icone size={18} />
              </span>
              <div>
                <h3 className="text-[14px] font-semibold tracking-tight text-texto">
                  {bloco.titulo}
                </h3>
                <p className="text-[12px] text-texto-suave">{bloco.descricao}</p>
              </div>
            </div>

            <ul className="mt-4 flex flex-col gap-2 border-t border-borda pt-4">
              {bloco.itens.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[13px] text-texto-suave"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-texto-fraco" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>

    <p className="mt-4 rounded-xl border border-borda bg-alerta-fraco px-4 py-3 text-[12px] text-alerta">
      O relatório de Marketing só fica útil se o campo Origem do lead for preenchido
      na entrada. Sem ele, dá para ver visitas no site, mas não dá para saber quais
      viraram venda.
    </p>
  </div>
);

export default PaginaRelatorios;
