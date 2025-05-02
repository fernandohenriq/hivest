interface AppModuleOptions {
  path: string;
  services: any[];
  controllers: any[];
}

export class AppModule {
  options: AppModuleOptions;

  constructor(options: Partial<AppModuleOptions>) {
    this.options = {
      path: options?.path || '/',
      services: options?.services || [],
      controllers: options?.controllers || [],
    };
  }

  async bootstrap() {}
}
