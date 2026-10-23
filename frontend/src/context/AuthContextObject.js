// src/context/AuthContextObject.js
//
// Apenas a criação do objeto de contexto, isolada em seu próprio arquivo.
// Tanto AuthContext.jsx (o Provider) quanto useAuth.js (o hook)
// importam este objeto — assim cada arquivo .jsx exporta só o componente.

import { createContext } from 'react';

export const AuthContext = createContext(null);