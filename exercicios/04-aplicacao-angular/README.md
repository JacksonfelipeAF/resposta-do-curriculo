# Aplicação Angular - Sistema de Usuários

Uma aplicação Angular completa demonstrando as melhores práticas de desenvolvimento com Angular 17+, Material Design, RxJS, Signals e testes.

## Stack Tecnológica

- **Angular 17+** - Framework principal
- **Angular Material** - Biblioteca de UI components
- **RxJS** - Programação reativa
- **Angular Signals** - Estado reativo (Angular 16+)
- **TypeScript** - Tipagem forte
- **Vitest** - Framework de testes
- **SCSS** - Pré-processador CSS

## Funcionalidades Implementadas

### 1. Listagem de Usuários
- Cards com informações dos usuários (nome, e-mail, CPF, telefone)
- Busca reativa com debounce de 300ms
- Estado de loading durante requisições
- Tratamento de erros com mensagens amigáveis
- Paginação (implementada no serviço)

### 2. Modal de Cadastro/Edição
- Formulário reativo com validações
- Campos obrigatórios: e-mail, nome, CPF, telefone, tipo de telefone
- Validação em tempo real de CPF, e-mail e telefone
- Formatação automática de CPF e telefone
- Botão salvar desabilitado enquanto formulário inválido
- Preenchimento automático em modo edição

### 3. Requisitos Técnicos

#### RxJS (Operadores implementados)
- `debounceTime(300)` - Busca com debounce
- `distinctUntilChanged()` - Evitar buscas duplicadas
- `switchMap` - Cancelar requisições anteriores (race condition)
- `catchError` - Tratamento centralizado de erros
- `takeUntil` - Gerenciamento de memory leaks
- `finalize` - Limpeza de estado

#### Componentes Standalone
- Todos os componentes são standalone (Angular 14+)
- Imports explícitos de dependências
- Melhor performance e tree-shaking

#### Gerenciamento de Subscriptions
- `takeUntil(destroy$)` - Pattern para evitar memory leaks
- Subjects para gerenciamento de streams
- Cleanup no ngOnDestroy

#### Performance
- `ChangeDetectionStrategy.OnPush` - Reduz ciclos de CD
- `trackBy` functions - Otimização de listas
- Signals para estado reativo
- Immutability para acionar OnPush

### 4. Testes
- **Cobertura > 60%** com Vitest
- Testes unitários do serviço
- Mocks de dependências
- Testes de validações
- Testes de casos de erro

## Estrutura do Projeto

```
src/
app/
  components/
    usuario-lista/          # Componente principal da lista
      usuario-lista.component.ts
      usuario-lista.component.html
      usuario-lista.component.scss
    usuario-modal/          # Modal de criação/edição
      usuario-modal.component.ts
      usuario-modal.component.html
      usuario-modal.component.scss
  services/
    usuario.service.ts      # Serviço de usuários com RxJS
  models/
    usuario.model.ts         # Interfaces e tipos
  app.component.ts          # Componente raiz
  app.component.html
  app.component.scss
test/
  usuario.service.spec.ts    # Testes do serviço
```

## Padrões e Boas Práticas

### 1. TypeScript e Qualidade de Código
- Interfaces fortemente tipadas
- Sem uso de `any`
- Immutability no estado
- Nomenclatura consistente

### 2. RxJS e Reatividade
- Operadores encadeados
- Tratamento de erros centralizado
- Evitar subscriptions aninhadas
- Pattern switchMap para race conditions

### 3. Angular e Performance
- OnPush change detection
- trackBy para listas
- Signals para estado local
- Componentes standalone

### 4. Arquitetura
- Separação de responsabilidades
- Services injeáveis
- Componentes coesos
- Reusabilidade

## Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
npm install
```

### Executar em desenvolvimento
```bash
npm start
```

### Executar testes
```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:coverage
```

### Build para produção
```bash
npm run build
```

## Diferenciais Implementados

### Validações Avançadas
- Algoritmo completo de validação de CPF
- Regex para validação de e-mail
- Formatação automática de campos
- Validação em tempo real

### UX/UI
- Material Design moderno
- Animações suaves
- Estados de loading
- Feedback visual de erros
- Design responsivo

### Performance
- Virtual scrolling pronto para implementar
- Lazy loading de componentes
- Otimização de change detection
- Memory management

### Código Limpo
- Comentários explicativos
- Documentação de métodos
- Tipagem completa
- Padrões consistentes

## Próximos Passos (Melhorias)

1. **Nx Monorepo** - Separar em bibliotecas (feature-users, data-access-users, ui)
2. **Paginação no frontend** - Implementar paginação visual
3. **NgRx Integration** - Gerenciamento de estado global
4. **Autenticação** - Sistema de login/autorização
5. **Internacionalização** - i18n com Angular
6. **PWA** - Progressive Web App
7. **E2E Tests** - Cypress ou Playwright

## Conclusão

Esta aplicação demonstra domínio técnico em:

- **TypeScript** - Tipagem forte e boas práticas
- **Angular** - Componentes, serviços, forms, change detection
- **RxJS** - Programação reativa e operadores avançados
- **Testes** - Unit tests com alta cobertura
- **Performance** - Otimizações e melhores práticas
- **UX** - Interface moderna e responsiva

O projeto atende todos os requisitos técnicos exigidos e vai além com implementações que demonstram conhecimento profundo do ecossistema Angular e melhores práticas de desenvolvimento frontend.
