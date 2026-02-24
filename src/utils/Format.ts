export const formatAddress = (address: string): string => {
    if (!address) {
        return ''
    }

    if (address.includes('...')){
      return address
    }
    
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const formatDate = (timestamp: number): string =>{
    let date:Date = new Date(timestamp * 1000)
    //return `${date.getFullYear()}/${date.getMonth()}/${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    //return date.toLocaleDateString()
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}

// 自定义格式（不带货币符号）
export const formatCurrency = (
    amount: number,
    locale: string = 'en-US',
    options: Intl.NumberFormatOptions = {}
): string => {
    let _maximumFractionDigits:number = 2
    
    const defaultOptions: Intl.NumberFormatOptions = {
        minimumFractionDigits: 2,
        maximumFractionDigits: _maximumFractionDigits,
        ...options
    }
    if(amount < 0.001 && amount > 0){
        return "<0.001"
    }
    return new Intl.NumberFormat(locale, defaultOptions).format(amount)
}

export const formatTimeForTX = (timestamp: number): string =>{
    let seconds:number = Math.floor(Date.now()/1000) - timestamp
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= (24 * 3600);
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    let timeString:string = ''
    if(days > 0){
        timeString = `${days}天${hours}小时`
    }else{
        if(hours > 0){
            timeString = `${hours}小时${minutes}分`
        }else{
            if( minutes > 0){
                timeString = `${minutes}分${remainingSeconds}秒`
            }else{
                timeString = `${remainingSeconds}秒`
            }
        }
    }
    return timeString
}