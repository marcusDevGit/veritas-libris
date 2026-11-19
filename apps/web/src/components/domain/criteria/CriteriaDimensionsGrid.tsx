import React from 'react';
import { BookOpen, Church, Scale, Shield } from 'lucide-react';

const DIMENSIONS = [
  {
    icon: <Church className="w-5 h-5" />,
    iconBoxClass: 'bg-primary-container text-on-primary',
    badge: 'Escala: 0 a 10',
    axis: 'Eixo I • Veritas Fidei',
    title: '1. Fidelidade Doutrinária & Teológica',
    description:
      'Avaliação sistemática da conformidade com o Catecismo da Igreja Católica (CIC). Identificação de heresias formais (gnosticismo moderno, pelagianismo, materialismo reducionista ou imanentismo), apologia ao relativismo e sincretismo esotérico.',
    highlightLabel: 'Distinção Crucial de Análise:',
    highlightText:
      'Distingue-se categoricamente a representação do pecado humano dramático (onde o erro gera consequências morais e a graça redime) da propaganda ideológica deliberada que promove a rebelião formal contra os dogmas revelados.',
    scales: [
      { dot: 'bg-error', label: '0–3.9: Dano Dogmático' },
      { dot: 'bg-secondary', label: '4.0–7.9: Confuso / Neutro' },
      { dot: 'bg-primary-container', label: '8.0–10: Ortodoxia Límpida' },
    ],
  },
  {
    icon: <Shield className="w-5 h-5" />,
    iconBoxClass: 'bg-secondary text-on-secondary',
    badge: 'Salvaguarda Moral',
    axis: 'Eixo II • Pudor & Castitas',
    title: '2. Modéstia, Castidade & Pureza',
    description:
      'Mapeamento de descrições voluptuosas, gratuidade erótica, pornografia verbal e banalização do Sacramento Matrimonial. A análise foca no estímulo induzido ao leitor e na pureza da imaginação visual suscitada pelo texto.',
    highlightLabel: 'Exemplo Formativo Canônico:',
    highlightText:
      'A miséria e tragédia de Sônia Marmeladova em Crime e Castigo é narrada com penitência e compaixão bíblica, sem estímulo lascivo, diferindo intrinsecamente da literatura erótica contemporânea de gratuidade hedonista.',
    scales: [
      { dot: 'bg-error', label: 'Crítico: Lascívia Explícita' },
      { dot: 'bg-secondary', label: 'Atenção: Sugestivo' },
      { dot: 'bg-primary-container', label: 'Íntegro: Sóbrio e Puro' },
    ],
  },
  {
    icon: <Scale className="w-5 h-5" />,
    iconBoxClass: 'bg-tertiary text-on-tertiary',
    badge: 'Critério Psico-espiritual',
    axis: 'Eixo III • Gravitas & Vulneratio',
    title: '3. Violência, Gravidade & Perturbação',
    description:
      'Verificação do limiar psicológico: crueldade gráfica, terror psicológico opressivo, suicídio, automutilação, profanação e ocultismo explícito. A intenção não é censura pueril, mas a tutela da sensibilidade e da paz de espírito do leitor.',
    highlightLabel: 'Diretriz Pastoral Específica:',
    highlightText:
      'O mal nunca deve ser apresentado como invencível ou triunfante de forma absoluta. A violência canônica bíblica (como nos Livros dos Macabeus) possui telos salvífico; o niilismo moderno, por sua vez, induz ao desespero mórbido.',
    scales: [
      { dot: 'bg-error', label: 'Pesado / Opressivo' },
      { dot: 'bg-secondary', label: 'Moderado / Trágico' },
      { dot: 'bg-primary-container', label: 'Leve / Serena' },
    ],
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    iconBoxClass: 'bg-secondary-container text-on-secondary-container',
    badge: 'Pulchrum Est Splendor',
    axis: 'Eixo IV • Pulchritudo & Artes',
    title: '4. Mérito Literário & Beleza Estética',
    description:
      'Auditoria de alta literatura: profundidade psicológica, rigor de composição poética, nobreza de linguagem, verossimilhança dramática e universalidade humana. A mediocridade sentimentalista também é avaliada criticamente.',
    highlightLabel: 'O Axioma de São Tomás de Aquino:',
    highlightText:
      'Pulchrum est splendor veritatis. A verdade exige vestes condignas de nobreza artística. Livros piedosos porém vazios de arte recebem ressalvas estéticas para evitar a deformação do bom gosto e a pieguice estéril.',
    scales: [
      { dot: 'bg-error', label: 'Trivial / Panfletário' },
      { dot: 'bg-secondary', label: 'Adequado / Popular' },
      { dot: 'bg-primary-container', label: 'Obra-prima / Clássico' },
    ],
  },
];

export const CriteriaDimensionsGrid: React.FC = () => {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-secondary uppercase tracking-widest">
            Fundamentos Analíticos
          </span>
          <h2 className="font-editorial text-xl sm:text-3xl font-bold text-primary mt-1">
            As Quatro Dimensões Cardeais de Discernimento
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-md">
          Cada obra submetida ao índice é escrutinada de modo independente através de quatro eixos rigorosos que congregam doutrina, sensibilidade moral, psicologia e cânone artístico.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DIMENSIONS.map((item) => (
          <article
            key={item.title}
            className="bg-surface-container-lowest border border-outline/15 rounded-xl p-6 shadow-2xs hover:shadow-sm transition-shadow flex flex-col justify-between gap-5"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center shadow-2xs ${item.iconBoxClass}`}
                >
                  {item.icon}
                </div>
                <span className="px-2.5 py-1 rounded bg-surface-container text-primary text-[11px] font-semibold">
                  {item.badge}
                </span>
              </div>

              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                {item.axis}
              </span>
              <h3 className="font-editorial text-lg font-bold text-primary mt-1 mb-2.5">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                {item.description}
              </p>

              <div className="bg-surface-container-low rounded-lg p-3.5 border border-outline/10">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider block mb-1">
                  {item.highlightLabel}
                </span>
                <p className="text-xs text-on-surface leading-relaxed">{item.highlightText}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-outline/15 flex flex-wrap items-center justify-between gap-2 text-[11px] text-on-surface-variant">
              {item.scales.map((scale) => (
                <span key={scale.label} className="inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${scale.dot}`} />
                  {scale.label}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
