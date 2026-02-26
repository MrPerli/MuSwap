# 项目名称：MuSwap

### 一、项目简介：

这是一个Web3个人项目，通过该项目，旨在了解和熟悉DeFi项目中去中心化交易所(DEX)的业务逻辑，和相关DApp前端应用的开发细节；项目涉及技术栈包括：React，Wagmi/ether.js/viem，TheGraph索引，antd UI框架以及包括EtherScan，ChainLink，CoinMarketCap，CoinGecko，Uniswap SDK等开源API调用；

### 二、项目完成情况：

该项目当前完成了用户钱包连接和部分链上数据展示功能，包括：

#### 1.钱包连接

自定义钱包连接界面，可以支持MetaMask, Uniswap Extension, Coinbase Wallet等钱包连接，可在不同钱包之间进行切换，钱包连接调用Wagmi hook完成

#### 2.余额和资产价值数据可视化

展示当前连接的钱包账户在当前获取到的以太坊主网下支持的代币列表下的余额不为0的代币列表，以及这些代币所对应的以USD计价的资产价值（代币价格数据来源于ChainLink、CoinGecko等公开API）

#### 3.代币概览信息可视化

展示当前以太坊主网支持的常用代币列表，以及各代币的实时价格，交易量，TVL等（支持的代币列表数据来源于https://tokens.uniswap.org）

#### 4.ERC20代币的详情数据可视化

###### a.代币24小时价格图表

自定义Chart组件MuChart，仿照Uniswap Web App风格实现，呈现24小时内代币价格趋势图和K线图，鼠标可交互，展示具体数据，图表数据源来自于Uniswap V3版本TheGraph子图

###### b.代币Swap记录

自定义Table组件MuTable，可根据交易类型筛选表格数据，可呈现最近20条发生在Uniswap上的和当前代币相关的代币swap记录，表格数据来源于Uniswap V3版本TheGraph子图

###### c.代币流动性池

可展示和当前代币相关的流动性池信息，以TVL前10降序展示，数据来源于Uniswap V3版本TheGraph子图）；

###### d.代币交换

界面交互模仿Uniswap Web App实现，底层通过调用自定义封装的查询代币余额Hook实现查询当前连接的钱包账户拥有的代币余额，以及通过CoinMarketCap API查询当前代币实时价格，并通过调用Uniswap V3 SDK来实现代币交易；---TODO

#### 5.账户交易记录可视化

###### a.当前连接账户交易记录

直接进入模块，展示当前连接的钱包账户的交易记录

###### b.其他账户交易记录

通过在路由地址后追加其他钱包账户地址，可以查看其他钱包账户的交易记录

###### c.交易详情

选择交易记录，可以跳转至EtherScan上的交易详情界面

### 三、代码结构说明

项目基于Vite脚手架创建，采用React+TypeScript框架，以下是主要目录说明

##### assets

静态资源目录，包含一些图标文件

##### components

组件目录，包括通用自定义组件如MuInput（仿Uniswap风格自定义代币金额输入框）、MuChart（仿Uniswap风格图表）、MuTable（仿Uniswap风格数据表格，支持自定义列）等，以及一些业务相关的组件定义，如代币/钱包地址展示组件TokenAdressShow，支持地址缩略展示和全地址拷贝，如代币选择组件TokenSelector等

##### config

配置目录，包含Wagmi配置，所有菜单项配置（含路由）

##### graphql

graphql相关通用查询接口定义

##### hooks

勾子目录，包含项目用到的所有自定义勾子，例如查询代币列表的useTokens以及查代币余额的useTokensBalance等，另外还针对uniswap v3版本TheGraph子图查询定义了不同的hooks

##### libs

和底层库交互的接口，例如子图查询底层的Apollo客户端定义

##### pages

所有页面级组件定义

##### services

网络数据获取服务，传统的网络数据获取，例如CoinGecko API调用以及CoinMarketCap API的调用等

##### types

所有公共类型定义

##### utils

工具集合

### 四、项目后续规划

1.基于Uniswap SDK完成完整的代币交易业务闭环

2.优化界面呈现效果，针对列表数据的自动分页展示

3.尝试引入代币健康码功能，利用现有的代币健康评分数据，集成到当前项目，实现更直观交互呈现
