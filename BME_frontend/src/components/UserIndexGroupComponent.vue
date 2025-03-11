<script lang="ts">
import { defineComponent } from 'vue'
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { ref, reactive, onMounted } from 'vue';
import api from '../api';

export default defineComponent({
    setup(props, context) {
        const store = useStore();
        const router = useRouter();
        const route = useRoute();

        const groupList = ref([]);
        const teacher = ref()

        const fetchGroup = async () => {
            const res = await api({
                url: '/user/group',
                method: 'get',
            }).then((res) => {
                console.log(res);
                groupList.value = res.data.group;
                teacher.value = res.data.teacher;
            }).catch((err) => {
                console.log(err);
            })
        }

        onMounted(() => {
            fetchGroup();
        })
        
        return {
            groupList,
            teacher,
        }
    },
})
</script>

<template>
  <div>
    <div class="title">我的小组</div>
    <div class="content">
        <div class="instructor">
            <div class="instructor-title">导师</div>
            <div>
                <el-avatar :size="50" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            </div>
            <div>{{ teacher }}</div>
        </div>
        <div class="student">
            <div class="student-title">学生</div>
            <div style="position: absolute;">
                <el-avatar :size="50" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            </div>
            <div style="position: absolute; left: 30px;">
                <el-avatar :size="50" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            </div>
            <div style="position: absolute; left: 60px;">
                <el-avatar :size="50" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            </div>
            <div style="position: absolute; left: 90px;">
                <el-avatar :size="50" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            </div>
            <!-- <div v-for="(student, index) in groupList">{{ student.Student }}</div> -->
        </div>
    </div>
  </div>
</template>

<style scoped>
.title{
    padding: 20px;
    padding-bottom: 0;
    font-size: large;
    font-weight: bold;
    color: #444;
}
.content{
    /* height: 100%; */
    padding-left: 20px;
    margin-top: 10px;
    display: flex;
}
.instructor{
   display: flex;
   flex-direction: column;
   align-items: center;

   margin-left: 20px;
}
.instructor-title{
    font-weight: bold;
    color: #DA6AFC;
    text-shadow: 0px 0px 5px #ecadff;

    margin-bottom: 10px;
}
.student{
    margin-left: 40px;
    position: relative;
    
}
.student-title{
    font-weight: bold;
    color: #6AD5FC;
    text-shadow: 0px 0px 5px #a5e7ff;

    margin-bottom: 10px;
    

}
</style>
{
  "Group_Name": "string",
  "Student_Ids": [
    {
    "student_id": "13"
    },
    {
    "student_id": "14"
    }
  ]
}