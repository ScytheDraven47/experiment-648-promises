/**
 *
 * @returns {{isAuthenticated; boolean, message?: string}}
 */
function checkPin() {
  return new Promise((resolve, reject) => {
    const $modal = document.querySelector("#auth-modal");
    const $authForm = $modal.querySelector("#auth-form");
    const $pinInput = $authForm.querySelector("#input-auth-pin");

    async function handleAuthFormSubmit(e) {
      e.preventDefault();
      const pin = $pinInput.value;
      const result = await dbAuthentication({ pin });
      if (result.isAuthenticated) {
        resolve(result);
      } else {
        reject(result?.message);
      }

      $authForm.removeEventListener("submit", handleAuthFormSubmit);
      $authForm.reset();
      $modal.close();
    }

    $modal.showModal();
    $pinInput.focus();
    $authForm.addEventListener("submit", handleAuthFormSubmit);
  });
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

async function handleFormSubmit(e) {
  e.preventDefault();

  await formEffectPipe(e);
}

/*** Strategies ***/

/**
 * Previous step worked, provides result
 * @param {any} value The result
 * @returns
 */
const Success = (value) => ({ type: "Success", value });

/**
 * Something went wrong, provides error
 * @param {any} error The error
 * @returns
 */
const Failure = (value) => ({ type: "Failure", value });

/**
 * Store the async side effect but don't run it
 * @param {Function} cmd The side effect to be run
 * @param {Function} next The next step (on Success)
 * @returns
 */
const Command = (cmd, next) => ({ type: "Command", cmd, next });

/**
 * Combines an effect with the next step, based on outcome
 * @param {Function} effect The first function to run
 * @param {Function} fn The next function to run
 * @returns
 */
const chain = (effect, fn) => {
  console.log({ effect, fn });
  switch (effect.type) {
    case "Success":
      return fn(effect.value);
    case "Failure":
      return effect;
    case "Command":
      const next = (result) => chain(effect.next(result), fn);
      return Command(effect.cmd, next);
  }
};

/**
 * Uses {@link chain} to run effects in a sequence
 * @param  {...any} fns All of the functions to chain
 * @returns
 */
const effectPipe =
  (...fns) =>
  (start) =>
    fns.reduce(chain, Success(start));

/**
 * Runs a Command
 * @param {Function} effect A side effect to run
 * @returns
 */
async function runEffect(effect) {
  while (effect.type === "Command") {
    try {
      effect = effect.next(await effect.cmd());
    } catch (e) {
      return Failure(e);
    }
  }
  return effect;
}

function checkHTMLValidationEffect($form) {
  const result = checkHTMLValidation($form);
  return result.isValid ? Success(result) : Failure(result?.message);
}

async function dbCoinTossWrapper() {
  const result = await dbCoinToss();
  updateStatus(
    result.isValid ? "" : "Coin toss failed!",
    result.isValid ? "success" : "error",
  );
  return result;
}

const dbCoinTossCmd = () =>
  Command(
    () => dbCoinTossWrapper(),
    (result) => Success(result),
  );

const dbCoinTossEffect = (result) =>
  result.isValid ? Success(result) : Failure(result?.message);

async function checkPinWrapper() {
  const result = await checkPin();
  updateStatus(
    result.isAuthenticated ? "Authenticated!" : "Authentication Failed!",
    result.isAuthenticated ? "success" : "error",
  );
  return result;
}

const checkPinCmd = () =>
  Command(
    () => checkPinWrapper(),
    (result) => Success(result),
  );

const checkPinEffect = (result) =>
  result.isAuthenticated ? Success(result) : Failure(result?.message);

function saveForm() {
  updateStatus("Saved!", "success");
  toggleFormButtonsEnabled(true);
  return Success("yay!");
}

const formEffectPipeFlow = ($form) =>
  effectPipe(
    checkHTMLValidationEffect,
    () => dbCoinTossCmd(),
    dbCoinTossEffect,
    () => checkPinCmd(),
    checkPinEffect,
    saveForm,
  )($form);

async function formEffectPipe(e) {
  const $form = e.currentTarget;
  toggleFormButtonsEnabled($form, false);
  await runEffect(formEffectPipeFlow($form));
}
