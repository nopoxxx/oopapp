import { addToStorage, getFromStorage } from "../utils";
import { BaseModel } from "./BaseModel";

export class User extends BaseModel {
  constructor(login, password, isAdmin) {
    super();
    this.login = login;
    this.password = password;
    this.storageKey = "users";
    this.isAdmin = isAdmin ? isAdmin : false;
  }

  get hasAccess() {
    let users = getFromStorage(this.storageKey);
    if (users.length == 0) return false;
    for (let user of users) {
      if (user.login === this.login && user.password === this.password) {
        return true;
      }
    }
    return false;
  }

  static save(user) {
    try {
      addToStorage(user, user.storageKey);
      return true;
    } catch (e) {
      throw new Error(e);
    }
  }
}
