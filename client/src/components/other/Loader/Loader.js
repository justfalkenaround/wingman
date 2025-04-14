/*_____ LOADER COMPONENT VISUALIZES LOADING BY BLURRING OUT SEGMENT AND DISABLING INTERACTION ECT _____*/

/*_____ LOADER COMPONENT _____*/
const Loader = props => {
    return (
        <div className={`ui ${props.global ? '' : 'segment'}`}>
            <div className='ui active inverted dimmer'>
                <div className='ui small loader'></div>
            </div>
        </div>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default Loader