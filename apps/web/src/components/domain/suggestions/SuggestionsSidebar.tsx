import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookMarked, Church, Clock, GraduationCap, Scale, Users, Zap } from 'lucide-react';

const STEPS = [
  {
    num: '1',
    bgClass: 'bg-primary text-on-primary',
    title: 'Recebimento & Protocolo',
    desc: 'Registro no banco de triagem com geração de identificador para auditoria e acompanhamento.',
  },
  {
    num: '2',
    bgClass: 'bg-primary-container text-on-primary',
    title: 'Triagem pela Curadoria Oficial',
    desc: 'Pareceristas acadêmicos, teólogos e sacerdotes examinam a integridade do texto, aparato crítico e adequação etária.',
  },
  {
    num: '3',
    bgClass: 'bg-secondary text-on-secondary',
    title: 'Catalogação ou Parecer',
    desc: 'Aprovada a ficha, a obra ingressa no Índice com a devida nota prudencial (Recomendado, Com Ressalvas ou Desaconselhado).',
  },
];

export const SuggestionsSidebar: React.FC = () => {
  return (
    <aside className="flex flex-col gap-5">
      <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-secondary" />
          <h2 className="font-editorial text-lg font-bold text-primary">
            O que acontece após o envio?
          </h2>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          Nosso método de análise resguarda a fidelidade ao Magistério da Igreja e à tradição humanística clássica:
        </p>

        <div className="flex flex-col gap-4 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-highest">
          {STEPS.map((step) => (
            <div key={step.num} className="relative flex flex-col gap-0.5">
              <span
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${step.bgClass}`}
              >
                {step.num}
              </span>
              <h3 className="text-xs font-bold text-primary">{step.title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-secondary-container/25 border border-secondary/20 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-secondary" />
          <h3 className="font-editorial text-base font-bold text-primary">
            Dica para Cadastro Imediato
          </h3>
        </div>
        <p className="text-xs text-on-surface leading-relaxed">
          Se você possui a edição física em mãos e ela contém um <strong>ISBN-13 válido</strong>, use nossa ferramenta de importação automática no topo. Ela preenche ficha catalográfica, capa e sinopse em segundos.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors"
        >
          <span>Ir para o Catálogo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
          <h3 className="font-editorial text-base font-bold text-primary">
            Prioridades de Exame Pastoral
          </h3>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Nossa fila de leitura prioriza obras que impactam diretamente a formação cristã em comunidade:
        </p>
        <ul className="space-y-2.5 text-xs text-on-surface-variant">
          <li className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <span>
              <strong>Listas Escolares:</strong> Livros adotados em colégios católicos e pré-vestibulares confessionais.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Users className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <span>
              <strong>Clubes de Leitura Familiar:</strong> Clássicos universais e contos infanto-juvenis demandados por famílias educadoras.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Church className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <span>
              <strong>Formação Catequética:</strong> Guias devocionais, biografias de santos e ensaios apologéticos para catequistas.
            </span>
          </li>
        </ul>
        <div className="pt-2 border-t border-outline/10 flex items-center justify-between text-[11px]">
          <span className="uppercase tracking-wider text-outline font-semibold">
            Tempo médio de resposta
          </span>
          <span className="font-bold text-primary inline-flex items-center gap-1">
            <BookMarked className="w-3.5 h-3.5 text-secondary" />3 a 7 dias úteis
          </span>
        </div>
      </div>
    </aside>
  );
};
