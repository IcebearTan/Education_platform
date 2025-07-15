<script setup>
import api from '../api';
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const formInline = reactive({
  key: ''
});
const dialogFormVisible = ref(false);
const userMedals = ref([]);
const allUserMedals = ref([]);
const filteredUserMedals = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);

const form = reactive({
  user_id: '',
  medal_id: '',
  grant_reason: '',
  granted_by: ''
});

const rules = reactive({
  user_id: [
    { required: true, message: '请选择用户', trigger: 'change' }
  ],
  medal_id: [
    { required: true, message: '请选择勋章', trigger: 'change' }
  ],
  grant_reason: [
    { required: true, message: '请输入授予原因', trigger: 'blur' }
  ]
});

const users = ref([]);
const medals = ref([]);

const tableLabel = ref([
  {
    prop: 'user_name',
    label: '用户名',
    width: 150
  },
  {
    prop: 'medal_name',
    label: '勋章名称',
    width: 200
  },
  {
    prop: 'grant_reason',
    label: '授予原因',
    width: 300
  },
  {
    prop: 'granted_by',
    label: '授予人',
    width: 150
  },
  {
    prop: 'grant_time',
    label: '授予时间',
    width: 200
  }
]);

const handleSearch = () => {
  const keyword = formInline.key.trim();
  currentPage.value = 1;
  if (!keyword) {
    filteredUserMedals.value = allUserMedals.value;
  } else {
    filteredUserMedals.value = allUserMedals.value.filter(item => {
      const userName = item.user_name ? String(item.user_name) : '';
      const medalName = item.medal_name ? String(item.medal_name) : '';
      const reason = item.grant_reason ? String(item.grant_reason) : '';
      return userName.includes(keyword) || medalName.includes(keyword) || reason.includes(keyword);
    });
  }
  totalItems.value = filteredUserMedals.value.length;
  updatePagedUserMedals();
};

const fetchUserMedals = async () => {
  try {
    const response = await api({
      url: '/medal/user_medal_list',
      method: 'get',
    });
    allUserMedals.value = response.data || [];
    filteredUserMedals.value = allUserMedals.value;
    totalItems.value = allUserMedals.value.length;
    updatePagedUserMedals();
  } catch (error) {
    ElMessage({
      message: '获取用户勋章列表失败',
      type: 'error'
    });
  }
};

const fetchUsers = async () => {
  try {
    const response = await api({
      url: '/user/user_list',
      method: 'get',
    });
    users.value = response.data || [];
  } catch (error) {
    ElMessage.error('获取用户列表失败');
  }
};

const fetchMedals = async () => {
  try {
    const response = await api({
      url: '/medal/medal_list',
      method: 'get',
    });
    medals.value = response.data || [];
  } catch (error) {
    ElMessage.error('获取勋章列表失败');
  }
};

const updatePagedUserMedals = () => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  userMedals.value = filteredUserMedals.value.slice(start, end);
};

const handlePageChange = (page) => {
  currentPage.value = page;
  updatePagedUserMedals();
};

const handleGrant = () => {
  Object.assign(form, {
    user_id: '',
    medal_id: '',
    grant_reason: '',
    granted_by: ''
  });
  dialogFormVisible.value = true;
};

const handleRevoke = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要撤销用户 "${row.user_name}" 的勋章 "${row.medal_name}" 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    const response = await api({
      url: `/medal/revoke/${row.user_id}/${row.medal_id}`,
      method: 'delete'
    });
    
    if (response.data) {
      ElMessage.success('撤销成功');
      fetchUserMedals();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('撤销失败');
    }
  }
};

const handleSubmit = async () => {
  try {
    const response = await api({
      url: '/medal/grant',
      method: 'post',
      data: form
    });
    if (response.data) {
      ElMessage.success('授予成功');
      dialogFormVisible.value = false;
      fetchUserMedals();
    }
  } catch (error) {
    ElMessage.error('授予失败');
  }
};

const handleCancle = () => {
  dialogFormVisible.value = false;
};

onMounted(() => {
  fetchUserMedals();
  fetchUsers();
  fetchMedals();
});
</script>

<template>
  <div style="width: 100%; height: 100%; position: relative; overflow: hidden;">
    <div class="header-container">
      <div class="l-container">勋章授予</div>
      <div class="r-container">
        <el-form :inline="true" class="form-inline" :model="formInline" @submit.prevent>
          <el-form-item label="查询" style="margin: 0; align-items: center;">
            <el-input 
              placeholder="输入用户名、勋章名称或授予原因" 
              v-model="formInline.key" 
              @keyup.enter="handleSearch"
              clearable
            ></el-input>
          </el-form-item>
          
          <el-form-item style="margin: 0; align-items: center; margin-right: 20px; margin-left: 10px;">
            <el-button type="primary" @click="handleSearch">
              <el-icon>
                <Search />
              </el-icon>
            </el-button>
          </el-form-item>
        </el-form>
        
        <el-button type="success" @click="handleGrant" style="margin-left: 10px;">
          授予勋章
        </el-button>
      </div>
    </div>

    <div style="margin: 20px;">
      <div class="table">
        <el-table :data="userMedals" style="width: 100%; max-height: 800px; overflow-y: auto;">
          <el-table-column v-for="item in tableLabel" :key="item.prop" :prop="item.prop" :label="item.label" 
            :width="item.width ? item.width : 125" />
          
          <el-table-column fixed="right" label="操作" min-width="120">
            <template #default="scoped">
              <el-button type="danger" size="small" @click="handleRevoke(scoped.row)">撤销</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog v-model="dialogFormVisible" title="授予勋章" width="600">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="选择用户" prop="user_id">
          <el-select v-model="form.user_id" placeholder="请选择用户" style="width: 100%;">
            <el-option 
              v-for="user in users" 
              :key="user.User_Id" 
              :label="user.User_Name" 
              :value="user.User_Id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择勋章" prop="medal_id">
          <el-select v-model="form.medal_id" placeholder="请选择勋章" style="width: 100%;">
            <el-option 
              v-for="medal in medals" 
              :key="medal.medal_id" 
              :label="medal.medal_name" 
              :value="medal.medal_id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="授予原因" prop="grant_reason">
          <el-input v-model="form.grant_reason" type="textarea" :rows="3" placeholder="请输入授予原因" />
        </el-form-item>
        <el-form-item label="授予人" prop="granted_by">
          <el-input v-model="form.granted_by" placeholder="请输入授予人姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancle">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认授予</el-button>
        </div>
      </template>
    </el-dialog>
  </div>

  <div class="pagination-wrapper">
    <el-pagination
      @current-change="handlePageChange"
      :page-size="pageSize"
      :pager-count="11"
      layout="prev, pager, next"
      :total="totalItems"
      :current-page="currentPage"
    />
  </div>
</template>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.l-container {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.r-container {
  display: flex;
  align-items: center;
}

.form-inline {
  display: flex;
  align-items: center;
}

.table {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px;
}
</style> 