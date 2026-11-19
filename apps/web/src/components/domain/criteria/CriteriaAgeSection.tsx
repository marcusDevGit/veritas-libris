import React from 'react';

const PILLS = ['LIVRE', '10+', '12+', '14+', '16+', '18+'];

const AGE_GROUPS = [
  {
    badge: 'Livre & 10+',
    title: 'Infância & Formação',
    desc: 'Narrativas límpidas, contos nobres, hagiografias infantis e fábulas clássicas que cultivam a imaginação moral sem angústia desproporcional.',
  },
  {
    badge: '12+ & 14+',
    title: 'Primeira Juventude',
    desc: 'Exige discernimento abstrato. Enfrenta o combate espiritual, heroísmo cavalheiresco e noções iniciais de perigo moral em contexto formativo.',
  },
  {
    badge: '16+ & 18+',
    title: 'Maturidade & Apologética',
    desc: 'Suporta tragédia moral complexa, alta literatura psicológica (Dostoiévski, Undset) ou estudos de refutação filosófica para leitores maduros.',
  },
];

export const CriteriaAgeSection: React.FC = () => {
  return (
    <section className="bg-surface-container-lowest border border-outline/15 rounded-xl p-6 sm:p-8 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-outline/15">
        <div>
          <span className="text-[11px] font-bold text-secondary uppercase tracking-widest">
            Maturação &amp; Tutela
          </span>
          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-primary mt-1">
            Taxonomia de Faixa Etária Recomendada
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PILLS.map((pill) => (
            <span
              key={pill}
              className="bg-[#1e293b] text-white px-2.5 py-1 rounded text-xs font-bold tracking-wide"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {AGE_GROUPS.map((group) => (
          <div key={group.badge} className="p-4 rounded-lg bg-surface-container-low flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#1e293b] text-white px-2 py-0.5 rounded text-xs font-bold">
                {group.badge}
              </span>
              <span className="text-xs sm:text-sm font-bold text-primary">{group.title}</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">{group.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
