export const getFromStorage = function (key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

export const addToStorage = function (obj, key) {
  const storageData = getFromStorage(key);
  storageData.push(obj);
  localStorage.setItem(key, JSON.stringify(storageData));
};

export const generateTestUser = function (User) {
  const testUser = new User("1", "1");
  User.save(testUser);
};

export const generateSecondTestUser = function (User) {
  const SecondTestUser = new User("2", "2");
  User.save(SecondTestUser);
};
