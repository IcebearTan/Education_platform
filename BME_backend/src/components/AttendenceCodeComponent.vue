<template>
  <div class="container">
    <div class="code-card">
        <div class="title">你的签到/签退码</div>
        <div class="code-box">
            <div v-if="!isCodeInvalid" class="title">你还没有码</div>
            <div v-else class="code">
                <template v-if="cnt >= validTime">
                    <div class="expired">已过期，请刷新</div>
                </template>
                <template v-else>
                    <el-progress type="circle" :percentage=updatePercentage :status=updateStatus class="progress">
                        {{ code }}
                    </el-progress>
                </template>
            </div>
        </div>
        <div class="button-box">
            <el-button type="primary" size="large" @click="handleCheckIn">签到</el-button>
            <el-button type="danger" size="large" @click="handleCheckOut">签退</el-button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api';

// 定义Code结构体
const CodeInfo = {
    code: null,
    generationTime: null,
    type: null // 'check_in' 或 'check_out'
}

// 分配本地内存存储Code信息
const codeMemory = ref({
    currentCode: null,
    generationTime: null,
    type: null
})

// // 本地持久化存储Key
const LOCAL_STORAGE_KEY = 'attendence_code_info'

// 更新内存和localStorage中的Code信息
const updateCodeMemory = (newCode, codeType) => {
    const info = {
        currentCode: newCode,
        generationTime: new Date().toISOString(),
        type: codeType
    }
    codeMemory.value = info
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(info))
    console.log('Code内存已更新:', codeMemory.value)
}

// 页面加载时从localStorage恢复Code信息
const restoreCodeFromLocal = () => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (data) {
        const info = JSON.parse(data)
        if (info.currentCode && info.generationTime) {
            // 判断是否过期
            const now = new Date()
            const genTime = new Date(info.generationTime)
            const diffSeconds = Math.floor((now - genTime) / 1000)
            if (diffSeconds < validTime) {
                code.value = info.currentCode
                isCodeInvalid.value = true
                cnt.value = diffSeconds
                codeMemory.value = info
            } else {
                // 已过期
                code.value = null
                isCodeInvalid.value = true
                cnt.value = validTime
                codeMemory.value = { currentCode: null, generationTime: null, type: null }
            }
        }
    }
}

const code = ref(null)
const isCodeInvalid = ref(false)
const validTime = 300
const cnt = ref(0)

const countTime = () => {
    if (isCodeInvalid) {
        cnt.value++
    }
}

const updatePercentage = computed(() => {
    return (validTime - cnt.value) / validTime * 100
})
const updateStatus = computed(() => {
    if (cnt.value <= 75) {
        return 'success'
    } else if (75 < cnt.value && cnt.value <= 150) {
        return ''
    } else if (150 < cnt.value && cnt.value <= 225) {
        return 'warning'
    } else {
        return 'danger'
    }
})

const handleCheckIn = async () => {
    try {
        const response = await api({
            url: '/generate-code',
            method: 'post',
            data: {
                type: 'check_in',
            }
        })
        if (response.data) {
            code.value = response.data.check_code
            isCodeInvalid.value = true
            cnt.value = 0
            // 更新内存中的Code信息
            updateCodeMemory(response.data.check_code, 'check_in')
            ElMessage.success('生成成功!请在5分钟内签到')
        } else {
            ElMessage.error('生成失败')
        }
    } catch (error) {
        if (error.response.status == 429) {
            ElMessage.error('频繁请求，5秒后再试')
        } else {
            ElMessage.error('生成失败')
        }
    }
}
const handleCheckOut = async () => {
    try {
        const response = await api({
            url: '/generate-code',
            method: 'post',
            data: {
                type: 'check_out',
            }
        })
        if (response.data) {
            code.value = response.data.check_code
            isCodeInvalid.value = true
            cnt.value = 0
            // 更新内存中的Code信息
            updateCodeMemory(response.data.check_code, 'check_out')
            ElMessage.success('生成成功!请在5分钟内签退')
        } else {
            ElMessage.error('生成失败')
        }
    } catch (error) {
        if (error.response.status == 429) {
            ElMessage.error('频繁请求，5秒后再试')
        } else {
            ElMessage.error('生成失败')
        }
    }
}

onMounted(() => {
    restoreCodeFromLocal()
    setInterval(() => {
        countTime()
    }, 1000)
})

</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.code-card{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 400px;
    height: 300px;
    border-radius: 10px;
    background-color: #ffffff;
    box-shadow: #f2f2f2 0px 0px 10px 0px;

    padding: 10px;
}
.title{
    font-size: 20px;
    font-weight: 600;
    color: #333333;
}
.code{
    font-weight: 600;
}
.expired {
    font-size: 20px;
    color: #f56c6c;
    font-weight: 600;
}
</style>
