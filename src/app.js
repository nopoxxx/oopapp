import "bootstrap/dist/css/bootstrap.min.css";
import { User } from "./models/User";
import { authUser } from "./services/auth";
import { State } from "./state";
import "./styles/style.css";
import noAccessTemplate from "./templates/noAccess.html";
import signInTemplate from "./templates/signIn.html";
import signUpTemplate from "./templates/signUp.html";
import taskFieldTemplate from "./templates/taskField.html";
import { addToStorage, getFromStorage } from "./utils";

export const appState = new State();

const userDropdown = document.querySelector("#user-dropdown-btn");

if (!localStorage.getItem("taskCounter")) {
  localStorage.setItem("taskCounter", 1);
}

userDropdown.addEventListener("click", function () {
  if (
    document.querySelector("#user-dropdown-content").classList.contains("hide")
  ) {
    document.querySelector("#user-dropdown-content").classList.remove("hide");
  } else {
    document.querySelector("#user-dropdown-content").classList.add("hide");
  }
  window.onclick = function (event) {
    if (!event.target.matches("#user-dropdown-btn")) {
      document.querySelector("#user-dropdown-content").classList.add("hide");
    }
  };
});

document
  .querySelector("#user-dropdown__sign-in")
  .addEventListener("click", function () {
    document.querySelector("#content").innerHTML = signInTemplate;
    const loginForm = document.querySelector("#app-login-form");
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const login = formData.get("login");
      const password = formData.get("password");

      let fieldHTMLContent = authUser(login, password)
        ? taskFieldTemplate
        : noAccessTemplate;

      document.querySelector("#content").innerHTML = fieldHTMLContent;
      if (fieldHTMLContent === taskFieldTemplate) {
        const currentUser = appState.currentUser;
        if (currentUser) {
        }

        readyTaskListener(currentUser.id);
        inProgressTaskListener(currentUser.id);
        finishedTaskListener(currentUser.id);
        displayTasks(currentUser.id);
      }
    });
  });

document
  .querySelector("#user-dropdown__sign-up")
  .addEventListener("click", function () {
    document.querySelector("#content").innerHTML = signUpTemplate;
    const loginForm = document.querySelector("#app-register-form");
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const login = formData.get("login");
      const password = formData.get("password");

      const newUser = new User(login, password);
      User.save(newUser);

      let fieldHTMLContent = authUser(login, password)
        ? taskFieldTemplate
        : noAccessTemplate;

      document.querySelector("#content").innerHTML = fieldHTMLContent;

      if (fieldHTMLContent === taskFieldTemplate) {
        const currentUser = appState.currentUser;

        readyTaskListener(currentUser.id);
        inProgressTaskListener(currentUser.id);
        finishedTaskListener(currentUser.id);
        displayTasks(currentUser.id);
      }
    });
  });

function readyTaskListener(user) {
  const addBtn = document.querySelector("#ready__add-btn");
  const submitBtn = document.querySelector("#ready__submit-btn");
  const tasks = document.querySelector("#tasks_ready");
  const input = document.createElement("textarea");
  input.classList.add("hide");
  const newTask = document.createElement("li");

  addBtn.addEventListener("click", () => {
    addBtn.classList.add("hide");
    submitBtn.classList.remove("hide");
    newTask.classList.add("task-item");
    input.classList.remove("hide");
    input.setAttribute("placeholder", "Enter task description");
    input.classList.add("textarea");
    tasks.insertAdjacentElement("beforeend", newTask);
    newTask.insertAdjacentElement("beforeend", input);
  });

  submitBtn.addEventListener("click", () => {
    let task;
    if (input.value) {
      addBtn.classList.remove("hide");
      submitBtn.classList.add("hide");
      const taskDescription = input.value;

      task = {
        id: localStorage.getItem("taskCounter"),
        description: taskDescription,
        status: "ready",
        owner: user,
      };

      localStorage.setItem(
        "taskCounter",
        localStorage.getItem("taskCounter") + 1
      );

      addToStorage(task, "tasks");

      document.querySelector("#ready__error").classList.add("hide");
      input.value = "";
      input.classList.add("hide");
      newTask.remove();
      displayTasks(user);
    } else {
      document.querySelector("#ready__error").classList.remove("hide");
    }
  });

  window.onclick = function (event) {
    if (
      !event.target.matches(".textarea") &&
      !event.target.matches("#ready__add-btn") &&
      !event.target.matches("#ready__submit-btn") &&
      !input.classList.contains("hide")
    ) {
      let task;
      if (input.value) {
        addBtn.classList.remove("hide");
        submitBtn.classList.add("hide");
        const taskDescription = input.value;

        task = {
          id: localStorage.getItem("taskCounter"),
          description: taskDescription,
          status: "ready",
          owner: user,
        };

        localStorage.setItem(
          "taskCounter",
          localStorage.getItem("taskCounter") + 1
        );

        addToStorage(task, "tasks");

        document.querySelector("#ready__error").classList.add("hide");
        input.value = "";
        input.classList.add("hide");
        newTask.remove();
        displayTasks(user);
      } else {
        document.querySelector("#ready__error").classList.remove("hide");
      }
    }
  };
}

function inProgressTaskListener(user) {
  const addBtn = document.querySelector("#in_progress__add-btn");
  const inputList = document.querySelector("#in_progress__dropdown");
  const fakeBtn = document.querySelector("#in_progress__fake-btn");

  checkReadyTasks(user);

  addBtn.addEventListener("click", () => {
    addBtn.classList.add("hide");
    fakeBtn.classList.remove("hide");

    const inputTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const readyTasks = inputTasks.filter(
      (task) =>
        task.owner.toString() === user.toString() && task.status === "ready"
    );

    readyTasks.forEach((task) => {
      const inputItem = document.createElement("button");
      inputItem.classList.add("dropdown-item");
      inputItem.textContent = task.description;
      inputList.insertAdjacentElement("beforeend", inputItem);
      inputItem.addEventListener("click", () => {
        const taskIndex = inputTasks.findIndex((t) => t.id === task.id);

        if (taskIndex !== -1) {
          inputTasks[taskIndex].status = "in_progress";
          localStorage.setItem("tasks", JSON.stringify(inputTasks));
          inputItem.remove();
          displayTasks(user);
          checkReadyTasks(user);
        }
      });
    });

    inputList.classList.remove("hide");

    window.onclick = function (event) {
      if (!event.target.matches("#in_progress__add-btn")) {
        inputList.classList.add("hide");
        inputList.replaceChildren();
        addBtn.classList.remove("hide");
        fakeBtn.classList.add("hide");
      }
    };
  });
}

function finishedTaskListener(user) {
  const addBtn = document.querySelector("#finished__add-btn");
  const inputList = document.querySelector("#finished__dropdown");
  const fakeBtn = document.querySelector("#finished__fake-btn");

  checkInProgressTasks(user);

  addBtn.addEventListener("click", () => {
    addBtn.classList.add("hide");
    fakeBtn.classList.remove("hide");

    const inputTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const inProgressTasks = inputTasks.filter(
      (task) =>
        task.owner.toString() === user.toString() &&
        task.status === "in_progress"
    );

    inProgressTasks.forEach((task) => {
      const inputItem = document.createElement("button");
      inputItem.classList.add("dropdown-item");
      inputItem.textContent = task.description;
      inputList.insertAdjacentElement("beforeend", inputItem);
      inputItem.addEventListener("click", () => {
        const taskIndex = inputTasks.findIndex((t) => t.id === task.id);

        if (taskIndex !== -1) {
          inputTasks[taskIndex].status = "finished";
          localStorage.setItem("tasks", JSON.stringify(inputTasks));
          inputItem.remove();
          displayTasks(user);
          checkInProgressTasks(user);
        }
      });
    });

    inputList.classList.remove("hide");

    window.onclick = function (event) {
      if (!event.target.matches("#finished__add-btn")) {
        inputList.classList.add("hide");
        inputList.replaceChildren();
        addBtn.classList.remove("hide");
        fakeBtn.classList.add("hide");
      }
    };
  });
}

function checkReadyTasks(user) {
  const addBtn = document.querySelector("#in_progress__add-btn");
  const inputTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const readyTasks = inputTasks.filter(
    (task) =>
      task.owner.toString() === user.toString() && task.status === "ready"
  );
  addBtn.disabled = readyTasks.length === 0;
}

function checkInProgressTasks(user) {
  const addBtn = document.querySelector("#finished__add-btn");
  const inputTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const inProgressTasks = inputTasks.filter(
    (task) =>
      task.owner.toString() === user.toString() && task.status === "in_progress"
  );
  addBtn.disabled = inProgressTasks.length === 0;
}

function displayTasks(user) {
  checkReadyTasks(user);
  checkInProgressTasks(user);
  let activeCount = 0;
  let finishedCount = 0;

  document.querySelector("#ready__add-btn").classList.remove("hide");
  document.querySelector("#ready__submit-btn").classList.add("hide");
  document.querySelector("#ready__error").classList.add("hide");

  const oldItems = document.querySelectorAll(".task-item");
  oldItems.forEach((item) => item.remove());

  const tasks = getFromStorage("tasks");
  tasks.forEach((task) => {
    if (user == task.owner) {
      const taskItem = document.createElement("li");
      taskItem.classList.add("task-item");
      taskItem.textContent = task.description;
      switch (task.status) {
        case "ready":
          ++activeCount;
          document
            .querySelector("#tasks_ready")
            .insertAdjacentElement("beforeend", taskItem);
          break;
        case "in_progress":
          document
            .querySelector("#tasks_in_progress")
            .insertAdjacentElement("beforeend", taskItem);
          break;
        case "finished":
          ++finishedCount;
          document
            .querySelector("#tasks_finished")
            .insertAdjacentElement("beforeend", taskItem);
          break;
      }
    }
  });

  document.querySelector("#active-tasks-count").textContent = activeCount;
  document.querySelector("#finished-tasks-count").textContent = finishedCount;

  checkReadyTasks(user);
  checkInProgressTasks(user);
}
