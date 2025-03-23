<template>
  <div class="student-group-task">
    <div class="date-task">
      <div class="date">3月23日</div>
      <div class="task-box">
        <div class="title">认识C语言及环境配置</div>
        <div class="content">同学们要认真看这个内容，我们到时候好好讨论</div>
        <div class="box-footer">
          <div class="deadline">截止时间：{{ deadline }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const deadline = ref('2023-03-24 23:59:59')//这个是用于测试的变量，之后不一定会这么写

const router = useRouter()
</script>

<style scoped>
.student-group-task{
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.date-task{
  width: 95%;
}

.date{
  width: fit-content;

  font-size: 18px;
  font-weight: bold;

  padding-bottom: 5px;

  margin-bottom: 20px;
  border-bottom: solid 3px #000;
  color: #000;
}

.task-box{
  width: 100%;
  height: 120px;
  padding-top: 10px;
  padding-bottom: 10px;

  border-radius: 10px;
  box-shadow: 0 0 7px #eee;

  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */

  transition: all 0.2s ease-in-out;
}

.task-box:hover{
  box-shadow: 0 0 10px #e2e2e2;
  transform: translateY(-5px);

  cursor: pointer;
}

.title{
  font-size: 18px;
  /* font-weight: bold; */

  margin-bottom: 10px;
  margin-left: 20px;

  color: #222;

}

.content{
  font-size: 14px;
  /* font-weight: bold; */
  color: #666;

  margin-left: 20px;
  margin-right: 20px;

  height: 3em; /* 限制高度为两行的高度 */
  line-height: 1.5em; /* 设置行高 */
  overflow: hidden; /* 超出部分隐藏 */
  display: -webkit-box; /* 必须要用 webkit-box 才能支持 line-clamp */
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical; 
  text-overflow: ellipsis; /* 添加省略号（可选） */

  /* margin-bottom: auto; */
}

.box-footer{
  font-size: 12px;
  color: #999;

  margin-top: auto;
  margin-left: 20px;
}
</style>