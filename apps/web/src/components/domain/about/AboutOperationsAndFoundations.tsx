import React from 'react';
import { Award, BookmarkCheck, GraduationCap, History, Lock, Shield, ShieldCheck, Users } from 'lucide-react';

const CHURCH_DOCS = [
  {
    ref: '§§ 2493–2499',
    title: 'Catecismo da Igreja Católica',
    desc: 'Orientações sobre os meios de comunicação social e a responsabilidade moral de formar consciências retas.',
  },
  {
    ref: 'Conc. Vaticano II',
    title: "Decreto 'Inter Mirifica'",
    desc: 'Exorta pais e educadores a guiarem os jovens na escolha prudente de leituras que promovam a virtude.',
  },
  {
    ref: 'Cânn. 822 a 832',
    title: 'Código de Direito Canônico',
    desc: 'Disciplina sobre publicações que tocam na fé e nos costumes e colaboração de peritos na tutela doutrinária.',
  },
];

export const AboutOperationsAndFoundations: React.FC = () => {
  return (
    <>
      <section className="w-full bg-surface-container py-12 border-y border-outline/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[11px] font-bold text-secondary uppercase tracking-widest block mb-1">
                Hierarquia de Validação
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-primary">
                Como Opera o Nosso Corpo Editorial
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-md">
              Conjugando pareceres de curadores nomeados com contribuições estruturadas da comunidade leitora.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-6 shadow-2xs flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded bg-secondary-container/70 text-on-secondary-container text-[11px] font-bold">
                    Peso 3.0 • Curador
                  </span>
                </div>
                <h3 className="font-editorial text-lg font-bold text-primary mb-2">
                  Curadores Nomeados
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                  Pareceristas designados pela administração com autoridade editorial e prerrogativa de aplicar trava oficial.
                </p>
                <div className="bg-surface-container-low rounded-lg p-3 border border-outline/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Lock className="w-3.5 h-3.5 text-secondary" />
                    <span>Trava Editorial (editorialLock)</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Previne distorções externas mantendo o veredito homologado seguro no acervo.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-outline/10 flex items-center gap-2 text-[11px] font-bold text-outline uppercase">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Homologação Formal</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-6 shadow-2xs flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-surface-container-high text-primary flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded bg-surface-container text-on-surface-variant text-[11px] font-bold">
                    Mapeamento Colaborativo
                  </span>
                </div>
                <h3 className="font-editorial text-lg font-bold text-primary mb-2">
                  Comunidade &amp; Educadores
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                  Pais, catequistas e leitores experientes que sinalizam passagens sensíveis por capítulo ou temática.
                </p>
                <ul className="space-y-2 text-xs text-on-surface-variant">
                  <li className="flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-secondary shrink-0" />
                    <span>Sinalização de páginas com ressalvas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-secondary shrink-0" />
                    <span>Indicação de obras alternativas edificantes</span>
                  </li>
                </ul>
              </div>
              <div className="pt-3 border-t border-outline/10 flex items-center gap-2 text-[11px] font-bold text-outline uppercase">
                <Users className="w-4 h-4 text-secondary" />
                <span>Voz Comunitária Ativa</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-6 shadow-2xs flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center">
                    <History className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded bg-surface-container text-on-surface-variant text-[11px] font-bold">
                    Trilha de Auditoria
                  </span>
                </div>
                <h3 className="font-editorial text-lg font-bold text-primary mb-2">
                  Transparência &amp; Critérios
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                  O índice distingue claramente entre consenso calculado dos leitores e parecer fixado pela curadoria.
                </p>
                <div className="bg-surface-container rounded-lg p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Consenso Comunitário:</span>
                    <span className="font-bold text-primary">Calculado</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Parecer Curatorial:</span>
                    <span className="font-bold text-secondary">Auditado</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-outline/10 flex items-center gap-2 text-[11px] font-bold text-outline uppercase">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Vereditos Fundamentados</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
        <div>
          <span className="text-[11px] font-bold text-secondary uppercase tracking-widest block mb-1">
            Raízes no Magistério
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-primary">
            Fundamentos Eclesiais do nosso Serviço
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CHURCH_DOCS.map((doc) => (
            <div key={doc.title} className="bg-surface-container-low border border-outline/15 rounded-xl p-5">
              <span className="text-xs font-bold text-secondary">{doc.ref}</span>
              <h3 className="font-editorial text-base font-bold text-primary mt-1 mb-2">{doc.title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">{doc.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-surface-container-highest border border-outline/15 p-6 flex flex-col md:flex-row gap-4 items-start">
          <div className="w-11 h-11 rounded-lg bg-surface-container-lowest text-secondary flex items-center justify-center shrink-0 shadow-2xs">
            <Shield className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-editorial text-base font-bold text-primary">
              Declaração Canônica e Institucional sobre o <em>Imprimatur</em>
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              O <strong>Veritas Libris</strong> é uma iniciativa independente de caráter{' '}
              <strong>consultivo, formativo e prudencial</strong>. Em nenhuma hipótese nossos vereditos substituem a censura oficial eclesiástica (<em>Nihil Obstat</em>) ou a licença de impressão (<em>Imprimatur</em>), reservadas ao Bispo Diocesano (Cân. 823).
            </p>
          </div>
        </div>
      </section>
    </>
  );
};
