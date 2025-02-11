import { createApp } from 'vue';
import App from './App.vue';
import './Index.css';
import { lazyVxeTable, lazyVxeUI } from './Vxe';
import { lazyAntDesign } from './AntDesign';
import './Db';

createApp(App).use(lazyAntDesign).use(lazyVxeUI).use(lazyVxeTable).mount('#app');
