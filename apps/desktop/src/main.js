import './style.css'

const appUrl = import.meta.env.VITE_PUBLIC_APP_URL || 'https://app.tech-agent.dev'
document.querySelector('#app-frame').src = appUrl
