import './styles/main.pcss'
import './styles/variable.pcss'
import App from './App'

document.addEventListener('DOMContentLoaded', () => {
    const app = App.getInstance();
    app.render();
})
