export interface MuRouteInfoProps {
    info: React.ReactNode
}

export const MuRouteInfo = (props: MuRouteInfoProps) => {
    const currentOrigin = window.location.origin
    return (
        <div 
            style={{
                display:'flex',
                flexDirection:'row',
                padding:'5px',
                position:'fixed',
                bottom:'0px',
                left:'0px',
                background:'rgb(39, 39, 39)',
                color:'whitesmoke',
                fontSize:'10px',
                borderRadius:'3px'
            }}
        >
            {`${currentOrigin}${props.info}`}
        </div>
    )
}