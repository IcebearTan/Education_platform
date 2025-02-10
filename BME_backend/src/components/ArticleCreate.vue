<script>
import api from '../api';
import { md5 } from 'js-md5';
import { ElMessage, ElMessageBox } from 'element-plus';
import tinymce from 'tinymce';
import 'tinymce/themes/silver';

export default {
  data() {
    return {
      formInline: {
        key: ''
      },
      dialogFormVisible: true,
      users: [
        {
          id: 1,
          username: 'admin',
          is_admin: "2024-12-07",
        },
        {
          id: 2,
          username: 'user1',
          is_admin: "2024-12-07",
        },
        {
          id: 3,
          username: 'user2',
          is_admin: "2024-12-07",
        },
      ],
      tableLabel: [
        {
          prop: 'id',
          label: '文章id',
          width: '200px',
        },
        {
          prop: 'username',
          label: '文章标题',
          width: '300px',
        },
        {
          prop: 'is_admin',
          label: '创建日期',
          width: '300px',
        },
      ],
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      username: null,
      user_id: '',
      form: {
        username: '',
        password: '',
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
        ],
      },
      action: 'edit',
    };
  },

  async created() {
    await this.fetchData();
  },

  mounted() {
    tinymce.init({
      selector: '#mytiny',
    });

  },

  methods: {
    async fetchData() {
      try {
        const response = await api.get(`/api/admin/users/`, {
          params: {
            page: this.currentPage,
            size: this.pageSize,
            username: this.username,
          }
        }
        );
        if (!response.data.users.length) {
          ElMessage({
            message: 'No user found',
            type: 'warning'
          });
          return;
        }
        this.users = response.data.users;
        this.totalItems = response.data.total;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    async fetchCourse(page = 1) {
      try {
        const response = await api.get('/admin/course/', {
          params: {
            page: 1,
            size: this.pageSize,
            course_name: this.formInline.key
          }
        });
        if (!response.data.courses.length) {
          ElMessage({
            message: 'No course found',
            type: 'warning'
          });
          return;
        }
        this.courses = response.data.courses;
        this.totalItems = response.data.total;
      } catch (error) {
        console.error('Failed to fetch course:', error);
      }
    },
    async deleteUser(user) {
      try {
        await api.delete(`/api/admin/user/${user.id}`);
        ElMessage({
          message: '删除成功',
          type: 'success'
        });
        this.fetchData();
      } catch (error) {
        console.error('Failed to delete course:', error);
      }
    },
    async addUser() {
      try {
        const response = await api.post('/courses/', this.form);

        this.courses.push(response.data);

        ElMessage({
          message: '添加成功',
          type: 'success'
        });
        this.dialogFormVisible = false;
        this.fetchData();
      } catch (error) {
        console.error('Failed to add course:', error);
      }
    },
    async editUser() {
      try {
        this.form.password = md5(this.form.password);
        const response = await api.put(`/api/admin/user/${this.form.id}`, this.form);
        this.users.push(response.data);

        ElMessage({
          message: '修改成功',
          type: 'success'
        });
        this.dialogFormVisible = false;
        this.fetchData();
      } catch (error) {
        console.error('Failed to add course:', error);
      }
    },
    showAssignments(user) {
      this.dialogTableVisible = true;
      console.log(course.assignments);
      this.assignments = course.assignments;
    },
    formatDateTime(row, col, dateTime, index) {
      const date = new Date(dateTime);
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      return date.toLocaleString('en-US', options).replace(',', '');
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchData(page);
    },
    handleSearch() {
      if (this.formInline.key) {
        this.username = this.formInline.key;
      }
      this.fetchData();
    },
    handleDelete(val) {
      ElMessageBox.confirm('你确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteUser(val);
      });
    },
    handleAdd() {
      this.action = 'add';

      this.form.username = '';
      this.form.password = '';

      this.dialogFormVisible = true;
    },
    handleEdit(user) {
      this.action = 'edit';
      this.form.id = user.id;

      this.form.username = user.username;
      this.form.instructor = '';

      this.dialogFormVisible = true;
    },
    handleSubmit() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          if (this.action === 'edit') {
            this.editUser();
          } else {
            this.addUser();
          }
          this.form.username = '';
          this.form.password = '';
        } else {
          // Form is invalid
          console.log('Form validation failed');
          return false;
        }
      });
    },
    handleCancle() {
      this.dialogFormVisible = false;
      this.form.username = '';
      this.form.password = '';
    },
  },
  computed: {

  }
};
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
      <div id="mytiny"></div>
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

    <el-dialog v-model="dialogFormVisible" :title="action == 'add' ? '新增课程' : '编辑用户'" width="500">
      <div id="mytiny"></div>
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

  margin-left: 10px;
}
</style>
