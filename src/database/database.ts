import { User, UserCreation, IUsersStore, user } from "../models/user";
import { v4 as uuidv4 } from 'uuid';

class UsersStore {
  private usersStore: IUsersStore = { '131c8241-fcae-4425-94b7-e410fb285018': { ...user } };

  getUsers = (): User[] => {
    return Object.values(this.usersStore);
  };
  
  getUserById = (id: string): User | undefined => {
    return this.usersStore[id];
  };
  
  createUser = (user: UserCreation): User => {
    const userId = uuidv4();
  
    const newUser = {
      ...user,
      id: userId,
    }
  
    this.usersStore[userId] = newUser;
  
    return newUser;
  };
  
  updateUser = (user: User): User | undefined => {
    this.usersStore[user.id] = user;
    return user;
  }
  
  deleteUser = (id: string) => {
    return delete this.usersStore[id];
  }
}

export const store = new UsersStore();
