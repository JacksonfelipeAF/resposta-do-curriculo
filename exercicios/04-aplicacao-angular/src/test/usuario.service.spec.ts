// Testes unitários do UsuarioService com Vitest

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { UsuarioService } from '../app/services/usuario.service';
import { Usuario, CreateUsuarioRequest } from '../app/models/usuario.model';

// Mock do HttpClient
const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
};

describe('UsuarioService', () => {
  let service: UsuarioService;

  beforeEach(() => {
    service = new UsuarioService(mockHttpClient as any);
    vi.clearAllMocks();
  });

  describe('getUsuarios', () => {
    it('deve retornar lista de usuários com paginação', async () => {
      // Arrange
      const mockResponse = {
        data: [
          { id: 1, nome: 'João', email: 'joao@teste.com' }
        ],
        total: 1,
        page: 1,
        pageSize: 10
      };

      mockHttpClient.get.mockReturnValue(of(mockResponse));

      // Act
      const result = await service.getUsuarios(1, 10).toPromise();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/usuarios', expect.any(Object));
    });

    it('deve tratar erro na busca de usuários', async () => {
      // Arrange
      const error = new Error('Erro de rede');
      mockHttpClient.get.mockReturnValue(throwError(() => error));

      // Act & Assert
      await expect(service.getUsuarios().toPromise()).rejects.toThrow();
    });
  });

  describe('createUsuario', () => {
    it('deve criar um novo usuário', async () => {
      // Arrange
      const novoUsuario: CreateUsuarioRequest = {
        nome: 'Novo Usuário',
        email: 'novo@teste.com',
        cpf: '123.456.789-00',
        telefone: '(11) 98765-4321',
        tipoTelefone: 'celular'
      };

      const usuarioCriado: Usuario = {
        id: 1,
        ...novoUsuario,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockHttpClient.post.mockReturnValue(of(usuarioCriado));

      // Act
      const result = await service.createUsuario(novoUsuario).toPromise();

      // Assert
      expect(result).toEqual(usuarioCriado);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/usuarios', novoUsuario);
    });

    it('deve tratar erro na criação de usuário', async () => {
      // Arrange
      const usuario: CreateUsuarioRequest = {
        nome: 'Teste',
        email: 'teste@teste.com',
        cpf: '123.456.789-00',
        telefone: '(11) 98765-4321',
        tipoTelefone: 'celular'
      };

      const error = new Error('Erro ao criar usuário');
      mockHttpClient.post.mockReturnValue(throwError(() => error));

      // Act & Assert
      await expect(service.createUsuario(usuario).toPromise()).rejects.toThrow();
    });
  });

  describe('updateUsuario', () => {
    it('deve atualizar um usuário existente', async () => {
      // Arrange
      const id = 1;
      const dadosAtualizacao = {
        nome: 'Usuário Atualizado'
      };

      const usuarioAtualizado: Usuario = {
        id,
        nome: 'Usuário Atualizado',
        email: 'usuario@teste.com',
        cpf: '123.456.789-00',
        telefone: '(11) 98765-4321',
        tipoTelefone: 'celular',
        updatedAt: new Date()
      };

      mockHttpClient.put.mockReturnValue(of(usuarioAtualizado));

      // Act
      const result = await service.updateUsuario(id, dadosAtualizacao).toPromise();

      // Assert
      expect(result).toEqual(usuarioAtualizado);
      expect(mockHttpClient.put).toHaveBeenCalledWith(`/api/usuarios/${id}`, dadosAtualizacao);
    });
  });

  describe('deleteUsuario', () => {
    it('deve excluir um usuário', async () => {
      // Arrange
      const id = 1;
      mockHttpClient.delete.mockReturnValue(of(void 0));

      // Act
      await service.deleteUsuario(id).toPromise();

      // Assert
      expect(mockHttpClient.delete).toHaveBeenCalledWith(`/api/usuarios/${id}`);
    });
  });

  describe('validarCPF', () => {
    it('deve validar CPF correto', () => {
      // Arrange
      const cpfValido = '123.456.789-09';

      // Act
      const resultado = service.validarCPF(cpfValido);

      // Assert
      expect(resultado).toBe(true);
    });

    it('deve rejeitar CPF inválido', () => {
      // Arrange
      const cpfInvalido = '111.111.111-11';

      // Act
      const resultado = service.validarCPF(cpfInvalido);

      // Assert
      expect(resultado).toBe(false);
    });

    it('deve rejeitar CPF com formato incorreto', () => {
      // Arrange
      const cpfFormatoInvalido = '123456789';

      // Act
      const resultado = service.validarCPF(cpfFormatoInvalido);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('validarEmail', () => {
    it('deve validar email correto', () => {
      // Arrange
      const emailValido = 'usuario@dominio.com';

      // Act
      const resultado = service.validarEmail(emailValido);

      // Assert
      expect(resultado).toBe(true);
    });

    it('deve rejeitar email inválido', () => {
      // Arrange
      const emailInvalido = 'email-invalido';

      // Act
      const resultado = service.validarEmail(emailInvalido);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('validarTelefone', () => {
    it('deve validar telefone celular correto', () => {
      // Arrange
      const telefoneValido = '(11) 98765-4321';

      // Act
      const resultado = service.validarTelefone(telefoneValido);

      // Assert
      expect(resultado).toBe(true);
    });

    it('deve validar telefone fixo correto', () => {
      // Arrange
      const telefoneValido = '(11) 2345-6789';

      // Act
      const resultado = service.validarTelefone(telefoneValido);

      // Assert
      expect(resultado).toBe(true);
    });

    it('deve rejeitar telefone inválido', () => {
      // Arrange
      const telefoneInvalido = '123456';

      // Act
      const resultado = service.validarTelefone(telefoneInvalido);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('buscarUsuarios', () => {
    it('deve buscar usuários por nome', async () => {
      // Arrange
      const termo = 'João';
      const usuariosEncontrados = [
        { id: 1, nome: 'João Silva', email: 'joao@teste.com' }
      ];

      mockHttpClient.get.mockReturnValue(of(usuariosEncontrados));

      // Act
      const result = await service.buscarUsuarios(termo).toPromise();

      // Assert
      expect(result).toEqual(usuariosEncontrados);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/usuarios', expect.any(Object));
    });

    it('deve retornar array vazio para termo vazio', async () => {
      // Arrange
      const termoVazio = '';

      // Act
      const result = await service.buscarUsuarios(termoVazio).toPromise();

      // Assert
      expect(result).toEqual([]);
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });
  });

  describe('getUsuarioById', () => {
    it('deve buscar usuário por ID', async () => {
      // Arrange
      const id = 1;
      const usuario = { id: 1, nome: 'João', email: 'joao@teste.com' };
      mockHttpClient.get.mockReturnValue(of(usuario));

      // Act
      const result = await service.getUsuarioById(id).toPromise();

      // Assert
      expect(result).toEqual(usuario);
      expect(mockHttpClient.get).toHaveBeenCalledWith(`/api/usuarios/${id}`);
    });

    it('deve lançar erro se usuário não for encontrado', async () => {
      // Arrange
      const id = 999;
      mockHttpClient.get.mockReturnValue(throwError(() => new Error('Não encontrado')));

      // Act & Assert
      await expect(service.getUsuarioById(id).toPromise()).rejects.toThrow('Usuário não encontrado');
    });
  });
});
