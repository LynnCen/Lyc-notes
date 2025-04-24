# 数据库

## 数据库三级模式两级映射

**三级模式解释**

1. 外模式（External Schema）/ 用户模式
- 也称为子模式或用户视图
- 描述数据库中局部数据的逻辑结构
- 是用户能看见和使用的局部数据的逻辑结构描述
- 一个数据库可以有多个外模式，一个应用程序只能使用一个外模式

2. 概念模式（Conceptual Schema）/ 逻辑模式

- 数据库中全体数据的逻辑结构和特征的描述
- 是所有用户的公共数据视图
- 与具体的存储设备和存取方法无关
- 一个数据库只有一个概念模式

3. 内模式（Internal Schema）/ 物理模式

- 数据物理结构和存储方式的描述
- 描述数据在存储设备上的存储方式和存取方法
- 一个数据库只有一个内模式

 **两级映射解释**

1. 外模式/概念模式映射

- 定义外模式与概念模式之间的对应关系
- 保证数据的逻辑独立性
- 当概念模式改变时，通过修改映射关系可以保持外模式不变

2. 概念模式/内模式映射

- 定义概念模式与内模式之间的对应关系
- 保证数据的物理独立性
- 当内模式改变时，通过修改映射关系可以保持概念模式不变


```mermaid
graph TB
    subgraph "三级模式"
        A[外模式/用户模式<br>External Schema] 
        B[概念模式/逻辑模式<br>Conceptual Schema]
        C[内模式/物理模式<br>Internal Schema]
    end
    
    subgraph "两级映射"
        D[外模式/概念模式映射<br>External/Conceptual Mapping]
        E[概念模式/内模式映射<br>Conceptual/Internal Mapping]
    end
    
    A -->|映射| B
    B -->|映射| C
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bfb,stroke:#333,stroke-width:2px
```

## 数据库的设计过程

```mermaid
graph TD
    A["需求分析"] -->|数据流图<br>数据字典<br>需求说明书| B["概念结构设计"]
    B -->|E-R模型| C["逻辑结构设计"]
    C -->|关系模式<br>视图<br>完整性约束| D["物理结构设计"]
    
    E["当前和未来应用<br>的数据要求"] --> A
    F["数据处理要求"] --> A
    
    G["转换规则<br>规范化理论"] --> C
    
    H["DBMS特性"] --> D
    I["硬件、OS特性"] --> D
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bfb,stroke:#333,stroke-width:2px
    style D fill:#fbb,stroke:#333,stroke-width:2px
```

## E-R模型

```mermaid
graph TD
    %% 学生实体及其属性
    Student[("学生")]
    StudentId((学号))
    StudentName((姓名))
    StudentGender((性别))
    StudentAge((年龄))
    
    %% 课程实体及其属性
    Course[("课程")]
    CourseId((课程号))
    CourseName((课程名))
    CourseTeacher((任课教师))
    
    %% 选课关系及其属性
    Selection{选课}
    Score((成绩))
    
    %% 连接学生的属性
    Student --- StudentId
    Student --- StudentName
    Student --- StudentGender
    Student --- StudentAge
    
    %% 连接课程的属性
    Course --- CourseId
    Course --- CourseName
    Course --- CourseTeacher
    
    %% 连接选课关系
    Student --- Selection
    Selection --- Course
    Selection --- Score
    
    %% 标注关系的基数
    M1[/"M"/]
    N1[/"N"/]
    Selection --- M1
    Selection --- N1
    
    %% 样式设置
    classDef entity fill:#f9f,stroke:#333,stroke-width:2px
    classDef attribute fill:#bbf,stroke:#333,stroke-width:1px
    classDef relationship fill:#bfb,stroke:#333,stroke-width:2px
    
    class Student,Course entity
    class StudentId,StudentName,StudentGender,StudentAge,CourseId,CourseName,CourseTeacher,Score attribute
    class Selection relationship
```

实体型转为关系模式？


## 关系代数

并、交、差、笛卡尔积、投影、选择、联接

笛卡尔积：将两个关系（表）中的每个元组（行）与另一个关系的所有元组无条件组合，生成包含所有可能行排列的新关系。
（例如：若表A有m行，表B有n行，笛卡尔积结果为m×n行，列数为两表列数之和。）

投影：选列，保留所需字段；

选择：选行，按条件过滤数据；

联接：组合表，关联匹配的行。

## 规范化理论- 函数依赖


## 规范化理论 - 价值与用途

## 规范化理论 - 键（求解候选键）

先找入度为0的节点，进行遍历

## 数据备份

冷备份、热备份

完全备份、差量备份、增量备份

## 数据库安全



