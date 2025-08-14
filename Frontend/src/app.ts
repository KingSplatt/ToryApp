import { api, WeatherForecast } from './api';

const appEl = document.getElementById('app')!;

function render() {
  appEl.innerHTML = `
    <div class="header">
      <h1>ToryApp</h1>
    </div>
  `;
}

render();
