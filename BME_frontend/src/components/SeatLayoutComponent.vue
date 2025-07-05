<template>
  <div class="seat-layout-container">
    <!-- 头部信息 -->
    <div class="header">
      <h2 class="title">座位布局</h2>
      <div class="info">
        <span class="total-seats">总座位: {{ totalSeats }}</span>
        <span class="available-seats">可用: {{ availableSeats }}</span>
        <span class="occupied-seats">已占用: {{ occupiedSeats }}</span>
      </div>
    </div>

    <!-- 图例 -->
    <div class="legend">
      <div class="legend-item">
        <div class="seat-demo available"></div>
        <span>可用</span>
      </div>
      <div class="legend-item">
        <div class="seat-demo occupied"></div>
        <span>已占用</span>
      </div>
      <div class="legend-item">
        <div class="seat-demo selected"></div>
        <span>已选择</span>
      </div>
      <div class="legend-item">
        <div class="seat-demo disabled"></div>
        <span>不可用</span>
      </div>
    </div>

    <!-- 座位网格 -->
    <div class="seat-grid">
      <div 
        v-for="(row, rowIndex) in seatLayout" 
        :key="rowIndex" 
        class="seat-row"
      >
        <div class="row-label">{{ String.fromCharCode(65 + rowIndex) }}</div>
        <div 
          v-for="(seat, seatIndex) in row" 
          :key="seatIndex"
          class="seat"
          :class="getSeatClass(seat)"
          @click="selectSeat(seat, rowIndex, seatIndex)"
        >
          {{ seatIndex + 1 }}
        </div>
      </div>
    </div>

    <!-- 选中座位信息 -->
    <div v-if="selectedSeats.length > 0" class="selected-info">
      <h3>已选择座位:</h3>
      <div class="selected-list">
        <span 
          v-for="seat in selectedSeats" 
          :key="seat.id"
          class="selected-seat-tag"
        >
          {{ seat.row }}{{ seat.number }}
          <button @click="unselectSeat(seat)" class="remove-btn">×</button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  rows: {
    type: Number,
    default: 8
  },
  seatsPerRow: {
    type: Number,
    default: 10
  },
  initialSeats: {
    type: Array,
    default: () => []
  }
})

// 响应式数据
const seatLayout = ref([])
const selectedSeats = ref([])

// 计算属性
const totalSeats = computed(() => {
  return seatLayout.value.reduce((total, row) => total + row.length, 0)
})

const availableSeats = computed(() => {
  return seatLayout.value.flat().filter(seat => seat.status === 'available').length
})

const occupiedSeats = computed(() => {
  return seatLayout.value.flat().filter(seat => seat.status === 'occupied').length
})

// 初始化座位布局
const initSeatLayout = () => {
  seatLayout.value = []
  for (let row = 0; row < props.rows; row++) {
    const seatRow = []
    for (let seat = 0; seat < props.seatsPerRow; seat++) {
      seatRow.push({
        id: `${row}-${seat}`,
        row: String.fromCharCode(65 + row), // A, B, C...
        number: seat + 1,
        status: 'available', // available, occupied, disabled, selected
        user: null
      })
    }
    seatLayout.value.push(seatRow)
  }
  
  // 应用初始座位数据
  if (props.initialSeats.length > 0) {
    applyInitialSeats()
  }
}

// 应用初始座位数据
const applyInitialSeats = () => {
  props.initialSeats.forEach(seatData => {
    const seat = findSeat(seatData.row, seatData.number)
    if (seat) {
      seat.status = seatData.status || 'occupied'
      seat.user = seatData.user || null
    }
  })
}

// 查找座位
const findSeat = (row, number) => {
  const rowIndex = row.charCodeAt(0) - 65
  if (rowIndex >= 0 && rowIndex < seatLayout.value.length) {
    return seatLayout.value[rowIndex][number - 1]
  }
  return null
}

// 获取座位样式类
const getSeatClass = (seat) => {
  return {
    'seat-available': seat.status === 'available',
    'seat-occupied': seat.status === 'occupied',
    'seat-selected': seat.status === 'selected',
    'seat-disabled': seat.status === 'disabled'
  }
}

// 选择座位
const selectSeat = (seat, rowIndex, seatIndex) => {
  if (seat.status === 'occupied' || seat.status === 'disabled') {
    return
  }
  
  if (seat.status === 'selected') {
    // 取消选择
    seat.status = 'available'
    selectedSeats.value = selectedSeats.value.filter(s => s.id !== seat.id)
  } else {
    // 选择座位
    seat.status = 'selected'
    selectedSeats.value.push({ ...seat })
  }
}

// 取消选择座位
const unselectSeat = (seatToRemove) => {
  const seat = findSeat(seatToRemove.row, seatToRemove.number)
  if (seat) {
    seat.status = 'available'
  }
  selectedSeats.value = selectedSeats.value.filter(s => s.id !== seatToRemove.id)
}

// 组件挂载时初始化
onMounted(() => {
  initSeatLayout()
})

// 暴露方法给父组件
defineExpose({
  getSelectedSeats: () => selectedSeats.value,
  clearSelection: () => {
    selectedSeats.value.forEach(seat => {
      const foundSeat = findSeat(seat.row, seat.number)
      if (foundSeat) {
        foundSeat.status = 'available'
      }
    })
    selectedSeats.value = []
  }
})
</script>

<style scoped>
.seat-layout-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 头部信息 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e2e8f0;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.info {
  display: flex;
  gap: 15px;
  font-size: 14px;
}

.info span {
  padding: 4px 8px;
  border-radius: 4px;
  background: #f7fafc;
  color: #4a5568;
}

/* 图例 */
.legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4a5568;
}

.seat-demo {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid;
}

/* 座位网格 */
.seat-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.seat-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-label {
  width: 30px;
  text-align: center;
  font-weight: 600;
  color: #4a5568;
}

.seat {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid;
  user-select: none;
}

/* 座位状态样式 */
.seat-available {
  background: #e6fffa;
  border-color: #4fd1c7;
  color: #234e52;
}

.seat-available:hover {
  background: #b2f5ea;
  transform: scale(1.05);
}

.seat-occupied {
  background: #fed7d7;
  border-color: #fc8181;
  color: #742a2a;
  cursor: not-allowed;
}

.seat-selected {
  background: #bee3f8;
  border-color: #4299e1;
  color: #2a4365;
}

.seat-disabled {
  background: #f7fafc;
  border-color: #cbd5e0;
  color: #a0aec0;
  cursor: not-allowed;
}

/* 选中座位信息 */
.selected-info {
  padding: 20px;
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 8px;
}

.selected-info h3 {
  margin: 0 0 10px 0;
  color: #2f855a;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-seat-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  background: #c6f6d5;
  border: 1px solid #9ae6b4;
  border-radius: 15px;
  font-size: 12px;
  color: #2f855a;
}

.remove-btn {
  background: none;
  border: none;
  color: #e53e3e;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #fed7d7;
  border-radius: 50%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .seat-layout-container {
    padding: 10px;
  }
  
  .header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .legend {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .seat {
    width: 35px;
    height: 35px;
    font-size: 11px;
  }
  
  .seat-row {
    gap: 6px;
  }
}
</style>
