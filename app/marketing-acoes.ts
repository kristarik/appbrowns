'use server';

import { revalidatePath } from 'next/cache';
import { sincronizarTudo } from '@/lib/marketing/sincronizar';
import { verRelatorios } from '@/lib/permissoes';
import { lerSessao } from '@/lib/sessao';

export type ResultadoAtualizacao = { erro?: string; ok?: string };

export const atualizarMarketing = async (): Promise<ResultadoAtualizacao> => {
  const sessao = await lerSessao();

  if (!sessao) return { erro: 'Sessão expirada' };
  if (!verRelatorios(sessao.papel)) return { erro: 'Sem permissão' };

  const resultados = await sincronizarTudo(30);

  revalidatePath('/relatorios');

  const falhas = resultados.filter((r) => !r.ok);

  if (falhas.length > 0) {
    return {
      erro: falhas.map((f) => `${f.fonte}: ${f.detalhe.slice(0, 120)}`).join(' · '),
    };
  }

  return { ok: resultados.map((r) => `${r.fonte}: ${r.detalhe}`).join(' · ') };
};
