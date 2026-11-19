import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Compass, Feather, History, Home, Send, Users } from 'lucide-react';

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
          Um serviço pastoral e literário independente criado para ajudar famílias, catequistas, professores e leitores a escolherem boas leituras com critério e segurança.
        </p>
      </header>

      <section className="bg-surface-container-lowest border border-outline/15 rounded-2xl p-6 sm:p-8 shadow-2xs grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">
            Nossa Missão
          </span>
          <h2 className="font-editorial text-2xl font-bold text-primary">
            Discernimento claro em meio ao excesso de publicações
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Nem sempre a sinopse comercial de um livro revela seus pressupostos filosóficos, desvios doutrinários ou adequação para jovens e famílias. O Veritas Libris organiza pareceres objetivos, indicando ressalvas concretas com referência de capítulo ou temática.
          </p>
        </div>

        <blockquote className="p-5 rounded-xl bg-surface-container-low border-l-4 border-secondary text-sm font-editorial italic text-primary leading-relaxed">
          “Examinai tudo, ficai com o que é bom; afastai-vos de toda espécie de mal.”
          <footer className="mt-2 text-xs not-italic font-sans font-semibold text-secondary">
            1 Tessalonicenses 5, 21-22
          </footer>
        </blockquote>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
            <Feather className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-base font-bold text-primary">Curadores Nomeados</h3>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Pareceristas designados pela administração com peso 3 nas avaliações, síntese editorial e trava soberana quando necessário.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-base font-bold text-primary">Comunidade Ativa</h3>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Leitores autenticados contribuem apontando ressalvas específicas, faixa etária sugerida e obras alternativas edificantes.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high text-tertiary flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-base font-bold text-primary">Transparência &amp; Auditoria</h3>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Distinção explícita entre o consenso calculado da comunidade, a trava editorial oficial e a chancela eclesiástica.
          </p>
        </div>
      </section>

      <section className="bg-surface-container-low border border-outline/15 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Award className="w-4 h-4 text-secondary" />
            <span>Quer indicar uma obra para o nosso acervo?</span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Envie sugestões de livros para análise da curadoria ou ideias de melhoria para a plataforma.
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
