export function tempoRelativo(dataIso) {
  const diffMs = Date.now() - new Date(dataIso).getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias <= 0) return 'hoje';
  if (diffDias === 1) return '1 dia atrás';
  if (diffDias < 7) return `${diffDias} dias atrás`;

  const diffSemanas = Math.floor(diffDias / 7);
  if (diffSemanas === 1) return '1 semana atrás';
  if (diffSemanas < 5) return `${diffSemanas} semanas atrás`;

  const diffMeses = Math.floor(diffDias / 30);
  if (diffMeses === 1) return '1 mês atrás';
  return `${diffMeses} meses atrás`;
}

export function iniciais(nomeCompleto) {
  const partes = nomeCompleto.trim().split(' ').filter(Boolean);
  const primeira = partes[0]?.[0] || '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

const CORES_AVATAR = ['#5A189A', '#7B2CBF', '#9D4EDD', '#3C096C'];

export function corAvatar(nomeCompleto) {
  const soma = [...nomeCompleto].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CORES_AVATAR[soma % CORES_AVATAR.length];
}

export function estrelas(nota) {
  const cheias = Math.max(0, Math.min(5, Math.round(Number(nota) || 0)));
  return '★'.repeat(cheias) + '☆'.repeat(5 - cheias);
}
