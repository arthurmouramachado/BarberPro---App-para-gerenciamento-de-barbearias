export type Funcao = 'ADMIN' | 'BARBEIRO' | 'CLIENTE';

export class CreateUserDto {
  nome!: string;
  email!: string;
  senha!: string;
  funcao!: Funcao;
  data_nascimento!: string;
  telefone?: string;

  // campos do barbeiro
  especialidade!: string;
  bio?: string;
  ativo?: boolean;
}
