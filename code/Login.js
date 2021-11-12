const sign_in_btn = document.querySelector("#goto-instructor-container-btn");
const sign_up_btn = document.querySelector("#goto-student-container-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("show-student-forms-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("show-student-forms-mode");
});