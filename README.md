# Hivestle

Um framework modular para Node.js com suporte a injeção de dependência e decorators.

## Scripts Disponíveis

### `yarn dev`

Executa o servidor principal em modo de desenvolvimento:

```bash
yarn dev
```

- Servidor roda na porta 3000
- Apenas inicializa o servidor sem testes

### `yarn example`

Executa o servidor com exemplos e testes automáticos:

```bash
yarn example
```

- Servidor roda na porta 3000
- Executa automaticamente todos os testes de endpoints
- Demonstra a funcionalidade completa do framework

### `yarn build`

Compila o projeto TypeScript:

```bash
yarn build
```

### `yarn start`

Executa o servidor compilado:

```bash
yarn start
```

## Estrutura de Exemplo

O projeto inclui um exemplo completo em `src/exemple/` que demonstra:

- **Módulos**: Organização hierárquica de módulos
- **Controllers**: Com decorators `@Controller` para paths customizados
- **Providers**: Injeção de dependência com herança entre módulos
- **Rotas**: Hierarquia de paths organizada

### Endpoints de Exemplo

- `POST /api/companies` - Criar empresa
- `GET /api/companies/:id` - Buscar empresa
- `POST /api/users` - Criar usuário
- `GET /api/users/:id` - Buscar usuário
- `POST /api/users/auth/login` - Login
- `POST /api/users/auth/register` - Registro
- `GET /api/users/auth/profile` - Perfil
- `POST /api/users/auth/logout` - Logout
- `GET /api/users/settings/` - Configurações
- `PUT /api/users/settings/theme` - Atualizar tema
- `PUT /api/users/settings/notifications` - Atualizar notificações
