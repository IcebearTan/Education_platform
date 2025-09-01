// Mock 配置文件
// 用于控制是否启用 mock 数据模式

export const mockConfig = {
    // 是否启用 mock 模式（开发阶段可以设置为 true）
    enabled: true,

    // API 基础URL（如果有后端服务的话）
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',

    // Mock 响应延迟时间（毫秒）
    responseDelay: {
        fast: 150,      // 快速响应
        normal: 300,    // 正常响应
        slow: 800       // 慢速响应（模拟网络较慢的情况）
    },

    // 错误模拟配置
    errorSimulation: {
        enabled: false,  // 是否启用错误模拟
        errorRate: 0.1   // 错误率（0-1）
    },

    // 分页配置
    pagination: {
        pageSize: 10,
        maxPage: 5
    },

    // 用户信息
    mockUser: {
        User_Id: 2001,
        username: '李小明',
        role: 'student'
    }
}

// 检查是否应该使用 mock 数据
export const shouldUseMock = () => {
    // 在开发环境且启用了mock模式时使用mock数据
    return import.meta.env.DEV && mockConfig.enabled
}

// Mock API 请求拦截器
export const mockApiRequest = async (apiCall, mockResponse, delay = mockConfig.responseDelay.normal) => {
    if (shouldUseMock()) {
        // 使用 mock 数据
        console.log(`[Mock API] 使用模拟数据`)
        return await new Promise((resolve, reject) => {
            setTimeout(() => {
                if (mockConfig.errorSimulation.enabled && Math.random() < mockConfig.errorSimulation.errorRate) {
                    reject(new Error('模拟网络错误'))
                } else {
                    resolve(mockResponse())
                }
            }, delay)
        })
    } else {
        // 使用真实 API
        try {
            return await apiCall()
        } catch (error) {
            console.warn('[API] 真实API调用失败，回退到mock数据:', error.message)
            // API失败时回退到mock数据
            return await mockResponse()
        }
    }
}

export default mockConfig
