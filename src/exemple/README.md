# Hivest Examples

Este diretório contém exemplos completos de como usar o framework Hivest, incluindo o novo sistema de middleware automático.

## 🚀 **Middleware Automático**

O Hivest agora suporta middleware automático que funciona como um Controller. Quando você marca uma classe com `@Middleware`, todos os métodos que não possuem decorators HTTP são automaticamente tratados como middleware.

### **Exemplo: LogMiddleware**

```typescript
import { Middleware } from '../../lib/decorators';
import { HttpContext } from '../../lib/types';

@Middleware()
export class LogMiddleware {
  async log({ req, next }: HttpContext) {
    console.log(`[LOG] ${req.method} ${req.path}`);
    next();
  }
}
```

### **Como Usar**

1. **Crie o middleware**:

```typescript
@Middleware() // Global - executa em todas as rotas
export class MyMiddleware {
  async methodName({ req, res, next }) {
    // Lógica do middleware
    next();
  }
}
```

2. **Registre no módulo**:

```typescript
export const mainModule = new AppModule({
  path: '/api',
  controllers: [MyMiddleware], // Adiciona como controller
  // ... outros providers e imports
});
```

### **Características**

- ✅ **Automático**: Todos os métodos sem decorators HTTP viram middleware
- ✅ **Flexível**: Pode misturar middleware e rotas na mesma classe
- ✅ **Simples**: Não precisa decorar cada método individualmente
- ✅ **Path Opcional**: `@Middleware()` ou `@Middleware({ path: '/rota' })`

### **Exemplos de Uso**

#### **Middleware Global**

```typescript
@Middleware()
export class GlobalMiddleware {
  async log({ req, next }) {
    console.log(`[GLOBAL] ${req.method} ${req.path}`);
    next();
  }
}
```

#### **Middleware com Rota**

```typescript
@Middleware({ path: '/auth' })
export class AuthMiddleware {
  async validateToken({ req, res, next }) {
    // Middleware de validação
    next();
  }

  @HttpPost('/login') // Este método vira rota
  async login({ req, res }) {
    return res.json({ message: 'Login' });
  }
}
```

## 📁 **Estrutura dos Exemplos**

```
src/exemple/
├── modules/
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   ├── company/
│   │   ├── company.controller.ts
│   │   ├── company.service.ts
│   │   └── company.module.ts
│   ├── log.middleware.ts      # Exemplo de middleware
│   └── main.module.ts         # Módulo principal
└── index.ts                   # Testes e exemplos
```

## 🧪 **Testando os Exemplos**

Execute o servidor de exemplo:

```bash
npm run dev
# ou
yarn dev
```

O servidor iniciará na porta 3000 e você verá logs como:

```
[LOG] POST /api/companies
[LOG] GET /api/users/1
[LOG] POST /api/users/auth/login
```

## 🌟 **Endpoints de Exemplo**

- `POST /api/companies` - Criar empresa
- `GET /api/companies/:id` - Buscar empresa
- `POST /api/users` - Criar usuário
- `GET /api/users/:id` - Buscar usuário
- `POST /api/users/auth/login` - Login
- `GET /api/users/auth/profile` - Perfil
- `GET /api/users/settings/` - Configurações

Todos os endpoints são automaticamente logados pelo `LogMiddleware`!
