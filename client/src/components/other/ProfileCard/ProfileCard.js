/*_____ FUNCTION CAPITALIZE THE FIRST LETTER OF A STRING _____*/
const capitalize = string => `${string[0].toUpperCase()}${string.substring(1)}`

/*_____ PROFILE CARD COMPONENT _____*/
const ProfileCard = props => {
    /*_____ GRAB THE PROPS _____*/
    const { image, name, gender, location, bio, age } = props
    const blank = () => 0
    /*_____ RENDER THE COMPONENT _____*/
    return (
        <article onClick={props.specialOnClick || blank} style={props.special ? { maxWidth: '60%', cursor: 'pointer' } : {}} className='ui card'>
            <img src={image && image.url} />
            <section className='content'>
                <section className='header'>{name}</section>
                <section className='meta'>{capitalize(gender || 'Gender Not Provided')} {age || capitalize('Age Not Provided')}</section>
                <section className='meta'>{capitalize(location || 'Nowhere')}</section>
                <section className='description'>{bio || `Hi I'm ${name} and I didn't take the time to fill out my bio... Whoops!`}</section>
            </section>
            {props.children}
            {
                props.images && props.images.map(v => (
                    <img key={v._id} src={v && v.url} />
                ))
            }
        </article>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default ProfileCard