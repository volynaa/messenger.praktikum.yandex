import FormValidator from "../../ui/validation";
import App from "../../App";

export { default as login } from './login.hbs?raw'
document.addEventListener('DOMContentLoaded', (e) => {
    try {
        let valid: FormValidator;
        setTimeout(() => {
            valid = new FormValidator('login-form');
            const loginForm = document.getElementById('login-form') as HTMLFormElement;
            console.log(loginForm)
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if (valid.isValid()) {
                        const formData = new FormData(loginForm);
                        const login = formData.get('login');
                        const password = formData.get('password');

                        console.log('Логин:', login);
                        console.log('Пароль:', password);

                        const targetPage = e.submitter.dataset.page;
                        if(targetPage){
                            const app = App.getInstance();
                            app.changePage(targetPage)
                        }
                    }
                });
            }
        }, 0);

    } catch (error) {
        console.error('Form validation initialization error:', error);
    }
});
