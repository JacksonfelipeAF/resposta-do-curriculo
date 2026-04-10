# Como Ver Tudo Funcionando - Guia Passo a Passo

## Pré-requisitos
- Node.js 18+ instalado
- Angular CLI instalado globalmente

## Passo 1: Criar Projeto Angular Base

```bash
# Criar novo projeto Angular
ng new usuario-app --standalone --style=scss --routing=false

# Entrar na pasta do projeto
cd usuario-app
```

## Passo 2: Instalar Dependências

```bash
# Angular Material
ng add @angular/material

# Outras dependências necessárias
npm install @angular/cdk

# Para testes (se quiser usar Vitest)
npm install -D vitest @vitest/coverage-v8 @vitest/ui jsdom
```

## Passo 3: Configurar Angular Material

Quando rodar `ng add @angular/material`, responda:
- Choose a prebuilt theme: **Indigo/Pink**
- Set up global Angular Material typography styles: **Yes**
- Include and enable animations: **Yes**

## Passo 4: Substituir os Arquivos

Copie os arquivos que criei para a pasta `src/` do seu projeto:

### Estrutura de arquivos para copiar:

```
src/
app/
  components/
    usuario-lista/
      usuario-lista.component.ts
      usuario-lista.component.html
      usuario-lista.component.scss
    usuario-modal/
      usuario-modal.component.ts
      usuario-modal.component.html
      usuario-modal.component.scss
  models/
    usuario.model.ts
  services/
    usuario.service.ts
  app.component.ts
  app.component.html
  app.component.scss
  app.config.ts
test/
  usuario.service.spec.ts
```

## Passo 5: Ajustar o App Config

Crie `src/app/app.config.ts`:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideHttpClient()
  ]
};
```

## Passo 6: Ajustar main.ts

Substitua `src/main.ts`:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

## Passo 7: Adicionar Imports Faltantes

No `usuario-lista.component.ts`, adicione os imports que faltam:

```typescript
import { MatChipsModule } from '@angular/material/chips';
import { MatChipOption } from '@angular/material/chips';
```

## Passo 8: Adicionar Função Auxiliar

No `usuario-lista.component.ts`, adicione esta função:

```typescript
getPhoneTypeColor(tipo: string): string {
  switch (tipo) {
    case 'celular': return 'primary';
    case 'fixo': return 'accent';
    case 'comercial': return 'warn';
    default: return 'primary';
  }
}
```

## Passo 9: Remover Imports Não Necessários

No `app.component.ts`, remova os imports que não estão sendo usados:

```typescript
import { MatListModule } from '@angular/material/list'; // Remover este
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'; // Remover este
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
```

E simplifique o componente:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { UsuarioListaComponent } from './components/usuario-lista/usuario-lista.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    UsuarioListaComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Sistema de Usuários';
}
```

## Passo 10: Simplificar Template do App

No `app.component.html`, use uma versão simplificada:

```html
<mat-sidenav-container class="app-container">
  <mat-toolbar color="primary" class="app-toolbar">
    <span class="toolbar-title">
      <mat-icon class="toolbar-icon">people</mat-icon>
      {{ title }}
    </span>
    
    <span class="toolbar-spacer"></span>
    
    <button mat-icon-button class="toolbar-button">
      <mat-icon>notifications</mat-icon>
    </button>
    
    <button mat-icon-button class="toolbar-button">
      <mat-icon>account_circle</mat-icon>
    </button>
  </mat-toolbar>

  <mat-sidenav-content class="main-content">
    <div class="content-wrapper">
      <app-usuario-lista></app-usuario-lista>
    </div>
  </mat-sidenav-content>
</mat-sidenav-container>
```

## Passo 11: Adicionar Estilos Globais

No `src/styles.scss`, adicione:

```scss
@import '@angular/material/prebuilt-themes/indigo-pink.css';

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: Roboto, "Helvetica Neue", sans-serif;
}

.app-container {
  height: 100vh;
}

.toolbar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
}

.toolbar-icon {
  font-size: 24px;
}

.toolbar-spacer {
  flex: 1 1 auto;
}

.main-content {
  padding: 20px;
  background: #f5f5f5;
}
```

## Passo 12: Executar a Aplicação

```bash
# Iniciar o servidor de desenvolvimento
ng serve --open
```

## Passo 13: Testar Funcionalidades

### 1. Listagem de Usuários
- Você verá 5 usuários mockados
- Campo de busca no topo
- Botão vermelho flutuante para adicionar

### 2. Busca com Debounce
- Digite no campo "Buscar por nome ou e-mail"
- Espere 300ms para ver os resultados filtrarem
- Teste digitar rápido e devagar

### 3. Modal de Criação
- Clique no botão vermelho "+"
- Preencha o formulário
- Veja as validações em tempo real
- Tente CPF inválido para ver a validação

### 4. Modal de Edição
- Clique no botão de editar (ícone de lápis) em algum usuário
- O formulário virá preenchido
- Altere os dados e salve

### 5. Exclusão
- Clique no botão de excluir (ícone de lixeira)
- Confirme a exclusão

## Passo 14: Testar os Exercícios Individuais

Para testar os outros exercícios TypeScript:

```bash
# Criar arquivo de teste
echo "import './exercicios/01-typescript/produto-refatorado';
import './exercicios/01-typescript/filtragem-genericas';

// Testar as classes
const verdureira = new Verdureira();
console.log('Teste Produto:', verdureira.getDescricaoProduto(1));

// Testar paginação
const usuarios = [
  { id: 1, nome: 'João', email: 'joao@teste.com' },
  { id: 2, nome: 'Maria', email: 'maria@teste.com' }
];

const resultado = filtrarEPaginar(
  usuarios,
  (user) => user.nome.includes('Jo'),
  { pagina: 1, tamanho: 10 }
);

console.log('Teste Paginação:', resultado);
" > test-exercicios.ts

# Executar com Node.js (precisa de ts-node)
npx ts-node test-exercicios.ts
```

## Solução de Problemas Comuns

### Erro: "Cannot find module '@angular/material'"
```bash
ng add @angular/material
```

### Erro: "Property 'x' does not exist on type"
Verifique se todos os imports estão corretos e se os módulos estão adicionados aos imports do componente.

### Erro: "Template parse errors"
Verifique se todos os componentes usados no template estão importados no array `imports` do componente.

### Erro: "formControlName" não funciona
Verifique se `ReactiveFormsModule` está importado no componente.

## Resumo do que Você Verá Funcionando:

1. **Interface completa** com Material Design
2. **Busca reativa** com debounce de 300ms
3. **Modal CRUD** totalmente funcional
4. **Validações em tempo real** de CPF, e-mail, telefone
5. **Formatação automática** de campos
6. **Estados de loading** durante requisições
7. **Tratamento de erros** com mensagens amigáveis
8. **Design responsivo** para mobile
9. **Animações suaves** e micro-interações
10. **Performance otimizada** com OnPush e trackBy

Tudo isso estará rodando em `http://localhost:4200`!
