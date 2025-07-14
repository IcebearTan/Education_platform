// 版本配置文件
// 这个文件用于统一管理版本号和更新信息

// 当前版本号（会在构建时被 vite.config.js 读取）
export const APP_VERSION = '2.1.0'

// 构建日期（会在构建时自动生成）
export const BUILD_DATE = new Date().toLocaleDateString('zh-CN')

// 更新日期（手动设置）
export const UPDATE_DATE = '2025年7月14日'

// 更新公告的唯一标识（基于更新日期和版本号）
export const ANNOUNCEMENT_ID = `20250714-v${APP_VERSION}`

// 版本更新日志
export const VERSION_CHANGELOG = {
    '2.1.0': {
        date: '2025年7月14日',
        features: [
            '📚 全新任务管理系统：老师可以发布任务，设置截止时间和优先级',
            '✍️ 在线作业提交功能：支持文字内容和文件上传，方便快捷',
            '📝 智能批改系统：老师可以在线批改作业，给出分数和评语',
            '📊 提交状态跟踪：实时查看作业提交情况，已提交/未提交一目了然',
            '⏰ 截止时间提醒：系统会显示作业截止状态，避免逾期提交',
            '🔄 作业修改功能：截止时间前可以重新提交修改作业内容'
        ],
        importantNotice: '请同学们及时关注任务列表，按时完成并提交作业。逾期将无法提交，请合理安排时间！'
    },
    '2.0.0': {
        date: '2025年4月10日',
        features: [
            '🌟 线上打卡的最大签退时间延长至 6小时，要记得好好签退哦！',
            '🔧 修改了签到系统的部分逻辑，现在重新登录会同步签到中的时间。',
            '🎉 新增了网站的更新公告，会在每次网站更新后的第一次登录时显示。'
        ]
    }
}

// 获取当前版本的更新信息
export const getCurrentVersionInfo = () => {
    return VERSION_CHANGELOG[APP_VERSION] || {
        date: UPDATE_DATE,
        features: [],
        importantNotice: ''
    }
}

// 获取完整版本信息
export const getVersionInfo = () => {
    return {
        version: APP_VERSION,
        buildDate: BUILD_DATE,
        updateDate: UPDATE_DATE,
        announcementId: ANNOUNCEMENT_ID,
        changelog: getCurrentVersionInfo()
    }
}
