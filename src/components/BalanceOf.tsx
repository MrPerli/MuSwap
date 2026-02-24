import { useEffect, useState } from "react"

interface BalanceOfProps{
    Value: bigint,
    Decimals: number,
    Symbol: string,
}

export const BalanceOf = (props: BalanceOfProps) => {
    const [integerShow, setIntegerShow] = useState<string>('')
    const [decimalsShow, setDecimalsShow] = useState<string>('')
    

    const integerShowFormat = (int: number):string => {
        let i: number = Number(BigInt(int) / 1000n)
        let j: number = int % 1000
        let format: string = `,${j.toString().padStart(3,'0')}`
        if (i === 0){
             return `${j}`
        }else{
            return integerShowFormat(i) + format
        }
    }

    useEffect(()=>{
        let INT: number = Number(props.Value / (10n**BigInt(props.Decimals)))
        setIntegerShow(`${integerShowFormat(INT)}`)
        let DECI_1000 = Number((props.Value * 1000n) / (10n**BigInt(props.Decimals))) 
        let DECI: number = INT === 0 ? DECI_1000 : DECI_1000 % INT
        setDecimalsShow(`${DECI}`)
    },[])

    return (
        <>
            <span >{integerShow}</span>
            <span style={{color:'lightgray'}}>.{decimalsShow}</span>
            <pre> </pre>
            <span >{`${props.Symbol.toUpperCase()}`}</span>
        </>
    )
}