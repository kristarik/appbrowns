import type { ReactNode } from 'react';
import { Casca } from '@/components/layout/casca';

const LayoutPainel = ({ children }: { children: ReactNode }) => (
  <Casca>{children}</Casca>
);

export default LayoutPainel;
