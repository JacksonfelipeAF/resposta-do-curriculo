// 2.2 - RxJS - eliminando subscriptions aninhadas

import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, switchMap, take, takeUntil } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

// Serviço simulado
class PessoaService {
  buscarPorId(id: number) {
    return of({ id, nome: 'João' });
  }
  
  buscarQuantidadeFamiliares(id: number) {
    return of(5);
  }
}

// CÓDIGO ORIGINAL COM PROBLEMA:
@Component({
  template: `<h1>{{ texto }}</h1>`,
  standalone: true
})
export class ComponenteOriginal implements OnInit, OnDestroy {
  texto: string;
  private destroy$ = new Subject<void>();
  
  constructor(private readonly pessoaService: PessoaService) {}

  ngOnInit(): void {
    const pessoaId = 1;

    // PROBLEMA: subscribe aninhado
    this.pessoaService.buscarPorId(pessoaId).subscribe(pessoa => {
      this.pessoaService.buscarQuantidadeFamiliares(pessoaId).subscribe(qtd => {
        this.texto = `Nome: ${pessoa.nome} | familiares: ${qtd}`;
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// SOLUÇÃO 1: Usando switchMap (recomendado)
@Component({
  template: `<h1>{{ texto }}</h1>`,
  standalone: true
})
export class ComponenteComSwitchMap implements OnInit, OnDestroy {
  texto: string;
  private destroy$ = new Subject<void>();
  
  constructor(private readonly pessoaService: PessoaService) {}

  ngOnInit(): void {
    const pessoaId = 1;

    this.pessoaService.buscarPorId(pessoaId)
      .pipe(
        switchMap(pessoa => 
          this.pessoaService.buscarQuantidadeFamiliares(pessoaId)
            .pipe(
              // Combinar resultado da primeira chamada
              map(qtd => ({ pessoa, qtd }))
            )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(({ pessoa, qtd }) => {
        this.texto = `Nome: ${pessoa.nome} | familiares: ${qtd}`;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// SOLUÇÃO 2: Usando forkJoin (quando chamadas podem ser paralelas)
@Component({
  template: `<h1>{{ texto }}</h1>`,
  standalone: true
})
export class ComponenteComForkJoin implements OnInit, OnDestroy {
  texto: string;
  private destroy$ = new Subject<void>();
  
  constructor(private readonly pessoaService: PessoaService) {}

  ngOnInit(): void {
    const pessoaId = 1;

    forkJoin({
      pessoa: this.pessoaService.buscarPorId(pessoaId),
      qtd: this.pessoaService.buscarQuantidadeFamiliares(pessoaId)
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(({ pessoa, qtd }) => {
      this.texto = `Nome: ${pessoa.nome} | familiares: ${qtd}`;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// SOLUÇÃO 3: Usando combineLatest (para fluxos reativos)
@Component({
  template: `<h1>{{ texto }}</h1>`,
  standalone: true
})
export class ComponenteComCombineLatest implements OnInit, OnDestroy {
  texto: string;
  private destroy$ = new Subject<void>();
  
  constructor(private readonly pessoaService: PessoaService) {}

  ngOnInit(): void {
    const pessoaId = 1;

    combineLatest([
      this.pessoaService.buscarPorId(pessoaId),
      this.pessoaService.buscarQuantidadeFamiliares(pessoaId)
    ])
    .pipe(
      map(([pessoa, qtd]) => ({ pessoa, qtd })),
      takeUntil(this.destroy$)
    )
    .subscribe(({ pessoa, qtd }) => {
      this.texto = `Nome: ${pessoa.nome} | familiares: ${qtd}`;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// SOLUÇÃO 4: Versão moderna com async pipe (Angular 16+)
import { signal } from '@angular/core';

@Component({
  template: `<h1>{{ texto() }}</h1>`,
  standalone: true
})
export class ComponenteComAsyncPipe implements OnInit {
  texto = signal('');
  
  constructor(private readonly pessoaService: PessoaService) {}

  ngOnInit(): void {
    const pessoaId = 1;

    this.pessoaService.buscarPorId(pessoaId)
      .pipe(
        switchMap(pessoa => 
          this.pessoaService.buscarQuantidadeFamiliares(pessoaId)
            .pipe(
              map(qtd => ({ pessoa, qtd }))
            )
        ),
        take(1) // Auto-completar após primeiro valor
      )
      .subscribe(({ pessoa, qtd }) => {
        this.texto.set(`Nome: ${pessoa.nome} | familiares: ${qtd}`);
      });
  }
}

/**
 * EXPLICAÇÃO DA ESCOLHA DE OPERADORES:
 * 
 * SWITCHMAP:
 * - Cancela requisição anterior quando nova chega
 * - Ideal para sequências dependentes (segunda depende da primeira)
 * - Evita race conditions
 * - Gerencia automaticamente subscriptions internas
 * 
 * FORKJOIN:
 * - Executa chamadas em paralelo quando possível
 * - Espera todos os observables completarem
 * - Bom quando chamadas são independentes
 * - Retorna objeto com resultados nomeados
 * 
 * COMBINELATEST:
 * - Emite quando qualquer observable emite
 * - Mantém último valor de todos os outros
 * - Bom para fluxos que precisam reagir a mudanças
 * - Útil para interfaces reativas
 * 
 * BENEFÍCIOS DAS SOLUÇÕES:
 * 1. Sem memory leaks (takeUntil/take)
 * 2. Código mais limpo e legível
 * 3. Tratamento de erros centralizado
 * 4. Performance melhor (sem subscriptions aninhadas)
 * 5. Manutenibilidade superior
 */

import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

export { 
  ComponenteOriginal, 
  ComponenteComSwitchMap, 
  ComponenteComForkJoin, 
  ComponenteComCombineLatest,
  ComponenteComAsyncPipe,
  PessoaService 
};
