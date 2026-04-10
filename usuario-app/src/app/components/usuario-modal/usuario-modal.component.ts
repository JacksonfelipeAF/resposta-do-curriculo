// Modal de criação/edição de usuário com formulário reativo e validações

import { 
  Component, 
  Inject, 
  OnInit, 
  OnDestroy,
  signal,
  computed
} from '@angular/core';
import { 
  MAT_DIALOG_DATA, 
  MatDialogRef, 
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { Observable, of, EMPTY } from 'rxjs';
import { 
  switchMap,
  catchError,
  map,
  startWith,
  debounceTime,
  distinctUntilChanged
} from 'rxjs/operators';

import { Usuario, CreateUsuarioRequest, UpdateUsuarioRequest } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';

export interface UsuarioModalData {
  modo: 'criar' | 'editar';
  usuario?: Usuario;
}

@Component({
  selector: 'app-usuario-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatChipsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ],
  templateUrl: './usuario-modal.component.html',
  styleUrls: ['./usuario-modal.component.scss']
})
export class UsuarioModalComponent implements OnInit, OnDestroy {
  // Signals para estado
  private loadingSignal = signal<boolean>(false);
  private cpfValidoSignal = signal<boolean>(true);
  private emailValidoSignal = signal<boolean>(true);
  private telefoneValidoSignal = signal<boolean>(true);
  
  readonly loading = this.loadingSignal.asReadonly();
  readonly cpfValido = this.cpfValidoSignal.asReadonly();
  readonly emailValido = this.emailValidoSignal.asReadonly();
  readonly telefoneValido = this.telefoneValidoSignal.asReadonly();
  
  // Formulário reativo
  usuarioForm: FormGroup;
  
  // Dados do modal
  modo: 'criar' | 'editar';
  usuario?: Usuario;
  
  // Opções para select
  tiposTelefone = [
    { value: 'celular', label: 'Celular' },
    { value: 'fixo', label: 'Fixo' },
    { value: 'comercial', label: 'Comercial' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private dialogRef: MatDialogRef<UsuarioModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UsuarioModalData
  ) {
    this.modo = data.modo;
    this.usuario = data.usuario;
    
    this.usuarioForm = this.criarFormulario();
    
    if (this.modo === 'editar' && this.usuario) {
      this.preencherFormulario();
    }
  }
  
  ngOnInit(): void {
    this.configurarValidacoesEmTempoReal();
  }
  
  ngOnDestroy(): void {
    // Cleanup se necessário
  }
  
  // Criar formulário com validações
  private criarFormulario(): FormGroup {
    return this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/) // Apenas letras e espaços
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(255)
      ]],
      cpf: ['', [
        Validators.required,
        Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/) // Formato CPF
      ]],
      telefone: ['', [
        Validators.required,
        Validators.pattern(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/) // Formato telefone
      ]],
      tipoTelefone: ['celular', Validators.required]
    });
  }
  
  // Preencher formulário em modo edição
  private preencherFormulario(): void {
    if (this.usuario) {
      this.usuarioForm.patchValue({
        nome: this.usuario.nome,
        email: this.usuario.email,
        cpf: this.usuario.cpf,
        telefone: this.usuario.telefone,
        tipoTelefone: this.usuario.tipoTelefone
      });
    }
  }
  
  // Configurar validações em tempo real
  private configurarValidacoesEmTempoReal(): void {
    // Validação de CPF em tempo real
    this.usuarioForm.get('cpf')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(cpf => {
      if (cpf && cpf.length === 14) { // Formato completo
        this.cpfValidoSignal.set(this.usuarioService.validarCPF(cpf));
      } else {
        this.cpfValidoSignal.set(true); // Não validar enquanto estiver digitando
      }
    });
    
    // Validação de email em tempo real
    this.usuarioForm.get('email')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(email => {
      if (email && this.usuarioForm.get('email')?.valid) {
        this.emailValidoSignal.set(this.usuarioService.validarEmail(email));
      } else {
        this.emailValidoSignal.set(true);
      }
    });
    
    // Validação de telefone em tempo real
    this.usuarioForm.get('telefone')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(telefone => {
      if (telefone && this.usuarioForm.get('telefone')?.valid) {
        this.telefoneValidoSignal.set(this.usuarioService.validarTelefone(telefone));
      } else {
        this.telefoneValidoSignal.set(true);
      }
    });
  }
  
  // Formatar CPF enquanto digita
  onCpfInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    this.usuarioForm.get('cpf')?.setValue(value, { emitEvent: false });
  }
  
  // Formatar telefone enquanto digita
  onTelefoneInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
    }
    
    this.usuarioForm.get('telefone')?.setValue(value, { emitEvent: false });
  }
  
  // Verificar se formulário é válido
  get formularioValido(): boolean {
    return this.usuarioForm.valid && 
           this.cpfValido() && 
           this.emailValido() && 
           this.telefoneValido();
  }
  
  // Salvar usuário
  salvar(): void {
    if (!this.formularioValido) {
      this.marcarCamposComoTouched();
      return;
    }
    
    this.loadingSignal.set(true);
    
    const dados = this.usuarioForm.value;
    
    if (this.modo === 'criar') {
      this.criarUsuario(dados);
    } else {
      this.atualizarUsuario(dados);
    }
  }
  
  // Criar novo usuário
  private criarUsuario(dados: CreateUsuarioRequest): void {
    this.usuarioService.createUsuario(dados).pipe(
      catchError(erro => {
        console.error('Erro ao criar usuário:', erro);
        return EMPTY;
      })
    ).subscribe(usuario => {
      this.loadingSignal.set(false);
      this.dialogRef.close(usuario);
    });
  }
  
  // Atualizar usuário existente
  private atualizarUsuario(dados: UpdateUsuarioRequest): void {
    if (!this.usuario) return;
    
    this.usuarioService.updateUsuario(this.usuario.id, dados).pipe(
      catchError(erro => {
        console.error('Erro ao atualizar usuário:', erro);
        return EMPTY;
      })
    ).subscribe(usuario => {
      this.loadingSignal.set(false);
      this.dialogRef.close(usuario);
    });
  }
  
  // Cancelar
  cancelar(): void {
    this.dialogRef.close(null);
  }
  
  // Marcar campos como touched para mostrar erros
  private marcarCamposComoTouched(): void {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      this.usuarioForm.get(key)?.markAsTouched();
    });
  }
  
  // Getters para facilitar acesso aos campos no template
  get nome(): FormControl {
    return this.usuarioForm.get('nome') as FormControl;
  }
  
  get email(): FormControl {
    return this.usuarioForm.get('email') as FormControl;
  }
  
  get cpf(): FormControl {
    return this.usuarioForm.get('cpf') as FormControl;
  }
  
  get telefone(): FormControl {
    return this.usuarioForm.get('telefone') as FormControl;
  }
  
  get tipoTelefone(): FormControl {
    return this.usuarioForm.get('tipoTelefone') as FormControl;
  }
  
  // Mensagens de erro
  getMensagemErro(campo: string): string {
    const control = this.usuarioForm.get(campo);
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    
    const errors = control.errors;
    
    if (errors['required']) {
      return 'Campo obrigatório';
    }
    
    if (errors['email']) {
      return 'E-mail inválido';
    }
    
    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }
    
    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    
    if (errors['pattern']) {
      switch (campo) {
        case 'nome':
          return 'Apenas letras e espaços permitidos';
        case 'cpf':
          return 'Formato: XXX.XXX.XXX-XX';
        case 'telefone':
          return 'Formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX';
        default:
          return 'Formato inválido';
      }
    }
    
    return 'Campo inválido';
  }
  
  // Título do modal
  get tituloModal(): string {
    return this.modo === 'criar' ? 'Novo Usuário' : 'Editar Usuário';
  }
  
  // Texto do botão principal
  get textoBotaoPrincipal(): string {
    return this.modo === 'criar' ? 'Criar' : 'Salvar';
  }
}
