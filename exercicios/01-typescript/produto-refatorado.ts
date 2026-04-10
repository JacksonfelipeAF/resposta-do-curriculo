// 1.1 - Refatoração com TypeScript e boas práticas

interface ProdutoInterface {
  id: number;
  descricao: string;
  quantidadeEstoque: number;
}

class Produto implements ProdutoInterface {
  constructor(
    public readonly id: number,
    public readonly descricao: string,
    public quantidadeEstoque: number
  ) {}

  // Método para verificar se há estoque
  temEstoque(): boolean {
    return this.quantidadeEstoque > 0;
  }

  // Método para decrementar estoque
  decrementarEstoque(quantidade: number = 1): void {
    if (this.quantidadeEstoque >= quantidade) {
      this.quantidadeEstoque -= quantidade;
    } else {
      throw new Error('Estoque insuficiente');
    }
  }

  // Método para formatar descrição
  getDescricaoFormatada(): string {
    return `${this.id} - ${this.descricao} (${this.quantidadeEstoque}x)`;
  }
}

class Verdureira {
  private produtos: Produto[] = [];

  constructor() {
    this.produtos = [
      new Produto(1, 'Maçã', 20),
      new Produto(2, 'Laranja', 0),
      new Produto(3, 'Limão', 20)
    ];
  }

  // Método melhorado usando find
  getDescricaoProduto(produtoId: number): string {
    const produto = this.encontrarProduto(produtoId);
    
    if (!produto) {
      throw new Error(`Produto com ID ${produtoId} não encontrado`);
    }
    
    return produto.getDescricaoFormatada();
  }

  // Método simplificado usando find
  hasEstoqueProduto(produtoId: number): boolean {
    const produto = this.encontrarProduto(produtoId);
    return produto ? produto.temEstoque() : false;
  }

  // Método auxiliar para encontrar produto
  private encontrarProduto(produtoId: number): Produto | undefined {
    return this.produtos.find(produto => produto.id === produtoId);
  }

  // Método para adicionar produto
  adicionarProduto(produto: Produto): void {
    const existe = this.produtos.some(p => p.id === produto.id);
    if (existe) {
      throw new Error(`Produto com ID ${produto.id} já existe`);
    }
    this.produtos.push(produto);
  }

  // Método para remover produto
  removerProduto(produtoId: number): boolean {
    const index = this.produtos.findIndex(p => p.id === produtoId);
    if (index !== -1) {
      this.produtos.splice(index, 1);
      return true;
    }
    return false;
  }

  // Método para listar produtos com estoque
  getProdutosComEstoque(): Produto[] {
    return this.produtos.filter(produto => produto.temEstoque());
  }

  // Método para obter todos os produtos
  getTodosProdutos(): ReadonlyArray<Produto> {
    return Object.freeze([...this.produtos]);
  }
}

// Exemplo de uso:
const verdureira = new Verdureira();

console.log('Descrição do produto 1:', verdureira.getDescricaoProduto(1));
console.log('Produto 2 tem estoque?', verdureira.hasEstoqueProduto(2));
console.log('Produtos com estoque:', verdureira.getProdutosComEstoque().length);

export { Produto, Verdureira, ProdutoInterface };
