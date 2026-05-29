import './style.css'

const appUrl = import.meta.env.VITE_PUBLIC_APP_URL || 'https://sunguoyuan415-create.github.io/tech-agent'
document.querySelector('#app-frame').src = appUrl
