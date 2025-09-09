import FormValidator from '../../ui/validation';
import App from '../../App';

export { default as register } from './register.hbs?raw';
document.addEventListener('DOMContentLoaded', () => {
  try {
    let valid: FormValidator;
    setTimeout(() => {
      const registerForm = document.getElementById('register-form') as HTMLFormElement;
      if (registerForm) {
        valid = new FormValidator('register-form');
        registerForm.addEventListener('submit', (e) => {
          e.preventDefault();
          if (valid.isValid()) {
            const formData = new FormData(registerForm);

            console.log('Почта:', formData.get('email'));
            console.log('Логин:', formData.get('login'));
            console.log('Имя:', formData.get('first_name'));
            console.log('Фамилия:', formData.get('second_name'));
            console.log('Телефон:', formData.get('phone'));
            console.log('Пароль:', formData.get('password'));
            console.log('Пароль еще раз:', formData.get('doublePassword'));

            const targetPage = e.submitter.dataset.page;
            if (targetPage) {
              const app = App.getInstance();
              app.changePage(targetPage);
            }
          }
        });
      }
    }, 0);
  } catch (error) {
    console.error('Form validation initialization error:', error);
  }
});
