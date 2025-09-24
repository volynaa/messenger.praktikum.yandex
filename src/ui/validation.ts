export interface ValidationRules {
  required?: boolean;
  errorShow?: boolean;
  minLen?: number;
  maxLen?: number;
  pattern?: string;
  customValidator?: (value: string) => string | null;
}

export interface FormField extends HTMLInputElement {
  validationRules?: ValidationRules;
}

class FormValidator {
  private form: HTMLFormElement;
  private inputs: NodeListOf<FormField>;

  constructor(formId: string) {
    const form = document.getElementById(formId) as HTMLFormElement;
    if (!form) {
      throw new Error(`Form with id "${formId}" not found`);
    }
    this.form = form;
    this.inputs = this.form.querySelectorAll('input');
    this.init();
  }

  private init(): void {
    this.inputs.forEach((input) => {
      this.initializeValidationRules(input);
    });
  }

  private initializeValidationRules(input: FormField): void {
    const rules: ValidationRules = {};

    const minLenAttr = input.getAttribute('minLen');
    if (minLenAttr) {
      rules.minLen = parseInt(minLenAttr, 10);
    }

    const maxLenAttr = input.getAttribute('maxLen');
    if (maxLenAttr) {
      rules.maxLen = parseInt(maxLenAttr, 10);
    }

    const patternAttr = input.getAttribute('pat');
    if (patternAttr) {
      rules.pattern = patternAttr;
    }

    const requiredAttr = input.getAttribute('req');
    if (requiredAttr) {
      rules.required = requiredAttr === 'true' || requiredAttr === '';
    }

    const errorAttr = input.getAttribute('errorShow');
    rules.errorShow = errorAttr === 'true';


    input.validationRules = rules;
  }

  private validateField(input: FormField): boolean {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    if (input.validationRules?.required && !value) {
      errorMessage = 'Это поле обязательно для заполнения';
      isValid = false;
    }

    if (isValid && input.validationRules?.minLen !== undefined) {
      if (value.length < input.validationRules.minLen) {
        errorMessage = `Минимальная длина: ${input.validationRules.minLen} символов`;
        isValid = false;
      }
    }

    if (isValid && input.validationRules?.maxLen !== undefined) {
      if (value.length > input.validationRules.maxLen) {
        errorMessage = `Максимальная длина: ${input.validationRules.maxLen} символов`;
        isValid = false;
      }
    }

    if (isValid && input.id === 'login' && /^\d+$/.test(value)) {
      errorMessage = 'Логин не может состоять только из цифр';
      isValid = false;
    }

    if (isValid && input.validationRules?.pattern) {
      if (!new RegExp(input.validationRules.pattern).test(value)) {
        errorMessage = 'Неверный формат';
        isValid = false;
      }
    }

    if (isValid && input.id === 'password-repeat') {
      const passwordInput = Array.from(this.inputs).find(
          (inp) => inp.name === 'password');
      if (passwordInput && passwordInput.value !== value) {
        errorMessage = 'Пароли должны совпадать';
        isValid = false;
      }
    }
    if (!isValid&&input.validationRules?.errorShow) {
      this.showError(input, errorMessage);
    }

    return isValid;
  }

  private showError(input: FormField, message: string): void {
    this.clearError(input);

    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    Object.assign(errorElement.style, {
      color: 'red',
      fontSize: '12px',
      marginTop: '5px',
      display: 'block',
    });

    input.classList.add('input-error');
    input.insertAdjacentElement('afterend', errorElement);
  }

  private clearError(input: FormField): void {
    if(input){
      const errorElement = input.nextElementSibling as HTMLElement;
      if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.remove();
      }
      input.classList.remove('input-error');
    }
  }

  private clearAllErrors(): void {
    this.inputs.forEach((input) => {
      this.clearError(input);
    });
  }

  public validateAll(): boolean {
    let isValid = true;
    this.clearAllErrors();
    this.inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  public isValid(): boolean {
    return this.validateAll();
  }

  public isValidOneElement(e): boolean {
    let isValid = true;
    let elem = undefined
    this.inputs.forEach((input) => {
      if(input.id===e.target.id){
        elem = input
      }
    });
    this.clearError(elem);
    if (elem && !this.validateField(elem)) {
      isValid = false;
    }

    return isValid;
  }
}

export default FormValidator;
