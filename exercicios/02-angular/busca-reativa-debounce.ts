// 2.3 - RxJS - busca com debounce

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, of, EMPTY } from 'rxjs';
import { 
  debounceTime, 
  distinctUntilChanged, 
  switchMap, 
  catchError, 
  startWith, 
  tap,
  filter,
  takeUntil
} from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';

// Interface para tipagem
interface Usuario {
  id: number;
  nome: string;
  email: string;
}

// Serviço de busca
@Injectable({
  providedIn: 'root'
})
class BuscaService {
  private usuarios: Usuario[] = [
    { id: 1, nome: 'João Silva', email: 'joao@email.com' },
    { id: 2, nome: 'Maria Santos', email: 'maria@email.com' },
    { id: 3, nome: 'Pedro Oliveira', email: 'pedro@email.com' },
    { id: 4, nome: 'Ana Costa', email: 'ana@email.com' },
    { id: 5, nome: 'Carlos Pereira', email: 'carlos@email.com' }
  ];

  buscarUsuarios(termo: string) {
    // Simula chamada HTTP com delay
    return of(this.usuarios.filter(usuario => 
      usuario.nome.toLowerCase().includes(termo.toLowerCase())
    )).pipe(
      delay(300) // Simula latência de rede
    );
  }
}

// Componente de busca reativo
@Component({
  selector: 'app-busca-reativa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="busca-container">
      <h2>Busca de Usuários</h2>
      
      <div class="campo-busca">
        <input 
          type="text" 
          [formControl]="campoBusca"
          placeholder="Digite para buscar..."
          class="input-busca"
        />
        
        <!-- Indicador de loading -->
        <div *ngIf="loading$ | async" class="loading">
          <span class="spinner"></span>
          Buscando...
        </div>
      </div>

      <!-- Mensagem de erro -->
      <div *ngIf="erro$ | async" class="erro">
        {{ erro$ | async }}
      </div>

      <!-- Resultados da busca -->
      <div class="resultados">
        <h3>Resultados ({{ resultados$ | async }})</h3>
        
        <div *ngIf="(resultados$ | async)?.length === 0 && !loading$ | async" class="sem-resultados">
          Nenhum resultado encontrado
        </div>
        
        <ul *ngIf="(resultados$ | async)?.length > 0" class="lista-resultados">
          <li *ngFor="let usuario of (resultados$ | async)" class="item-usuario">
            <strong>{{ usuario.nome }}</strong> - {{ usuario.email }}
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .busca-container {
      max-width: 500px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    
    .campo-busca {
      position: relative;
      margin-bottom: 20px;
    }
    
    .input-busca {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 16px;
    }
    
    .loading {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      gap: 5px;
      color: #666;
      font-size: 14px;
    }
    
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .erro {
      color: #e74c3c;
      background: #fdf2f2;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 15px;
    }
    
    .resultados h3 {
      margin-bottom: 10px;
      color: #333;
    }
    
    .sem-resultados {
      color: #666;
      font-style: italic;
      text-align: center;
      padding: 20px;
    }
    
    .lista-resultados {
      list-style: none;
      padding: 0;
    }
    
    .item-usuario {
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    
    .item-usuario:last-child {
      border-bottom: none;
    }
    
    .item-usuario:hover {
      background: #f8f9fa;
    }
  `]
})
export class BuscaReativaComponent implements OnInit, OnDestroy {
  campoBusca = new FormControl('');
  
  // Observables para gerenciar estado
  private termosBusca$ = new Subject<string>();
  private loading$ = new BehaviorSubject<boolean>(false);
  private erro$ = new BehaviorSubject<string>('');
  private resultados$ = new BehaviorSubject<Usuario[]>([]);
  
  // Expor observables para o template com async pipe
  readonly loading = this.loading$.asObservable();
  readonly erro = this.erro$.asObservable();
  readonly resultados = this.resultados$.asObservable();
  
  private destroy$ = new Subject<void>();
  
  constructor(private buscaService: BuscaService) {}
  
  ngOnInit(): void {
    // Configurar stream de busca reativa
    this.termosBusca$.pipe(
      // Esperar 500ms após usuário parar de digitar
      debounceTime(500),
      
      // Evitar buscas duplicadas
      distinctUntilChanged(),
      
      // Filtrar termos vazios
      filter(termo => termo.trim().length > 0),
      
      // Indicar início do loading
      tap(() => this.loading$.next(true)),
      
      // Cancelar busca anterior e fazer nova (evita race condition)
      switchMap(termo => 
        this.buscaService.buscarUsuarios(termo).pipe(
          // Tratar erros da busca
          catchError(erro => {
            console.error('Erro na busca:', erro);
            this.erro$.next('Erro ao buscar usuários. Tente novamente.');
            this.loading$.next(false);
            return EMPTY; // Não continuar o stream
          })
        )
      ),
      
      // Indicar fim do loading
      tap(() => this.loading$.next(false)),
      
      // Auto-completar para evitar memory leaks
      takeUntil(this.destroy$)
    ).subscribe(
      resultados => {
        this.resultados$.next(resultados);
        this.erro$.next(''); // Limpar erro em caso de sucesso
      }
    );
    
    // Observable para mudanças no campo de busca
    this.campoBusca.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(valor => {
      if (valor) {
        this.termosBusca$.next(valor);
      } else {
        // Limpar resultados quando campo está vazio
        this.resultados$.next([]);
        this.erro$.next('');
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Completar todos os subjects
    this.termosBusca$.complete();
    this.loading$.complete();
    this.erro$.complete();
    this.resultados$.complete();
  }
}

// Versão simplificada sem form control (usando Subject direto)
@Component({
  selector: 'app-busca-simplificada',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="busca-simplificada">
      <input 
        #inputBusca
        type="text" 
        placeholder="Buscar usuários..."
        (keyup)="onInputChange(inputBusca.value)"
        class="input-busca"
      />
      
      <div *ngIf="loading" class="loading">Buscando...</div>
      
      <ul *ngIf="resultados.length > 0">
        <li *ngFor="let usuario of resultados">
          {{ usuario.nome }} - {{ usuario.email }}
        </li>
      </ul>
      
      <div *ngIf="resultados.length === 0 && !loading && termoDigitado" class="sem-resultados">
        Nenhum resultado
      </div>
    </div>
  `,
  styles: [`
    .busca-simplificada {
      padding: 20px;
      max-width: 400px;
    }
    .input-busca {
      width: 100%;
      padding: 8px;
      margin-bottom: 10px;
    }
    .loading {
      color: #666;
      font-style: italic;
    }
    .sem-resultados {
      color: #999;
      text-align: center;
      padding: 20px;
    }
  `]
})
export class BuscaSimplificadaComponent implements OnInit, OnDestroy {
  resultados: Usuario[] = [];
  loading = false;
  termoDigitado = false;
  
  private buscaSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  constructor(private buscaService: BuscaService) {}
  
  ngOnInit(): void {
    this.buscaSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(termo => termo.trim().length > 0),
      tap(() => {
        this.loading = true;
        this.termoDigitado = true;
      }),
      switchMap(termo => 
        this.buscaService.buscarUsuarios(termo).pipe(
          catchError(() => {
            this.loading = false;
            return of([]);
          })
        )
      ),
      takeUntil(this.destroy$)
    ).subscribe(resultados => {
      this.resultados = resultados;
      this.loading = false;
    });
  }
  
  onInputChange(valor: string): void {
    if (!valor) {
      this.resultados = [];
      this.termoDigitado = false;
      return;
    }
    this.buscaSubject.next(valor);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.buscaSubject.complete();
  }
}

// Mock do delay para simulação
function delay(ms: number) {
  return (source: any) => source.pipe(
    // Implementação simplificada - em projeto real usar o operador delay do RxJS
    new Observable(observer => {
      setTimeout(() => {
        source.subscribe(observer);
      }, ms);
    })
  );
}

import { Injectable, Observable } from '@angular/core';
import { newObservable } from 'rxjs';

export { BuscaReativaComponent, BuscaSimplificadaComponent, BuscaService, Usuario };
