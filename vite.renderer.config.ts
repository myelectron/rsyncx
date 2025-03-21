import vue from '@vitejs/plugin-vue';
import ReactivityTransform from '@vue-macros/reactivity-transform/vite';
import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import { AntDesignVueResolver, ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import AutoRegistry from 'unplugin-vue-components/vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { lazyImport, VxeResolver } from 'vite-plugin-lazy-import';

// https://vitejs.dev/config/
// mode:
//      命令 vite 的 mode 为 development
//      命令 vite build 的 mode 为 production
//      如果想自定义mode，运行命令 vite build --mode <自定义mode名称>
export default defineConfig(({ mode }) => {
    // 根目录
    const rootDir = resolve(__dirname);
    // 源代码目录
    const srcDir = resolve(__dirname, 'src/renderer');

    // 根据当前工作目录中的 `mode` 加载 .env 文件
    // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
    // https://cn.vitejs.dev/config/#using-environment-variables-in-config
    const env = loadEnv(mode, rootDir, '');

    return {
        build: {
            root: rootDir,
            // 编译输出路径
            // outDir: resolve(__dirname, 'dist'),
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true, // 生产环境时移除console
                    drop_debugger: true, // 生产环境时移除debugger;
                },
            },
        },
        resolve: {
            alias: {
                // 代码中使用路径时，用 ~/ 开头来代表src下的路径
                '~': srcDir,
            },
        },
        css: {
            preprocessorOptions: {
                less: {
                    javascriptEnabled: true,
                },
                scss: {
                    additionalData: '@use "./src/style/index.scss" as *;',
                },
            },
            // postcss: {
            //     plugins: [pxToViewport],
            // },
        },
        plugins: [
            vue(),
            // 按需加载模块 https://vxetable.cn/#/start/useGlobal
            lazyImport({
                resolvers: [
                    VxeResolver({
                        libraryName: 'vxe-table',
                    }),
                    VxeResolver({
                        libraryName: 'vxe-pc-ui',
                    }),
                ],
            }),
            // Reactivity Transform
            // https://vue-macros.sxzz.moe/zh-CN/features/reactivity-transform.html
            ReactivityTransform(),
            // 图标库插件(https://github.com/unplugin/unplugin-icons)
            // 图标库(https://icones.js.org)
            Icons({
                // vue3编译器(需要安装@vue/compiler-sfc)
                compiler: 'vue3',
                // 自动安装，可以检测import来自动安装图标集(实验性功能)
                autoInstall: true,
            }),
            // 按需自动导入API，可以免写import语句
            // https://github.com/unplugin/unplugin-auto-import
            AutoImport({
                // 应用在哪些文件上
                include: [
                    /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
                    /\.vue$/,
                    /\.vue\?vue/, // .vue
                    /\.md$/, // .md
                ],
                // 全局导入
                imports: [
                    // 内置
                    'vue',
                    'pinia',
                ],
                // 第三方提供的自动导入解析器
                resolvers: [
                    AntDesignVueResolver({
                        importStyle: false, // ant design vue 4.0不需要导入样式
                    }),
                    ElementPlusResolver(),
                    // IconsResolver({
                    //     // 自动引入的Icon组件统一前缀，默认为 i，设置false为不需要前缀
                    //     // {prefix}-{collection}-{icon-name}
                    //     prefix: 'icon',
                    // }),
                ],
                // 在root目录下自动生成auto-imports.d.ts文件
                dts: true,
            }),
            // 按需自动注册组件
            // https://github.com/unplugin/unplugin-vue-components
            AutoRegistry({
                // 查找自定义组件的位置
                dirs: ['component', 'view'],
                // 第三方提供的自动注册解析器
                resolvers: [
                    AntDesignVueResolver({
                        importStyle: false, // ant design vue 4.0不需要导入样式
                    }),
                    ElementPlusResolver(),
                    // 自动导入图标组件，可以免写import语句
                    IconsResolver({
                        // 自动引入的Icon组件统一前缀，默认为 i，设置false为不需要前缀
                        // {prefix}-{collection}-{icon-name}
                        prefix: 'icon',
                    }),
                ],
                // 在root目录下自动生成components.d.ts文件
                dts: true,
            }),
            // HTML插件
            // https://github.com/vbenjs/vite-plugin-html
            createHtmlPlugin({
                // 注入
                inject: {
                    data: {
                        title: env.VITE_APP_NAME, // 注入标题
                    },
                },
            }),
        ],
    };
});
