// 2.1 - Change Detection e OnPush

import { ChangeDetectionStrategy, Component, Injectable, OnInit, OnDestroy } from '@angular/core';
import { of, Subscription, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable()
class PessoaService {
  /** @description Mock de uma busca em API com retorno em 0.5 segundos */
  buscarPorId(id: number) {
    return of({ id, nome: 'João' }).pipe(delay(500));
  }
}

@Component({
  selector: 'app-root',
  providers: [PessoaService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>{{ texto }}</h1>
             <p>Contador: {{ contador }}</p>
             <p>Timestamp: {{ timestamp }}</p>`,
  standalone: true
})
export class AppComponent implements OnInit, OnDestroy {
  texto: string;
  contador = 0;
  timestamp = Date.now();
  subscriptionBuscarPessoa: Subscription;
  private contadorInterval: any;
  
  // SOLUÇÃO: Usar BehaviorSubject para tornar o estado reativo
  private textoSubject = new BehaviorSubject<string>('');
  readonly texto$ = this.textoSubject.asObservable();
  
  constructor(private readonly pessoaService: PessoaService) {}

  ngOnInit(): void {
    // SOLUÇÃO 1: Manter referência ao observable e usar async pipe no template
    this.subscriptionBuscarPessoa = this.pessoaService.buscarPorId(1).subscribe((pessoa) => {
      this.texto = `Nome: ${pessoa.nome}`;
      this.textoSubject.next(this.texto); // Disparar change detection
      this.timestamp = Date.now(); // Mudar outra propriedade para forçar CD
    });

    // SOLUÇÃO 2: Usar zone.run() para forçar change detection
    this.contadorInterval = setInterval(() => {
      this.contador++;
      this.timestamp = Date.now(); // Mudar timestamp para forçar CD
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.subscriptionBuscarPessoa) {
      this.subscriptionBuscarPessoa.unsubscribe();
    }
    if (this.contadorInterval) {
      clearInterval(this.contadorInterval);
    }
    this.textoSubject.complete();
  }
}

// VERSÃO CORRIGIDA COM MELHORES PRÁTICAS

import { ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root-corrigido',
  providers: [PessoaService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>{{ texto$ | async }}</h1>
             <p>Contador: {{ contador$ | async }}</p>
             <p>Timestamp: {{ timestamp$ | async }}</p>`,
  standalone: true
})
export class AppComponentCorrigido implements OnInit {
  // Usar signals (Angular 16+) ou observables para estado reativo
  readonly texto$ = new BehaviorSubject<string>('');
  readonly contador$ = new BehaviorSubject<number>(0);
  readonly timestamp$ = new BehaviorSubject<number>(Date.now());
  
  constructor(
    private readonly pessoaService: PessoaService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Abordagem reativa com async pipe
    this.pessoaService.buscarPorId(1).subscribe((pessoa) => {
      this.texto$.next(`Nome: ${pessoa.nome}`);
      this.timestamp$.next(Date.now());
    });

    // Usar RxJS para contador reativo
    interval(1000).pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      const novoContador = this.contador$.value + 1;
      this.contador$.next(novoContador);
      this.timestamp$.next(Date.now());
    });
  }
}

// EXPLICAÇÃO DO PROBLEMA:

/**
 * PROBLEMA IDENTIFICADO:
 * O componente usa ChangeDetectionStrategy.OnPush, mas o nome não é exibido porque:
 * 
 * 1. OnPush só executa change detection quando:
 *    - Novos inputs são recebidos (referência diferente)
 *    - Eventos são disparados do componente ou template
 *    - Observables usados com async pipe emitem novos valores
 *    - ChangeDetectorRef.markForCheck() é chamado explicitamente
 * 
 * 2. No código original:
 *    - this.texto = `Nome: ${pessoa.nome}` é assíncrono (dentro de subscribe)
 *    - OnPush não detecta mudanças assíncronas automaticamente
 *    - setInterval também não dispara change detection
 * 
 * SOLUÇÕES POSSÍVEIS (sem alterar estratégia):
 * 
 * 1. Usar ChangeDetectorRef.markForCheck() após atualizar propriedades
 * 2. Usar observables com async pipe no template
 * 3. Usar signals (Angular 16+)
 * 4. Usar zone.run() para forçar change detection
 * 5. Mudar alguma propriedade que está no template para forçar CD
 */

export { PessoaService, AppComponent, AppComponentCorrigido };
