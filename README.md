# BarberPro

### Aplicativo de Agendamento de Barbearia

O **BarberPro** é uma aplicação mobile desenvolvida para facilitar o
agendamento de serviços e o gerenciamento da rotina de barbearias.

O projeto foi desenvolvido como **Trabalho de Conclusão de Curso (TCC)**
do curso de **Análise e Desenvolvimento de Sistemas**, reunindo em uma
única aplicação funcionalidades destinadas a clientes, barbeiros e
administradores.

O sistema é composto por uma aplicação mobile desenvolvida com
**React Native e Expo**, integrada a uma **API REST em NestJS**,
utilizando **PostgreSQL** como banco de dados e **Prisma ORM** para
comunicação com o banco.

---

## Trabalho de Conclusão de Curso

**Título:** BarberPro: Aplicativo de Agendamento de Barbearia  
**Autor:** Arthur Moura Machado  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Instituição:** IMESA / FEMA  
**Orientador:** Prof. Dr. Alex Sandro Romeo de Souza Poletto  
**Ano:** 2026  

---

## Sobre o projeto

Com o crescimento do uso de dispositivos móveis, diversos serviços
passaram a ser realizados através de aplicativos.

Entretanto, em muitas barbearias o processo de agendamento ainda é
realizado manualmente, por telefone ou por aplicativos de mensagens.

Esse processo pode provocar problemas como:

- conflitos de horários;
- esquecimentos;
- atrasos;
- dificuldade na organização da agenda;
- falhas de comunicação entre clientes e profissionais.

Pensando nesse cenário, foi desenvolvido o **BarberPro**, uma solução
mobile que procura centralizar o processo de agendamento e auxiliar
na gestão dos serviços oferecidos pelas barbearias.

---

## Motivação

A ideia do BarberPro surgiu a partir de uma experiência pessoal.

Durante muitos anos acompanhei de perto a rotina profissional do meu
pai, que trabalha como barbeiro há mais de quatro décadas.

Essa convivência permitiu observar situações comuns no dia a dia de
uma barbearia, principalmente relacionadas à organização dos
agendamentos realizados por telefone ou mensagens.

Durante minha formação em **Análise e Desenvolvimento de Sistemas**,
surgiu então a oportunidade de unir o interesse pelo desenvolvimento
de aplicações mobile com um problema real observado nesse ambiente.

Assim nasceu o BarberPro.

---

## Objetivo

O objetivo do BarberPro é desenvolver uma aplicação mobile
multiplataforma voltada para o gerenciamento de barbearias,
buscando:

- otimizar os atendimentos;
- facilitar a comunicação entre clientes e barbeiros;
- melhorar a organização dos horários;
- diminuir conflitos de agendamento;
- facilitar o gerenciamento dos serviços;
- proporcionar uma experiência simples e intuitiva.

---

# Perfis do sistema

O BarberPro possui três perfis principais:

## Cliente

O cliente pode:

- realizar cadastro;
- realizar login;
- visualizar barbearias;
- visualizar serviços disponíveis;
- selecionar um barbeiro;
- consultar horários disponíveis;
- realizar agendamentos;
- visualizar seus agendamentos;
- cancelar agendamentos;
- realizar pagamentos;
- visualizar seu perfil.

---

## Barbeiro

O barbeiro pode:

- realizar cadastro e login;
- vincular-se a uma barbearia;
- visualizar seus próprios agendamentos;
- acompanhar sua agenda;
- atualizar o status dos atendimentos;
- definir seus horários disponíveis;
- gerenciar serviços;
- consultar seu faturamento;
- visualizar e editar informações do perfil.

Os atendimentos podem possuir diferentes estados durante seu fluxo,
como:

- Agendado;
- Em andamento;
- Concluído;
- Cancelado.

---

## Administrador / Dono

O administrador possui as funcionalidades operacionais do barbeiro,
além de recursos destinados ao gerenciamento do estabelecimento.

Entre eles:

- cadastrar e gerenciar a barbearia;
- cadastrar serviços;
- gerenciar barbeiros;
- controlar membros da equipe;
- consultar o faturamento da barbearia;
- administrar informações do estabelecimento.

---

# Principais funcionalidades

### Agendamento

O fluxo de agendamento permite que o cliente:

1. escolha uma barbearia;
2. escolha um serviço;
3. escolha um barbeiro;
4. selecione uma data;
5. visualize os horários disponíveis;
6. selecione um horário;
7. confira o resumo;
8. confirme o agendamento.

---

### Disponibilidade

Cada profissional pode possuir seus próprios horários de trabalho.

O sistema utiliza essas informações para definir os horários que
podem ser apresentados aos clientes no momento do agendamento.

Horários indisponíveis ou já reservados não devem ser utilizados para
novos agendamentos.

---

### Pagamentos

O projeto possui suporte ao fluxo de pagamento relacionado aos
agendamentos.

A aplicação possui integração para geração de pagamento através de
**PIX**, permitindo:

- geração da cobrança;
- exibição do QR Code;
- código PIX Copia e Cola;
- acompanhamento do status do pagamento;
- associação da transação ao agendamento.

A integração PIX é realizada utilizando a **AbacatePay**.

---

### Relatórios financeiros

O barbeiro pode acompanhar informações relacionadas ao seu
faturamento.

O sistema considera os atendimentos concluídos para a composição dos
valores exibidos nos relatórios.

---

### Avaliações

A estrutura da aplicação também possui suporte para avaliações
relacionadas aos agendamentos realizados.

---

# Tecnologias utilizadas

## Frontend

- React Native
- Expo
- TypeScript
- Expo Router
- React Navigation
- Axios
- AsyncStorage
- React Native Calendars
- Expo Location
- Expo Linear Gradient
- Expo Vector Icons
- Google Fonts

## Backend

- Node.js
- NestJS
- TypeScript
- Prisma ORM
- JWT
- Bcrypt
- Class Validator
- REST API

## Banco de dados

- PostgreSQL

## Integrações

- AbacatePay — pagamentos PIX

---

# Arquitetura do sistema

O BarberPro foi desenvolvido utilizando uma arquitetura dividida entre
aplicação mobile, API backend e banco de dados.

### Aplicativo Mobile

O frontend foi desenvolvido utilizando **React Native com Expo** e
**TypeScript**.

Ele é responsável pela interação com o usuário e pelas interfaces dos
três perfis presentes no sistema:

- Cliente;
- Barbeiro;
- Administrador.

A comunicação com o backend é realizada através de requisições HTTP
utilizando **Axios**.

---

### API Backend

O backend foi desenvolvido utilizando **Node.js com NestJS** e
TypeScript.

A API é responsável por centralizar as regras de negócio e realizar
operações relacionadas a:

- autenticação de usuários;
- clientes;
- barbeiros;
- barbearias;
- serviços;
- agendamentos;
- disponibilidade de horários;
- pagamentos;
- avaliações;
- notificações.

O backend também é responsável pela comunicação entre o aplicativo,
o banco de dados e serviços externos utilizados pelo BarberPro.

---

### Banco de dados

O sistema utiliza **PostgreSQL** para persistência das informações.

A comunicação entre a API NestJS e o PostgreSQL é realizada através
do **Prisma ORM**, responsável pelo acesso e manipulação dos dados.

---

### Serviços externos

Para o fluxo de pagamento via PIX, o backend realiza integração com
a **AbacatePay**.

A integração permite gerar a cobrança associada ao agendamento e
retornar ao aplicativo as informações necessárias para realização
do pagamento.

---

### Comunicação entre as camadas

De forma resumida, o funcionamento da aplicação ocorre da seguinte
maneira:

1. O usuário realiza uma ação no aplicativo mobile;
2. O React Native envia uma requisição para a API;
3. A API NestJS recebe e valida os dados;
4. As regras de negócio são executadas;
5. O Prisma realiza as operações necessárias no PostgreSQL;
6. Quando necessário, a API se comunica com serviços externos;
7. O backend retorna uma resposta ao aplicativo;
8. O aplicativo atualiza a interface para o usuário.

---

# Estrutura do banco de dados

O BarberPro utiliza **PostgreSQL** como sistema de gerenciamento de
banco de dados e **Prisma ORM** para realizar a comunicação entre o
backend e o banco.

Entre as principais entidades presentes no sistema estão:

### Usuários

Armazena as informações gerais dos usuários cadastrados no BarberPro,
como nome, e-mail, senha, telefone e perfil de acesso.

Os usuários podem possuir diferentes funções dentro do sistema, como
cliente ou barbeiro/administrador.

### Clientes

Armazena as informações específicas dos usuários que utilizam o
sistema como clientes.

Os clientes podem realizar agendamentos de serviços.

### Barbeiros

Representa os profissionais cadastrados no sistema.

Cada barbeiro pode estar vinculado a uma barbearia, possuir serviços,
horários de disponibilidade e atendimentos associados.

### Barbearias

Armazena as informações dos estabelecimentos cadastrados.

Uma barbearia pode possuir diversos barbeiros e serviços.

### Serviços

Representa os serviços disponibilizados pelas barbearias, contendo
informações como:

- nome;
- descrição;
- preço;
- duração;
- situação do serviço.

### Agendamentos

É uma das entidades centrais do sistema.

O agendamento relaciona:

- cliente;
- barbeiro;
- serviço;
- data;
- horário de início;
- horário de término;
- status do atendimento.

### Disponibilidade

Armazena os dias e horários em que cada barbeiro está disponível
para realizar atendimentos.

Essas informações são utilizadas durante o processo de agendamento.

### Pagamentos

Registra as informações relacionadas ao pagamento de um agendamento,
incluindo:

- método;
- valor;
- status;
- identificador da transação;
- data do pagamento.

### Avaliações

Permite associar uma avaliação a um agendamento realizado pelo
cliente.

A avaliação pode armazenar nota e comentário sobre o atendimento.

### Notificações

Estrutura responsável por armazenar mensagens e notificações
associadas aos usuários do sistema.

---

# Estrutura do projeto

```text
BarberPro---App-para-gerenciamento-de-barbearias/
│
├── api-barberpro/
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── agendamentos/
│   │   ├── auth/
│   │   ├── avaliacoes/
│   │   ├── barbearias/
│   │   ├── barbeiros/
│   │   ├── clientes/
│   │   ├── database/
│   │   ├── disponibilidade/
│   │   ├── notificacoes/
│   │   ├── pagamentos/
│   │   ├── servicos/
│   │   └── user/
│   │
│   └── package.json
│
└── app-barberpro/
    │
    ├── src/
    │   ├── _components/
    │   ├── app/
    │   │   ├── Barbeiro/
    │   │   └── Clientes/
    │   ├── contexts/
    │   ├── routes/
    │   ├── services/
    │   └── utils/
    │
    └── package.json
```

---

# Autenticação

O BarberPro utiliza autenticação através de **JWT (JSON Web Token)**.

Após realizar login, o token é armazenado no dispositivo utilizando
o AsyncStorage.

Nas requisições autenticadas o aplicativo envia:

```http
Authorization: Bearer TOKEN
```

A API utiliza o token para identificar o usuário e controlar o acesso
às funcionalidades protegidas.

---

# Executando o projeto

## Pré-requisitos

Antes de iniciar, tenha instalado:

* Node.js
* npm
* PostgreSQL
* Git
* Expo Go ou emulador Android/iOS

---

## 1. Clonar o projeto

```bash
git clone https://github.com/arthurmouramachado/BarberPro---App-para-gerenciamento-de-barbearias.git
```

```bash
cd BarberPro---App-para-gerenciamento-de-barbearias
```

---

# Backend

Entre na pasta:

```bash
cd api-barberpro
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env`:

```env
DATABASE_URL="postgresql://usuario:suasenha@localhost:5432/nomedobanco"

JWT_KEY="SUA_CHAVE_JWT"

ABACATE_API_KEY="SUA_CHAVE_ABACATEPAY"

GOOGLE_CLIENT_EMAIL=""
GOOGLE_PRIVATE_KEY=""
```

Gere o Prisma Client:

```bash
npx prisma generate
```

Sincronize o banco durante o desenvolvimento:

```bash
npx prisma db push
```

Execute a API:

```bash
npm run start:dev
```

Por padrão:

```text
http://localhost:3000
```

---

# Aplicativo Mobile

Abra outro terminal:

```bash
cd app-barberpro
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env`:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP:3000
```

Exemplo utilizando um celular conectado à mesma rede:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.10:3000
```

Execute:

```bash
npx expo start
```

Depois abra o projeto utilizando o Expo Go ou um emulador.

---

# Interfaces

O BarberPro possui interfaces específicas para cada perfil.

### Interfaces iniciais

* Splash Screen
* Login
* Cadastro
* Seleção de perfil
* Seleção de vínculo profissional
* Seleção de barbearia
* Cadastro de barbearia

### Cliente

* Tela principal
* Lista de agendamentos
* Histórico
* Perfil
* Serviços
* Fluxo de agendamento
* Checkout
* Pagamento PIX

### Barbeiro

* Dashboard
* Agenda
* Perfil
* Relatório financeiro
* Gerenciamento de serviços
* Gerenciamento de horários

### Administrador

* Gerenciamento da equipe de barbeiros

---

# Telas Principais do Aplicativo

<div align="center">
  <table>
    <tr>
      <td align="center" style="border: none;">
        <img width="320" alt="tela de carregamento" src="https://github.com/user-attachments/assets/d2216bdb-6cbe-4573-a38d-fa4a9e85e2a6" />
        <br><b>Tela de Carregamento</b>
      </td>
      <td align="center" style="border: none;">
        <img width="320" alt="tela de home(cliente)" src="https://github.com/user-attachments/assets/00e315ca-08cf-4849-b1ff-8a84d0eded4b" />
        <br><b>Tela de Home Cliente</b>
      </td>
      <td align="center" style="border: none;">
        <img width="320" alt="tela home Barbeiro(Barbeiro)" src="https://github.com/user-attachments/assets/4c94cf19-2830-4095-bc89-50ccaf3613b9" />
        <br><b>Tela de Home Barbeiro/Dono</b>
      </td>
    </tr>
  </table>
</div>


---

# Regras de negócio

Algumas regras importantes do BarberPro:

* o cliente só pode selecionar horários disponíveis;
* um horário indisponível não pode ser reservado;
* o pagamento ocorre após a criação do agendamento;
* o barbeiro visualiza apenas seus próprios agendamentos;
* o barbeiro altera somente atendimentos atribuídos a ele;
* o faturamento considera atendimentos concluídos;
* um barbeiro deve estar vinculado a uma barbearia;
* funções administrativas exigem permissão adequada.

---

# Trabalhos futuros

O desenvolvimento do BarberPro pode continuar com a implementação de
novas funcionalidades.

Entre as melhorias previstas estão:

### Sistema de notificações

Envio de lembretes próximos ao horário agendado, buscando reduzir
atrasos e faltas.

### Integração com calendário do dispositivo

Integração com o calendário do dispositivo utilizando `expo-calendar`,
permitindo que o cliente adicione seus agendamentos à própria agenda.

### Tema escuro

Possibilidade de alternar entre os temas claro e escuro.

### Docker
Como melhoria futura, pretende-se adicionar **Docker** ao projeto para
padronizar e facilitar a configuração do ambiente de desenvolvimento.

A ideia é containerizar principalmente a API em NestJS e o banco de
dados PostgreSQL, permitindo que o ambiente seja iniciado de forma mais
simples e consistente, reduzindo problemas relacionados a diferenças de
configuração entre máquinas.

### Publicação do aplicativo

Publicação do BarberPro nas principais lojas:

* Google Play Store;
* Apple App Store.

---

# Aprendizados

O desenvolvimento do BarberPro permitiu aplicar na prática diversos
conceitos estudados durante o curso de Análise e Desenvolvimento de
Sistemas, incluindo:

* levantamento de requisitos;
* requisitos funcionais e não funcionais;
* regras de negócio;
* diagramas UML;
* modelagem de banco de dados;
* desenvolvimento mobile;
* desenvolvimento de APIs REST;
* autenticação;
* integração frontend/backend;
* bancos de dados relacionais;
* integração com serviços externos;
* Git e GitHub.

Um dos maiores desafios do projeto foi realizar a integração entre o
backend desenvolvido em NestJS, o banco PostgreSQL utilizando Prisma
ORM e o aplicativo mobile desenvolvido em React Native e Expo.

---

# Autor

**Arthur Moura Machado**

Estudante de **Análise e Desenvolvimento de Sistemas**

GitHub: [@arthurmouramachado](https://github.com/arthurmouramachado)

---

## Licença

Projeto desenvolvido para fins acadêmicos como Trabalho de Conclusão
de Curso.

© 2026 Arthur Moura Machado
