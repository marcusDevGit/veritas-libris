export type GuideTabId =
  | 'criterios'
  | 'papeis'
  | 'sugestoes'
  | 'curadoria'
  | 'funcionalidades';

export interface GuideTabItem {
  id: GuideTabId;
  label: string;
  shortLabel: string;
}

export const GUIDE_TABS: GuideTabItem[] = [
  { id: 'criterios', label: 'Critérios & Consenso', shortLabel: 'Critérios' },
  { id: 'papeis', label: 'Papéis & Conduta', shortLabel: 'Papéis' },
  { id: 'sugestoes', label: 'Sugestões & Indicação', shortLabel: 'Sugestões' },
  { id: 'curadoria', label: 'Curadoria & Moderação', shortLabel: 'Curadoria' },
  { id: 'funcionalidades', label: 'Funcionalidades do App', shortLabel: 'Recursos' },
];
