import { Button, message } from 'ant-design-vue';
import { App } from 'vue';
// 可选组件
export function lazyAntDesign(app: App) {
    app.use(Button);
    app.config.globalProperties.$message = message;
}
