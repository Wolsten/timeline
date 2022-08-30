import './app.css'
import App from './App.svelte'

// check for timelines
const timelines = document.querySelectorAll('time-line')
// console.log(timelines)

let app

// Only load app if find any timelines
if (timelines.length > 0) {
    const div = document.createElement('DIV')
    div.id = 'app'
    document.body.appendChild(div)
    app = new App({
        target: document.getElementById('app')
    })
}

export default app


