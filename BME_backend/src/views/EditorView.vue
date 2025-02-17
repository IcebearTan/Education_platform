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
import { onMounted } from 'vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const Article_Id = ref(router.currentRoute.value.query.id)

onMounted(() => {
  // const id = this.$route.query.id
  console.log('传过来咯')
  // Article_Id.value = router.currentRoute.value.query.id
  console.log(Article_Id.value)
})

const handleOpen = (key, keyPath) => {
  
}

const handleClose = (key, keyPath) => {

}
</script>



<template>
  <div>
    <div class="common-layout">
      <EditorComponent :Article_Id="Article_Id" />
    </div>
  </div>
</template>

<style scoped>
.common-layout {
  width: 100%;
  min-height: 100%;
  /* background-color: #f5f5f5; */
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
