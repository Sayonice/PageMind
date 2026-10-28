const CHAVE_CONFIG = 'pagemind_config';

const PADRAO = {
  tema: 'sistema',
  tamanhoFonte: 'medio',
  visualizacaoCompacta: false,
  animacoes: true,
};

const ESCALAS_FONTE = { pequeno: 0.9, medio: 1, grande: 1.15 };

export function obterConfiguracoes() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_CONFIG));
    return { ...PADRAO, ...salvo };
  } catch {
    return PADRAO;
  }
}

export function salvarConfiguracoes(config) {
  localStorage.setItem(CHAVE_CONFIG, JSON.stringify(config));
  aplicarConfiguracoes(config);
}

export function aplicarConfiguracoes(config = obterConfiguracoes()) {
  const raiz = document.documentElement;

  let temaResolvido = config.tema;
  if (temaResolvido === 'sistema') {
    temaResolvido = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'escuro'
      : 'claro';
  }
  raiz.setAttribute('data-theme', temaResolvido);

  raiz.style.setProperty('--escala-fonte', ESCALAS_FONTE[config.tamanhoFonte] ?? 1);

  document.body.classList.toggle('layout-compacto', !!config.visualizacaoCompacta);
  document.body.classList.toggle('sem-animacoes', !config.animacoes);
}
