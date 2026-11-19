import React from 'react';
import { Link } from 'react-router-dom';
import { Award, BookMarked, Compass, Feather, History, Home, Send, Users } from 'lucide-react';

const MOTTO_PILLARS = [
  { title: 'Fidelitas', desc: 'Aderência fiel ao Magistério e à doutrina católica.' },
  { title: 'Prudentia', desc: 'Discernimento equilibrado conforme idade e maturidade.' },
  { title: 'Sapientia', desc: 'Abertura à verdadeira beleza literária e formativa.' },
];

const CHURCH_DOCS = [
  {
    title: 'Catecismo da Igreja Católica',
    ref: '§§ 2493–2499',
    desc: 'Orientações sobre a comunicação social, verdade e responsabilidade moral na cultura.',
  },
  {
    title: "Decreto 'Inter Mirifica'",
    ref: 'Concílio Vaticano II',
    desc: 'Princípios sobre o uso reto dos meios de comunicação e o discernimento das obras.',
  },
  {
    title: 'Código de Direito Canônico',
    ref: 'Cânones 822–832',
    desc: 'Disciplina eclesiástica sobre publicações, Nihil Obstat e concessão do Imprimatur.',
  },
];

export const AboutCurationPage: React.FC = () => {
  return (
    <div className="pt-[96px] sm:pt-[116px] pb-16 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <nav aria-label="Navegação Estrutural" className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors inline-flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Início
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-semibold">Sobre a Curadoria</span>
        </nav>

        <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-primary tracking-tight mt-1">
          Sobre a Curadoria Veritas Libris
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-3xl leading-relaxed">
          Discernimento que ilumina, sem medo e sem obscurantismo: um serviço pastoral e literário independente a serviço das famílias, educadores e leitores.
        </p>
      </header>

      <section className="bg-surface-container-lowest border border-outline/15 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">
              Nossa Missão
            </span>
            <h2 className="font-editorial text-2xl font-bold text-primary">
              Discernimento claro em meio ao excesso de publicações
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Nem sempre a sinopse comercial revela pressupostos filosóficos, desvios doutrinários ou adequação etária. O Veritas Libris organiza pareceres objetivos com ressalvas contextualizadas.
            </p>
          </div>

          <blockquote className="p-5 rounded-xl bg-surface-container-low border-l-4 border-secondary text-sm font-editorial italic text-primary leading-relaxed">
            “Examinai tudo, ficai com o que é bom; afastai-vos de toda espécie de mal.”
            <footer className="mt-2 text-xs not-italic font-sans font-semibold text-secondary">
              1 Tessalonicenses 5, 21-22
            </footer>
          </blockquote>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-outline/10">
          {MOTTO_PILLARS.map((item) => (
            <div key={item.title} className="p-4 rounded-xl bg-surface-container-low">
              <h3 className="font-editorial text-base font-bold text-primary">{item.title}</h3>
              <p className="text-xs text-on-surface-variant mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-editorial text-xl sm:text-2xl font-bold text-primary">
          Como Opera o Nosso Corpo Editorial
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
              <Feather className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-base font-bold text-primary">Curadores Nomeados</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Pareceristas designados pela administração com peso 3, síntese oficial e trava editorial soberana.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-base font-bold text-primary">Comunidade &amp; Educadores</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Leitores autenticados contribuem apontando ressalvas específicas, faixa etária e alternativas edificantes.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high text-tertiary flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-base font-bold text-primary">Transparência &amp; Critérios</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Distinção explícita entre o consenso comunitário, a trava editorial e o selo Imprimatur.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-editorial text-xl sm:text-2xl font-bold text-primary">
          Fundamentos Eclesiais do nosso Serviço
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CHURCH_DOCS.map((doc) => (
            <div
              key={doc.title}
              className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 space-y-2"
            >
              <div className="flex items-center gap-2 text-secondary text-xs font-bold uppercase">
                <BookMarked className="w-4 h-4" />
                <span>{doc.ref}</span>
              </div>
              <h3 className="font-editorial text-base font-bold text-primary">{doc.title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">{doc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-low border border-outline/15 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Award className="w-4 h-4 text-secondary" />
            <span>Una-se ao nosso apostolado de discernimento literário</span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Explore o acervo avaliado ou envie uma sugestão de obra para nossa equipe curatorial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-surface-container-lowest border border-outline/20 text-primary text-xs sm:text-sm font-semibold hover:bg-surface-container transition-colors"
          >
            <Compass className="w-4 h-4 text-secondary" />
            Explorar Catálogo
          </Link>
          <Link
            to="/sugestoes"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-on-primary text-xs sm:text-sm font-semibold hover:bg-primary-container transition-colors"
          >
            <Send className="w-4 h-4" />
            Enviar Sugestão
          </Link>
        </div>
      </section>
    </div>
  );
};
