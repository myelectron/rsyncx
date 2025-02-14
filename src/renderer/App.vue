<template>
    <div class="task">
        <vxe-grid ref="gridRef" v-bind="gridOptions" v-on="gridEvents">
            <template #toolbarButtons>
                <a-button type="primary" :icon="h(PlusOutlined)" @click="onAdd">新增</a-button>
                <a-divider type="vertical" />
                <a-button :disabled="!hasChanged" :icon="h(CheckOutlined)" @click="onSave">保存</a-button>
                <a-button :disabled="!hasChanged" :icon="h(CloseOutlined)" @click="onCancel">放弃</a-button>
            </template>
            <template #action="{ row }">
                <a-button :icon="h(DeleteOutlined)" @click="makeDel(row)">删除</a-button>
                <a-button
                    type="primary"
                    :icon="h(RightCircleOutlined)"
                    :disabled="isPendingByRow(row)"
                    @click="exec(row)"
                >
                    执行
                </a-button>
            </template>
        </vxe-grid>
    </div>
    <div class="display">
        <div class="header">命令行响应结果</div>
        <div class="content" ref="displayContentRef">
            <div
                class="item"
                :class="{
                    'item-error': item.type === 'error',
                }"
                v-for="(item, index) in display"
                :key="index"
            >
                {{ item.content }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { h, ref, reactive } from 'vue';
import {
    PlusOutlined,
    DeleteOutlined,
    RightCircleOutlined,
    CheckOutlined,
    CloseOutlined,
    InfoCircleFilled,
    CloseCircleFilled,
} from '@ant-design/icons-vue';
import { VxeUI, VxeGridInstance, VxeGridListeners, VxeGridProps, VxeTablePropTypes, VxeGridPropTypes } from 'vxe-table';
import { JobMo } from './mo/JobMo';
import { JobApi } from './api/JobApi';
import { execRsync, onRsyncOutput, onRsyncError } from './util/RsyncUtils';

const gridRef = ref<VxeGridInstance<JobMo>>();
const display = ref([]);
const displayContentRef = ref<HTMLElement>();

let displayStatus: 'normal' | 'wait-file-name' | 'wait-send' = 'normal';
let fileName = '';
const pushDisplayItem = (item: { type: 'info' | 'error'; content: string }) => {
    display.value.push(item);
    nextTick(() => {
        if (displayContentRef.value) {
            displayContentRef.value.scrollTop = displayContentRef.value.scrollHeight;
        }
    });
};
onRsyncOutput((data) => {
    console.log('data', data);
    const lines = data.split('\n');
    for (let line of lines) {
        line = line.trim();
        if (line === '') continue;
        let content;
        switch (displayStatus) {
            case 'wait-file-name':
                if (/^sent \d+ \w+  received \d+ \w+  \d+\.\d+ .+$/.test(line)) {
                    const [_, sentBytes, sentUnit, receivedBytes, receivedUnit, speed, speedUnit] = line.match(
                        /^sent (\d+) (\w+)  received (\d+) (\w+)  (\d+\.\d+) (.+)$/,
                    );
                    content = `已传送(${sentBytes}${sentUnit})，已接收(${receivedBytes}${receivedUnit})，速度(${speed}${speedUnit})`;
                    displayStatus = 'normal';
                } else {
                    fileName = line;
                    content = `文件名: ${fileName}`;
                    displayStatus = 'wait-send';
                }
                break;
            case 'wait-send':
                const [completed, process, speed, time] = line.split(/\s+/);
                content = `${fileName}: 进度(${process})，传送(${completed})，速度(${speed})，时间(${time})`;
                const last = display.value[display.value.length - 1];
                if (last.content.startsWith(`${fileName}: 进度(`)) {
                    last.content = content;
                } else {
                    pushDisplayItem({ type: 'info', content });
                }
                if (process === '100%') displayStatus = 'normal';
                continue;
            case 'normal':
                if (/^building file list \.\.\.$/.test(line)) {
                    content = '正在准备处理文件...';
                } else if (/^\d+ files\.\.\.$/.test(line)) {
                    const fileCount = line.match(/^(\d+)/)[1];
                    content = `已处理 ${fileCount} 个文件...`;
                } else if (/^\d+ file to consider$/.test(line)) {
                    const fileCount = line.match(/^(\d+)/)[1];
                    content = `准备处理 ${fileCount} 个文件`;
                    displayStatus = 'wait-file-name';
                } else if (/^sent \d+ \w+  received \d+ \w+  \d+\.\d+ .+$/.test(line)) {
                    const [_, sentBytes, sentUnit, receivedBytes, receivedUnit, speed, speedUnit] = line.match(
                        /^sent (\d+) (\w+)  received (\d+) (\w+)  (\d+\.\d+) (.+)$/,
                    );
                    content = `已传送(${sentBytes}${sentUnit})，已接收(${receivedBytes}${receivedUnit})，速度(${speed}${speedUnit})`;
                    const last = display.value[display.value.length - 1];
                    if (last.content.startsWith(`${fileName}: 进度(`)) {
                        last.content = fileName + ': ' + content;
                        continue;
                    }
                } else if (/^total size is \d+  speedup is \d+\.\d+$/.test(line)) {
                    const [_, totalSize, speedup] = line.match(/^total size is (\d+)  speedup is (\d+\.\d+)$/);
                    content = `已处理文件总大小(${totalSize})，速度(${speedup})`;
                } else {
                    content = line;
                }
                break;
            default:
                content = line;
        }
        pushDisplayItem({ type: 'info', content });
    }
});
onRsyncError((data) => {
    pushDisplayItem({ type: 'error', content: data });
    displayStatus = 'normal';
});

const editRules: VxeTablePropTypes.EditRules<JobMo> = {
    name: [{ required: true, message: '必须填写' }],
    src: [{ required: true, message: '必须填写' }],
    target: [{ required: true, message: '必须填写' }],
};

const columns: VxeGridPropTypes.Columns<JobMo> = [
    {
        field: 'name',
        title: '名称',
        width: '200',
        dragSort: true,
        editRender: { name: 'input' },
    },
    { field: 'src', title: '来源', width: '400', editRender: { name: 'input' } },
    { field: 'target', title: '目标', width: '400', editRender: { name: 'input' } },
    {
        field: 'port',
        title: '端口',
        width: 80,
        editRender: { name: 'VxeNumberInput', props: { type: 'integer' } },
    },
    { field: 'exclude', title: '排除', width: 150, editRender: { name: 'input' } },
    { field: 'args', title: '其它参数', width: '200', editRender: { name: 'input' } },
    {
        field: 'delete',
        title: '删除冗余',
        width: 80,
        resizable: false,
        cellRender: {
            name: 'VxeSwitch',
            props: {
                disabled: false,
            },
        },
    },
    { title: '操作', fixed: 'right', width: 202, resizable: false, slots: { default: 'action' } },
];

const gridOptions = reactive<VxeGridProps<JobMo>>({
    stripe: true,
    keepSource: true,
    showOverflow: true,
    height: '100%',
    resizableConfig: {
        isDblclickAutoWidth: true,
    },
    toolbarConfig: {
        import: true,
        export: true,
        custom: true,
        zoom: true,
        slots: {
            buttons: 'toolbarButtons',
        },
    },
    importConfig: {},
    exportConfig: {},
    columnConfig: {
        resizable: true,
    },
    rowConfig: {
        useKey: true,
        isHover: true,
        drag: true,
        isCurrent: true,
    },
    editConfig: {
        trigger: 'dblclick',
        mode: 'row',
        showIcon: false,
        showStatus: true,
    },
    keyboardConfig: {
        isTab: true,
        isEsc: true,
    },
    editRules,
    columns,
});

const gridEvents: VxeGridListeners<JobMo> = {
    cellClick({ row }) {
        const $grid = gridRef.value;
        if ($grid) {
            if ($grid.isUpdateByRow(row)) {
                hasChanged.value = true;
            }
        }
    },
    editClosed({ row }) {
        const $grid = gridRef.value;
        if ($grid) {
            hasChanged.value = checkChanged();
        }
    },
};

const refresh = async () => {
    gridOptions.loading = true;
    try {
        gridOptions.data = await JobApi.list();
        hasChanged.value = false;
    } catch (error) {
        console.error(error);
        VxeUI.modal.message({ content: '刷新失败！', status: 'error' });
    } finally {
        gridOptions.loading = false;
    }
};

const onAdd = async () => {
    const $grid = gridRef.value;
    const newRow: JobMo = {
        id: undefined,
        name: undefined,
        src: undefined,
        target: undefined,
    };
    const { row } = await $grid.insertAt(newRow, null);
    await $grid.setEditRow(row);
    hasChanged.value = true;
};

const hasChanged = ref(false);

const checkChanged = () => {
    const $grid = gridRef.value;
    if (!$grid) return false;
    const { insertRecords, updateRecords, removeRecords, pendingRecords } = $grid.getRecordset();
    return (
        insertRecords.length > 0 || updateRecords.length > 0 || removeRecords.length > 0 || pendingRecords.length > 0
    );
};

const makeDel = async (row: JobMo) => {
    const $grid = gridRef.value;
    await $grid.togglePendingRow(row);
    hasChanged.value = checkChanged();
};

const isPendingByRow = (row: JobMo) => {
    const $grid = gridRef.value;
    return $grid.getPendingRecords().some((item) => item.id === row.id);
};

/**
 * 校验
 */
const validate = async () => {
    const $grid = gridRef.value;
    const result = !!!(await $grid.validate(true));
    result || VxeUI.modal.message({ status: 'error', content: '校验不通过！' });
    return result;
};

const onSave = async () => {
    gridOptions.loading = true;
    try {
        const valid = await validate();
        const $grid = gridRef.value;
        if ($grid) {
            if (!valid) return;
            const { insertRecords, updateRecords, removeRecords, pendingRecords } = $grid.getRecordset();
            console.log(insertRecords, updateRecords, removeRecords, pendingRecords);
            for (const record of insertRecords) {
                await JobApi.add(record);
            }
            for (const record of updateRecords) {
                await JobApi.update(record);
            }
            for (const record of removeRecords) {
                await JobApi.del(record.id);
            }
            for (const record of pendingRecords) {
                await JobApi.del(record.id);
            }
            await refresh();
        }
    } catch (error) {
        console.error(error);
        VxeUI.modal.message({ content: '保存失败！', status: 'error' });
    } finally {
        gridOptions.loading = false;
    }
};

const onCancel = async () => {
    const $grid = gridRef.value;
    if (hasChanged.value) {
        const result = await VxeUI.modal.confirm('确认要放弃修改吗？');
        if (result !== 'confirm') return;
        await refresh();
    }
};

const exec = async (row: JobMo) => {
    execRsync(row);
    // try {
    //     display.value.push(execRsync(row));
    // } catch (error) {
    //     console.error(error);
    //     display.value.push(error);
    //     VxeUI.modal.message({ content: '执行失败！', status: 'error' });
    // }
};

onMounted(async () => {
    await refresh();
});
</script>

<style scoped>
button {
    margin: 0 5px;
}
.task {
    flex-grow: 1;
}
.display {
    display: flex;
    flex-direction: column;
    margin: 10px 0;
    border: 1px solid #eee;
    height: 300px;
    .header {
        height: 30px;
        padding: 10px;
        border-bottom: 1px solid #eee;
    }
    .content {
        /* padding: 10px; */
        flex-grow: 1;
        overflow: auto;
        .item {
            border-bottom: 1px solid #eee;
            padding: 10px;
        }
    }
}
.item-error {
    color: red;
}
</style>
