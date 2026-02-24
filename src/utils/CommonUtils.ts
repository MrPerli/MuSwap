import { message } from "antd"

// 处理钱包地址复制
export const copyToClipboard = (content: string | `0x${string}` | undefined):boolean => {
    if (content) {
        navigator.clipboard.writeText(content)
        return true
    }
    return false
}

// 模拟Sleep
export function Sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const isVilidAddress = (address:string):boolean => {
    const addressPattern = /^0x[a-fA-F0-9]{40}$/
    return addressPattern.test(address)
}