/*_____ MESSAGE COMPONENT VISUALIZES USER MESSAGES WITH THEMES _____*/

/*_____ MESSAGE COMPONENT _____*/
const MessageComponent = props => {
    return (
        <section className={`ui ${props.type || 'success'} message`}>
            <div className='content'>
                <div className='header'>{props.header || 'Success'}</div>
                <p>{props.message || 'Operation Was Completed Without A Problem'}</p>
            </div>
        </section>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default MessageComponent