<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api';

const options = [
  { value: '1', label: '学习小组' },
  { value: '2', label: '项目小组' }
];
const value = ref('1');

const studyGroupList = ref([
    {
        Group_Name: '学习小组1',
        teacher: '张老师'
    },
    {
        Group_Name: '学习小组2',
        teacher: '李老师'
    },
    {
        Group_Name: '学习小组3',
        teacher: '王老师'
    },
    {
        Group_Name: '学习小组4',
        teacher: '赵老师'
    }
]);
const projectGroupList = ref([
    {
        Group_Name: '学习小组1',
        teacher: '张老师'
    },
    {
        Group_Name: '学习小组2',
        teacher: '李老师'
    },
    {
        Group_Name: '学习小组3',
        teacher: '王老师'
    },
    {
        Group_Name: '学习小组4',
        teacher: '赵老师'
    }
]);

const getGroupList = async () => {
    try {
        const res = await api({
            url: '/user/group',
            method: 'get'
        })

        if (res.data.code === 200) {
            studyGroupList.value = res.data.study_group || [];
            projectGroupList.value = res.data.project_group || [];
        }
    } catch (error) {
        console.log(error)
    }
};

onMounted(() => {
    //   fetchGroup();
    getGroupList();
});

// 当前只做切换演示，实际可根据 groupList 结构区分
const isStudyGroup = () => value.value === '1';
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
    <div class="content" v-if="isStudyGroup()">
      <div
        class="group-box"
        v-if="studyGroupList.length > 0"
        v-for="(group, idx) in studyGroupList"
        :key="group.Group_Name + idx"
      >
        <div class="group-content">
          <div>{{ group.title }}</div>
          <div>导师：{{ group.teacher || '未知' }}</div>
        </div>
      </div>
      <div class="no-group" v-else>暂无小组</div>
    </div>
    <div class="content" v-else>
        <div
        class="group-box"
        v-if="projectGroupList.length > 0"
        v-for="(group, idx) in projectGroupList"
        :key="group.Group_Name + idx"
      >
        <div class="group-content">
          <div>{{ group.title }}</div>
          <div>导师：{{ group.teacher || '未知' }}</div>
        </div>
      </div>
      <div class="no-group" v-else>暂无小组</div>
    </div>
  </div>
</template>

<style scoped>
.no-group {
    text-align: center;
    color: #999;
    font-size: 16px;
    margin-top: 50px;
}

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
.group-box {
    width: 85%;
    min-height: 52px;
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #f8fbff 0%, #f1f7ff 100%);
    border: 1px solid #e1ecf7;
    border-radius: 12px;
    margin: 8px 0;
    padding: 0 16px;
    position: relative;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

.group-box::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 12px 0 0 12px;
}

.group-box:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
    background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
    border-color: #c7d8f0;
}

.group-box:hover::before {
    width: 6px;
}

.group-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-left: 12px;
    color: #2c3e50;
    font-size: 15px;
}

.group-content > div:first-child {
    font-weight: 600;
    color: #34495e;
    letter-spacing: 0.3px;
}

.group-content > div:last-child {
    color: #7f8c8d;
    font-size: 14px;
    font-weight: 500;
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