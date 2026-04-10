// Componente de Lista de Usuários com RxJS, OnPush e trackBy

import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy,
  signal,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable, Subject, of, EMPTY } from 'rxjs';
import { 
  debounceTime, 
  distinctUntilChanged, 
  switchMap,
  catchError,
  startWith,
  takeUntil,
  finalize
} from 'rxjs/operators';

import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioModalComponent } from '../usuario-modal/usuario-modal.component';

@Component({
  selector: 'app-usuario-lista',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './usuario-lista.component.html',
  styleUrls: ['./usuario-lista.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuarioListaComponent implements OnInit, OnDestroy {
  // Signals para estado reativo (Angular 16+)
  private usuariosSignal = signal<Usuario[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string>('');
  private searchTermSignal = signal<string>('');
  
  // Exposição readonly para o template
  readonly usuarios = this.usuariosSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly searchTerm = this.searchTermSignal.asReadonly();
  
  // Computed para usuários filtrados
  readonly usuariosFiltrados = computed(() => {
    const usuarios = this.usuariosSignal();
    const term = this.searchTermSignal();
    
    if (!term || term.trim().length === 0) {
      return usuarios;
    }
    
    return usuarios.filter(usuario => 
      usuario.nome.toLowerCase().includes(term.toLowerCase()) ||
      usuario.email.toLowerCase().includes(term.toLowerCase())
    );
  });
  
  // Formulário de busca
  buscaForm: FormGroup;
  
  // Subjects para gerenciamento de subscriptions
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();
  
  // Injeção de dependências
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  
  constructor() {
    this.buscaForm = this.fb.group({
      busca: ['', [Validators.minLength(2)]]
    });
  }
  
  ngOnInit(): void {
    this.carregarUsuarios();
    this.configurarBuscaReativa();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject$.complete();
  }
  
  // Método para carregar usuários
  private carregarUsuarios(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set('');
    
    this.usuarioService.getUsuarios().pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loadingSignal.set(false)),
      catchError(erro => {
        this.errorSignal.set('Erro ao carregar usuários. Tente novamente.');
        this.mostrarMensagem('Erro ao carregar usuários', 'error');
        return of({ data: [], total: 0, page: 1, pageSize: 10 });
      })
    ).subscribe(response => {
      this.usuariosSignal.set(response.data);
    });
  }
  
  // Configurar busca reativa com debounce
  private configurarBuscaReativa(): void {
    this.buscaForm.get('busca')?.valueChanges.pipe(
      debounceTime(300), // Aguardar 300ms após parar de digitar
      distinctUntilChanged(), // Evitar buscas duplicadas
      takeUntil(this.destroy$)
    ).subscribe(termo => {
      this.searchTermSignal.set(termo || '');
    });
    
    // Stream de busca com RxJS (alternativa usando switchMap)
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(termo => {
        if (!termo || termo.trim().length === 0) {
          return of([]);
        }
        
        this.loadingSignal.set(true);
        return this.usuarioService.buscarUsuarios(termo).pipe(
          catchError(erro => {
            this.mostrarMensagem('Erro na busca', 'error');
            return of([]);
          }),
          finalize(() => this.loadingSignal.set(false))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(resultados => {
      // Se houver termo de busca, atualizar com resultados filtrados
      if (this.searchTermSignal()) {
        // Poderíamos usar os resultados do serviço aqui
        // Por enquanto, usamos o computed filter
      }
    });
  }
  
  // Método para abrir modal de criação
  abrirModalCriar(): void {
    const dialogRef = this.dialog.open(UsuarioModalComponent, {
      width: '500px',
      data: { modo: 'criar' }
    });
    
    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$)
    ).subscribe(resultado => {
      if (resultado) {
        this.criarUsuario(resultado);
      }
    });
  }
  
  // Método para abrir modal de edição
  abrirModalEditar(usuario: Usuario): void {
    const dialogRef = this.dialog.open(UsuarioModalComponent, {
      width: '500px',
      data: { modo: 'editar', usuario }
    });
    
    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$)
    ).subscribe(resultado => {
      if (resultado) {
        this.atualizarUsuario(usuario.id, resultado);
      }
    });
  }
  
  // Método para criar usuário
  private criarUsuario(dados: any): void {
    this.loadingSignal.set(true);
    
    this.usuarioService.createUsuario(dados).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loadingSignal.set(false)),
      catchError(erro => {
        this.mostrarMensagem('Erro ao criar usuário', 'error');
        return EMPTY;
      })
    ).subscribe(novoUsuario => {
      // Atualizar lista com novo usuário (immutability para OnPush)
      this.usuariosSignal.set([...this.usuariosSignal(), novoUsuario]);
      this.mostrarMensagem('Usuário criado com sucesso!', 'success');
    });
  }
  
  // Método para atualizar usuário
  private atualizarUsuario(id: number, dados: any): void {
    this.loadingSignal.set(true);
    
    this.usuarioService.updateUsuario(id, dados).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loadingSignal.set(false)),
      catchError(erro => {
        this.mostrarMensagem('Erro ao atualizar usuário', 'error');
        return EMPTY;
      })
    ).subscribe(usuarioAtualizado => {
      // Atualizar lista (immutability para OnPush)
      this.usuariosSignal.set(
        this.usuariosSignal().map(u => u.id === id ? usuarioAtualizado : u)
      );
      this.mostrarMensagem('Usuário atualizado com sucesso!', 'success');
    });
  }
  
  // Método para excluir usuário
  excluirUsuario(usuario: Usuario): void {
    if (!confirm(`Tem certeza que deseja excluir ${usuario.nome}?`)) {
      return;
    }
    
    this.usuarioService.deleteUsuario(usuario.id).pipe(
      takeUntil(this.destroy$),
      catchError(erro => {
        this.mostrarMensagem('Erro ao excluir usuário', 'error');
        return EMPTY;
      })
    ).subscribe(() => {
      // Atualizar lista (immutability para OnPush)
      this.usuariosSignal.set(
        this.usuariosSignal().filter(u => u.id !== usuario.id)
      );
      this.mostrarMensagem('Usuário excluído com sucesso!', 'success');
    });
  }
  
  // Método para retry em caso de erro
  retryCarregar(): void {
    this.carregarUsuarios();
  }
  
  // Método para mostrar mensagens
  private mostrarMensagem(mensagem: string, tipo: 'success' | 'error' = 'success'): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      panelClass: tipo === 'error' ? ['error-snackbar'] : ['success-snackbar']
    });
  }
  
  // TrackBy function para performance
  trackByUsuarioId(index: number, usuario: Usuario): number {
    return usuario.id;
  }
  
  // Getters para facilitar acesso no template
  get hasUsuarios(): boolean {
    return this.usuariosSignal().length > 0;
  }
  
  get hasError(): boolean {
    return !!this.errorSignal();
  }
  
  get isLoading(): boolean {
    return this.loadingSignal();
  }
  
  get filteredCount(): number {
    return this.usuariosFiltrados().length;
  }
}
