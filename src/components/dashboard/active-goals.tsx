import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  deadline?: Date | string | null;
}

const priorityVariant: Record<Goal['priority'], 'default' | 'success' | 'warning' | 'destructive'> = {
  LOW: 'success',
  MEDIUM: 'default',
  HIGH: 'warning',
  URGENT: 'destructive',
};

const priorityLabel: Record<Goal['priority'], string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const categoryLabel: Record<string, string> = {
  FINANCIAL: 'Financeira',
  PERSONAL: 'Pessoal',
  STUDIES: 'Estudos',
  FITNESS: 'Fitness',
  CAREER: 'Carreira',
  OTHER: 'Outros',
};

export function ActiveGoals({ goals }: { goals: Goal[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Metas em destaque</CardTitle>
            <CardDescription>{goals.length} metas ativas</CardDescription>
          </div>
          <Link href="/metas" className="text-xs font-medium text-primary hover:underline">
            Ver todas
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Você ainda não tem metas ativas. Defina seu próximo objetivo.
          </p>
        ) : (
          goals.map((g) => (
            <div key={g.id} className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{g.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {categoryLabel[g.category] ?? g.category}
                    {g.deadline && ` · até ${formatDate(g.deadline)}`}
                  </p>
                </div>
                <Badge variant={priorityVariant[g.priority]}>{priorityLabel[g.priority]}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={g.progress} className="h-1.5 flex-1" />
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {g.progress}%
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
