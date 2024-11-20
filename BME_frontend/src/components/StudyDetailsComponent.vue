<script>
import { RouterView } from "vue-router";
import MenuComponent from "../components/MenuComponent.vue";
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: "HomeView",
  components: { 
    MenuComponent
  },

  data() {
    return {
      store: useStore(),
      router: useRouter(),
    };
  },

  created() {
    api({
      url: "/user/user_index",
      method: "get",
    }).catch((error) => {
      // if (error.response.status == 422){
      ElMessage.error('登录失效，请重新登录')
      this.router.push('/login')
      // }

    }).then((res) => {
        // if (res.response.status == 422) {
        //   ElMessage.error('Oops, this is a error message.')
        // }

        if (res.data.code == 200) {
          console.log(res)
          this.store.dispatch('setUser', res.data)
        }
      }
    )
  }
};
</script>

<script setup>
import api from '../api';
import { onMounted } from 'vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'

</script>



<template>
  <div class="course-wrapper">
      <el-row style="width: 100%;">
        <el-col :span="4" class="left-col">广告招租</el-col>
        <el-col :span="16" class="main-col">
          <el-row>
            <el-col :span="16">
              <div class="course-details">
                <el-row style="width: 100%;">
                  <el-col :span="6">
                    <div style="height: 100%; display: flex; align-items: center; justify-content: center; background-color: #b6b6b6;">
                      暂无图片
                    </div>
                  </el-col>
                  <el-col :span="18">
                    <div style="height: 20%;">
                      C语言程序设计
                    </div>
                    <div class="course-description">
                      C语言是许多现代编程语言的基础，掌握C语言可以帮助理解其他语言。同时C语言强调对计算机底层的控制，能增强逻辑思维和问题解决能力。在生物医疗电子中，许多系统和应用程序是用C语言编写的，学习它能够为未来的开发打下坚实的基础。总之，学习C语言，是走进编程世界的重要一步。
                      学习资料：这一部分采用课内外结合的学习方式，依照课内进度，以《C程序设计》为基础，结合卓越工程师训练营系列的《C语言程序设计与应用》和课外题目进行，内容以大纲为基础，以分组汇报的方式进行灵活安排和考查，同时提供学员交流空间。
                    </div>
                    <button>加入学习</button>
                  </el-col>
                </el-row>
              </div>
              <div class="course-contents">
                <div style="height: 50px;background-color: #c5c5c5;width: 100%;">
                  目录
                </div>
                <div class="course-content-card">
                  <div class="course-content-item">
                    <div>认识C语言及环境配置</div>
                    <div style="display: flex; justify-content: space-between;">《C程序设计》第一章<span>未解锁</span></div>
                    <div style="display: flex; justify-content: space-between;">菜鸟：C语言教程-基础语法<span>未解锁</span></div>
                  </div>
                  <div class="course-content-item">
                    <div>认识C语言及环境配置</div>
                    <div style="display: flex; justify-content: space-between;">《C程序设计》第一章<span>未解锁</span></div>
                    <div style="display: flex; justify-content: space-between;">菜鸟：C语言教程-基础语法<span>未解锁</span></div>
                  </div>
                  <div class="course-content-item">
                    <div>认识C语言及环境配置
                    </div>
                    <div style="display: flex; justify-content: space-between;">《C程序设计》第一章<span>未解锁</span></div>
                    <div style="display: flex; justify-content: space-between;">菜鸟：C语言教程-基础语法<span>未解锁</span></div>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="course-process">
                课程进度:0/17
              </div>
              <div class="course-class">
                <div>导师：Jie Luo</div>
                <div>
                  同班同学<div>Icebear</div><div>Labor</div>
                </div>
              </div>
            </el-col>
          </el-row>
          
        </el-col>
        <el-col :span="4" class="right-col">广告招租</el-col>
      </el-row>
    </div>
</template>

<style scoped>

.course-wrapper {
  
  min-height: 100vh;
  display: flex;
  justify-content: space-between;
  
  
}

.left-side {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 50%;
  height: 100%;
}

.course-details {
  display: flex;
  /* justify-content: center;
  align-items: center; */
  width: 100%;
  height: 200px;
  background-color: #f5f5f5;
}

.course-contents {
  height: 50%;
  display: flex;
  /* justify-content: center; */
  align-items: center;
  flex-direction: column;
}

.course-process{
  
}

.main-col {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.course-content-card{
  background-color: #f5f5f5;
  width: 90%;

  border-radius: 5px;
  box-shadow: #5c5c5c  0px 0px 5px;
}

.course-content-item{
  border-bottom: solid 2px #5c5c5c;
}

.course-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;       /* 显示的行数 */
  -webkit-box-orient: vertical;/* 设置为垂直布局 */
  overflow: hidden;            /* 超出隐藏 */
}
</style>
