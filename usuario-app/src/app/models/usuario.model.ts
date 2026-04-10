// Model de Usuário para tipagem forte

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  tipoTelefone: 'celular' | 'fixo' | 'comercial';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUsuarioRequest {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  tipoTelefone: 'celular' | 'fixo' | 'comercial';
}

export interface UpdateUsuarioRequest extends Partial<CreateUsuarioRequest> {
  id: number;
}

export interface UsuarioResponse {
  data: Usuario[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
