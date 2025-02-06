<template>
    <vxe-grid v-bind="gridOptions">
        <vxe-column type="seq" title="序号" width="50"></vxe-column>
        <vxe-column field="name" title="名称" width="20%"></vxe-column>
        <vxe-column field="src" title="来源" width="25%"></vxe-column>
        <vxe-column field="target" title="目标" width="25%"></vxe-column>
        <vxe-column field="port" title="端口" width="50"></vxe-column>
        <vxe-column field="delete" title="删除" width="50"></vxe-column>
        <vxe-column field="exclude" title="排除" width="50"></vxe-column>
        <vxe-column field="args" title="其它参数" width="10%"></vxe-column>
        <vxe-column title="操作" width="50"> </vxe-column>
    </vxe-grid>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { VxeGridProps } from 'vxe-table';
import { JobMo } from './mo/JobMo';

const gridOptions = reactive<VxeGridProps<JobMo>>({
    columns: [
        { type: 'seq', width: 60 },
        { field: 'name', title: '名称', minWidth: '20%' },
        { field: 'src', title: '来源', minWidth: '25%' },
        { field: 'target', title: '目标', minWidth: '25%' },
        { field: 'port', title: '端口', minWidth: 50 },
        { field: 'delete', title: '删除', minWidth: 50 },
        { field: 'exclude', title: '排除', minWidth: 50 },
        { field: 'args', title: '其它参数', minWidth: '10%' },
        { title: '操作', minWidth: 50 },
    ],
    data: [
        {
            id: 1,
            name: '柳化氯碱-adm-svr',
            src: '~/workspace/rebue/adm/adm-svr/target/adm-svr-1.0.0.jar',
            target: 'lhlj-prod:/usr/local/adm-svr/',
        },
    ],
});
</script>

<style scoped></style>
