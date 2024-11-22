<script>

</script>

<template>
    <el-row style="width: 100%;">
        <el-col :span="4" class="left-col">广告招租</el-col>
        <el-col :span="16" class="main-col">
          <h1>考核列表</h1>
          <div class="exam-card">
            <div style="width: 80%;">
                <h2>考核项目</h2>
                <div>考核导师</div>
                <div>考核时间</div>
                <div>考核地点</div>
            </div>
            <div style="width: 20%;">
                <button>报名</button>
                <div>截止时间：202411211940</div>
            </div>
          </div>
          <div class="exam-card">
            <div style="width: 80%;">
                <h2>考核项目</h2>
                <div>考核导师</div>
                <div>考核时间</div>
                <div>考核地点</div>
            </div>
            <div style="width: 20%;">
                <button>报名</button>
                <div>截止时间：202411211940</div>
            </div>
          </div>
          <div class="exam-card">
            <div style="width: 80%;">
                <h2>考核项目</h2>
                <div>考核导师</div>
                <div>考核时间</div>
                <div>考核地点</div>
            </div>
            <div style="width: 20%;">
                <button>报名</button>
                <div>截止时间：202411211940</div>
            </div>
          </div>
          <div class="exam-card">
            <div style="width: 80%;">
                <h2>考核项目</h2>
                <div>考核导师</div>
                <div>考核时间</div>
                <div>考核地点</div>
            </div>
            <div style="width: 20%;">
                <button>报名</button>
                <div>截止时间：202411211940</div>
            </div>
          </div>
          <div class="exam-card">
            <div style="width: 80%;">
                <h2>考核项目</h2>
                <div>考核导师</div>
                <div>考核时间</div>
                <div>考核地点</div>
            </div>
            <div style="width: 20%;">
                <button>报名</button>
                <div>截止时间：202411211940</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4" class="right-col">广告招租</el-col>
      </el-row>
</template>

<style scoped>
.left-col {
  background-color: #f5f5f5;
  text-align: center;
  padding: 10px;

  height: 400px;

  font-size: 100px;
  font-weight: 900;
}

.right-col {
  background-color: #f5f5f5;
  text-align: center;
  padding: 10px;

  height: 400px;

  font-size: 100px;
  font-weight: 900;
}

.exam-card{
    display: flex;
    /* justify-content: space-between; */
    flex-direction: row;

    width: 90%;
    height: 150px;
    
    border-radius: 5px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    margin: 20px;
}
</style>