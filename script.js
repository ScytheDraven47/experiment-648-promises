/**
 *
 * @returns {{isAuthenticated; boolean, message?: string}}
 */
function checkPin(resolve, reject) {
  // const result = confirm("Do you authenticate?");

  // if (result) {
  //   return {
  //     isAuthenticated: true,
  //   };
  // }

  // return {
  //   isAuthenticated: false,
  //   message: "User cancelled",
  // };

  new Promise((resolve, reject) => {});

  const $modal = document.querySelector("#auth-modal");
  const $authForm = $modal.querySelector("#auth-form");
  const $pinInput = $authForm.querySelector("#input-auth-pin");

  async function handleAuthFormSubmit(e) {
    e.preventDefault();
    const pin = $pinInput.value;
    const result = await dbAuthentication(pin);
    if (result.isAuthenticated) {
      // resolve(result);
    } else {
      // reject(result);
    }
    $authForm.removeEventListener("submit", handleAuthFormSubmit);
  }

  $modal.showModal();
  $pinInput.focus();
  $authForm.addEventListener("submit", handleAuthFormSubmit);
}

/**
 * @param {ValidityState} validity
 * @returns {{isValid: boolean, message?: string}}
 */
function parseValidityState(validity) {
  if (validity.valid)
    return {
      isValid: true,
    };

  let messages = [];
  if (validity.badInput) {
    messages.push("badInput");
  }
  if (validity.customError) {
    messages.push("customError");
  }
  if (validity.patternMismatch) {
    messages.push("patternMismatch");
  }
  if (validity.rangeOverflow) {
    messages.push("rangeOverflow");
  }
  if (validity.rangeUnderflow) {
    messages.push("rangeUnderflow");
  }
  if (validity.stepMismatch) {
    messages.push("stepMismatch");
  }
  if (validity.tooLong) {
    messages.push("tooLong");
  }
  if (validity.tooShort) {
    messages.push("tooShort");
  }
  if (validity.typeMismatch) {
    messages.push("typeMismatch");
  }
  if (validity.valueMissing) {
    messages.push("valueMissing");
  }
  return {
    isValid: false,
    message: messages.join(", "),
  };
}

function toggleFormButtonsEnabled($form, shouldEnable) {
  Array.from(
    $form.querySelectorAll("button:where([type=submit],[type=reset])"),
  ).forEach((button) => {
    if (shouldEnable) {
      button.removeAttribute("disabled");
    } else {
      button.setAttribute("disabled", "disabled");
    }
  });
}

/*** Form Handling ***/

const $form = document.querySelector("#test-form");
const $statusMessage = document.querySelector("#status-message");
const $authModal = document.querySelector("#auth-modal");
const $authForm = document.querySelector("#auth-form");
$form.addEventListener("submit", handleFormSubmit);

const updateStatus = (message, status) => {
  $statusMessage.textContent = message;

  $statusMessage.classList.remove("success", "error");
  switch (status) {
    case "success":
      $statusMessage.classList.add("success");
      break;
    case "error":
      $statusMessage.classList.add("error");
      break;
  }
};

function handleFormSubmit(e) {
  e.preventDefault();

  formPromiseChain(e);
}

function formBranching(e) {
  const $form = e.currentTarget;
  toggleFormButtonsEnabled($form, false);
}

function formPromiseChain(e) {
  const $form = e.currentTarget;
  toggleFormButtonsEnabled($form, false);
  new Promise((resolve, reject) => {
    const result = checkHTMLValidation($form);

    if (!result.isValid) {
      reject("Failed HTML validation!");
    }

    resolve();
  })
    .then(async () => {
      updateStatus("Fetching from DB...");
      const result = await dbCoinToss();
      if (!result.isValid) {
        throw new Error(result?.message);
      }
      updateStatus("");
    })
    .then(() => {
      const result = checkPin();
      if (!result.isAuthenticated) {
        throw new Error(result?.message);
      }
      updateStatus("Authenticated!");
    })
    .then(() => {
      updateStatus("Saved!", "success");
    })
    .catch((message) => {
      updateStatus(message, "error");
    })
    .finally(() => {
      toggleFormButtonsEnabled($form, true);
    });
}

/**
 *
 * @param {HTMLFormElement} $form
 */
function checkHTMLValidation($form) {
  /**
   * @type {{name: string, isValid: boolean, message?: string}[]} Result of parseValidityState + name
   */
  let inputs = [];
  Array.from($form.querySelectorAll("input")).map(({ validity, name }) => ({
    name,
    ...parseValidityState(validity),
  }));
  return inputs.reduce(
    (prev, curr) => {
      if (curr.isValid) return prev;

      return {
        isValid: false,
        message: prev.message + `\n${curr.name}: ${curr?.message}`,
      };
    },
    { isValid: true, message: "" },
  );
}
