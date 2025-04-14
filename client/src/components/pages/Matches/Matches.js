/*_____ IMPORT ALL DEPENDENCIES _____*/
import ErrorComponent from '../../other/ErrorComponent/ErrorComponent.js'
import MessageComponent from '../../other/MessageComponent/MessageComponent.js'
import { CurrentUserContext, ThemeContext } from '../App/App.js'
import { useContext, useState, useEffect } from 'react'
import Loader from '../../other/Loader/Loader.js'
import ProfileCard from '../../other/ProfileCard/ProfileCard.js'
import { getMatches, updateMatch } from '../../../api/index.js'
import SafeButton from '../../other/SafeButton/SafeButton.js'

/*_____ MATCHES COMPONENT _____*/
const Matches = props => {
    /*_____ GET CONTEXT AND SET STATES _____*/
    const user = useContext(CurrentUserContext)
    const theme = useContext(ThemeContext)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(null)
    const [expanded, setExpanded] = useState(null)
    const [matches, setMatches] = useState(null)

    /*_____ GET A LIST OF MATCHES _____*/
    const _getMatches = async () => {
        try {
            setLoading(true)
            const _matches = await getMatches()
            setMatches(_matches)
            setLoading(false)
        }
        catch (err) {
            setLoading(false)
            setError(err)
        }
    }

    /*_____ INITIALIZE _____*/
    useEffect(() => {
        _getMatches()
    }, [])

    /*_____ RESPOND TO MATCH _____*/
    const update = async (id, disposition) => {
        try {
            setLoading(true)
            await updateMatch(id, disposition)
            await _getMatches()
            props.getCurrent()
            setLoading(false)
        }
        catch (err) {
            setLoading(false)
            setError(err)
        }
    }

    /*_____ FALLBACK COMPONENT _____*/
    if (user && user.matches && matches && !matches.length) {
        return (
            <article className='ui segment container warning error success'>
                {loading ? (<Loader global={true} />) : null}
                {error ? (<ErrorComponent error={error} />) : null}
                <MessageComponent
                    header='You Currently Have No Matches'
                    message='Try Putting Some Time In On The Match Page'
                    type='info'
                />
            </article>
        )
    }
    /*_____ RENDER THE COMPONENT _____*/
    return (
        <article className='ui segment container warning error success info'>
            <h3>Matches</h3>
            {loading ? (<Loader global={true} />) : null}
            {error ? (<ErrorComponent error={error} />) : null}
            <section className={`ui container segment ${
                props.width > 1080 ? 'three cards' : props.width > 720 ? 'two cards' : 'one cards'
                }`}>
                {user && user.matches && matches && matches.map(v => (
                    <ProfileCard
                        key={v._id}
                        image={v && v.image}
                        name={v && v.name}
                        gender={v && v.gender}
                        age={v && v.age}
                        bio={v && v.bio}
                        location={v && v.location}
                        images={expanded === v._id ? v && v.images : []}
                    >
                        <SafeButton color='red' onClick={() => update(v._id, 'reject')}>Reject</SafeButton>
                        <SafeButton onClick={() => update(v._id, 'accept')}>Connect</SafeButton>
                        <button
                            className={`ui button inverted ${theme.action}`}
                            onClick={() => { expanded === v._id ? setExpanded(null) : setExpanded(v._id) }}
                        >
                            {expanded === v._id ? 'See Less' : 'See More'}
                        </button>
                    </ProfileCard>
                ))}
            </section>
        </article>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default Matches