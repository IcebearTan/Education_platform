<script setup>
import api from '../api';
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const formInline = reactive({
  key: ''
})

const handleSearch = () => {
}

const codes = ref([])

const tableLabel = [
  {
    label: '考勤码',
    prop: 'check_code',
    width: 200
  },
  {
    label: '考勤码类型',
    prop: 'type',
    width: 200
  },
  {
    label: '创建时间',
    prop: 'created_at',
    width: 200
  },
  {
    label: '剩余时间',
    prop: 'status',
    width: 200
  }
]

const handleSubmit = async () => {
  try {
    const response = await api({
      url: '/generate-code',
      method: 'post',
      data: {
        type: form.type
      }
    })

    if (response.data) {
      codes.value.push(response.data)
    } else {
      ElMessage.error('生成考勤码失败')
    }
  } catch (error) {
    ElMessage.error('生成考勤码失败')
  }

  dialogFormVisible.value = false
  form.type = ''
}

const handleCancle = () => {
  dialogFormVisible.value = false
  form.type = ''
}

const getCodesFromLocalStorage = () => {
  codes.value = JSON.parse(localStorage.getItem('codes')) || []
}

const saveCodesToLocalStorage = (codes) => {
  console.log('saveCodesToLocalStorage', codes.value)
  localStorage.setItem('codes', JSON.stringify(codes))
}

const dialogFormVisible = ref(false)

const form = reactive({
  type: '',
})

onMounted(() => {
  getCodesFromLocalStorage()
})

onUnmounted(() => {
  saveCodesToLocalStorage(codes.value)
})
</script>

<template>
  <div style="width: 100%; height: 100%; position: relative; overflow: hidden;">
    <div class="header-container">
      <div class="l-container">
        <span>考勤管理</span>
        <el-button class="create-button" type="primary" size="large" @click="dialogFormVisible = true">生成考勤码</el-button>
      </div>
      <div class="r-container">
        <el-form :inline="true" class="form-inline" :model="formInline">
          <el-form-item label="查询" style="margin: 0; align-items: center;">
            <el-input placeholder=" 输入" v-model="formInline.key"></el-input>
          </el-form-item>
          <el-form-item style="margin: 0; align-items: center; margin-right: 20px; margin-left: 10px;">
            <el-button type="primary" @click="handleSearch">
              <el-icon>
                <Search />
              </el-icon>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div style="margin: 20px;">
      <div class="table">
        <el-table :data="codes" style="width: 100%; max-height: 700px; overflow-y: auto;">
          <el-table-column v-for="item in tableLabel" :key="item.prop" :prop="item.prop" :label="item.label"
            :width="item.width ? item.width : 125" />
          <el-table-column fixed="right" label="Operations" min-width="120">
            <template #="scoped">
              <el-button type="primary" size="small" @click="handleEdit(scoped.row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDelete(scoped.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog v-model="dialogFormVisible" title="选择码类型" width="380">
      <el-form :model="form">
        <el-form-item label="签到/签退">
          <el-select v-model="form.type" placeholder="请选择生成类型">
            <el-option label="签到码" value="check_in" />
            <el-option label="签退码" value="check_out" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancle()">取消</el-button>
          <el-button type="primary" @click="handleSubmit()">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin: 10px;
  height: 40px;

  .l-container {
    display: inline-block;

    font-size: 30px;
    font-weight: 900;

    margin-left: 20px;

    color: #3b5cd5;
  }

  .r-container {
    display: flex;
    align-items: center;

    .form-inline {
      display: flex;
      justify-content: center;

      .el-form-item {
        text-align: center;
      }

      margin: 0;
    }

    /* font-size: 30px;
    font-weight: 900;

    margin-left: 20px;

    color: #08e397; */
  }
}

.default-card {
  display: inline-block;
  width: 350px;

  margin: 20px;

  cursor: pointer;
}

.default-card:hover {
  transform: translateY(-10px);
  box-shadow: #c4c4c4 0px 0px 10px;
}

.loading {
  margin-left: 30px;
  font-size: 20px;
  font-weight: 900;

  color: #4f4f4f;
}

.details {
  color: #767676;
}

.create-button {
  display: inline-block;
  margin-bottom: 5px;

  margin-left: 20px;
}
</style>
