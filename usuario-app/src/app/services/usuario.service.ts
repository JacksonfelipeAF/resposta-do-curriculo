// Serviço de Usuários com RxJS e tratamento de erros

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { 
  map, 
  catchError, 
  debounceTime, 
  distinctUntilChanged, 
  switchMap,
  tap,
  delay,
  finalize
} from 'rxjs/operators';
import { 
  Usuario, 
  CreateUsuarioRequest, 
  UpdateUsuarioRequest, 
  UsuarioResponse,
  ApiError 
} from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = '/api/usuarios';
  
  // Mock data para desenvolvimento
  private mockUsuarios: Usuario[] = [
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao.silva@email.com',
      cpf: '123.456.789-00',
      telefone: '(11) 98765-4321',
      tipoTelefone: 'celular',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria.santos@email.com',
      cpf: '987.654.321-00',
      telefone: '(11) 2345-6789',
      tipoTelefone: 'fixo',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    },
    {
      id: 3,
      nome: 'Pedro Oliveira',
      email: 'pedro.oliveira@email.com',
      cpf: '456.789.123-00',
      telefone: '(11) 91234-5678',
      tipoTelefone: 'celular',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03')
    },
    {
      id: 4,
      nome: 'Ana Costa',
      email: 'ana.costa@email.com',
      cpf: '789.123.456-00',
      telefone: '(11) 3456-7890',
      tipoTelefone: 'comercial',
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-04')
    },
    {
      id: 5,
      nome: 'Carlos Pereira',
      email: 'carlos.pereira@email.com',
      cpf: '321.654.987-00',
      telefone: '(11) 98765-4321',
      tipoTelefone: 'celular',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05')
    }
  ];

  constructor(private http: HttpClient) {}

  // Método para buscar todos os usuários com paginação
  getUsuarios(page: number = 1, pageSize: number = 10): Observable<UsuarioResponse> {
    // Mock implementation - em produção usaria HttpClient real
    return of(this.mockUsuarios).pipe(
      delay(800), // Simular latência de rede
      map(usuarios => {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = usuarios.slice(startIndex, endIndex);
        
        return {
          data: paginatedData,
          total: usuarios.length,
          page,
          pageSize
        };
      }),
      catchError(this.handleError)
    );
  }

  // Método para buscar usuários com filtro (debounce implementado no componente)
  buscarUsuarios(nome: string): Observable<Usuario[]> {
    if (!nome || nome.trim().length === 0) {
      return of([]);
    }

    return of(this.mockUsuarios).pipe(
      delay(500), // Simular latência de busca
      map(usuarios => 
        usuarios.filter(usuario => 
          usuario.nome.toLowerCase().includes(nome.toLowerCase()) ||
          usuario.email.toLowerCase().includes(nome.toLowerCase())
        )
      ),
      catchError(this.handleError)
    );
  }

  // Método para criar usuário
  createUsuario(usuario: CreateUsuarioRequest): Observable<Usuario> {
    const novoUsuario: Usuario = {
      id: Math.max(...this.mockUsuarios.map(u => u.id)) + 1,
      ...usuario,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return of(novoUsuario).pipe(
      delay(600), // Simular criação
      tap(() => {
        this.mockUsuarios.push(novoUsuario);
      }),
      catchError(this.handleError)
    );
  }

  // Método para atualizar usuário
  updateUsuario(id: number, usuario: UpdateUsuarioRequest): Observable<Usuario> {
    const index = this.mockUsuarios.findIndex(u => u.id === id);
    if (index === -1) {
      return throwError(() => new Error('Usuário não encontrado'));
    }

    const usuarioAtualizado: Usuario = {
      ...this.mockUsuarios[index],
      ...usuario,
      updatedAt: new Date()
    };

    return of(usuarioAtualizado).pipe(
      delay(400), // Simular atualização
      tap(() => {
        this.mockUsuarios[index] = usuarioAtualizado;
      }),
      catchError(this.handleError)
    );
  }

  // Método para deletar usuário
  deleteUsuario(id: number): Observable<void> {
    return of(void 0).pipe(
      delay(300), // Simular deleção
      tap(() => {
        const index = this.mockUsuarios.findIndex(u => u.id === id);
        if (index !== -1) {
          this.mockUsuarios.splice(index, 1);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Método para buscar usuário por ID
  getUsuarioById(id: number): Observable<Usuario> {
    const usuario = this.mockUsuarios.find(u => u.id === id);
    if (!usuario) {
      return throwError(() => new Error('Usuário não encontrado'));
    }

    return of(usuario).pipe(
      delay(200),
      catchError(this.handleError)
    );
  }

  // Tratamento centralizado de erros
  private handleError(error: HttpErrorResponse | Error): Observable<never> {
    let errorMessage = 'Ocorreu um erro inesperado';

    if (error instanceof HttpErrorResponse) {
      // Erro HTTP
      if (error.error instanceof ErrorEvent) {
        // Erro do lado do cliente
        errorMessage = `Erro do cliente: ${error.error.message}`;
      } else {
        // Erro do lado do servidor
        errorMessage = `Erro do servidor: ${error.status} - ${error.message}`;
      }
    } else if (error instanceof Error) {
      // Erro genérico
      errorMessage = error.message;
    }

    console.error('Erro no UsuarioService:', error);
    
    // Retornar um erro formatado
    return throwError(() => ({
      message: errorMessage,
      code: error instanceof HttpErrorResponse ? error.status.toString() : 'UNKNOWN',
      details: error
    } as ApiError));
  }

  // Método para validação de CPF (bônus)
  validarCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais (CPF inválido)
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
    
    // Validação do CPF (algoritmo simplificado)
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
      soma = soma + parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;
    
    soma = 0;
    
    for (let i = 1; i <= 10; i++) {
      soma = soma + parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;
    
    return true;
  }

  // Método para validação de email (bônus)
  validarEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Método para validação de telefone (bônus)
  validarTelefone(telefone: string): boolean {
    const telefoneLimpo = telefone.replace(/\D/g, '');
    return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11;
  }
}
