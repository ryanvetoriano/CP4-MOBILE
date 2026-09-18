# CP4 – App com Autenticação (Firebase Auth)

Checkpoint 4 da disciplina **Mobile Application Development** – Tecnologia em Desenvolvimento de Sistemas (2TDS).

## Integrantes

| Nome | RM |
| ---- | -- |
| _Ryan Vetoriano_ | _RM565667_ |
| _Raul Rezende_ | _RM564002_ |

## Descrição do projeto

Aplicativo mobile em React Native + TypeScript (Expo Router) com autenticação de usuários via **Firebase Authentication** e persistência da sessão com **AsyncStorage**.

### Funcionalidades

- **Cadastro** com nome, e-mail, senha e confirmação de senha. Valida campos obrigatórios, formato do e-mail, tamanho mínimo da senha e se as senhas são iguais. O nome é salvo como `displayName` no Firebase.
- **Login** com e-mail e senha, com mensagens de erro amigáveis (credenciais inválidas, muitas tentativas, falha de rede etc.).
- **Persistência da sessão**: após o login, os dados de identificação do usuário (uid, nome, e-mail e datas) são salvos no AsyncStorage (chave `@cp4-mobile:session`). Ao reabrir o app essa sessão é lida e o usuário vai direto para a área autenticada. A sessão também é confirmada com o Firebase (`onAuthStateChanged`, que usa `getReactNativePersistence(AsyncStorage)`); se o token não for mais válido, a sessão local é removida. **A senha nunca é armazenada.**
- **Logout**: encerra a sessão no Firebase (`signOut`), remove a sessão do AsyncStorage e volta para a tela de login.
- **Esqueci minha senha**: envia o e-mail de redefinição (`sendPasswordResetEmail`) e mostra a mensagem _"Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha."_
- **Excluir conta**: pede confirmação, exclui o usuário do Firebase (`deleteUser`), remove a sessão do AsyncStorage e volta para o login. Se o Firebase exigir um login recente, o app pede a senha para reautenticar antes de excluir.
- **Proteção de rotas**: com `Stack.Protected` do Expo Router, o grupo `(app)` só fica acessível quando existe usuário logado e o grupo `(auth)` só quando não existe. Qualquer tentativa de abrir uma rota protegida redireciona para a tela correta.

### Telas

| Área não autenticada | Área autenticada |
| -------------------- | ---------------- |
| Login (`/login`) | Minha conta / Perfil (`/`): dados do usuário, logout e exclusão de conta |
| Cadastro (`/register`) | |
| Esqueci minha senha (`/forgot-password`) | |

## Tecnologias utilizadas

- [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/) (SDK 57)
- [TypeScript](https://www.typescriptlang.org/)
- [Expo Router](https://docs.expo.dev/router/introduction/) (rotas baseadas em arquivos e `Stack.Protected`)
- [Firebase Authentication](https://firebase.google.com/docs/auth) (SDK JS `firebase` v12)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) (`@react-native-async-storage/async-storage`)

## Estrutura

```
app/                            # Rotas (Expo Router)
  _layout.tsx                   # Providers + proteção das rotas com Stack.Protected
  (auth)/                       # Área não autenticada
    _layout.tsx
    login.tsx
    register.tsx
    forgot-password.tsx
  (app)/                        # Área autenticada
    _layout.tsx
    index.tsx                   # Minha conta / Perfil
src/
  config/firebase.ts            # Inicialização do Firebase e do Auth
  context/AuthContext.tsx       # Estado de autenticação e operações (cadastro, login, logout...)
  services/sessionStorage.ts    # Leitura/gravação/remoção da sessão no AsyncStorage
  services/authErrors.ts        # Tradução dos códigos de erro do Firebase
  components/                   # Input, botão, mensagens e layout de tela
  utils/                        # Validações e diálogo de confirmação
  types/                        # Tipos auxiliares (persistência RN do Firebase Auth)
```

## Instalação e execução

### Pré-requisitos

- Node.js 20 ou superior
- App **Expo Go** no celular (Android/iOS) ou um emulador Android / simulador iOS
- Um projeto no [Console do Firebase](https://console.firebase.google.com/)

### 1. Configurar o Firebase

1. No Console do Firebase, crie um projeto (ou use um existente).
2. Em **Authentication > Método de login**, habilite **E-mail/senha**.
3. Em **Configurações do projeto > Seus apps**, adicione um app **Web** e copie as credenciais (`firebaseConfig`).

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

### 3. Instalar as dependências e executar

```bash
npm install
npx expo start
```

Para verificar os tipos:

```bash
npm run typecheck
```
