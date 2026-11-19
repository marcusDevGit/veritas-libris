import React from 'react';

const AGE_ITEMS = [
  { badge: 'Livre', title: 'Todas as Idades', desc: 'Leitura infantil e familiar sem restrições.' },
  { badge: '10+', title: 'Infantojuvenil', desc: 'Aventuras leves e fábulas formativas.' },
  { badge: '12+', title: 'Pré-Adolescentes', desc: 'Temas históricos ou conflitos moderados.' },
  { badge: '14+', title: 'Juventude', desc: 'Dilemas morais e formação do caráter.' },
  { badge: '16+', title: 'Ensino Médio / Adulto', desc: 'Obras complexas que exigem maturidade.' },
  { badge: '18+', title: 'Público Adulto', desc: 'Temática densa; discernimento pastoral.' },
];

export const CriteriaAgeSection: React.FC = () => {
  return (
    <section className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 sm:p-6 space-y-4">
      <div>
        <h2 className="font-editorial text-lg sm:text-xl font-bold text-primary">
          Taxonomia de Faixa Etária Recomendada
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          A pílula etária orienta pais e educadores independentemente do mérito literário da obra.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {AGE_ITEMS.map((item) => (
          <div
            key={item.badge}
            className="p-3 rounded-lg bg-surface-container-low border border-outline/15 flex flex-col gap-1.5"
          >
            <span className="inline-flex w-fit px-2 py-0.5 rounded bg-tertiary text-on-tertiary text-[11px] font-bold">
              {item.badge}
            </span>
            <span className="text-xs font-bold text-primary">{item.title}</span>
            <p className="text-[11px] text-on-surface-variant leading-snug">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
