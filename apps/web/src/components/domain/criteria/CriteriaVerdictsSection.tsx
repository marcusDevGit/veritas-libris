import React from 'react';
import { AlertTriangle, Ban, CheckCircle2, Info, ShieldAlert } from 'lucide-react';

const VERDICTS = [
  {
    topBar: 'bg-primary-container',
    badgeClass: 'bg-[#ecfdf5] text-[#047857]',
    icon: <CheckCircle2 className="w-4 h-4" />,
    badgeLabel: 'Recomendado',
    title: 'Leitura Edificante & Doutrina Íntegra',
    description:
      'Obras que iluminam o intelecto, fortalecem as virtudes cristãs e não representam risco à pureza ou à integridade da fé católica.',
    bullets: [
      { icon: <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />, text: 'Fidelidade Doutrinária ≥ 8.0' },
      { icon: <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />, text: 'Ausência de gratuidade sensual ou herética' },
      { icon: <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />, text: 'Mérito literário condizente' },
    ],
    footer: 'Indicado para bibliotecas paroquiais, colégios e leitura desacompanhada.',
  },
  {
    topBar: 'bg-secondary',
    badgeClass: 'bg-[#fffbeb] text-[#b45309]',
    icon: <AlertTriangle className="w-4 h-4" />,
    badgeLabel: 'Com Ressalvas',
    title: 'Matéria Grave ou Valor Clássico Complexo',
    description:
      'Livros clássicos densos, crônicas históricas ou romances que retratam o drama do pecado ou desvios filosóficos. Exigem maturidade.',
    bullets: [
      { icon: <Info className="w-4 h-4 text-secondary shrink-0" />, text: 'Exige leitura do Parecer Específico' },
      { icon: <Info className="w-4 h-4 text-secondary shrink-0" />, text: 'Notas capitulares recomendadas' },
      { icon: <Info className="w-4 h-4 text-secondary shrink-0" />, text: 'Requer faixa etária estrita (14+ ou 16+)' },
    ],
    footer: 'Requer discernimento orientado por pais, educadores ou diretores espirituais.',
  },
  {
    topBar: 'bg-error',
    badgeClass: 'bg-[#fff1f2] text-[#be123c]',
    icon: <Ban className="w-4 h-4" />,
    badgeLabel: 'Desaconselhado',
    title: 'Nocivo à Fé, Costumes ou Salvação',
    description:
      'Obras de apologia ativa a heresias, difusão de relativismo destrutivo, pornografia ostensiva ou anticlericalismo militante.',
    bullets: [
      { icon: <ShieldAlert className="w-4 h-4 text-error shrink-0" />, text: 'Subversão formal dos princípios cristãos' },
      { icon: <ShieldAlert className="w-4 h-4 text-error shrink-0" />, text: 'Grave perigo de escândalo espiritual' },
      { icon: <ShieldAlert className="w-4 h-4 text-error shrink-0" />, text: 'Apenas para estudo apologético estrito' },
    ],
    footer: 'Não recomendado para formação pessoal, espiritualidade ou recreação familiar.',
  },
];

export const CriteriaVerdictsSection: React.FC = () => {
  return (
    <section className="flex flex-col gap-6">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[11px] font-bold text-secondary tracking-widest uppercase">
          Classificação Tripartida
        </span>
        <h2 className="font-editorial text-xl sm:text-3xl font-bold text-primary mt-1.5 mb-2">
          A Escala Oficial de Vereditos Editoriais
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Cada título resenhado é classificado sob uma de três chancelas categóricas, transparentes e justificadas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {VERDICTS.map((verdict) => (
          <div
            key={verdict.badgeLabel}
            className="bg-surface-container-lowest border border-outline/15 rounded-xl p-6 sm:p-7 shadow-2xs relative overflow-hidden flex flex-col justify-between gap-5"
          >
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${verdict.topBar}`} />
            <div>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-5 ${verdict.badgeClass}`}
              >
                {verdict.icon}
                <span>{verdict.badgeLabel}</span>
              </div>
              <h3 className="font-editorial text-lg font-bold text-primary mb-2.5 leading-snug">
                {verdict.title}
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-5">
                {verdict.description}
              </p>

              <ul className="space-y-2">
                {verdict.bullets.map((b) => (
                  <li key={b.text} className="flex items-center gap-2 text-xs font-medium text-on-surface">
                    {b.icon}
                    <span>{b.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-outline/15">
              <p className="text-xs text-on-surface-variant leading-relaxed">{verdict.footer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
