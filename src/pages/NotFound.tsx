import { BugFilled } from "@ant-design/icons"
import { Avatar, Button } from "antd"
import { useNavigate } from "react-router-dom"

export const NotFound = () => {
    const navigate = useNavigate()
    return (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <span style={{color:'#f3f3f3ff', fontSize:'50px'}}>404!</span>
            <Avatar style={{backgroundColor: '#2a1e2900', color:'#d003f4ff',}} icon={<BugFilled/>}/>
            <Button onClick={()=>{navigate('/')}}>点我返回主页面</Button>
        </div>
    )
}