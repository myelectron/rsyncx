<template>
    <vxe-grid ref="gridRef" v-bind="gridOptions">
        <template #toolbarButtons>
            <a-button v-show="!editStatus" type="primary" :icon="h(FormOutlined)" @click="onEdit">编辑</a-button>
            <a-button v-show="editStatus" type="primary" :icon="h(RollbackOutlined)" @click="onEditCancel"
                >退出编辑</a-button
            >
            <a-divider type="vertical" />
            <a-button v-show="editStatus" type="primary" :icon="h(PlusOutlined)" @click="onAdd">新增</a-button>
            <a-divider type="vertical" />
            <a-button v-show="editStatus" type="primary" :icon="h(CheckOutlined)" @click="onSave">保存</a-button>
            <a-button v-show="editStatus" type="primary" :icon="h(CloseOutlined)" @click="onCancel">放弃</a-button>
            <a-button v-show="!editStatus" type="primary" :icon="h(ImportOutlined)">导入</a-button>
            <a-button
                v-show="!editStatus"
                :disabled="gridRef?.getCheckboxRecords().length === 0"
                type="primary"
                :icon="h(ExportOutlined)"
                >导出</a-button
            >
        </template>
        <template #columns_options="{ row }">
            <a-button
                v-show="editStatus && !isPendingByRow(row)"
                type="primary"
                :icon="h(DeleteOutlined)"
                @click="makeDel(row)"
            >
                删除
            </a-button>
            <a-button
                v-show="editStatus && isPendingByRow(row)"
                type="primary"
                :icon="h(UndoOutlined)"
                @click="makeDel(row)"
            >
                恢复
            </a-button>
            <a-button v-show="!editStatus" type="primary" :icon="h(RightCircleOutlined)" @click="makeDel(row)">
                执行
            </a-button>
        </template>
    </vxe-grid>
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
    CheckOutlined,
    CloseOutlined,
    ImportOutlined,
    ExportOutlined,
} from '@ant-design/icons-vue';
import { VxeUI, VxeGridInstance, VxeGridProps, VxeGridPropTypes } from 'vxe-table';
import { JobMo } from './mo/JobMo';
import { ulid } from 'ulid';

const gridRef = ref<VxeGridInstance<JobMo>>();
const editStatus = ref(false);

const data: JobMo[] = [];

const columns: VxeGridPropTypes.Columns<JobMo> = [
    { type: 'checkbox', width: 50, resizable: false, fixed: 'left' },
    { type: 'seq', width: 50, resizable: false, fixed: 'left' },
    {
        field: 'name',
        title: '名称',
        width: '200',
        fixed: 'left',
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
    { title: '操作', fixed: 'right', width: 110, resizable: false, slots: { default: 'columns_options' } },
];

const gridOptions = reactive<VxeGridProps<JobMo>>({
    stripe: true,
    keepSource: true,
    // height: '100%',
    toolbarConfig: {
        slots: {
            buttons: 'toolbarButtons',
        },
    },
    columnConfig: {
        resizable: true,
    },
    rowConfig: {
        useKey: true,
        isHover: true,
        drag: true,
    },
    checkboxConfig: {
        range: true,
    },
    editConfig: {
        enabled: false,
        trigger: 'click',
        mode: 'row',
    },
    resizableConfig: {
        isDblclickAutoWidth: true,
    },
    validConfig: {
        msgMode: 'full',
    },
    editRules: {
        name: [{ required: true, message: '必须填写' }],
        src: [{ required: true, message: '必须填写' }],
        target: [{ required: true, message: '必须填写' }],
    },
    mouseConfig: {
        selected: true,
    },
    keyboardConfig: {
        isEdit: true,
        isArrow: true,
        isEnter: true,
        isBack: true,
        isDel: true,
        isEsc: true,
        isTab: true,
        isClip: true,
        isFNR: true,
        isChecked: true,
        isLastEnterAppendRow: true,
    },
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

const setEditStatus = (value: boolean) => {
    editStatus.value = value;

    gridOptions.editConfig.enabled = value;

    const $grid = gridRef.value;
    columns.find((item) => item.field === 'name').dragSort = value;
    columns.find((item) => item.field === 'delete').cellRender.props.disabled = !value;
    $grid.loadColumn(columns);
};

const onEdit = () => {
    setEditStatus(true);
};

const onEditCancel = async () => {
    if (hasChanged()) {
        const result = await VxeUI.modal.confirm('确认要放弃修改吗？');
        if (result !== 'confirm') return;
    }
    setEditStatus(false);
};

const onCancel = async () => {
    const $grid = gridRef.value;
    if (hasChanged()) {
        const result = await VxeUI.modal.confirm('确认要放弃修改吗？');
        if (result !== 'confirm') return;
        $grid.revertData();
    }
};

const hasChanged = () => {
    const $grid = gridRef.value;
    const { insertRecords, updateRecords, removeRecords, pendingRecords } = $grid.getRecordset();
    console.log(insertRecords, updateRecords, removeRecords, pendingRecords);

    return (
        insertRecords.length > 0 || updateRecords.length > 0 || removeRecords.length > 0 || pendingRecords.length > 0
    );
};

const onAdd = () => {
    const $grid = gridRef.value;
    const newRow: JobMo = {
        id: ulid(),
        name: undefined,
        src: undefined,
        target: undefined,
    };
    $grid.insertAt(newRow, null);
    nextTick(() => {
        const $grid = gridRef.value;
        if ($grid) {
            $grid.setEditRow(newRow);
        }
    });
};

const makeDel = async (row: JobMo) => {
    const $grid = gridRef.value;
    await $grid.togglePendingRow(row);
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
    const result = !!!(await $grid.fullValidate(true));
    result
        ? VxeUI.modal.message({ status: 'success', content: '校验成功！' })
        : VxeUI.modal.message({ status: 'error', content: '校验不通过！' });
    return result;
};

const onSave = async () => {
    if (await !validate()) return;
    const $grid = gridRef.value;
    const { insertRecords, updateRecords, removeRecords, pendingRecords } = $grid.getRecordset();
    console.log(insertRecords, updateRecords, removeRecords, pendingRecords);
};
</script>

<style scoped>
button {
    margin: 0 5px;
}
</style>
