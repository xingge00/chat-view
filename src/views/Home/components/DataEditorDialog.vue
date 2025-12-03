<script setup>
import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue", "save"]);

const localRows = ref([]);
const apiUrl = ref("");
const apiLoading = ref(false);
const apiError = ref("");

const canSave = computed(() => {
  if (!localRows.value.length) {
    return false;
  }
  return localRows.value.every(
    (item) => item.label?.trim() && Number.isFinite(Number(item.value))
  );
});

const closeDialog = () => {
  emit("update:modelValue", false);
};

const syncRowsFromProps = () => {
  localRows.value = props.data.map((item, index) => ({
    id: item.id ?? `${Date.now()}-${index}`,
    label: item.label ?? "",
    value: item.value ?? 0,
  }));
};

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      syncRowsFromProps();
      apiError.value = "";
    }
  }
);

watch(
  () => props.data,
  () => {
    if (!props.modelValue) {
      syncRowsFromProps();
    }
  },
  { deep: true }
);

const handleAddRow = () => {
  localRows.value.push({
    id: `${Date.now()}-${localRows.value.length}`,
    label: "",
    value: 0,
  });
};

const handleRemoveRow = (id) => {
  localRows.value = localRows.value.filter((row) => row.id !== id);
};

const normalizeExternalData = (payload) => {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.list)
        ? payload.list
        : [];

  return source
    .map((item, index) => {
      const label = item.label ?? item.name ?? item.title ?? `数据${index + 1}`;
      const rawValue = item.value ?? item.amount ?? item.total ?? 0;
      return {
        id: item.id ?? `${Date.now()}-${index}`,
        label,
        value: Number(rawValue),
      };
    })
    .filter(
      (item) => item.label && !Number.isNaN(item.value) && item.value !== null
    );
};

const fetchExternalData = async () => {
  const url = apiUrl.value.trim();
  if (!url) {
    apiError.value = "请输入 API 地址";
    return;
  }
  apiLoading.value = true;
  apiError.value = "";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API 请求失败：${response.status}`);
    }
    const result = await response.json();
    const normalized = normalizeExternalData(result);
    if (!normalized.length) {
      throw new Error("返回数据格式不符合要求");
    }
    localRows.value = normalized;
    ElMessage.success(`已载入 ${normalized.length} 条数据`);
  } catch (error) {
    apiError.value = error.message || "数据获取失败";
  } finally {
    apiLoading.value = false;
  }
};

const handleSave = () => {
  if (!canSave.value) {
    return;
  }
  const sanitized = localRows.value.map((row, index) => ({
    id: row.id ?? `${Date.now()}-${index}`,
    label: row.label.trim(),
    value: Number(row.value),
  }));
  emit("save", sanitized);
  closeDialog();
};
</script>

<template>
<el-dialog
  :model-value="modelValue"
  title="图表数据管理"
  width="720px"
  destroy-on-close
  @update:model-value="emit('update:modelValue', $event)"
  @close="closeDialog"
>
    <div class="data-editor">
      <div class="data-editor__toolbar">
        <el-button type="primary" size="small" @click="handleAddRow">
          新增数据
        </el-button>
        <div class="data-editor__api">
          <el-input
            v-model="apiUrl"
            placeholder="输入外部 API 地址以获取数据"
            size="small"
            clearable
          >
            <template #append>
              <el-button
                type="primary"
                :loading="apiLoading"
                @click="fetchExternalData"
              >
                获取
              </el-button>
            </template>
          </el-input>
          <p v-if="apiError" class="data-editor__error">
            {{ apiError }}
          </p>
        </div>
      </div>

      <el-table :data="localRows" border height="320px">
        <el-table-column label="序号" width="70" align="center">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="名称">
          <template #default="{ row }">
            <el-input v-model="row.label" size="small" placeholder="如：护理巡视" />
          </template>
        </el-table-column>
        <el-table-column label="数值" width="160">
          <template #default="{ row }">
            <el-input-number
              v-model="row.value"
              :controls="false"
              size="small"
              :precision="2"
              :step="1"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              text
              @click="handleRemoveRow(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="data-editor__hint">
        支持的数据字段：label/name/title、value/amount/total。API
        返回的数据需为数组或包含 data/list 数组。
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" :disabled="!canSave" @click="handleSave">
          保存数据
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.data-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__toolbar {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  &__api {
    flex: 1;
  }

  &__error {
    margin: 6px 0 0;
    font-size: 12px;
    color: #f97316;
  }

  &__hint {
    font-size: 12px;
    color: #6b7280;
  }
}
</style>
