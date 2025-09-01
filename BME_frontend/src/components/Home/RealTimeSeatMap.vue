<template>
  <div class="seat-map-container">
    <!-- 房间选择器 -->
    <div class="room-selector">
      <el-select v-model="selectedRoom" placeholder="选择房间" @change="handleRoomChange">
        <el-option
          v-for="room in rooms"
          :key="room.id"
          :label="room.name"
          :value="room.id"
        />
      </el-select>
    </div>

    <!-- 座位图展示区域 -->
    <div class="seat-map-display" v-if="currentRoomData">
      <div class="room-info">
        <h4>{{ currentRoomData.name }}</h4>
        <div class="occupancy-stats">
          <span class="occupied">已占用: {{ occupiedSeats }}/{{ totalSeats }}</span>
          <span class="available">可用: {{ availableSeats }}</span>
        </div>
      </div>

      <!-- 座位网格 -->
      <div class="seat-grid" :style="gridStyle">
        <div
          v-for="seat in currentRoomData.seats"
          :key="seat.id"
          :class="getSeatClass(seat)"
          @click="handleSeatClick(seat)"
          :title="getSeatTooltip(seat)"
        >
          <div class="seat-number">{{ seat.number }}</div>
          <div class="seat-user" v-if="seat.occupied">
            <el-avatar :size="24" :src="seat.user?.avatar">
              {{ seat.user?.name?.charAt(0) }}
            </el-avatar>
          </div>
        </div>
      </div>

      <!-- 图例 -->
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color available"></div>
          <span>可用</span>
        </div>
        <div class="legend-item">
          <div class="legend-color occupied"></div>
          <span>已占用</span>
        </div>
        <div class="legend-item">
          <div class="legend-color my-seat"></div>
          <span>我的座位</span>
        </div>
        <div class="legend-item">
          <div class="legend-color unavailable"></div>
          <span>不可用</span>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div class="loading-state" v-else>
      <el-skeleton :rows="4" animated />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElSelect, ElOption, ElAvatar, ElSkeleton } from 'element-plus'

// Props
const props = defineProps({
  // 是否显示房间选择器
  showRoomSelector: {
    type: Boolean,
    default: true
  },
  // 默认选中的房间ID
  defaultRoomId: {
    type: String,
    default: null
  },
  // 当前用户ID（用于高亮自己的座位）
  currentUserId: {
    type: String,
    default: null
  },
  // 更新间隔（毫秒）
  updateInterval: {
    type: Number,
    default: 30000 // 30秒
  }
})

// Emits
const emit = defineEmits(['seat-click', 'room-change'])

// 响应式数据
const selectedRoom = ref(props.defaultRoomId || '')
const rooms = ref([])
const currentRoomData = ref(null)
const isLoading = ref(false)

// 模拟数据 - 实际使用时替换为API调用
const mockRooms = [
  {
    id: 'room1',
    name: '自习室A',
    rows: 6,
    cols: 8,
    seats: generateMockSeats('room1', 6, 8)
  },
  {
    id: 'room2',
    name: '自习室B',
    rows: 4,
    cols: 10,
    seats: generateMockSeats('room2', 4, 10)
  },
  {
    id: 'room3',
    name: '讨论室C',
    rows: 3,
    cols: 6,
    seats: generateMockSeats('room3', 3, 6)
  }
]

// 计算属性
const totalSeats = computed(() => {
  return currentRoomData.value?.seats?.length || 0
})

const occupiedSeats = computed(() => {
  return currentRoomData.value?.seats?.filter(seat => seat.occupied && seat.available)?.length || 0
})

const availableSeats = computed(() => {
  return currentRoomData.value?.seats?.filter(seat => !seat.occupied && seat.available)?.length || 0
})

const gridStyle = computed(() => {
  if (!currentRoomData.value) return {}
  return {
    gridTemplateColumns: `repeat(${currentRoomData.value.cols}, 1fr)`,
    gridTemplateRows: `repeat(${currentRoomData.value.rows}, 1fr)`
  }
})

// 方法
function generateMockSeats(roomId, rows, cols) {
  const seats = []
  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= cols; col++) {
      const seatNumber = `${String.fromCharCode(64 + row)}${col.toString().padStart(2, '0')}`
      const isOccupied = Math.random() < 0.6 // 60% 占用率
      const isAvailable = Math.random() < 0.9 // 90% 可用率
      
      seats.push({
        id: `${roomId}-${row}-${col}`,
        number: seatNumber,
        row,
        col,
        occupied: isOccupied && isAvailable,
        available: isAvailable,
        user: isOccupied && isAvailable ? {
          id: `user${Math.floor(Math.random() * 1000)}`,
          name: `用户${Math.floor(Math.random() * 100)}`,
          avatar: null
        } : null
      })
    }
  }
  return seats
}

function getSeatClass(seat) {
  const classes = ['seat']
  
  if (!seat.available) {
    classes.push('unavailable')
  } else if (seat.occupied) {
    if (seat.user?.id === props.currentUserId) {
      classes.push('my-seat')
    } else {
      classes.push('occupied')
    }
  } else {
    classes.push('available')
  }
  
  return classes
}

function getSeatTooltip(seat) {
  if (!seat.available) return '座位不可用'
  if (seat.occupied) {
    if (seat.user?.id === props.currentUserId) {
      return `我的座位 - ${seat.number}`
    }
    return `${seat.number} - ${seat.user?.name || '未知用户'}`
  }
  return `${seat.number} - 可用`
}

function handleSeatClick(seat) {
  emit('seat-click', seat)
}

function handleRoomChange(roomId) {
  selectedRoom.value = roomId
  loadRoomData(roomId)
  emit('room-change', roomId)
}

async function loadRoomData(roomId) {
  isLoading.value = true
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 实际使用时替换为真实API调用
    const room = mockRooms.find(r => r.id === roomId)
    if (room) {
      currentRoomData.value = { ...room }
    }
  } catch (error) {
    console.error('加载房间数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 定时更新数据
let updateTimer = null

function startAutoUpdate() {
  if (updateTimer) clearInterval(updateTimer)
  
  updateTimer = setInterval(() => {
    if (selectedRoom.value) {
      loadRoomData(selectedRoom.value)
    }
  }, props.updateInterval)
}

function stopAutoUpdate() {
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
}

// 生命周期
onMounted(async () => {
  // 加载房间列表
  rooms.value = mockRooms
  
  // 选择默认房间
  if (props.defaultRoomId && rooms.value.find(r => r.id === props.defaultRoomId)) {
    selectedRoom.value = props.defaultRoomId
  } else if (rooms.value.length > 0) {
    selectedRoom.value = rooms.value[0].id
  }
  
  // 加载初始数据
  if (selectedRoom.value) {
    await loadRoomData(selectedRoom.value)
  }
  
  // 开始自动更新
  startAutoUpdate()
})

// 监听选中房间变化
watch(selectedRoom, (newRoomId) => {
  if (newRoomId) {
    loadRoomData(newRoomId)
  }
})

// 组件卸载时清理定时器
import { onUnmounted } from 'vue'
onUnmounted(() => {
  stopAutoUpdate()
})
</script>

<style scoped>
.seat-map-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.room-selector {
  padding: 16px;
  border-bottom: 1px solid #eee;
  background: #fafafa;
}

.seat-map-display {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.room-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.room-info h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.occupancy-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
}

.occupied {
  color: #e74c3c;
}

.available {
  color: #27ae60;
}

.seat-grid {
  flex: 1;
  display: grid;
  gap: 4px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  min-height: 300px;
}

.seat {
  aspect-ratio: 1;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border: 2px solid transparent;
  min-height: 40px;
  font-size: 12px;
}

.seat.available {
  background: #e8f5e8;
  border-color: #27ae60;
  color: #27ae60;
}

.seat.available:hover {
  background: #d4edda;
  transform: scale(1.05);
}

.seat.occupied {
  background: #ffebee;
  border-color: #e74c3c;
  color: #e74c3c;
}

.seat.occupied:hover {
  background: #ffcdd2;
}

.seat.my-seat {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #2196f3;
  box-shadow: 0 0 8px rgba(33, 150, 243, 0.3);
}

.seat.unavailable {
  background: #f5f5f5;
  border-color: #bbb;
  color: #999;
  cursor: not-allowed;
}

.seat-number {
  font-weight: 600;
  font-size: 10px;
  margin-bottom: 2px;
}

.seat-user {
  margin-top: 2px;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid #ddd;
}

.legend-color.available {
  background: #e8f5e8;
  border-color: #27ae60;
}

.legend-color.occupied {
  background: #ffebee;
  border-color: #e74c3c;
}

.legend-color.my-seat {
  background: #e3f2fd;
  border-color: #2196f3;
}

.legend-color.unavailable {
  background: #f5f5f5;
  border-color: #bbb;
}

.loading-state {
  padding: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .seat-grid {
    gap: 2px;
    padding: 8px;
  }
  
  .seat {
    min-height: 32px;
    font-size: 10px;
  }
  
  .legend {
    gap: 12px;
  }
  
  .room-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .occupancy-stats {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .seat {
    min-height: 28px;
  }
  
  .seat-number {
    font-size: 8px;
  }
  
  .legend {
    gap: 8px;
  }
  
  .legend-item {
    font-size: 11px;
  }
}
</style>
