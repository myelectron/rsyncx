import { createApp } from 'vue';
import App from './App.vue';
import './Index.css';
import { lazyVxeTable, lazyVxeUI } from './Vxe';
import './Db';

createApp(App).use(lazyVxeUI).use(lazyVxeTable).mount('#app');
