<script>

</script>

<template>
    <div class="headContainer">
        <div class="headText">探索学习路径</div>
        <div class="headGraph">学习路径</div>
    </div>
    <div class="mainContainer">
        <el-card class="boxCard" @click="$router.push('/study/details')">
            <el-row>
                <el-col :span="4">
                    暂无图片
                </el-col>
                <el-col :span="20">
                    <div class="cardTitle">C语言程序设计</div>
                    <div class="cardText">C语言程序设计C语言程序设计C语言程序设计C语言程序设计C语言程序设计</div>
                    <div class="null"></div>
                    <div class="cardFooter">114章·514节</div>
                </el-col>
            </el-row>
        </el-card>
        <el-card class="boxCard"></el-card>
        <el-card class="boxCard"></el-card>
        <el-card class="boxCard"></el-card>
        <el-card class="boxCard"></el-card>
        <el-card class="boxCard"></el-card>
        
    </div>
</template>

<style scoped>
.headText {
    font-size: 30px;
    font-weight: bold;
    display: inline-block;

    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    
}
.headContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;

    height: 300px;
    background-color: #eeeeee;
}
.headGraph {
    font-size: 20px;
    font-weight: bold;
    display: inline-block;

    height: 100%;

}
.mainContainer {
    height: 100%;
    margin-left: 15%;
    margin-right: 15%;
    margin-top: 20px;
    margin-bottom: 20px;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
}
.boxCard{
    width: 30%;
    height: 85px;

    margin: 10px;
    overflow: hidden; /* 隐藏溢出内容 */
    display: -webkit-box; /* 使用 WebKit 箱模型 */
    -webkit-box-orient: vertical; /* 设置为垂直排列 */
    -webkit-line-clamp: 2; /* 设置显示的行数 */

    cursor: pointer;
}
.cardTitle {
    flex: 1;
    font-size: 12px;
}
.cardText {
    flex: 1;
    
    font-size: 12px;

}
.null {
    flex: 1;
    
}
.cardFooter {
    flex: 1;
    
    font-size: 12px;

}
.boxCard :deep(.el-card__body) {
    padding: 0px;
}
</style>