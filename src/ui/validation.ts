export interface ValidationRules {
  required?: boolean;
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
    this.form.addEventListener('submit', (e) => this.validateForm(e));

    this.inputs.forEach((input) => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));

      this.initializeValidationRules(input);
    });
  }

  private initializeValidationRules(input: FormField): void {
    const rules: ValidationRules = {};

    if (input.hasAttribute('required')) {
      rules.required = true;
    }

    const minLenAttr = input.getAttribute('minLen');
    if (minLenAttr) {
      rules.minLen = parseInt(minLenAttr, 10);
    }

    const maxLenAttr = input.getAttribute('maxLen');
    if (maxLenAttr) {
      rules.maxLen = parseInt(maxLenAttr, 10);
    }

    const patternAttr = input.getAttribute('pattern');
    if (patternAttr) {
      rules.pattern = patternAttr;
    }

    input.validationRules = rules;
  }

  private validateForm(e: Event): boolean {
    this.clearAllErrors();

    let isValid = true;

    this.inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    if (!isValid) {
      e.preventDefault();
    }

    return isValid;
  }

  private validateField(input: FormField): boolean {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    if (input.required && !value) {
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

    if (isValid && input.id === 'doublePassword') {
      const passwordInput = Array.from(this.inputs).find(
          (inp) => inp.type === 'password' && inp.id !== 'doublePassword'
      );
      if (passwordInput && passwordInput.value !== value) {
        errorMessage = 'Пароли должны совпадать';
        isValid = false;
      }
    }

    if (!isValid) {
      this.showError(input, errorMessage);
    }

    return isValid;
  }

  private showError(input: FormField, message: string): void {
    this.clearError(input); // Сначала очищаем предыдущую ошибку

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
    const errorElement = input.nextElementSibling as HTMLElement;
    if (errorElement && errorElement.classList.contains('error-message')) {
      errorElement.remove();
    }
    input.classList.remove('input-error');
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
}

export default FormValidator;
