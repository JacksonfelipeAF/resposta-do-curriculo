// 1.2 - Generics e tipos utilitários

interface PaginaParams {
  pagina: number;
  tamanho: number;
}

interface Pagina<T> {
  itens: T[];
  total: number;
  paginaAtual: number;
  totalPaginas: number;
  temProxima: boolean;
  temAnterior: boolean;
}

function filtrarEPaginar<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  params: PaginaParams
): Pagina<T> {
  // Aplicar filtro
  const dadosFiltrados = data.filter(filterFn);
  const total = dadosFiltrados.length;
  
  // Calcular paginação
  const inicio = (params.pagina - 1) * params.tamanho;
  const fim = inicio + params.tamanho;
  const itens = dadosFiltrados.slice(inicio, fim);
  
  const totalPaginas = Math.ceil(total / params.tamanho);
  
  return {
    itens,
    total,
    paginaAtual: params.pagina,
    totalPaginas,
    temProxima: params.pagina < totalPaginas,
    temAnterior: params.pagina > 1
  };
}

// Exemplo concreto com usuários
interface Usuario {
  id: number;
  nome: string;
  email: string;
  idade: number;
  ativo: boolean;
}

const usuarios: Usuario[] = [
  { id: 1, nome: 'João Silva', email: 'joao@email.com', idade: 25, ativo: true },
  { id: 2, nome: 'Maria Santos', email: 'maria@email.com', idade: 30, ativo: true },
  { id: 3, nome: 'Pedro Oliveira', email: 'pedro@email.com', idade: 35, ativo: false },
  { id: 4, nome: 'Ana Costa', email: 'ana@email.com', idade: 28, ativo: true },
  { id: 5, nome: 'Carlos Pereira', email: 'carlos@email.com', idade: 32, ativo: true },
  { id: 6, nome: 'Joana Mendes', email: 'joana@email.com', idade: 27, ativo: false }
];

// Exemplo 1: Filtrar usuários por nome que contém "Jo"
function filtrarPorNome(termo: string): (usuario: Usuario) => boolean {
  return (usuario: Usuario) => 
    usuario.nome.toLowerCase().includes(termo.toLowerCase()) && usuario.ativo;
}

const resultado1 = filtrarEPaginar(
  usuarios,
  filtrarPorNome('Jo'),
  { pagina: 1, tamanho: 2 }
);

console.log('Usuários com "Jo" no nome (página 1):');
console.log(resultado1.itens);
console.log('Total:', resultado1.total);

// Exemplo 2: Filtrar usuários por idade
function filtrarPorIdade(minima: number, maxima: number): (usuario: Usuario) => boolean {
  return (usuario: Usuario) => 
    usuario.idade >= minima && usuario.idade <= maxima && usuario.ativo;
}

const resultado2 = filtrarEPaginar(
  usuarios,
  filtrarPorIdade(25, 30),
  { pagina: 1, tamanho: 3 }
);

console.log('\nUsuários entre 25-30 anos:');
console.log(resultado2.itens);

// Exemplo 3: Paginação múltiplas páginas
const resultado3 = filtrarEPaginar(
  usuarios,
  (usuario) => usuario.ativo,
  { pagina: 2, tamanho: 2 }
);

console.log('\nUsuários ativos (página 2):');
console.log(resultado3.itens);
console.log('Página atual:', resultado3.paginaAtual);
console.log('Total de páginas:', resultado3.totalPaginas);
console.log('Tem próxima?', resultado3.temProxima);
console.log('Tem anterior?', resultado3.temAnterior);

// Exemplo com produtos para demonstrar reusabilidade
interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
}

const produtos: Produto[] = [
  { id: 1, nome: 'Notebook', preco: 3500, categoria: 'Eletrônicos' },
  { id: 2, nome: 'Mouse', preco: 50, categoria: 'Eletrônicos' },
  { id: 3, nome: 'Cadeira', preco: 800, categoria: 'Móveis' },
  { id: 4, nome: 'Mesa', preco: 1200, categoria: 'Móveis' },
  { id: 5, nome: 'Teclado', preco: 150, categoria: 'Eletrônicos' }
];

const produtosEletronicos = filtrarEPaginar(
  produtos,
  (produto) => produto.categoria === 'Eletrônicos',
  { pagina: 1, tamanho: 2 }
);

console.log('\nProdutos eletrônicos (página 1):');
console.log(produtosEletronicos.itens);

export { filtrarEPaginar, PaginaParams, Pagina };
export type { Usuario, Produto };
