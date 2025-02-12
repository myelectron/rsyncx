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
                    @click="makeDel(row)"
                    >执行</a-button
                >
            </template>
        </vxe-grid>
    </div>
    <div class="display"></div>
</template>

<script setup lang="ts">
import { h, ref, reactive } from 'vue';
import {
    FormOutlined,
    PlusOutlined,
    RollbackOutlined,
    DeleteOutlined,
    UndoOutlined,
    RightCircleOutlined,
    SaveOutlined,
    CheckOutlined,
    CloseOutlined,
    ImportOutlined,
    ExportOutlined,
} from '@ant-design/icons-vue';
import { VxeUI, VxeGridInstance, VxeGridListeners, VxeGridProps, VxeTablePropTypes, VxeGridPropTypes } from 'vxe-table';
import { JobMo } from './mo/JobMo';
import { ulid } from 'ulid';

const gridRef = ref<VxeGridInstance<JobMo>>();
const editStatus = ref(false);

const editRules: VxeTablePropTypes.EditRules<JobMo> = {
    name: [{ required: true, message: '必须填写' }],
    src: [{ required: true, message: '必须填写' }],
    target: [{ required: true, message: '必须填写' }],
};

const columns: VxeGridPropTypes.Columns<JobMo> = [
    // { type: 'seq', width: 50, resizable: false, fixed: 'left' },
    {
        field: 'name',
        title: '名称',
        width: '200',
        // fixed: 'left',
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
    },
    editConfig: {
        trigger: 'dblclick',
        mode: 'row',
        showIcon: false,
        showStatus: true,
    },
    resizableConfig: {
        isDblclickAutoWidth: true,
    },
    editRules,
    columns,
    // data,
    //  [
    //     {
    //         seq: 1,
    //         id: 1,
    //         name: '柳化氯碱-adm-svr',
    //         src: '~/workspace/rebue/adm/adm-svr/target/adm-svr-1.0.0.jar',
    //         target: 'lhlj-prod:/usr/local/adm-svr/',
    //     },
    // ],
});

const gridEvents: VxeGridListeners<JobMo> = {
    editClosed({ row }) {
        const $grid = gridRef.value;
        if ($grid) {
            if ($grid.isUpdateByRow(row)) {
                hasChanged.value = true;
            }
        }
    },
};

const onAdd = async () => {
    const $grid = gridRef.value;
    const newRow: JobMo = {
        id: ulid(),
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
    console.log(insertRecords, updateRecords, removeRecords, pendingRecords);

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
    const $grid = gridRef.value;
    if ($grid) {
        const valid = await validate();
        if (!valid) return;
        await $grid.clearEdit();
        gridOptions.loading = true;
        setTimeout(() => {
            const { insertRecords, updateRecords, removeRecords, pendingRecords } = $grid.getRecordset();
            console.log(insertRecords, updateRecords, removeRecords, pendingRecords);
            gridOptions.loading = false;
            VxeUI.modal.message({ content: '保存成功！', status: 'success' });
            hasChanged.value = false;
        }, 300);
    }
};

const onCancel = async () => {
    const $grid = gridRef.value;
    if (hasChanged.value) {
        const result = await VxeUI.modal.confirm('确认要放弃修改吗？');
        if (result !== 'confirm') return;
        await $grid.revertData();
        hasChanged.value = false;
    }
};
</script>

<style scoped>
button {
    margin: 0 5px;
}
.task {
    flex-grow: 1;
}
.display {
    height: 300px;
}
</style>
