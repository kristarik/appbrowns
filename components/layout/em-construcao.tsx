import { Construction } from 'lucide-react';

type Props = {
  titulo: string;
  descricao: string;
  previsto: string[];
};

export const EmConstrucao = ({ titulo, descricao, previsto }: Props) => (
  <div className="flex h-full items-center justify-center p-8">
    <div className="w-full max-w-md rounded-2xl border border-borda bg-superficie p-6 text-center">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-alerta-fraco text-alerta">
        <Construction size={20} />
      </span>

      <h2 className="mt-3 text-[15px] font-semibold tracking-tight text-texto">{titulo}</h2>
      <p className="mt-1 text-[13px] text-texto-suave">{descricao}</p>

      <ul className="mt-4 flex flex-col gap-1.5 border-t border-borda pt-4 text-left">
        {previsto.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[13px] text-texto-suave">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-texto-fraco" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  </div>
);
