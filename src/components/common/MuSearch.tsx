import { SearchOutlined } from "@ant-design/icons"
import { MuInput } from "@Mu/components/common/MuInput"
import { commBorder, flexRowStyle } from "@Mu/components/common/MuStyles"

export interface MuSearchProps {
    onSearch?:(searchContent: string) => void
}

export const MuSearch = (props: MuSearchProps) => {
    const {onSearch,} = {...props}

    const search = (key: string) => {
        onSearch !== undefined ? onSearch(key) : null
    }
    
    return (
        <div 
            style={{...flexRowStyle,border:commBorder, gap:'5px', borderRadius:'20px', paddingTop:'8px', paddingBottom:'8px', paddingLeft:'20px', paddingRight:'10px'}}
        >
            <SearchOutlined style={{width:'10%', fontSize:'20px'}}/>
            <MuInput style={{fontSize:'20px', width:'80%',}} waterMark="search tokens" onTextChange={(value: string)=>{search(value)}}/>
        </div>
    )
}