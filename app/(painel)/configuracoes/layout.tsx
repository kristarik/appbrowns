import type { ReactNode } from 'react';

const LayoutConfiguracoes = ({ children }: { children: ReactNode }) => (
  <div className="h-full overflow-y-auto p-5">{children}</div>
);

export default LayoutConfiguracoes;
