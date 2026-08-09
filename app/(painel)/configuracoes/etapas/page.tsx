import { ListChecks, Lock } from 'lucide-react';
import { Cartao } from '@/components/configuracoes/cartao';
import { FUNIL } from '@/lib/funil';
import { NECESSIDADES } from '@/lib/tipos';

const PaginaEtapas = () => (
  <div className="mx-auto flex max-w-3xl flex-col gap-4">
    <p className="flex items-start gap-2 rounded-xl border border-borda bg-superficie px-4 py-3 text-[12px] text-texto-suave">
      <Lock size={14} className="mt-0.5 shrink-0 text-texto-fraco" />
      <span>
        As etapas ainda vivem no código, não no banco. Editar aqui exigiria migrar o funil
        inteiro para o banco, e um atendimento em andamento não pode perder a etapa no meio do
        caminho. Deixei para uma versão dedicada. Enquanto isso, me peça a mudança que eu
        publico em minutos.
      </span>
    </p>

    {FUNIL.map((etapa, indice) => (
      <Cartao
        key={etapa.id}
        titulo={`${indice + 1}. ${etapa.nome}`}
        descricao={
          etapa.necessidades.length > 0
            ? `Só aparece em: ${etapa.necessidades.map((n) => NECESSIDADES[n]).join(', ')}`
            : 'Vale para todos os interesses'
        }
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-1 h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: etapa.cor }}
          />

          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-1.5 pb-1.5 text-[11px] font-semibold tracking-wide text-texto-fraco uppercase">
                <ListChecks size={12} />
                Checklist
              </p>
              {etapa.campos.length === 0 ? (
                <p className="text-[12px] text-texto-fraco italic">Nenhum campo exigido</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {etapa.campos.map((campo) => (
                    <li key={campo.id} className="text-[12px] text-texto-suave">
                      {campo.rotulo}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="pb-1.5 text-[11px] font-semibold tracking-wide text-texto-fraco uppercase">
                Follow-ups
              </p>
              <ul className="flex flex-col gap-1">
                {etapa.followUps.map((passo) => (
                  <li key={passo} className="text-[12px] text-texto-suave">
                    {passo}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Cartao>
    ))}
  </div>
);

export default PaginaEtapas;
