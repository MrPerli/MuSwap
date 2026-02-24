import type { MuMenuItemType } from "@Mu/components/common/MuMenu"

// 主菜单配置项
export const MainMenus:MuMenuItemType[] = [
    {
        key:'Swap',
        title:"交易", // 两个汉字中间需要加一个空格,否则AntDesign的Button不支持临时修改样式
        naviPath:"/Swap",
    },
    {
        key:'Explor',
        title:"探索", // 两个汉字中间需要加一个空格,否则AntDesign的Button不支持临时修改样式
        naviPath:"/Explor",
        children:[
            {
                key:'Tokens', 
                title:'代币',
                isMain:false,
                naviPath:"/Explor/Tokens",
            },
            {
                key:'FundPool', 
                title:'资金池', 
                isMain:false,
                naviPath:"/Explor/FundPool",
            },
            {
                key:'Tx', 
                title:'交易', 
                isMain:false,
                naviPath:"/Explor/Tx",
            },
        ],
    },
    {
        key:'FundPool', 
        title:'资金池', 
        naviPath:"/FundPool",
        children:[
            {
                key:'ViewPosition', 
                title:'查看仓位',
                isMain:false,
                naviPath:"/FundPool/ViewPosition",
            },
            {
                key:'CreateInchHead', 
                title:'创建寸头', 
                isMain:false,
                naviPath:"/FundPool/CreateInchHead",
            },
        ],
    },
    {
        key:'Portfolio', 
        title:'资产', 
        naviPath:"/Portfolio/Overview",
        children:[
            {
                key:'Overview', 
                title: "概览",
                isMain:false,
                naviPath:"/Portfolio/Overview",
            },
            {
                key:'FungibleToken', 
                title:'代币', 
                isMain:false,
                naviPath:"/Portfolio/FungibleToken",
            },
            {
                key:'NonFungibleToken', 
                title:'非同质化代币',
                isMain:false,
                naviPath:"/Portfolio/NonFungibleToken",
            },
            {
                key:'TransactionHistory', 
                title:'交易记录',
                isMain:false,
                naviPath:"/Portfolio/TransactionHistory",
            },
        ],
    },
]

// 探索模块菜单配置项
export const ExplorMenus:MuMenuItemType[] = [
    {
        key:'Tokens', 
        title:'代币',
        naviPath:"/Explor/Tokens",
    },
    {
        key:'FundPool', 
        title:'资金池',
        naviPath:"/Explor/FundPool",
    },
    {
        key:'Tx', 
        title:'交易',
        naviPath:"/Explor/Tx",
    },
]

// 资产组合模块菜单配置项
export const getPortfolioMenus = (accountId:string = '', _isMain:boolean = true):MuMenuItemType[] =>{
    return [
        {
            key:'Overview', 
            title:'概览',
            isMain: _isMain,
            naviPath:`/Portfolio/Overview/${accountId}`,
        },
        {
            key:'FungibleToken', 
            title:'代币', 
            isMain: _isMain,
            naviPath:`/Portfolio/FungibleToken/${accountId}`,
        },
        {
            key:'NonFungibleToken', 
            title:'非同质化代币',
            isMain: _isMain,
            naviPath:`/Portfolio/NonFungibleToken/${accountId}`,
        },
        {
            key:'TransactionHistory', 
            title:'交易记录',
            isMain: _isMain,
            naviPath:`/Portfolio/TransactionHistory/${accountId}`,
        },
    ]
}