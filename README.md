# Hivest

A **simple**, **fast** and **minimalist** framework for Node.js that allows you to create modular applications with dependency injection using decorators.

## 🎯 **What is Hivest?**

Hivest is a framework that simplifies the creation of modular Node.js applications, offering:

- **Hierarchical modules** with provider inheritance
- **Decorators** for controllers and routes
- **Automatic dependency injection**
- **Organized path structure**
- **Zero complex configuration**

## 🚀 **Key Features**

### ✨ **Simplicity**

- Minimal setup, no complex configurations
- Intuitive and familiar API
- Simple and direct decorators

### ⚡ **Performance**

- Fast initialization
- Efficient dependency resolution
- No unnecessary overhead

### 🧩 **Modularity**

- Independent and reusable modules
- Automatic provider inheritance
- Clear hierarchical structure

### 🎨 **Flexibility**

- Customizable decorators
- Hierarchically organized paths
- Easy to extend

## 📦 **Installation**

```bash
npm install hivest
# or
yarn add hivest
```

## 🏗️ **Core Concepts**

### **AppModule**

The basic building block. Each module can have:

- **Providers**: Services, repositories, configurations
- **Controllers**: API endpoints
- **Imports**: Other imported modules

### **Decorators**

- `@Controller()`: Defines base path for a controller
- `@HttpPost()`, `@HttpGet()`, etc.: Defines HTTP routes
- `@Injectable()`: Marks class for dependency injection
- `@Inject()`: Inject specific dependencies

### **Providers**

- **Class Providers**: Classes that will be instantiated
- **Value Providers**: Simple values
- **Smart Providers**: Automatic type detection

## 📚 **Usage Examples**

### **1. Creating a Simple Module**

```typescript
import { AppModule, Controller, HttpGet, Injectable } from 'hivest';

@Injectable()
@Controller({ path: '/users' })
class UserController {
  @HttpGet('/')
  async getUsers({ req, res }) {
    return res.json({ users: [] });
  }
}

const userModule = new AppModule({
  path: '/api',
  controllers: [UserController],
  providers: [UserService],
});
```

### **2. Modules with Inheritance**

```typescript
// Parent module with providers
const mainModule = new AppModule({
  path: '/api',
  providers: [
    { key: 'UserService', provide: UserService },
    { key: 'Database', provide: Database },
  ],
  imports: [UserModule], // Child module inherits providers
});

// Child module
class UserModule extends AppModule {
  constructor() {
    super({
      path: '/users',
      controllers: [UserController, AuthController],
    });
  }
}
```

### **3. Path Hierarchy**

```typescript
@Controller({ path: '/auth' })
class AuthController {
  @HttpPost('/login')     // → /api/users/auth/login
  @HttpPost('/register')  // → /api/users/auth/register
  @HttpGet('/profile')    // → /api/users/auth/profile
}
```

### **4. Dependency Injection**

```typescript
@Injectable()
class UserController {
  constructor(
    @Inject('UserService')
    readonly userService: UserService,

    @Inject('Database')
    readonly database: Database,
  ) {}
}
```

## 🏃‍♂️ **Quick Start**

### **1. Install dependencies**

```bash
yarn add hivest express reflect-metadata tsyringe
```

### **2. Create main module**

```typescript
import { AppModule } from 'hivest';

const app = new AppModule({
  path: '/api',
  providers: [UserService],
  controllers: [UserController],
});

app.listen(3000);
```

### **3. Create controller**

```typescript
import { Controller, HttpGet, Injectable } from 'hivest';

@Injectable()
@Controller({ path: '/users' })
class UserController {
  @HttpGet('/')
  async getUsers({ req, res }) {
    return res.json({ message: 'Hello Hivest!' });
  }
}
```

## 📁 **Recommended Project Structure**

```
src/
├── modules/
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   └── auth/
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       └── auth.module.ts
├── shared/
│   ├── database.ts
│   └── config.ts
└── main.module.ts
```

## 🔧 **Available Scripts**

### **Development**

```bash
yarn dev          # Runs server with examples and tests
yarn build        # Compiles TypeScript project
yarn start        # Runs compiled server
```

### **Examples**

The project includes complete examples in `src/exemple/` that demonstrate:

- Hierarchical modules
- Controllers with custom paths
- Provider inheritance
- Authentication and settings endpoints

## 🌟 **Example Endpoints**

- `POST /api/companies` - Create company
- `GET /api/companies/:id` - Get company
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user
- `POST /api/users/auth/login` - Login
- `POST /api/users/auth/register` - Register
- `GET /api/users/auth/profile` - Profile
- `POST /api/users/auth/logout` - Logout
- `GET /api/users/settings/` - Settings
- `PUT /api/users/settings/theme` - Update theme

## 🎨 **Available Decorators**

### **@Controller(options)**

Defines base path for a controller:

```typescript
@Controller({ path: '/auth' })
class AuthController {
  // Routes will be prefixed with /auth
}
```

### **@HttpPost(path), @HttpGet(path), etc.**

Defines HTTP routes:

```typescript
@HttpPost('/login')
@HttpGet('/profile')
@HttpPut('/update')
@HttpDelete('/remove')
```

### **@Injectable()**

Marks class for dependency injection:

```typescript
@Injectable()
class UserService {
  // Will be injectable in other services
}
```

### **@Inject(token)**

Injects specific dependency:

```typescript
constructor(
  @Inject('UserService')
  readonly userService: UserService
) {}
```

## 🔄 **Provider Inheritance**

Child modules automatically inherit all providers from parent modules:

```typescript
// Parent module
const mainModule = new AppModule({
  providers: [UserService, Database],
});

// Child module has access to UserService and Database
class UserModule extends AppModule {
  constructor() {
    super({
      controllers: [UserController], // Can use UserService and Database
    });
  }
}
```

## 🚀 **Why Hivest?**

### **vs NestJS**

- ✅ Simpler and more direct
- ✅ Less configuration
- ✅ Smaller learning curve
- ✅ Focus on simplicity

### **vs Pure Express**

- ✅ Organized structure
- ✅ Dependency injection
- ✅ Intuitive decorators
- ✅ Native modularity

### **vs Other frameworks**

- ✅ Zero unnecessary overhead
- ✅ Familiar API
- ✅ Easy migration
- ✅ Optimized performance

## 🤝 **Contributing**

1. Fork the project
2. Create a branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- 📖 [Documentation](https://github.com/fernandohenriq/hivest)
- 🐛 [Issues](https://github.com/fernandohenriq/hivest/issues)
- 💬 [Discussions](https://github.com/fernandohenriq/hivest/discussions)

---

**Hivest** - Transforming code into modules in a simple and efficient way! 🚀
