import React from 'react';
import { BookOpen, Brain, Church, Eye, Feather, Sparkles, Users } from 'lucide-react';

const TRIAD = [
  {
    icon: <Church className="w-5 h-5 text-primary" />,
    tag: 'Pilar I',
    title: 'Fidelitas',
    subtitle: 'Fidelidade ao Magistério & Sã Doutrina',
    desc: 'Alinhamento irrestrito ao Depósito da Fé (Depositum Fidei), à Sagrada Escritura e à Tradição apostólica. Nenhuma obra é elogiada se atacar dissimuladamente os dogmas ou a revelação cristã como verdade objetiva.',
  },
  {
    icon: <Eye className="w-5 h-5 text-secondary" />,
    tag: 'Pilar II',
    title: 'Prudentia',
    subtitle: 'Discernimento Formativo e Equilíbrio',
    desc: 'Distingue a crueza descritiva necessária à narrativa moral da glorificação licenciosa da impureza. Rejeita o escândalo desnecessário sem negar o peso trágico da condição humana decaída.',
  },
  {
    icon: <Sparkles className="w-5 h-5 text-primary" />,
    tag: 'Pilar III',
    title: 'Sapientia',
    subtitle: 'Estética Elevada e Excelência Formal',
    desc: 'Reconhecimento da boa literatura como veículo de redenção cultural. A mediocridade sentimental não basta como virtude moral: a arte autêntica requer perícia técnica, riqueza de linguagem e coerência estética.',
  },
];

export const AboutMissionTriad: React.FC = () => {
  return (
    <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-secondary">
            <Feather className="w-4 h-4" />
            <span className="text-[11px] font-bold tracking-widest uppercase">
              Propósito Literário
            </span>
          </div>

          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Discernimento que ilumina, sem medo e sem obscurantismo
          </h2>

          <div className="text-sm sm:text-base text-on-surface-variant space-y-4 leading-relaxed text-justify">
            <p>
              <span className="float-left text-5xl leading-[0.85] font-editorial font-bold text-primary pr-3 pt-1">
                O
              </span>
              Veritas Libris nasceu da urgência sentida por pais de família, colégios de orientação cristã e confessores diante da torrente editorial contemporânea. Em um século saturado de produções livreiras marcadas ora pelo cinismo moral, ora pela confusão metafísica, torna-se imprescindível contar com uma bússola segura e lúcida para o julgamento das letras.
            </p>
            <p>
              Nosso método afasta deliberadamente tanto o pietismo simplista — que confunde a legítima representação artística do drama do pecado com apologia à culpa — quanto a ingenuidade liberal, que julga o leitor imune às investidas da imaginação corrompida. Ler com espírito católico exige distinguir com rigor: o heroísmo da graça, as feridas da carne e a corrosão intencional da fé.
            </p>
            <p>
              Não praticamos a interdição cega nem pretendemos reeditar punições canônicas do passado: oferecemos um serviço pedagógico, consultivo e teológico. Avaliamos a substância doutrinária, a maturidade moral indispensável e a excelência literária da obra, entregando à consciência formada do leitor as ferramentas para haurir o trigo e afastar o joio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <span className="inline-flex items-center gap-2 bg-surface-container rounded-lg px-3 py-2 text-xs font-semibold text-primary">
              <BookOpen className="w-4 h-4 text-secondary" />
              Formação da Consciência
            </span>
            <span className="inline-flex items-center gap-2 bg-surface-container rounded-lg px-3 py-2 text-xs font-semibold text-primary">
              <Users className="w-4 h-4 text-secondary" />
              Segurança para as Famílias
            </span>
            <span className="inline-flex items-center gap-2 bg-surface-container rounded-lg px-3 py-2 text-xs font-semibold text-primary">
              <Brain className="w-4 h-4 text-secondary" />
              Maturidade Intelectual
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-surface-container-low rounded-xl p-4 border border-outline/15">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-widest block mb-1">
              Tríade Deontológica
            </span>
            <p className="font-editorial text-base font-bold text-primary">
              Três virtudes diretoras de todo juízo crítico
            </p>
          </div>

          {TRIAD.map((pilar) => (
            <article
              key={pilar.title}
              className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center">
                  {pilar.icon}
                </div>
                <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                  {pilar.tag}
                </span>
              </div>
              <h3 className="font-editorial text-lg font-bold text-primary">{pilar.title}</h3>
              <p className="text-[11px] font-bold text-secondary uppercase tracking-wide mt-0.5 mb-2">
                {pilar.subtitle}
              </p>
              <p className="text-xs text-on-surface-variant leading-relaxed">{pilar.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
