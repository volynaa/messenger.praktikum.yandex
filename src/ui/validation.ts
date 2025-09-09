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

    if (input.hasAttribute('minLen')) {
      rules.minLen = parseInt(input.getAttribute('minLen') || '0');
    }

    if (input.hasAttribute('maxLen')) {
      rules.maxLen = parseInt(input.getAttribute('maxLen') || '0');
    }

    if (input.hasAttribute('pattern')) {
      rules.pattern = input.getAttribute('pattern') || '';
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

  private validateField(input: HTMLInputElement): boolean {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    if (input.required && !value) {
      errorMessage = 'Это поле обязательно для заполнения';
      isValid = false;
    }
    const minLen = input.getAttribute('minLen');
    if (isValid && (value.length < minLen || value.length === 0)) {
      if (value.length === 0) {
        errorMessage = 'Обязательное поле';
      } else {
        errorMessage = `Минимальная длина: ${minLen} символа`;
      }
      isValid = false;
    }
    const maxLen = input.getAttribute('maxLen');
    if (isValid && maxLen && value.length > maxLen) {
      errorMessage = `Максимальная длина: ${maxLen} символов`;
      isValid = false;
    }
    if (isValid && input.id === 'login' && /^\d+$/.test(value)) {
      errorMessage = 'Логин не может состоять только из цифр';
      isValid = false;
    }
    const pattern = input.getAttribute('pat');
    if (isValid && pattern && !new RegExp(pattern).test(value)) {
      errorMessage = 'Неверный формат';
      isValid = false;
    }
    if (isValid && input.id === 'doublePassword' && this.inputs[5].value !== value) {
      errorMessage = 'Пароли должны совпадать';
      isValid = false;
    }
    if (!isValid) {
      this.showError(input, errorMessage);
    }
    return isValid;
  }

  private showError(input: FormField, message: string): void {
    const labelError = input.parentNode?.querySelector('.error-message');
    if (!labelError) {
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
  }

  private clearError(input: FormField): void {
    const errorElement = input.parentNode?.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
    input.classList.remove('input-error');
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

  public clearAllErrors(): void {
    this.inputs.forEach((input) => {
      this.clearError(input);
    });
  }

  public isValid(): boolean {
    return this.validateAll();
  }
}
export default FormValidator;
