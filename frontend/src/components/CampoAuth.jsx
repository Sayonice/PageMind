import { useState } from 'react';
import { IconeCadeado, IconeEnvelope, IconeOlho, IconeOlhoFechado } from './Icones';

const ICONES = { envelope: IconeEnvelope, cadeado: IconeCadeado };

export default function CampoAuth({ rotulo, icone, type = 'text', ...propsInput }) {
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const Icone = ICONES[icone];
  const ehSenha = type === 'password';

  return (
    <label className="campo-auth">
      <span className="campo-auth-rotulo">{rotulo}</span>
      <span className="campo-auth-caixa">
        {Icone && <Icone tamanho={16} />}
        <input type={ehSenha && senhaVisivel ? 'text' : type} {...propsInput} />
        {ehSenha && (
          <button
            type="button"
            className="campo-auth-olho"
            onClick={() => setSenhaVisivel((atual) => !atual)}
            aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {senhaVisivel ? <IconeOlhoFechado tamanho={16} /> : <IconeOlho tamanho={16} />}
          </button>
        )}
      </span>
    </label>
  );
}
