export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

export interface UserCreation extends Omit<User, "id"> {}

export interface IUsersStore {
  [key: string]: User;
}

export const user = {
  id: "131c8241-fcae-4425-94b7-e410fb285018",
  username: "Al",
  age: 25,
  hobbies: ['aaaa'],
}