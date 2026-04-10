# 2.4 - Performance - OnPush e trackBy

## Por que usar trackBy melhora a performance?

### Problema sem trackBy
Quando Angular renderiza uma lista com `*ngFor` ou `@for`, ele usa a **identidade do objeto** para determinar se um item mudou. Sem `trackBy`, Angular:

1. **Recria todos os elementos DOM** mesmo que apenas um item mudou
2. **Destrói e recria componentes** para cada item da lista
3. **Dispara change detection** desnecessariamente
4. **Perde estado local** (focus, scroll, estado de componentes)

### Como trackBy funciona
`trackBy` informa ao Angular como identificar unicamente cada item:

```typescript
// SEM trackBy - performance ruim
@for (item of items; track item) {
  <app-item [data]="item"></app-item>
}

// COM trackBy - performance otimizada
@for (item of items; track item.id) {
  <app-item [data]="item"></app-item>
}

// Ou com função customizada
trackByFn(index: number, item: Item): number {
  return item.id; // ID único
}
```

### Benefícios do trackBy:
- **Reutilização DOM**: Apenas elementos modificados são recriados
- **Preservação de estado**: Focus, scroll, estado interno mantidos
- **Menos work**: Evita destruição/recriação de componentes
- **Melhor UX**: Sem flickering ou perda de interação

## ChangeDetectionStrategy.OnPush em listas

### Como OnPush reduz ciclos desnecessários

**Default Strategy:**
- Verifica toda árvore de componentes em cada evento async
- Mesmo que dados não mudaram
- Custo O(n) para toda aplicação

**OnPush Strategy:**
- Só verifica componente quando:
  - Novos inputs (referência diferente)
  - Eventos do próprio componente
  - ChangeDetectorRef.markForCheck() explícito
  - Observable com async pipe emite

### Exemplo prático:

```typescript
@Component({
  selector: 'app-lista-usuarios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (usuario of usuarios; track usuario.id) {
      <app-usuario-card 
        [usuario]="usuario" 
        (edit)="onEdit($event)">
      </app-usuario-card>
    }
  `
})
export class ListaUsuariosComponent {
  @Input() usuarios: Usuario[] = [];
  
  // OnPush só verificará quando 'usuarios' mudar (nova referência)
}
```

### Impacto com Default vs OnPush

**Default Strategy em listas grandes:**
```
Lista 1000 itens + 1 mudança
= 1000 componentes verificados
= 1000 ciclos de CD
= Lenta e desnecessária
```

**OnPush Strategy em listas grandes:**
```
Lista 1000 itens + 1 mudança
= 1 componente verificado (o que mudou)
= 1 ciclo de CD
= Rápida e eficiente
```

## Melhores práticas para performance

### 1. Combinar OnPush + trackBy
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListaComponent {
  @Input() itens: Item[] = [];
  
  trackById(index: number, item: Item): number {
    return item.id;
  }
}
```

### 2. Immutability para OnPush
```typescript
// CORRETO - cria nova referência
this.itens = [...this.itens, novoItem];

// ERRADO - não aciona OnPush
this.itens.push(novoItem);
```

### 3. Async pipe para dados reativos
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (item of itens$ | async; track item.id) {
      <app-item [data]="item"></app-item>
    }
  `
})
export class ListaReativaComponent {
  itens$ = this.service.getItens();
}
```

### 4. Estratégias de otimização

**Para listas muito grandes:**
- Virtual scrolling (cdk-virtual-scroll)
- Paginação
- Lazy loading de itens

**Para dados que mudam frequentemente:**
- Debounce em atualizações
- Batch updates
- Web Workers para processamento

## Exemplo completo otimizado

```typescript
@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, UsuarioCardComponent],
  template: `
    <div class="lista-container">
      <div class="loading" *ngIf="loading$ | async">
        Carregando...
      </div>
      
      <div class="lista">
        @for (usuario of usuarios$ | async; track trackByUsuarioId) {
          <app-usuario-card 
            [usuario]="usuario"
            (edit)="onEditUsuario(usuario.id)">
          </app-usuario-card>
        } @empty {
          <p class="vazio">Nenhum usuário encontrado</p>
        }
      </div>
    </div>
  `
})
export class UsuariosListaComponent {
  readonly usuarios$ = this.usuarioService.getUsuarios();
  readonly loading$ = this.usuarioService.loading$;
  
  constructor(private usuarioService: UsuarioService) {}
  
  trackByUsuarioId(index: number, usuario: Usuario): number {
    return usuario.id;
  }
  
  onEditUsuario(id: number): void {
    // OnPush será acionado quando service atualizar dados
    this.usuarioService.editarUsuario(id);
  }
}
```

## Resumo do impacto

| Técnica | Performance | Memória | UX | Complexidade |
|---------|-------------|---------|----|-------------|
| Default + sem trackBy | Baixa | Alta | Ruim | Baixa |
| Default + trackBy | Média | Média | Média | Baixa |
| OnPush + trackBy | Alta | Baixa | Excelente | Média |
| OnPush + trackBy + async | Muito Alta | Muito Baixa | Excelente | Alta |

**Recomendação:** Sempre usar `trackBy` para listas e `OnPush` para componentes que não precisam verificar constantemente.
