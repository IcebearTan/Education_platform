<script setup>
// 引入API方法和Vue相关函数
import api from '../api';
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 搜索表单数据（用于关键字搜索）
const formInline = reactive({
  key: ''
});

const dialogFormVisible = ref(false);
const medals = ref([]);
const allMedals = ref([]);
const filteredMedals = ref([]);
const action = ref('edit');// 当前操作类型（新增/编辑）
//const formLabelWidth = '120px';

// 表单数据（用于新增/编辑勋章）
const form = reactive({
  medal_id: '',
  medal_name: '',
  medal_description: '',
  medal_image: '',
  medal_type: ''
});

const tableLabel = ref([
  {
    prop: 'medal_id',
    label: '勋章ID',
    width: 80
  },
  {
    prop: 'medal_name',
    label: '勋章名称',
    width: 200
  },
  {
    prop: 'medal_description',
    label: '勋章描述',
    width: 300
  },
  {
    prop: 'medal_type',
    label: '勋章类型',
    width: 150
  },
  {
    prop: 'created_time',
    label: '创建时间',
    width: 200
  }
]);

// 搜索功能：根据关键字筛选勋章
const handleSearch = () => {
  const keyword = formInline.key.trim();
  if (!keyword) {
    filteredMedals.value = allMedals.value;
  } else {
    // 过滤包含关键字的勋章
    filteredMedals.value = Array.isArray(allMedals.value) ? allMedals.value.filter(medal => {
      const name = String(medal.Medal_Name);
      const description = String(medal.Medal_Description);
      const type = String(medal.Medal_Tag);
      return name.includes(keyword) || description.includes(keyword) || type.includes(keyword);
    }) : [];
  }
  medals.value = filteredMedals.value;
};

const fetchMedals = async () => {
  try {
    const response = await api({
      url: 'medal/medal_list',
      method: 'get',
    });
    console.log('@', response.data);
    if (response.data.code === 200) {
      allMedals.value = response.data.medal;
      filteredMedals.value = allMedals.value;
      medals.value = filteredMedals.value;
    }
  } catch (error) {
    ElMessage({
      message: '获取勋章列表失败',
      type: 'error'
    });
  }
};

const handleEdit = (row) => {
  action.value = 'edit';
  Object.assign(form, row);
  dialogFormVisible.value = true;
};

const handleAdd = () => {
  action.value = 'add';
  Object.assign(form, {
    medal_id: '',
    medal_name: '',
    medal_description: '',
    medal_image: '',
    medal_type: ''
  });
  dialogFormVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除可爱的本 "${row.medal_name || row.Medal_Name}" 勋章宝宝吗？`,
      '哭哭 ~',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const response = await api({
      url: '/medal/medal_delete',
      method: 'post',
      data: {
        Medal_Id: row.medal_id || row.Medal_Id
      }
    });

    if (response.data && response.data.code === 200) {
      ElMessage.success('删除成功');
      fetchMedals();
    } else {
      ElMessage.error(response.data?.msg || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const handleSubmit = async () => {
  try {
    if (action.value === 'add') {
      // 新增勋章
      const response = await api({
        url: '/medal/create',
        method: 'post',
        data: form
      });
      if (response.data) {
        ElMessage.success('添加成功');
        dialogFormVisible.value = false;
        fetchMedals();
      }
    } else {
      // 编辑勋章
      const response = await api({
        url: '/medal/medal_edit',
        method: 'post',
        data: {
          Medal_Id: form.medal_id || form.Medal_Id,
          Medal_Name: form.medal_name || form.Medal_Name,
          Medal_Description: form.medal_description || form.Medal_Description,
          Medal_Tag: form.medal_type || form.Medal_Tag
        }
      });
      if (response.data && response.data.code === 200) {
        ElMessage.success('修改成功');
        dialogFormVisible.value = false;
        fetchMedals();
      } else if (response.data && response.data.code === 401) {
        ElMessage.error('勋章不存在');
      } else if (response.data && response.data.code === 400) {
        ElMessage.error('用户权限不足');
      } else {
        ElMessage.error('修改失败');
      }
    }
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

// 取消表单弹窗
const handleCancle = () => {
  dialogFormVisible.value = false;
};

// 计算所有分类标签
const categoryList = computed(() => {
  const tags = medals.value.map(medal => medal.Medal_Tag).filter(Boolean);
  // 去重
  return Array.from(new Set(tags));
});

const currentCategory = ref('');

const filteredWallMedals = computed(() => {
  // 先按分类过滤
  let filtered = currentCategory.value === ''
    ? medals.value
    : medals.value.filter(medal => medal.Medal_Tag === currentCategory.value);
  return filtered;
});

const grantDialogVisible = ref(false);
const grantStudentId = ref('');
const grantMedal = ref(null);

const openGrantDialog = (medal) => {
  grantMedal.value = medal;
  grantStudentId.value = '';
  grantDialogVisible.value = true;
};

const handleGrant = async () => {
  try {
    const response = await api({
      url: '/medal/user_medal_add',
      method: 'post',
      data: {
        Medal_Description: grantMedal.value.Medal_Description,
        Medal_Name: grantMedal.value.Medal_Name,
        Student_Id: grantStudentId.value
      }
    });
    if (response.data && response.data.code === 200) {
      ElMessage.success('勋章授予成功');
      grantDialogVisible.value = false;
    } else if (response.data && response.data.code === 400) {
      ElMessage.error('用户权限不足');
    } else if (response.data && response.data.code === 401) {
      ElMessage.error('学生不存在');
    } else if (response.data && response.data.code === 402) {
      ElMessage.error('勋章不存在');
    } else if (response.data && response.data.code === 403) {
      ElMessage.error('学生已经拥有该勋章');
    } else {
      ElMessage.error('授予失败');
    }
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

onMounted(() => {
  fetchMedals();
});
</script>

<template>
  <div style="width: 100%; height: 100%; position: relative; overflow: hidden;">
    <div class="header-container">
      <div class="l-container">勋章管理
        <el-button class="config" size="large" @click="handleAdd">新增勋章</el-button>
      </div>
      <div class="r-container">
        <el-form :inline="true" class="form-inline" :model="formInline" @submit.prevent>
          <el-form-item label="勋章查询" style="margin: 0; align-items: center;">
            <el-input 
              placeholder="输入勋章名称、描述或类型" 
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
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="category-nav">
      <button 
        class="category-btn" 
        :class="{active: currentCategory === ''}"
        @click="currentCategory = ''"
      >全部</button>
      <!-- 依照Medal_Tag设定的分类 -->
      <button
        v-for="tag in categoryList"
        :key="tag"
        class="category-btn"
        :class="{active: currentCategory === tag}"
        @click="currentCategory = tag"
      >{{ tag }}</button>
    </div>

    <!-- 勋章墙网格 -->
    <div class="medals-grid" v-if="filteredWallMedals.length > 0">
      <div 
        class="medal-card" 
        v-for="medal in filteredWallMedals" 
        :key="medal.medal_id || medal.Medal_Id"
      >
        <div class="medal-image-wrapper">
          <img 
            :src="`/admin/medals/${medal.Medal_Id}.png`" 
            :alt="medal.Medal_Name_CN" 
            class="medal-image_2"
          />
        </div>
        <div class="medal-details">
          <h3 class="medal-name">{{medal.Medal_Name }}</h3>
          <p class="medal-desc">{{medal.Medal_Description }}</p>
          <p class="medal-tag">{{medal.Medal_Tag }}</p>
        </div>
        <div class="medal-actions">
          <el-button type="success" size="small" @click="openGrantDialog(medal)">授予</el-button>
          <el-button type="primary" size="small" @click="handleEdit(medal)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(medal)">删除</el-button>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon">🏆</div>
      <p class="empty-text">还没有勋章</p>
      <p class="empty-hint">等待加速制作专属勋章</p>
    </div>

    <el-dialog v-model="dialogFormVisible" :title="action === 'add' ? '新增勋章' : '编辑勋章'" width="600">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="勋章名字" prop="medal_name">
          <el-input v-model="form.medal_name" placeholder="请输入勋章名字" autocomplete="off" />
        </el-form-item>
        <el-form-item label="勋章描述" prop="medal_description">
          <el-input v-model="form.medal_description" type="textarea" :rows="3" autocomplete="off" placeholder="描述"/>
        </el-form-item>
        <el-form-item label="勋章分类" prop="medal_type">
          <el-select v-model="form.medal_type" placeholder="请选择勋章分类" clearable>
            <el-option
              v-for="tag in categoryList"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancle">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="grantDialogVisible" title="授予勋章" width="400">
      <el-form>
        <el-form-item label="学生ID">
          <el-input v-model="grantStudentId" placeholder="请输入学生ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="grantDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleGrant">确认授予</el-button>
      </template>
    </el-dialog>
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
  box-sizing: border-box;
  width: 100%;
}

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
  margin-top: 0px;
  padding: 20px 0;
  box-sizing: border-box;
  width: 100%;
}

/* 分类导航 */
.category-nav {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 32px 0;
  padding: 0 20px;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
}
.category-btn {
  padding: 10px 22px;
  border: 2px solid #e2e8f0;
  border-radius: 50px;
  background: white;
  color: #4a5568;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 15px;
}
.category-btn:hover {
  border-color: #4299e1;
  color: #2b6cb0;
  transform: translateY(-1px);
}
.category-btn.active {
  background: #4299e1;
  border-color: #4299e1;
  color: white;
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
}

/* 勋章墙网格 */
.medal-image_2 {
  width: 120px;
  height: 120px;
  max-width: 100%;
  max-height: 24vw;
  border-radius: 50%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.medals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
  width: 100%;
  padding: 0 20px;
  margin: 0 auto;
  box-sizing: border-box;
}
.medal-card {
  background: white;
  border-radius: 16px;
  padding: 18px 8px 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #f7fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}
.medal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
}
.medal-image-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
  max-width: 100%;
}
.medal-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  transition: all 0.3s ease;
}
.medal-details {
  margin-bottom: 10px;
  max-width: 100%;
  overflow: hidden;
}
.medal-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  word-break: break-all;
}
.medal-desc {
  font-size: 13px;
  color: #666;
  margin: 4px 0 0 0;
  word-break: break-all;
}
.medal-tag {
  font-size: 12px;
  color: #888;
  margin: 2px 0 0 0;
  word-break: break-all;
}
.medal-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}
.empty-state {
  text-align: center;
  color: #888;
  margin: 40px 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
.empty-text {
  font-size: 20px;
  font-weight: 600;
}
.empty-hint {
  font-size: 14px;
  color: #aaa;
}

body, html, #app {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  box-sizing: border-box;
}

@media (max-width: 900px) {
  .medals-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
    padding: 0 10px;
  }
  .medal-image_2 {
    width: 70px;
    height: 70px;
    max-height: 18vw;
  }
  .medal-card {
    padding: 8px 2px 6px;
  }
  .medal-name {
    font-size: 14px;
  }
  .category-nav {
    padding: 0 10px;
  }
}
.config{
  animation: backgroundChange 100s infinite;
  margin-left: 10px;
  color: #fff;
}
@keyframes backgroundChange {
  0% {
    background-color: #fc8803bf;
  }
  25% {
    background-color: #ffc400;
  }
  50% {
    background-color: #a2ff00;
  }
  75% {
    background-color: #6a95da;
  }
  100% {
    background-color: #f898e5;
  }
}
</style> 