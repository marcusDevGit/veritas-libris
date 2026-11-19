import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Award,
  Ban,
  BookOpen,
  CheckCircle2,
  Home,
  Lock,
  Scale,
  Shield,
  Sparkles,
} from 'lucide-react';

const DIMENSIONS = [
  {
    icon: <Shield className="w-5 h-5 text-primary" />,
    title: 'Fidelidade Doutrinária & Teológica',
    description:
      'Verifica a harmonia da obra com a Sagrada Escritura, a Tradição e o Magistério da Igreja Católica, sinalizando eventuais erros teológicos ou relativismo.',
  },
  {
    icon: <Sparkles className="w-5 h-5 text-secondary" />,
    title: 'Modéstia, Castidade & Pureza',
    description:
      'Avalia a presença de sensualismo, imoralidade ou linguagem vulgar e se a narrativa trata as paixões humanas com sobriedade moral.',
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-amber-700" />,
    title: 'Violência, Gravidade & Perturbação',
    description:
      'Analisa cenas de crueldade, horror ou desespero existencial para definir recomendações adequadas à maturidade de cada leitor.',
  },
  {
    icon: <BookOpen className="w-5 h-5 text-primary" />,
    title: 'Mérito Literário & Beleza Estética',
    description:
      'Considera o valor formativo, a profundidade humana e a qualidade literária da obra na busca pelo verdadeiro, pelo bom e pelo belo.',
  },
];

export const CriteriaPage: React.FC = () => {
  return (
    <div className="pt-[96px] sm:pt-[116px] pb-16 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <nav aria-label="Navegação Estrutural" className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors inline-flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Início
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-semibold">Critérios do Índice</span>
        </nav>

        <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-primary tracking-tight mt-1">
          Critérios do Índice &amp; Metodologia
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-3xl leading-relaxed">
          Como avaliamos obras literárias sob a ótica moral, doutrinária e estética para auxiliar famílias, educadores e leitores católicos.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-editorial text-xl sm:text-2xl font-bold text-primary">
          As 4 Dimensões de Discernimento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {DIMENSIONS.map((item) => (
            <div
              key={item.title}
              className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 shadow-2xs flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-outline/15 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-editorial text-base font-bold text-primary">{item.title}</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-editorial text-xl sm:text-2xl font-bold text-primary">
          Escala de Vereditos &amp; Faixas Etárias
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
              Recomendado
            </div>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              Obra edificante, segura em matéria de fé e costumes, indicada conforme a faixa etária sugerida.
            </p>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4" />
              Com Ressalvas
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              Possui valor literário ou histórico, mas contém passagens que exigem maturidade, contexto ou acompanhamento.
            </p>
          </div>

          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-error">
              <Ban className="w-4 h-4" />
              Não Recomendado
            </div>
            <p className="text-xs text-rose-900/80 leading-relaxed">
              Apresenta desvios doutrinários graves, ataques diretos à fé ou conteúdo moralmente nocivo.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Scale className="w-5 h-5 text-secondary" />
            <h3 className="font-editorial text-lg">Motor de Consenso &amp; Prudência</h3>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Avaliações de <strong>Curadores Oficiais</strong> possuem <strong>peso 3</strong> no cálculo do consenso, enquanto avaliações comunitárias possuem peso 1. Por princípio de prudência pastoral, se 40% ou mais dos votos ponderados indicarem <em>Não Recomendado</em>, a obra assume esse alerta automaticamente.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Lock className="w-5 h-5 text-secondary" />
            <h3 className="font-editorial text-lg">Trava Editorial &amp; Imprimatur</h3>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Obras analisadas pelo colegiado podem receber <strong>Trava Editorial (editorialLock)</strong>, fixando o parecer oficial sobre o voto comunitário. O selo{' '}
            <span className="inline-flex items-center gap-1 font-semibold text-secondary">
              <Award className="w-3.5 h-3.5" /> Imprimatur
            </span>{' '}
            indica exclusivamente edições que possuem chancela eclesiástica formal.
          </p>
        </div>
      </section>
    </div>
  );
};
