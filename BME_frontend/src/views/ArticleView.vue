<script>
import { RouterView } from "vue-router";
import MenuComponent from "../components/MenuComponent.vue";

export default {
  name: "HomeView",
  components: { 
    MenuComponent
  }
};
</script>

<template>
  <div>
    <el-container class="common-layout">
      <el-header>
        <MenuComponent />
      </el-header>
      <el-main style="padding-left: 20px; min-height: 100vh;">
        <el-row>
          <el-col :span="4" class="left-col">广告招租</el-col>
          <el-col :span="16" class="main-col">
            <div class="common-layout">
              <el-container>
                <el-header>
                  <h1>
                    震惊！中山大学BME卓越工程师训练营竟然是一个卓越工程师训练营
                  </h1>
                </el-header>
                <el-main>
                  <div class="content">
                      <h1>🚀 加入卓越工程师训练营，成就你的未来！ 💼</h1>

                      <p>你是否在为未来的职业发展而感到迷茫？是否希望在竞争激烈的职场中脱颖而出？🌟 现在，机会来了！欢迎加入 <strong>卓越工程师训练营</strong>，开启你成功的第一步！</p>

                      <h2>🏆 为什么选择卓越工程师训练营？</h2>
                      <ul>
                          <li><strong>行业领先的课程体系：</strong> 我们的课程经过深思熟虑，涵盖了最前沿的技术与实用技能，帮助你在软件开发、数据分析、人工智能等领域立足！无论你是小白还是有经验的工程师，我们都有适合你的课程！</li>
                          <li><strong>顶尖讲师团队：</strong> 训练营汇聚了来自知名科技公司的行业专家，他们不仅具备丰富的理论知识，更有实际项目经验！让你在学习过程中，获得一手的实战技巧！</li>
                          <li><strong>实践项目驱动：</strong> 在这里，你将参与真实的项目实战，与团队合作，解决实际问题。掌握技能的同时，积累宝贵的项目经验，为未来的求职打下坚实基础！</li>
                          <li><strong>强大的职业发展支持：</strong> 加入训练营后，我们将提供职业指导，帮助你优化简历、准备面试，让你自信面对未来的挑战！我们与多家企业建立了合作关系，优秀学员还有机会获得推荐名额，助你轻松入职理想企业！</li>
                      </ul>

                      <h2>🔥 课程亮点：</h2>
                      <ul>
                          <li><strong>全方位技能培训：</strong> 从基础到高级，全面提升你的技术能力！</li>
                          <li><strong>实战项目：</strong> 独立或小组完成项目，提升团队协作能力和沟通技巧！</li>
                          <li><strong>网络拓展：</strong> 与志同道合的学员和行业大咖建立联系，拓宽你的人脉资源！</li>
                      </ul>

                      <h2>📅 不要错过！名额有限！</h2>
                      <p>现在报名，享受早鸟优惠！我们为前100名报名的学员准备了<strong class="highlight">神秘大礼包</strong>，助你开启全新职业旅程！✨</p>

                      <div class="cta">
                          <p>📞 立即拨打电话或点击下方链接咨询，抓住这个改变人生的机会！</p>
                          <p>👉 <a href="http://example.com" style="color: white; text-decoration: underline;">报名链接</a></p>
                      </div>

                      <p><strong>卓越工程师训练营</strong>，你的未来，从这里开始！🚀</p>
                  </div>
                </el-main>
                <el-footer>Footer</el-footer>
              </el-container>
            </div>
          </el-col>
          <el-col :span="4" class="right-col">广告招租</el-col>
        </el-row>
      </el-main>
      <el-footer class="footer">备案编号：1145141919810 没有版权和免责声明 千万别申诉版权 出版物许可证也没有 ©2024-2024深圳中大BME草台班子无限公司
        服务冷线：4008-123-123 客服邮箱：thisIsAfakeEmail@bme.com
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped>
.el-menu--horizontal>.el-menu-item:nth-child(1) {
    margin-right: auto;
}


.common-layout{
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content:space-between;

}

.footer {
  
  display: flex;
  padding: 10px;
  background-color: #f5f5f5;

  margin: 0;

  width: 100%;
  
  color: #bababa;
}

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

.main-col {
  text-align: center;
  padding: 10px;
}
</style>
