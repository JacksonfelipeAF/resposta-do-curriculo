// 3.1 - Angular Signals - estado local

import {
  Component,
  signal,
  computed,
  output,
  Input,
  effect,
} from "@angular/core";
import { CommonModule } from "@angular/common";

// Interface para tipagem
interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
}

// Componente contador de itens no carrinho usando Signals
@Component({
  selector: "app-contador-carrinho",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="carrinho-container">
      <h2>Meu Carrinho</h2>

      <!-- Lista de itens -->
      <div class="itens-lista">
        @for (item of itens(); track item.id) {
          <div class="item-carrinho">
            <div class="item-info">
              <span class="item-nome">{{ item.nome }}</span>
              <span class="item-preco">R$ {{ item.preco.toFixed(2) }}</span>
            </div>

            <div class="item-controles">
              <button
                (click)="removerItem(item.id)"
                [disabled]="item.quantidade === 1"
                class="btn-quantidade"
                aria-label="Remover um"
              >
                -
              </button>

              <span class="quantidade">{{ item.quantidade }}</span>

              <button
                (click)="adicionarItem(item.id)"
                class="btn-quantidade"
                aria-label="Adicionar um"
              >
                +
              </button>

              <button
                (click)="excluirItem(item.id)"
                class="btn-excluir"
                aria-label="Excluir item"
              >
                ×
              </button>
            </div>

            <div class="item-subtotal">
              R$ {{ (item.preco * item.quantidade).toFixed(2) }}
            </div>
          </div>
        } @empty {
          <div class="carrinho-vazio">
            <p>Seu carrinho está vazio</p>
            <button (click)="adicionarProdutoExemplo()" class="btn-adicionar">
              Adicionar produto exemplo
            </button>
          </div>
        }
      </div>

      <!-- Resumo do carrinho -->
      <div class="carrinho-resumo">
        <div class="total-itens">
          <span>Total de itens: {{ totalItens() }}</span>
        </div>

        <div class="total-valor">
          <span
            >Valor total:
            <strong>R$ {{ totalValor().toFixed(2) }}</strong></span
          >
        </div>

        <div class="acoes">
          <button
            (click)="limparCarrinho()"
            [disabled]="itens().length === 0"
            class="btn-limpar"
          >
            Limpar Carrinho
          </button>

          <button
            (click)="finalizarCompra()"
            [disabled]="itens().length === 0"
            class="btn-finalizar"
          >
            Finalizar Compra
          </button>
        </div>
      </div>

      <!-- Debug information -->
      <div class="debug-info" *ngIf="mostrarDebug">
        <h3>Debug Info</h3>
        <p>Itens: {{ itens() | json }}</p>
        <p>Total itens: {{ totalItens() }}</p>
        <p>Total valor: {{ totalValor() }}</p>
        <p>Mudanças no total: {{ mudancasTotal() }}</p>
      </div>

      <button (click)="toggleDebug()" class="btn-debug">
        {{ mostrarDebug ? "Esconder" : "Mostrar" }} Debug
      </button>
    </div>
  `,
  styles: [
    `
      .carrinho-container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      h2 {
        color: #333;
        margin-bottom: 20px;
        text-align: center;
      }

      .itens-lista {
        margin-bottom: 20px;
      }

      .item-carrinho {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px;
        border: 1px solid #eee;
        border-radius: 6px;
        margin-bottom: 10px;
        background: #fafafa;
      }

      .item-info {
        flex: 1;
      }

      .item-nome {
        font-weight: 600;
        color: #333;
        display: block;
        margin-bottom: 4px;
      }

      .item-preco {
        color: #666;
        font-size: 14px;
      }

      .item-controles {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 15px;
      }

      .btn-quantidade {
        width: 30px;
        height: 30px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s;
      }

      .btn-quantidade:hover:not(:disabled) {
        background: #f0f0f0;
        border-color: #999;
      }

      .btn-quantidade:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .quantidade {
        font-weight: 600;
        min-width: 20px;
        text-align: center;
      }

      .btn-excluir {
        width: 30px;
        height: 30px;
        border: 1px solid #e74c3c;
        background: #e74c3c;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 18px;
        transition: all 0.2s;
      }

      .btn-excluir:hover {
        background: #c0392b;
        border-color: #c0392b;
      }

      .item-subtotal {
        font-weight: 600;
        color: #2ecc71;
        min-width: 80px;
        text-align: right;
      }

      .carrinho-vazio {
        text-align: center;
        padding: 40px 20px;
        color: #666;
      }

      .carrinho-vazio p {
        margin-bottom: 15px;
        font-size: 16px;
      }

      .btn-adicionar {
        background: #3498db;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .btn-adicionar:hover {
        background: #2980b9;
      }

      .carrinho-resumo {
        border-top: 2px solid #eee;
        padding-top: 20px;
      }

      .total-itens,
      .total-valor {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 16px;
      }

      .total-valor strong {
        color: #2ecc71;
        font-size: 18px;
      }

      .acoes {
        display: flex;
        gap: 10px;
        margin-top: 20px;
      }

      .btn-limpar,
      .btn-finalizar {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
      }

      .btn-limpar {
        background: #ecf0f1;
        color: #7f8c8d;
      }

      .btn-limpar:hover:not(:disabled) {
        background: #bdc3c7;
      }

      .btn-finalizar {
        background: #2ecc71;
        color: white;
      }

      .btn-finalizar:hover:not(:disabled) {
        background: #27ae60;
      }

      .btn-limpar:disabled,
      .btn-finalizar:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .debug-info {
        margin-top: 20px;
        padding: 15px;
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
      }

      .btn-debug {
        margin-top: 10px;
        background: #6c757d;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
    `,
  ],
})
export class ContadorCarrinhoComponent {
  // Signal para lista de itens
  private _itens = signal<ItemCarrinho[]>([]);

  // Expor signal como readonly para o template
  itens = this._itens.asReadonly();

  // Computed para total de itens (quantidade × preço)
  totalValor = computed(() => {
    return this._itens().reduce((total, item) => {
      return total + item.preco * item.quantidade;
    }, 0);
  });

  // Computed para quantidade total de itens
  totalItens = computed(() => {
    return this._itens().reduce((total, item) => {
      return total + item.quantidade;
    }, 0);
  });

  // Output que emite sempre que o total mudar
  totalMudou = output<number>();

  // Signal para debug
  mostrarDebug = signal(false);

  // Contador de mudanças para demonstrar reatividade
  private _mudancasTotal = signal(0);
  mudancasTotal = this._mudancasTotal.asReadonly();

  // Efeito para detectar mudanças no total
  private totalAnterior = 0;

  constructor() {
    // Efeito para emitir output quando total mudar
    // Em Angular 16+, podemos usar effect() para isso
    this.monitorarMudancasTotal();
  }

  // Método para adicionar item
  adicionarItem(id: number): void {
    this._itens.update((itens) => {
      return itens.map((item) => {
        if (item.id === id) {
          return { ...item, quantidade: item.quantidade + 1 };
        }
        return item;
      });
    });
  }

  // Método para remover item (diminuir quantidade)
  removerItem(id: number): void {
    this._itens.update((itens) => {
      return itens.map((item) => {
        if (item.id === id && item.quantidade > 1) {
          return { ...item, quantidade: item.quantidade - 1 };
        }
        return item;
      });
    });
  }

  // Método para excluir item completamente
  excluirItem(id: number): void {
    this._itens.update((itens) => itens.filter((item) => item.id !== id));
  }

  // Método para adicionar novo produto ao carrinho
  adicionarNovoProduto(nome: string, preco: number): void {
    const novoItem: ItemCarrinho = {
      id: Date.now(), // ID único baseado no timestamp
      nome,
      preco,
      quantidade: 1,
    };

    this._itens.update((itens) => [...itens, novoItem]);
  }

  // Método para limpar carrinho
  limparCarrinho(): void {
    this._itens.set([]);
  }

  // Método para finalizar compra
  finalizarCompra(): void {
    const total = this.totalValor();
    alert(`Compra finalizada! Total: R$ ${total.toFixed(2)}`);
    this.limparCarrinho();
  }

  // Método para adicionar produto exemplo
  adicionarProdutoExemplo(): void {
    this.adicionarNovoProduto("Produto Exemplo", 29.99);
  }

  // Método para toggle debug
  toggleDebug(): void {
    this.mostrarDebug.set(!this.mostrarDebug());
  }

  // Monitorar mudanças no total (simulação de effect)
  private monitorarMudancasTotal(): void {
    // Em um projeto real, usaríamos effect() do Angular 16+
    // this.effect(() => {
    //   const totalAtual = this.totalValor();
    //   if (totalAtual !== this.totalAnterior) {
    //     this.totalMudou(totalAtual);
    //     this._mudancasTotal.set(this._mudancasTotal() + 1);
    //     this.totalAnterior = totalAtual;
    //   }
    // });

    // Por enquanto, vamos monitorar manualmente para demonstração
    setInterval(() => {
      const totalAtual = this.totalValor();
      if (totalAtual !== this.totalAnterior) {
        this.totalMudou(totalAtual);
        this._mudancasTotal.set(this._mudancasTotal() + 1);
        this.totalAnterior = totalAtual;
      }
    }, 100);
  }
}

// Exemplo de uso do componente
@Component({
  selector: "app-exemplo-carrinho",
  standalone: true,
  imports: [CommonModule, ContadorCarrinhoComponent],
  template: `
    <div class="exemplo-container">
      <h1>Exemplo de Carrinho com Signals</h1>

      <app-contador-carrinho
        (totalMudou)="onTotalMudou($event)"
      ></app-contador-carrinho>

      <div class="log-mudancas">
        <h3>Log de Mudanças no Total</h3>
        @for (log of logs(); track log.id) {
          <div class="log-item">
            {{ log.mensagem }}
          </div>
        } @empty {
          <p>Nenhuma mudança ainda</p>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .exemplo-container {
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
      }

      .log-mudancas {
        margin-top: 30px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 6px;
      }

      .log-item {
        padding: 8px;
        margin-bottom: 5px;
        background: white;
        border-left: 4px solid #3498db;
        border-radius: 2px;
      }
    `,
  ],
})
export class ExemploCarrinhoComponent {
  logs = signal<{ id: number; mensagem: string }[]>([]);
  private logId = 0;

  onTotalMudou(novoTotal: number): void {
    const log = {
      id: ++this.logId,
      mensagem: `Total mudou para: R$ ${novoTotal.toFixed(2)} em ${new Date().toLocaleTimeString()}`,
    };

    this.logs.update((logs) => [...logs.slice(-4), log]); // Manter apenas 5 logs
  }
}

// Exportar para uso em outros módulos
export { ItemCarrinho, ContadorCarrinhoComponent, ExemploCarrinhoComponent };
