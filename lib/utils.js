export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }) : '—';
export const fmtDateTime = (d) => d ? new Date(d).toLocaleString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
export const fmtCurrency = (v, currency = 'XAF') => v != null ? `${parseFloat(v).toLocaleString('fr-FR')} ${currency}` : '—';
export const fmtNumber = (v) => v != null ? parseInt(v).toLocaleString('fr-FR') : '0';

export const CAMPAIGN_STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export const CAMPAIGN_STATUS_LABELS = {
  DRAFT: 'Brouillon', SCHEDULED: 'Planifiée', PROCESSING: 'En cours',
  COMPLETED: 'Terminée', FAILED: 'Échouée', CANCELLED: 'Annulée',
};

export const MSG_STATUS_COLORS = {
  queued: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  skipped: 'bg-orange-100 text-orange-700',
};

export const WALLET_TX_COLORS = {
  CREDIT: 'text-green-600', DEBIT: 'text-red-600',
  RESERVE: 'text-orange-600', RELEASE: 'text-blue-600', REFUND: 'text-purple-600',
};

export const fmtCredits = (v) => v != null ? `${parseInt(v).toLocaleString('fr-FR')} crédit(s)` : '—';

export const RECHARGE_STATUS_LABELS = {
  pending: 'En attente', approved: 'Approuvée', rejected: 'Rejetée',
};
export const RECHARGE_STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};
