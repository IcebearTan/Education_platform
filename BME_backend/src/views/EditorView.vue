<script>
import { RouterView } from "vue-router";
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import EditorComponent from '../components/EditorComponent.vue';


export default {
  name: "HomeView",
  components: {
    EditorComponent,
  },

  data() {
    return {
      activeIndex: '/',

      store: useStore(),
      router: useRouter(),
    };
  },

  async created() {
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
        // console.log(res)
        this.store.dispatch('setUser', res.data)
      }
    }
    )

    if (this.$route.path === '/') {
      this.activeIndex = '/user-manage'
    }
    else {
      this.activeIndex = this.$route.path
    }
    console.log(this.activeIndex)
  }
};
</script>

<script setup>
import api from '../api';
import { onMounted, onBeforeUnmount } from 'vue'
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import { useRouter, RouterLink } from 'vue-router'

const store = useStore()
const router = useRouter()

const Article_Id = ref(router.currentRoute.value.query.id)
const createArticle = ref(true)

const loading = ref(false)

nextTick(() => {
    loading.value = true
    setTimeout(() => {
        loading.value = false
    }, 5000)
})

onMounted(() => {
  // const id = this.$route.query.id
  console.log('传过来咯')
  // Article_Id.value = router.currentRoute.value.query.id
  console.log(Article_Id.value)
  console.log(router.currentRoute)

  // window.addEventListener('beforeunload', handleBeforeUnload)
})

// const handleBeforeUnload = (event) => {
//     const message = '您可能有未保存的内容，确定要离开吗？';
//     event.returnValue = message; // 标准做法
//     return message; // 某些浏览器需要返回消息
// };

onBeforeUnmount(() => {
    console.log('走咯！')
    // window.removeEventListener('beforeunload', handleBeforeUnload)
})

const handleOpen = (key, keyPath) => {
  
}

const handleClose = (key, keyPath) => {

}
</script>



<template>
  <div
        v-loading="loading" 
        element-loading-background="rgba(255, 255, 255, 1)" 
        :delay="0" 
        element-loading-text="正在着急地加载...">
    <div class="common-layout">
      <div><EditorComponent :Article_Id="Article_Id" /></div>
    </div>
  </div>
</template>

<style scoped>
.common-layout {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;

  padding-top: 20px;
  padding-bottom: 20px;
}

.el-menu-vertical-demo {
  min-height: 100vh;
}

.title {
  text-align: center;
  color: #fff;
  margin: 0px;

  height: 60px;
  padding: 10px;

  font-size: large;
  font-weight: 900;

  background-color: #545c64;
}
</style>
