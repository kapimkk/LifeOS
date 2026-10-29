import { PageHeader } from '@/components/layout/page-header';
import { GestaoSubnav } from './gestao-subnav';

export default function GestaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão"
        description="Projetos, clientes e servidores no mesmo lugar. Um projeto pode apontar para um cliente e para uma VPS."
      />
      <GestaoSubnav />
      {children}
    </div>
  );
}
