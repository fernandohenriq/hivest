import 'reflect-metadata';

import { Controller, HttpGet, HttpMiddleware, HttpPost, Inject, Provider } from './app-decorators';
import { HttpContext } from './app-interfaces';
import { AppModule } from './app-module';

@Provider()
class LoggerMiddleware {
  @HttpMiddleware()
  httpEntry({ req, res, next }: HttpContext) {
    const timestamp = new Date().toLocaleString();
    const method = req.method;
    const url = req.originalUrl;
    console.info(
      `\x1b[42m[LOGGER]\x1b[0m \x1b[36m[${timestamp}]\x1b[0m \x1b[33m${method}\x1b[0m ${url}`,
    );
    next();
  }
}

@Provider()
class UserService {
  private users = [{ id: 1, name: 'John' }];

  getAllUsers() {
    return this.users;
  }

  createUser(userData: any) {
    const newUser = { id: this.users.length + 1, ...userData };
    this.users.push(newUser);
    return newUser;
  }
}

@Controller('/users')
class UserController {
  constructor(
    @Inject('UserService')
    private userService: UserService,
  ) {}

  @HttpGet('/')
  getAllUsers(ctx: HttpContext) {
    ctx.res.json(this.userService.getAllUsers());
  }

  @HttpPost('/')
  createUser(ctx: HttpContext) {
    ctx.res.status(201).json(this.userService.createUser(ctx.req.body));
  }
}

const userModule = new (class UserModule extends AppModule {
  constructor() {
    super({
      path: '/aaa',
      providers: [{ key: 'UserService', useClass: UserService }, { useClass: UserController }],
    });
  }
})();

@Provider()
class PostService {
  private posts = [{ id: 1, title: 'First Post' }];

  getAllPosts() {
    return this.posts;
  }

  createPost(postData: any) {
    const newPost = { id: this.posts.length + 1, ...postData };
    this.posts.push(newPost);
    return newPost;
  }
}

@Controller('/posts')
class PostController {
  constructor(
    @Inject('PostService')
    private postService: PostService,
  ) {}

  @HttpGet('/')
  getAllPosts(ctx: HttpContext) {
    ctx.res.json(this.postService.getAllPosts());
  }

  @HttpPost('/')
  createPost(ctx: HttpContext) {
    ctx.res.status(201).json(this.postService.createPost(ctx.req.body));
  }
}

const postModule = new (class PostModule extends AppModule {
  constructor() {
    super({
      path: '/bbb',
      providers: [{ key: 'PostService', useClass: PostService }, { useClass: PostController }],
    });
  }
})();

const mainModule = new (class MainModule extends AppModule {
  constructor() {
    super({
      path: '/api',
      imports: [userModule, postModule],
      providers: [{ key: 'LoggerMiddleware', useClass: LoggerMiddleware }],
    });
  }
})();

// Run tests after server starts
mainModule.start(3000, () => {
  console.log('\n\x1b[42m[SERVER]\x1b[0m \x1b[36m[3000]\x1b[0m \x1b[33m[RUNNING]\x1b[0m\n');
  setTimeout(async () => {
    const userBaseUrl = 'http://localhost:3000/api/aaa/users';
    const postBaseUrl = 'http://localhost:3000/api/bbb/posts';

    // Users test
    const userTests = async () => {
      console.log('🔍 Testing users...');

      // Test 1: Get all users
      try {
        const getResponse = await fetch(userBaseUrl);
        if (!getResponse.ok) throw new Error(`HTTP error! Status: ${getResponse.status}`);
        const users = await getResponse.json();
        console.log('✅ GET /users success:', users);
      } catch (error) {
        console.error('❌ GET /users failed:', error);
      }

      // Test 2: Create new user
      try {
        const postResponse = await fetch(userBaseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Test User' }),
        });
        if (!postResponse.ok) throw new Error(`HTTP error! Status: ${postResponse.status}`);
        const newUser = await postResponse.json();
        console.log('✅ POST /users success:', newUser);
      } catch (error) {
        console.error('❌ POST /users failed:', error);
      }

      // Test 3: Verify new user exists
      try {
        const verifyResponse = await fetch(userBaseUrl);
        if (!verifyResponse.ok) throw new Error(`HTTP error! Status: ${verifyResponse.status}`);
        const updatedUsers = await verifyResponse.json();
        console.log('✅ User count after creation:', updatedUsers.length);
      } catch (error) {
        console.error('❌ Verify user count failed:', error);
      }
    };

    // Add post tests
    const postTests = async () => {
      console.log('\n🔍 Testing posts...');

      // Test 1: Get all posts
      try {
        const response = await fetch(postBaseUrl);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const posts = await response.json();
        console.log('✅ GET /posts success:', posts);
      } catch (error) {
        console.error('❌ GET /posts failed:', error);
      }

      // Test 2: Create new post
      try {
        const response = await fetch(postBaseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Post' }),
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const newPost = await response.json();
        console.log('✅ POST /posts success:', newPost);
      } catch (error) {
        console.error('❌ POST /posts failed:', error);
      }
    };

    await userTests();
    await postTests();
  }, 1000);
});
