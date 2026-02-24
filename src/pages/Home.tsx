import { FireFilled, FireOutlined } from "@ant-design/icons"

export const Home = () => {
    return (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <FireFilled style={{color:'#e7027cff'}}/>
            <span style={{color:'#eb53d4ff', fontSize:'30px'}}>欢迎来到MyUniswap!</span>
            <span style={{color:'#4e4e4eff', fontSize:'18px'}}>主页建设中...</span>
        </div>
    )
}