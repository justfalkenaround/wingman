/*_____ THIS COMPONENT WILL RENDER AN ERROR MESSAGE VISUALLY DEPENEDING ON THE PROPS _____*/

/*_____ ERROR COMPONENT _____*/
const ErrorComponent = props => {
    return (
        <section className='ui icon error message'>
            <i className='attention circle icon'></i>
            <div className='content'>
                <div className='header'>{props.error && props.error.response && props.error.response.data && props.error.response.data.header || props.error && props.error._object && props.error._object.header || props.header || 'We\'re Sorry'}</div>
                <p
                style={{ fontFamily: 'Lato,\'Helvetica Neue\', Arial, Helvetica, Impact, sans-serif, serif' }}
                >{props.error && props.error.response && props.error.response.data && props.error.response.data.message || props.error && props.error._object && props.error._object.message || props.message || 'Something went wrong...'}</p>
            </div>
        </section>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default ErrorComponent