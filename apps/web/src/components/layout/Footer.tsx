import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ExternalLink, Info } from 'lucide-react';

/**
 * Footer — Rodapé Pastoral e Canônico do Veritas Libris
 * 
 * Estruturado em 5 colunas conforme a tela do Stitch:
 * - Apresentação institucional e adesão ao Magistério
 * - Navegação do acervo
 * - Referências canônicas e documentais da Igreja Católica
 * - Inscrição no boletim de leituras
 * - Nota canônica e jurídica sobre a distinção entre discernimento consultivo e o Imprimatur diocesano oficial
 */
export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="w-full bg-surface-container-low border-t border-outline/15 text-on-surface">
      <div className="max-w-[1380px] mx-auto px-6 lg:px-8 pt-14 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-outline/15">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="font-editorial text-2xl font-bold text-primary">
                Veritas Libris
              </span>
              <span className="text-xs px-2 py-0.5 bg-surface-container-high text-secondary border border-outline/20 rounded font-semibold">
                Curadoria Pastoral
              </span>
            </div>

            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-md">
              O Índice Católico de Leitura é um serviço pastoral e literário independente dedicado à análise moral, doutrinária e estética de obras clássicas e contemporâneas à luz do Magistério da Santa Sé.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
              <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
              <span>Sob as Diretrizes do Magistério e Tradição Católica</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-on-surface-variant">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <a href="#criterios" className="hover:text-primary transition-colors">
                  Critérios de Avaliação
                </a>
              </li>
              <li>
                <a href="#sobre" className="hover:text-primary transition-colors">
                  Corpo Curatorial
                </a>
              </li>
              <li>
                <a href="#submissoes" className="hover:text-primary transition-colors">
                  Envio de Sugestões
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
              Referências Eclesiais
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-on-surface-variant">
              <li>
                <a
                  href="https://www.vatican.va/archive/catechism_po/index_new/p3s2cap2_2196-2557_po.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <span>Catecismo (§§ 2493-2499)</span>
                  <ExternalLink className="w-3 h-3 text-outline" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_decree_19631204_inter-mirifica_po.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <span>Inter Mirifica (Vat. II)</span>
                  <ExternalLink className="w-3 h-3 text-outline" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.vatican.va/archive/cod-iuris-canonici/portuguese/codex-iuris-canonici_po.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <span>Dir. Canônico (Cân. 822-832)</span>
                  <ExternalLink className="w-3 h-3 text-outline" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.vatican.va/content/vatican/pt.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <span>Santa Sé - Documentos</span>
                  <ExternalLink className="w-3 h-3 text-outline" />
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
              Boletim de Leituras
            </h4>
            <p className="text-xs text-on-surface-variant">
              Receba mensalmente notas críticas e pareceres de novas publicações.
            </p>

            {subscribed ? (
              <div className="p-3 bg-secondary-container/30 text-secondary rounded-lg text-xs font-semibold">
                Obrigado! Seu correio eletrônico foi registrado.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu correio eletrônico..."
                  required
                  className="h-10 px-3.5 rounded-lg bg-surface-container-lowest border border-outline/25 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container"
                />
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-xs font-bold transition-colors shadow-xs"
                >
                  Inscrever-se
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="text-xs text-on-surface-variant max-w-3xl">
            <p className="text-xs text-on-surface mb-1 font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-secondary shrink-0" />
              <span>Nota Sobre Imprimatur & Nihil Obstat:</span>
            </p>
            <p className="text-[11px] text-outline leading-relaxed">
              As avaliações e notas atribuídas pelo Veritas Libris possuem caráter pedagógico e consultivo de discernimento prudencial leigo e pastoral. Não substituem o parecer oficial diocesano (Nihil Obstat / Imprimatur) emitido pelas autoridades eclesiásticas legítimas para edições litúrgicas ou catequéticas.
            </p>
          </div>

          <div className="text-xs text-outline text-left md:text-right shrink-0">
            <p>© {new Date().getFullYear()} Veritas Libris. Omnia ad maiorem Dei gloriam.</p>
            <p className="mt-1 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">
              Fidelitas • Prudentia • Sapientia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
