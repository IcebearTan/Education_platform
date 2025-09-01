<script>
import api from '../api';
import { md5 } from 'js-md5';
import { ElMessage, ElMessageBox } from 'element-plus';
import router from '../router';

export default {
  data() {
    return {
      formInline: {
        key: ''
      },
      dialogFormVisible: false,
      articles: [], // 当前页显示的文章
      allArticles: [], // 保存所有文章
      filteredArticles: [], // 保存搜索过滤后的文章
      tableLabel: [
        {
          prop: 'Article_Id',
          label: '文章id',
          width: '200px',
        },
        {
          prop: 'Article_Title',
          label: '文章标题',
          width: '300px',
        },
        {
          prop: 'Article_Introduction',
          label: '文章简介',
          width: '300px',
        },
      ],
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      username: null,
      Article_Id: '',
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
    await this.fetchArticles();
  },

  methods: {
    async fetchArticles() {
      console.log('Fetching articles...');
      try {
        const res = await api.get(`/article/list`);
        this.allArticles = res.data;
        this.filteredArticles = res.data;
        this.totalItems = res.data.length;
        this.updatePagedArticles();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    updatePagedArticles() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.articles = this.filteredArticles.slice(start, end);
    },

    async deleteArticle(val) {
      try {
        await api.post(`/article/delete`, { Article_Id: val.Article_Id });
        ElMessage({
          message: '删除成功',
          type: 'success'
        });
        this.fetchArticles();
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
      this.updatePagedArticles();
    },
    handleSearch() {
      const keyword = this.formInline.key.trim();
      this.currentPage = 1; // 搜索时重置到第一页
      
      if (!keyword) {
        this.filteredArticles = this.allArticles;
      } else {
        this.filteredArticles = this.allArticles.filter(article => {
          const title = article.Article_Title ? String(article.Article_Title) : '';
          const intro = article.Article_Introduction ? String(article.Article_Introduction) : '';
          const id = article.Article_Id ? String(article.Article_Id) : '';
          return title.includes(keyword) || intro.includes(keyword) || id.includes(keyword);
        });
      }
      
      this.totalItems = this.filteredArticles.length;
      this.updatePagedArticles();
    },
    handleDelete(val) {
      ElMessageBox.confirm('你确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteArticle(val);
      });
    },
    handleAdd() {
      this.action = 'add';

      router.push({ path: `/public` });
    },
    handleEdit(article) {
      // this.action = 'edit';
      // this.form.id = user.id;

      // this.form.username = user.username;
      // this.form.instructor = '';

      // this.dialogFormVisible = true;
      this.$router.push({ path: `/editor`, query: { id: article.Article_Id } });
      // console.log(article.Article_Id);
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
  <div class="selectable" style="width: 100%;">
    <div class="header-container">
      <div class="l-container">文章列表
        <el-button type="warning" @click="handleAdd" size="large" style="margin-left: 10px;">添加文章</el-button>
      </div>
      <div class="r-container">
        <el-form :inline="true" class="form-inline" :model="formInline" @submit.prevent>
          <el-form-item label="文章查询" style="margin: 0; align-items: center;">
            <el-input 
              placeholder=" 输入文章标题" 
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

    <div class="selectable" style="box-shadow: 0px 5px 10px 1px#e3e3e3; margin: 20px;">
      <div class="table">
        <el-table 
          :data="articles"
            style="width: 100%; overflow: auto; height: calc(100% - 40px); border-radius: 10px;"
            :row-style="{ height: '40px' }"
            
          >
        <el-table-column v-for="item in tableLabel" :key="item.prop" :prop="item.prop" :label="item.label"
          :width="item.width ? item.width : 125" />
        <el-table-column fixed="right" label="Operations" min-width="120">
          <template #="scoped">
            <el-button type="primary" size="small" @click="handleEdit(scoped.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scoped.row)">删除</el-button>
          </template>
        </el-table-column>
        </el-table>
        <div class="pagination-wrapper">
          <el-pagination class="selectable" 
          @current-change="handlePageChange" 
          :current-page="currentPage" 
          :page-size="pageSize"
          :total="totalItems" 
          layout="prev, pager, next"
          >
          </el-pagination>
        </div>
      </div>

    </div>

    

    <!-- <el-dialog v-model="dialogFormVisible" :title="action == 'add' ? '新增课程' : '编辑用户'" width="500">
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="username">
          <el-input v-model="form.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="用户密码" :label-width="formLabelWidth" prop="password">
          <el-input v-model="form.password" autocomplete="off" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancle">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </div>
      </template>
    </el-dialog> -->
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

.selectable {
    user-select: text;
}

.pagination-wrapper {
    position: relative;
    width: 100%;
    background-color: white;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0 0 10px 10px;
    
}

.table {
  width: 100%;
  height: calc(100vh - 220px);
  max-height: 600px;
  border-radius: 10px;
  border-width: 1px;
  border-style: solid;
  border-color: #C4C4C4;
  box-shadow: 0px 5px 10px 1px#f7f7f7;
  overflow: visible;
}

</style>
