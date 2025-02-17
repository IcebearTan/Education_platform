<script>
import { useRouter } from 'vue-router';
import { ref, reactive, onMounted, defineComponent } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { md5 } from 'js-md5';
import api from '../api';
// import EditorComponent from './EditorComponent.vue';

export default defineComponent({
  name: 'UserManagement',
  components: {
    // EditorComponent,
  },

  setup() {
    const router = useRouter();

    // Reactive data
    const formInline = reactive({
      key: ''
    });

    const dialogFormVisible = ref(true);
    const users = ref([
      { id: 1, username: 'admin', is_admin: "2024-12-07" },
      { id: 2, username: 'user1', is_admin: "2024-12-07" },
      { id: 3, username: 'user2', is_admin: "2024-12-07" },
    ]);

    const tableLabel = reactive([
      { prop: 'id', label: '文章id', width: '200px' },
      { prop: 'username', label: '文章标题', width: '300px' },
      { prop: 'is_admin', label: '创建日期', width: '300px' },
    ]);

    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalItems = ref(0);
    const username = ref(null);
    const user_id = ref('');
    
    const form = reactive({
      username: '',
      password: '',
    });

    const rules = reactive({
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入用户密码', trigger: 'blur' }],
    });

    const action = ref('edit');

    // Fetch user data
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/admin/users/`, {
          params: {
            page: currentPage.value,
            size: pageSize.value,
            username: username.value,
          },
        });

        if (!response.data.users.length) {
          ElMessage({
            message: 'No user found',
            type: 'warning',
          });
          return;
        }

        users.value = response.data.users;
        totalItems.value = response.data.total;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Fetch course data
    const fetchCourse = async (page = 1) => {
      try {
        const response = await api.get('/admin/course/', {
          params: {
            page: 1,
            size: pageSize.value,
            course_name: formInline.key,
          },
        });

        if (!response.data.courses.length) {
          ElMessage({
            message: 'No course found',
            type: 'warning',
          });
          return;
        }

        courses.value = response.data.courses;
        totalItems.value = response.data.total;
      } catch (error) {
        console.error('Failed to fetch course:', error);
      }
    };

    // Delete user
    const deleteUser = async (user) => {
      try {
        await api.delete(`/api/admin/user/${user.id}`);
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
        fetchData();
      } catch (error) {
        console.error('Failed to delete course:', error);
      }
    };

    // Add user
    const addUser = async () => {
      try {
        const response = await api.post('/courses/', form);
        courses.value.push(response.data);
        ElMessage({
          message: '添加成功',
          type: 'success',
        });
        dialogFormVisible.value = false;
        fetchData();
      } catch (error) {
        console.error('Failed to add course:', error);
      }
    };

    // Edit user
    const editUser = async () => {
      try {
        form.password = md5(form.password);
        const response = await api.put(`/api/admin/user/${form.id}`, form);
        users.value.push(response.data);
        ElMessage({
          message: '修改成功',
          type: 'success',
        });
        dialogFormVisible.value = false;
        fetchData();
      } catch (error) {
        console.error('Failed to add course:', error);
      }
    };

    // Show assignments (example)
    const showAssignments = (user) => {
      dialogTableVisible.value = true;
      console.log(course.assignments);
      assignments.value = course.assignments;
    };

    // Format datetime
    const formatDateTime = (row, col, dateTime, index) => {
      const date = new Date(dateTime);
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      };
      return date.toLocaleString('en-US', options).replace(',', '');
    };

    // Handle page change
    const handlePageChange = (page) => {
      currentPage.value = page;
      fetchData(page);
    };

    // Handle search
    const handleSearch = () => {
      if (formInline.key) {
        username.value = formInline.key;
      }
      fetchData();
    };

    // Confirm delete action
    const handleDelete = (val) => {
      ElMessageBox.confirm('你确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        deleteUser(val);
      });
    };

    // Handle add action
    const handleAdd = () => {
      // action.value = 'add';
      // form.username = '';
      // form.password = '';
      // dialogFormVisible.value = true;

      router.push('/editor');
    };

    // Handle edit action
    const handleEdit = (user) => {
      action.value = 'edit';
      form.id = user.id;
      form.username = user.username;
      form.instructor = '';
      dialogFormVisible.value = true;
    };

    // Handle form submission
    const handleSubmit = () => {
      formRef.value.validate((valid) => {
        if (valid) {
          if (action.value === 'edit') {
            editUser();
          } else {
            addUser();
          }
          form.username = '';
          form.password = '';
        } else {
          console.log('Form validation failed');
          return false;
        }
      });
    };

    // Handle cancel
    const handleCancle = () => {
      dialogFormVisible.value = false;
      form.username = '';
      form.password = '';
    };

    // On mounted, fetch initial data
    onMounted(() => {
      fetchData();
    });

    // Return all reactive data, methods, and computed properties
    return {
      formInline,
      dialogFormVisible,
      users,
      tableLabel,
      currentPage,
      pageSize,
      totalItems,
      username,
      form,
      rules,
      action,
      fetchData,
      fetchCourse,
      deleteUser,
      addUser,
      editUser,
      showAssignments,
      formatDateTime,
      handlePageChange,
      handleSearch,
      handleDelete,
      handleAdd,
      handleEdit,
      handleSubmit,
      handleCancle,
    };
  },
});
</script>


<template>

  <div style="width: 100%; height: 100%; position: relative; overflow: hidden;">
    <div class="header-container">
      <div class="l-container">草稿箱</div>
      <div class="r-container">
        <el-button type="primary" @click="handleAdd">添加文章</el-button>

        <el-form :inline="true" class="form-inline" :model="formInline">
          <el-form-item label="文章查询" style="margin: 0; align-items: center;">
            <el-input placeholder=" 输入文章标题" v-model="formInline.key"></el-input>
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
      <EditorComponent />
      <div class="table">
        <el-table :data="users" style="width: 100%; max-height: 500px; overflow-y: auto;">
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
      <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="pageSize"
        :total="totalItems" layout="prev, pager, next" style="position:absolute; bottom: 0; margin-bottom: 20px;">
      </el-pagination>
    </div>
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

  margin-left: 10px;
}
</style>
