<script lang="ts">
import { defineComponent } from 'vue'
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { ref, reactive, onMounted } from 'vue';
import api from '../../api';

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
                // console.log(res);
                groupList.value = res.data.group;
                teacher.value = res.data.teacher;
            }).catch((err) => {
                console.log(err);
            })
        }

        const isShow = ref(true);
        const options = ref([
            {
                value: '1',
                label: '学习小组',
            },
            {
                value: '2',
                label: '项目小组',
            }
        ])
        const value = ref('1')

        const changeGroup = (val) => {
            if (val === '1') {
                return true;
            } else {
                return false;
            }
        }

        onMounted(() => {
            fetchGroup();
        })
        
        return {
            groupList,
            teacher,
            isShow,
            options,
            value,
            changeGroup,
        }
    },
})
</script>

<template>
  <div class="group-container">
    <div class="title">
        <div class="group-kind">我的小组</div>
        <div>
            <el-select
            v-model="value"
            placeholder="Select"
            size="small"
            style="width: 100px"
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
    <div class="content" v-if="changeGroup(value)">
        <div class="group-box">
            <div style="width: 10px; height: 40px; background-color: aqua;"></div>
            <div class="group-content">
                <div>C语言程序设计</div>
                <div>导师：Jie Luo</div>
            </div>
        </div>
        <div class="group-box">
            <div style="width: 10px; height: 40px; background-color: aquamarine;"></div>
            <div class="group-content">
                <div>C语言程序设计</div>
                <div>导师：Jie Luo</div>
            </div>
        </div>
        <div class="group-box">
            <div style="width: 10px; height: 40px; background-color: aqua;"></div>
            <div class="group-content">
                <div>C语言程序设计</div>
                <div>导师：Jie Luo</div>
            </div>
        </div>
        <div class="group-box">
            <div style="width: 10px; height: 40px; background-color: aquamarine;"></div>
            <div class="group-content">
                <div>C语言程序设计</div>
                <div>导师：Jie Luo</div>
            </div>
        </div>
        <div class="group-box">
            <div style="width: 10px; height: 40px; background-color: aqua;"></div>
            <div class="group-content">
                <div>C语言程序设计</div>
                <div>导师：Jie Luo</div>
            </div>
        </div>
    </div>
    <div class="content" v-else>
        <div class="group-box">
            <div style="width: 10px; height: 40px; background-color: aqua;"></div>
            <div class="group-content">
                <div>网页开发组</div>
                <div>负责人：Icebear</div>
            </div>
        </div>
    </div>
    
  </div>
</template>

<style scoped>
.title{
    padding: 20px;
    padding-bottom: 0;
    padding-top: 15px;
    font-size: large;
    font-weight: bold;
    color: #444;

    display: flex;
    justify-content: space-between;
}
.content{
    /* height: 100%; */
    /* padding-left: 20px; */
    margin-top: 5px;
    margin-left: 20px;
    /* display: flex;
    flex-direction: column;
    align-items: center; */

    overflow-y: scroll;
    scrollbar-width: none;
    /* justify-content: space-evenly; */

    width: auto;
    height: 150px;
}
/* .group-box{
    height: 100%;
    width: 45%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    padding-top: 5px;
    padding-bottom: 5px;

    border-radius: 10px;
    border: dashed 1px #ffffff;

    transition: all 0.3s ease-in-out;
}
.group-box:hover{
    background-color: #f3f8ff;
    cursor: pointer;
    border: dashed 1px #6AD5FC;

}
.group-title{
    margin-bottom: 10px;
    color: #444;
}
.groups{
    font-size: small;
    margin-top: 10px;

    color: #666;
} */
.group-box{
    width: 90%;
    height: 40px;

    display: flex;
    /* justify-content: space-between; */
    align-items: center;
    /* border: solid 2px #b2dfff; */
    /* border-left: solid 5px #ccc; */

    box-shadow: #ccc 0px 0px 5px;
    border-radius: 10px;

    margin: 5px;
    margin-bottom: 10px;

    overflow: hidden;

    /* padding-left: 5px solid #ccc; */

}
.group-content{
    display: flex;
    justify-content: space-between;
    align-items: center;

    width: 100%;

    margin-left: 5px;
    margin-right: 10px;

    color: #444;
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