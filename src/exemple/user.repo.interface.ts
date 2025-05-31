export interface UserRepo {
  create(user: any): Promise<any>;
  findById(userId: string): Promise<any>;
  update(userId: string, user: any): Promise<any>;
}
