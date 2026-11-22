import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Bell,
  BookmarkCheck,
  BookOpen,
  Feather,
  MessageSquarePlus,
  Scale,
  ScanBarcode,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import type { GuideTabId } from './guideData.js';

interface GuideSectionContentProps {
  activeTab: GuideTabId;
}

export const GuideSectionContent: React.FC<GuideSectionContentProps> = ({ activeTab }) => {
  if (activeTab === 'criterios') {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="p-5 rounded-xl bg-surface-container-low border border-outline/15">
            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
              <Scale className="w-4 h-4 text-secondary" />
              <h3>As 4 Dimensões &amp; Vereditos</h3>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Cada obra é analisada em <strong>Fidelidade Doutrinária</strong>,{' '}
              <strong>Modéstia &amp; Pureza</strong>, <strong>Violência / Gravidade</strong> e{' '}
              <strong>Consenso Positivo</strong>, recebendo um veredito (<em>Recomendado</em>,{' '}
              <em>Com Ressalvas</em>, <em>Não Recomendado</em> ou <em>Sem Avaliação</em>) e faixa
              etária indicativa (<em>Livre</em>, 10+, 12+, 14+, 16+, 18+).
            </p>
          </article>

          <article className="p-5 rounded-xl bg-surface-container-low border border-outline/15">
            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <h3>Motor de Consenso &amp; Prudência</h3>
            </div>
            <ul className="text-xs sm:text-sm text-on-surface-variant space-y-1.5 leading-relaxed list-disc pl-4">
              <li>Pareceres de <strong>Curadores Oficiais</strong> têm peso <strong>3x</strong> contra <strong>1x</strong> de leitores.</li>
              <li><strong>Princípio de Prudência:</strong> se <strong>&gt;= 40%</strong> do peso total votar em <em>Não Recomendado</em>, a obra assume esse veredito.</li>
              <li>Ressalvas no mesmo tópico preservam a <strong>gravidade máxima</strong> apontada.</li>
            </ul>
          </article>
        </div>

        <div className="p-4 rounded-xl bg-secondary-container/30 border border-secondary/20 text-xs sm:text-sm text-on-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p>
            <strong>Nota Canônica:</strong> nossas classificações têm caráter consultivo e pedagógico leigo; não substituem o <em>Nihil Obstat</em> / <em>Imprimatur</em> diocesano.
          </p>
          <Link
            to="/criterios"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary shrink-0"
          >
            <span>Ver Matriz Completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (activeTab === 'papeis') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <article className="p-5 rounded-xl bg-surface-container-low border border-outline/15 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Users className="w-4 h-4 text-secondary" />
            <h3>Leitores &amp; Visitantes (READER)</h3>
          </div>
          <ul className="text-xs sm:text-sm text-on-surface-variant space-y-1.5 leading-relaxed list-disc pl-4">
            <li>Pesquise no catálogo, aplique filtros e use o <strong>Modo Família</strong>.</li>
            <li>Ao avaliar, aja com objetividade, honestidade sobre trechos lidos e <strong>caridade cristã</strong>.</li>
            <li>Justifique ressalvas com clareza (capítulo/trecho é opcional, mas muito útil).</li>
            <li>Gerencie suas obras em <strong>Minha Lista</strong> e edite/exclua pareceres em <strong>Meus Pareceres</strong>.</li>
          </ul>
        </article>

        <article className="p-5 rounded-xl bg-surface-container-low border border-outline/15 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Feather className="w-4 h-4 text-secondary" />
            <h3>Curadores Oficiais (CURATOR)</h3>
          </div>
          <ul className="text-xs sm:text-sm text-on-surface-variant space-y-1.5 leading-relaxed list-disc pl-4">
            <li>Atue com rigor pastoral, teológico e literário na fila <code>/curadoria</code>.</li>
            <li>Decida entre manter o consenso aberto ou aplicar a <strong>Trava Editorial</strong> com os 4 pontos oficiais.</li>
            <li>Verifique edições com <em>Imprimatur</em> e sugira alternativas edificantes.</li>
            <li>Modere abusos com ética (toda remoção gera registro no <code>AuditLog</code>).</li>
          </ul>
        </article>

        <article className="p-5 rounded-xl bg-surface-container-low border border-outline/15 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Award className="w-4 h-4 text-secondary" />
            <h3>Administradores (ADMIN)</h3>
          </div>
          <ul className="text-xs sm:text-sm text-on-surface-variant space-y-1.5 leading-relaxed list-disc pl-4">
            <li>Convide e promova novos curadores em <code>/admin</code> com critério doutrinário.</li>
            <li>Gerencie cargos (<code>READER</code>, <code>CURATOR</code>, <code>ADMIN</code>), com proteção contra remoção do último administrador.</li>
            <li>Revise periodicamente a linha do tempo de auditoria (<code>AuditLog</code>).</li>
          </ul>
        </article>
      </div>
    );
  }

  if (activeTab === 'sugestoes') {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="p-5 rounded-xl bg-surface-container-low border border-outline/15">
            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
              <MessageSquarePlus className="w-4 h-4 text-secondary" />
              <h3>Indicação de Obra vs Melhoria</h3>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Use <strong>Indicação de Obra</strong> para sugerir livros ausentes no acervo — informar o{' '}
              <strong>ISBN-13 válido</strong> permite que a curadoria importe o livro com 1 clique. Use{' '}
              <strong>Melhoria / Correção</strong> para apontar erros de dados ou sugestões para a plataforma.
            </p>
          </article>

          <article className="p-5 rounded-xl bg-surface-container-low border border-outline/15">
            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
              <BookOpen className="w-4 h-4 text-secondary" />
              <h3>Ciclo de Vida na Triagem</h3>
            </div>
            <ul className="text-xs sm:text-sm text-on-surface-variant space-y-1.5 leading-relaxed list-disc pl-4">
              <li><strong>Pendente:</strong> aguardando exame da curadoria.</li>
              <li><strong>Em análise:</strong> em verificação pela equipe.</li>
              <li><strong>Aceita:</strong> obra importada ou melhoria acolhida.</li>
              <li><strong>Descartada:</strong> fora de escopo, duplicada ou com nota explicativa.</li>
            </ul>
          </article>
        </div>

        <div className="flex justify-end">
          <Link
            to="/sugestoes"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors"
          >
            <span>Ir para Enviar Sugestões</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (activeTab === 'curadoria') {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="p-5 rounded-xl bg-surface-container-low border border-outline/15">
            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
              <ShieldAlert className="w-4 h-4 text-secondary" />
              <h3>Trava Editorial &amp; Paridade de 4 Pontos</h3>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Ao ativar <code>editorialLock</code> em <code>/curadoria</code>, a obra é concluída na fila e o curador passa a definir oficialmente os 4 pontos da ficha pública: <strong>Veredito + Faixa Etária</strong>, <strong>Temas &amp; Tags</strong>, <strong>Pontos de Inadequação</strong> e <strong>Síntese Editorial</strong>.
            </p>
          </article>

          <article className="p-5 rounded-xl bg-surface-container-low border border-outline/15">
            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4 text-secondary" />
              <h3>Copiloto Magisterium AI</h3>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Ferramenta de apoio doutrinário com citações do Magistério e cache inteligente. A IA{' '}
              <strong>não lê o livro inteiro</strong> (analisa apenas metadados, sinopse e ressalvas) e{' '}
              <strong>nunca publica ou ativa trava sozinha</strong> — a revisão humana é sempre obrigatória.
            </p>
          </article>
        </div>

        <div className="flex justify-end">
          <Link
            to="/curadoria"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-high text-primary text-xs font-semibold hover:bg-surface-container-highest transition-colors"
          >
            <span>Abrir Painel de Curadoria</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <article className="p-5 rounded-xl bg-surface-container-low border border-outline/15">
        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
          <ScanBarcode className="w-4 h-4 text-secondary" />
          <h3>Importação &amp; Scanner ISBN</h3>
        </div>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          Importe livros pelo ISBN-13 ou use o scanner de código de barras. A plataforma consulta Google Books, BrasilAPI ISBN e Open Library, priorizando sinopse em PT-BR e padronizando títulos.
        </p>
      </article>

      <article className="p-5 rounded-xl bg-surface-container-low border border-outline/15">
        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
          <BookmarkCheck className="w-4 h-4 text-secondary" />
          <h3>Minha Lista &amp; Meus Pareceres</h3>
        </div>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          Salve livros na sua lista pessoal, acompanhe estatísticas por veredito, vote em pareceres como <strong>Útil</strong> e gerencie suas avaliações em <code>/meus-pareceres</code>.
        </p>
      </article>

      <article className="p-5 rounded-xl bg-surface-container-low border border-outline/15">
        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
          <Bell className="w-4 h-4 text-secondary" />
          <h3>Notificações &amp; Privacidade</h3>
        </div>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          Quem salva uma obra em Minha Lista recebe alertas no sininho sobre novos pareceres e atualizações editoriais. Login seguro via Firebase Auth com RBAC no servidor.
        </p>
      </article>
    </div>
  );
};
