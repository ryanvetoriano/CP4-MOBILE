# CP5 – Minhas Tarefas (Firebase Auth + Cloud Firestore)

Checkpoint 5 da disciplina **Mobile Application Development** – Tecnologia em Desenvolvimento de Sistemas (2TDS).

Evolução do app do CP4: a autenticação continua com o **Firebase Authentication** e agora os dados do usuário ficam no **Cloud Firestore**, com CRUD completo.

## Integrantes

| Nome | RM |
| ---- | -- |
| _Ryan Vetoriano_ | _RM565667_ |
| _Raul Rezende_ | _RM564002_ |

## Tema do aplicativo

**Lista de tarefas.** Cada usuário cadastra e acompanha as próprias tarefas: título, descrição, categoria, data de entrega, prioridade e status.

## Descrição do projeto

Aplicativo mobile em React Native + TypeScript (Expo Router). O usuário cria uma conta, faz login e gerencia as suas tarefas, que ficam salvas no Cloud Firestore dentro do documento do próprio usuário (`usuarios/{uid}/tarefas`). Cada usuário vê e altera somente os próprios registros, o que é garantido no app e também pelas regras de segurança do Firestore.

### Funcionalidades

**Autenticação (mantida do CP4)**

- **Cadastro** com nome, e-mail, senha e confirmação de senha, com validações. O nome é salvo como `displayName` no Firebase Auth e também no documento `usuarios/{uid}` do Firestore (sem a senha).
- **Login** com e-mail e senha e mensagens de erro amigáveis.
- **Persistência da sessão** com AsyncStorage (chave `@cp4-mobile:session`). Ao reabrir o app, o usuário vai direto para a área autenticada. **A senha nunca é armazenada**, nem no AsyncStorage nem no Firestore.
- **Logout**: encerra a sessão no Firebase, limpa o AsyncStorage e volta para o login.
- **Esqueci minha senha**: envia o e-mail de redefinição (`sendPasswordResetEmail`).
- **Excluir conta**: pede confirmação, apaga as tarefas e o documento do usuário no Firestore e depois exclui a conta no Firebase Auth. Se o login não for recente, o app pede a senha antes, para reautenticar.
- **Proteção de rotas** com `Stack.Protected` do Expo Router: o grupo `(app)` só abre com usuário logado.

**Firestore (novo no CP5)**

| Operação | Funcionalidade | Onde |
| -------- | -------------- | ---- |
| **Create** | Cadastrar uma nova tarefa (`addDoc`) | Tela *Nova tarefa* |
| **Read** | Listar as tarefas em tempo real (`onSnapshot`) e carregar uma tarefa (`getDoc`) | *Início*, *Minhas tarefas* e *Editar tarefa* |
| **Update** | Editar uma tarefa existente (`updateDoc`) | Tela *Editar tarefa* |
| **Delete** | Excluir uma tarefa após confirmação (`deleteDoc`) | Tela *Minhas tarefas* |

- **Formulário com 6 campos**: título, descrição, categoria, data de entrega (DD/MM/AAAA, com máscara), prioridade (baixa/média/alta) e status (pendente/em andamento/concluída). Todos são obrigatórios e validados antes do envio (campos vazios, tamanho máximo e data existente).
- **Listagem** ordenada pela data de entrega, com status, prioridade, categoria, aviso de tarefa atrasada, filtro por status e os botões **Editar** e **Excluir**. Sem registros, aparece a mensagem _"Nenhum registro encontrado."_
- **Exclusão** com confirmação (_"Tem certeza que deseja excluir este registro?"_), atualização imediata da lista e mensagem de sucesso.
- **Feedback** em todas as operações: indicador de carregamento, mensagem de sucesso após cadastrar, editar ou excluir e mensagens de erro do Firestore traduzidas (sem permissão, sem conexão etc.).
- A lista é atualizada sozinha após qualquer operação, porque usa `onSnapshot`.

### Telas

| Área não autenticada | Área autenticada |
| -------------------- | ---------------- |
| Login (`/login`) | Início / Home (`/`): resumo das tarefas por status e próximas entregas |
| Cadastro (`/register`) | Minhas tarefas (`/tasks`): listagem com filtro, editar e excluir |
| Esqueci minha senha (`/forgot-password`) | Nova tarefa (`/tasks/new`): cadastro de registro |
| | Editar tarefa (`/tasks/[id]`): edição de registro |
| | Minha conta (`/profile`): nome, e-mail, logout e exclusão da conta |

## Tecnologias utilizadas

- [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/) (SDK 57)
- [TypeScript](https://www.typescriptlang.org/)
- [Expo Router](https://docs.expo.dev/router/introduction/) (rotas por arquivos e `Stack.Protected`)
- [Firebase Authentication](https://firebase.google.com/docs/auth) (SDK JS `firebase` v12)
- [Cloud Firestore](https://firebase.google.com/docs/firestore) (SDK JS `firebase` v12)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) (`@react-native-async-storage/async-storage`)

## Estrutura do Firestore

Os registros ficam em uma **subcoleção dentro do documento do usuário**, identificado pelo `uid` do Firebase Authentication:

```
usuarios (coleção)
└── {uid do usuário} (documento)
    ├── nome: "Ana Silva"
    ├── email: "ana@email.com"
    ├── criadoEm: timestamp
    ├── ultimoLogin: timestamp
    └── tarefas (subcoleção)
        ├── {tarefaId} (documento)
        │   ├── titulo: "Estudar para a prova"
        │   ├── descricao: "Revisar Firestore e regras de segurança"
        │   ├── categoria: "Faculdade"
        │   ├── dataEntrega: timestamp
        │   ├── prioridade: "baixa" | "media" | "alta"
        │   ├── status: "pendente" | "em_andamento" | "concluida"
        │   ├── usuarioId: "{uid do usuário}"
        │   ├── criadoEm: timestamp
        │   └── atualizadoEm: timestamp
        └── {tarefaId} ...
```

- O caminho `usuarios/{uid}/tarefas` sempre usa o `uid` do usuário autenticado (`auth.currentUser.uid`), então cada usuário só consulta os próprios registros.
- O campo `usuarioId` repete o dono da tarefa dentro do documento e também é validado pelas regras.
- A senha **não** é gravada no Firestore. As regras recusam qualquer campo além dos listados acima.

### Regras de segurança

As regras ficam em [`firestore.rules`](firestore.rules). Elas garantem que:

- só um usuário autenticado acessa os dados, e somente os que estão sob o seu próprio `uid` (`request.auth.uid == userId`). Um usuário não lê, edita, cria nem exclui registros de outro;
- as tarefas têm os campos e tipos corretos (textos não vazios e com tamanho máximo, data como timestamp, prioridade e status com valores válidos) e `usuarioId` igual ao dono;
- `criadoEm` não pode ser alterado na edição, e nenhum campo extra (como uma senha) pode ser salvo.

## Instalação e execução

### Pré-requisitos

- Node.js 20 ou superior
- App **Expo Go** no celular (Android/iOS), ou um emulador Android / simulador iOS
- Um projeto no [Console do Firebase](https://console.firebase.google.com/)

### 1. Configurar o Firebase

1. No Console do Firebase, crie um projeto (ou use o mesmo do CP4).
2. Em **Authentication > Método de login**, habilite **E-mail/senha**.
3. Em **Firestore Database**, clique em **Criar banco de dados** (pode escolher o modo de produção).
4. Na aba **Regras** do Firestore, substitua o conteúdo pelo arquivo [`firestore.rules`](firestore.rules) e clique em **Publicar**.
   - Se preferir usar a Firebase CLI: `npx firebase-tools deploy --only firestore:rules --project SEU_PROJECT_ID`, que usa o [`firebase.json`](firebase.json).
5. Em **Configurações do projeto > Seus apps**, adicione um app **Web** e copie as credenciais (`firebaseConfig`).

> O Firestore cria os índices de campo único automaticamente. A listagem (`orderBy('dataEntrega')`) não precisa de índice composto.

### 2. Configurar as variáveis de ambiente

Copie o arquivo de exemplo e preencha com as credenciais do passo anterior:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Executar

```bash
npx expo start
```

Depois, leia o QR Code com o **Expo Go** (Android) ou com a câmera (iOS), ou pressione `a` para abrir no emulador Android, `i` no simulador iOS ou `w` no navegador.

Para verificar os tipos:

```bash
npm run typecheck
```

## Estrutura do código

```
app/                            # Rotas (Expo Router)
  _layout.tsx                   # Providers + proteção das rotas com Stack.Protected
  (auth)/                       # Área não autenticada
    login.tsx
    register.tsx
    forgot-password.tsx
  (app)/                        # Área autenticada
    _layout.tsx                 # Stack das telas logadas + mensagens de feedback (toast)
    index.tsx                   # Início / Home
    profile.tsx                 # Minha conta / Perfil
    tasks/
      index.tsx                 # Listagem das tarefas (Read + Delete)
      new.tsx                   # Cadastro de tarefa (Create)
      [id].tsx                  # Edição de tarefa (Update)
src/
  config/firebase.ts            # Inicialização do Firebase, do Auth e do Firestore
  context/AuthContext.tsx       # Estado de autenticação e operações (cadastro, login, logout...)
  context/ToastContext.tsx      # Mensagens de sucesso/erro após as operações
  hooks/useTasks.ts             # Carrega as tarefas do usuário em tempo real
  services/tasksService.ts      # CRUD das tarefas no Firestore
  services/userService.ts       # Documento usuarios/{uid} e exclusão dos dados do usuário
  services/sessionStorage.ts    # Sessão no AsyncStorage
  services/authErrors.ts        # Tradução dos erros do Firebase Auth
  services/firestoreErrors.ts   # Tradução dos erros do Firestore
  components/                   # Input, botão, mensagens, formulário e card da tarefa
  types/                        # Tipos da tarefa e da persistência RN do Firebase Auth
  utils/                        # Validações, datas e diálogo de confirmação
firestore.rules                 # Regras de segurança do Cloud Firestore
firebase.json                   # Configuração da Firebase CLI (deploy das regras)
```
