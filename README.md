# 训练营在线教学平台项目

## 项目简介
这个项目是一个服务于训练营学生和老师，实现资源共享，进度管理，讨论交流，个人生涯的在线教学平台
同时也是软件二组网页开发组学习网页开发的试点项目

## 特性
- 前端使用了Vue+Vite框架和Javascript语言
- 后端使用轻量级flask框架
- 帮助学生更好入门基础网页开发
- 形成训练营自己的知识库和交流平台

## 安装
1. 克隆项目到本地
    ```bash
    git clone https://github.com/你的用户名/项目名.git
    ```
2. 进入项目目录
    ```bash
    cd 项目名
    ```
3. 安装项目依赖
    ```bash
    pip install -r requirements.txt
    ```

## 使用方法
1. 启动项目
    ```bash
    python main.py
    ```
2. 配置输入数据
    - 在 `data` 目录下放入脑电波与眼动数据。
3. 运行分析
    ```bash
    python analyze.py --input data/input_file.csv --output results/output_file.csv
    ```

## 贡献
如果你想贡献代码，请遵循以下步骤：
1. Fork 这个仓库
2. 创建一个新的分支
3. 提交你的修改
4. 提交一个 pull request

确保遵循我们项目的代码风格，执行所有测试并确保没有破坏现有功能。

## 测试
1. 运行单元测试
    ```bash
    python -m unittest discover tests/
    ```
2. 或者使用 pytest
    ```bash
    pytest
    ```

## 许可证
这个项目采用 [MIT 许可证](LICENSE)。

## 致谢
- 感谢 XXX 团队提供的数据集支持
- 感谢 YYY 开发者为这个项目提供的开源库
