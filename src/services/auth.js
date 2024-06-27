import { appState } from "../app";
import { User } from "../models/User";
import { getFromStorage } from "../utils";

export const authUser = function (login, password) {
  const users = getFromStorage("users");
  const existingUser = users.find(
    (user) => user.login === login && user.password === password
  );

  if (!existingUser) {
    return false;
  }

  const authenticatedUser = new User(
    existingUser.login,
    existingUser.password,
    existingUser.isAdmin
  );
  authenticatedUser._id = existingUser._id;
  appState.currentUser = authenticatedUser;

  return true;
};
