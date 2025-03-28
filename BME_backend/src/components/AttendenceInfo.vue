<template>
  <div>
    <div class="title">本月考勤时长</div>
    <div class="table">
        <el-table :data="attendenceInfo" style="width: 100%; max-height: 700px; overflow-y: auto;">
            <el-table-column v-for="item in tableLabel" :key="item.prop" :prop="item.prop" :label="item.label"
            :width="item.width ? item.width : 125" />
            <el-table-column fixed="right" label="" min-width="120">
                <template #="scoped">
                    <!-- <el-button type="primary" size="small" @click="handleEdit(scoped.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDelete(scoped.row)">删除</el-button> -->
                </template>
            </el-table-column>
        </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api';

const attendenceInfo = ref([])
const tableLabel = ref([
    {
        prop: 'user_id',
        label: '用户ID',
        width: 150
    },
    {
        prop: 'user_name',
        label: '用户名',
        width: 400
    },
    {
        prop: 'total_duration',
        label: '总时长',
        width: 400
    }
])

const fetchAttendenceInfo = async () => {
    try {
        const response = await api({
            url: '/admin_records',
            method: 'get'
        })
        if (response.data) {
            attendenceInfo.value = response.data.map(item => ({
                user_id: item.user_id,
                user_name: item.user_name,
                total_duration: item.monthly_records[0].total_duration,
                total_hours: item.monthly_records[0].total_hours,
            }))
        } else {
            ElMessage.error('获取考勤信息失败')
        }
    } catch (error) {
        ElMessage.error('获取考勤信息失败')
    }
}

onMounted(() => {
    fetchAttendenceInfo()
})

</script>

<style scoped>
.title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #555;

    margin-left: 10px;
}
</style>
