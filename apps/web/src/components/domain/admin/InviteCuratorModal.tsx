import React, { useState } from 'react';
import type { InviteUserBody, UserRole } from '@app/shared';
import { Feather, Send, ShieldCheck, X } from 'lucide-react';

interface InviteCuratorModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (payload: InviteUserBody) => void;
}

export const InviteCuratorModal: React.FC<InviteCuratorModalProps> = ({
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [role, setRole] = useState<UserRole>('CURATOR');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      role,
      title: title.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-xl max-w-xl w-full p-6 shadow-xl border border-outline/20 flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-primary">
                Convidar Novo Curador
              </h3>
              <p className="text-xs text-on-surface-variant">
                Nomeação prévia por e-mail Google ou promoção de usuário existente
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary mb-1">
              Nome Completo / Título
            </label>
            <input
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pe. Mateus Ferreira ou Profa. Helena Silveira"
              className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low border border-outline/20 text-sm text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                E-mail da Conta Google
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="curador@exemplo.com"
                className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low border border-outline/20 text-sm text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1">
                Diocese / Função (opcional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Parecerista Teológico"
                className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low border border-outline/20 text-sm text-on-surface outline-none focus:border-primary focus:bg-surface-container-lowest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1">
              Cargo &amp; Permissões (RBAC)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low border border-outline/20 text-sm text-on-surface outline-none focus:border-primary"
            >
              <option value="CURATOR">Curador Oficial (Peso 3 + Trava Editorial)</option>
              <option value="ADMIN">Administrador (Governança RBAC + Curadoria)</option>
            </select>
          </div>

          <div className="p-3.5 bg-secondary-container/25 rounded-lg flex items-start gap-2.5 border border-secondary/20">
            <ShieldCheck className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <p className="text-xs text-on-secondary-container leading-relaxed">
              Se a pessoa ainda não tiver entrado no Veritas Libris, ela ficará pré-nomeada e receberá o cargo automaticamente no primeiro login com esse e-mail.
            </p>
          </div>

          {errorMessage && (
            <p className="text-xs font-semibold text-error">{errorMessage}</p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Salvando...' : 'Expedir Nomeação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
