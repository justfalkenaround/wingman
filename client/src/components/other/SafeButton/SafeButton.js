/*_____ IMPORT ALL DEPENDENCIES _____*/
import { useState, useContext } from 'react'
import { ThemeContext } from '../../pages/App/App.js'

/*_____ RENDERS A BUTTON WITH LOGIC TO ASK THE USER IF THEY ARE SURE BEFORE EXECUTING FUNCTION _____*/

/*_____ SAFE BUTTON COMPONENT _____*/
const SafeButton = props => {
    /*_____ GET CONTEXT _____*/
    const theme = useContext(ThemeContext)
    const { onClick, children } = props
    /*_____ SET STATE _____*/
    const [pre, setPre] = useState(false)

    return (
        <>
            {
                pre
                    ? (
                        <button onClick={() => {
                            setPre(false)
                            onClick()
                        }} className={`ui button inverted ${props.color || theme.action}`}>Are You Sure?</button>
                    )
                    : (
                        <button onClick={() => setPre(true)} className={`ui button inverted ${props.color || theme.action}`}>{children}</button>
                    )
            }
        </>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default SafeButton