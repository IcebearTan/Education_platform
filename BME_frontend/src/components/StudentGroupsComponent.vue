<template>
  <div class="student-group-container">
    <div class="student-group-card">
      <div class="title">
        <div class="title-text">我的小组</div>
        <div class="title-select">
          <el-select
            v-model="value"
            placeholder="Select"
            size="large"
            style="width: 160px"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <div class="groups-container">
        <div class="group-card" @click="toGroupDetails()">
          <div class="cover-container">
            <div class="cover">C语言程序设计</div>
          </div>
          <div class="detail-container">
            <div class="group-title">C语言9组</div>
            <div class="group-member">
              <div class="instructor">
                <img src="../assets/ice_bear_avatar.jpg" alt="" class="avatar"/>
                <div>导师：Jie Luo</div>
              </div>
              <div class="students">
                <div class="avatars">
                  <img src="../assets/ice_bear_avatar.jpg" alt="" class="avatar"/>
                  <img src="../assets/Jerry_Scintilla_avatar.jpg" alt="" class="avatar"/>
                  <img src="../assets/ice_bear_avatar.jpg" alt="" class="avatar"/>
                  <img src="../assets/Jerry_Scintilla_avatar.jpg" alt="" class="avatar"/>
                </div>
                <div>Icebear、Labor 等 6 名学生在内</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'


export default defineComponent({
  setup(props, context) {
    const router = useRouter()

    const toGroupDetails = () => {
      setTimeout(() => {
        router.push('/user-center/student-group-details')
      },100)
      
    }
    
    return {
      toGroupDetails,
    }
  },
})
</script>

<style scoped>
.student-group-container{
  width: 100%;

  margin-top: 10px;
}
.student-group-card{
  /* width: 100%; */
  height: 1000px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

}
.title{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title-text{
  font-size: 20px;
  font-weight: bold;
  margin-left: 20px;
  margin-top: 20px;

  border-bottom: #444 2px solid;
  padding-bottom: 10px;

  color: #444;
}
.title-select{
  margin-right: 20px;
  margin-top: 20px;
}
.group-card{
  width: 95%;
  height: 160px;
  border-radius: 10px;

  box-shadow: #e6e6e6 0 0 10px;
  margin: auto;

  display: flex;
  margin-bottom: 20px;

  cursor: pointer;

  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.group-card:hover{  
  transform: translateY(-5px);
  box-shadow: #ddd 0 0 10px;
}
.group-card:active{
  transform: scale(0.96);
}
.groups-container{
  margin-top: 20px;
}
.cover-container{
  width: 20%;

  display: flex;
  justify-content: center;
  align-items: center;
}
.detail-container{
  width: 80%;
}
.cover{
  background-color: #91bdff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  font-weight: bold;
  width: 90px;
  height: 120px;

  border-radius: 5px;
  /* margin: 5px; */
  padding: 5px;

  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  color: #fff;
}
.group-title{
  display: flex;
  align-items: center;

  font-size: 18px;
  font-weight: bold;
  color: #444;

  margin-top: 10px;
}
.group-member{
  display: flex;
  justify-content: space-between;
  align-items: center;

}
.avatar{
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-bottom: 15px;
}
.instructor{
  display: flex;
  flex-direction: column;
  align-items: center;

  color: #666;
  margin-top: 20px;
}
.students{
  display: flex;
  flex-direction: column;
  align-items: center;

  color: #666;
  margin-top: 20px;
  margin-right: 20px;
}
</style>
