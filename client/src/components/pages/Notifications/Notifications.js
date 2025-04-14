/*_____ IMPORT ALL DEPENDENCIES _____*/
import MessageComponent from '../../other/MessageComponent/MessageComponent.js'
import ErrorComponent from '../../other/ErrorComponent/ErrorComponent.js'
import Loader from '../../other/Loader/Loader.js'
import SafeButton from '../../other/SafeButton/SafeButton.js'
import { CurrentUserContext } from '../App/App.js'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteNotification, updateNotification, allSeenNotification, clearAllNotification } from '../../../api/index.js'

/*_____ NOTIFICATIONS COMPONENT _____*/
const Notifications = props => {
    /*_____ GET CONTECT AND METHODS _____*/
    const redirect = useNavigate()
    const user = useContext(CurrentUserContext)
    /*_____ SET MESSAGE STATES _____*/
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(null)

    /*_____ DELETE ALL NOTIFICATIONS ON THIS PROFILE _____*/
    const removeAllNotifications = async () => {
        try {
            setLoading(true)
            await clearAllNotification()
            await props.getCurrent()
            setLoading(false)
        }
        catch (err) {
            setLoading(false)
            setError(err)
        }
    }

    /*_____ DELETE SPECIFIC NOTIFICATION _____*/
    const removeNotification = async id => {
        try {
            setLoading(true)
            await deleteNotification(id)
            await props.getCurrent()
            setLoading(false)
        }
        catch (err) {
            setLoading(false)
            setError(err)
        }
    }

    /*_____ SET ALL NOTIFICATIONS AS SEEN _____*/
    const seeAllNotifications = async () => {
        try {
            setLoading(true)
            await allSeenNotification()
            await props.getCurrent()
            setLoading(false)
        }
        catch (err) {
            setLoading(false)
            setError(err)
        }
    }

    /*_____ SEE A SPECFIC NOTIFICATION _____*/
    const changeNotification = async (id, data) => {
        try {
            setLoading(true)
            await updateNotification(id, data)
            await props.getCurrent()
            setLoading(false)
        }
        catch (err) {
            setLoading(false)
            setError(err)
        }
    }

    /*_____ FALLBACK COMPONENT _____*/
    if (user && user.notifications && !user.notifications.length) {
        return (
            <article className='ui segment container warning error success'>
                {loading ? (<Loader global={true} />) : null}
                {error ? (<ErrorComponent error={error} />) : null}
                <MessageComponent
                    header='You Currently Have No Notifications'
                    message='Try Putting Some Time In On The Match Page'
                    type='info'
                />
            </article>
        )
    }
    /*_____ RENDER LIST OF ALL NOTIFICATIONS _____*/
    return (
        <article className='ui segment container warning error success info'>
            <SafeButton onClick={() => seeAllNotifications()}>Mark All As Seen</SafeButton>
            <SafeButton onClick={() => removeAllNotifications()}>Clear All Notifications</SafeButton>
            <h3>Unseen Notifications</h3>
            {loading ? (<Loader global={true} />) : null}
            {error ? (<ErrorComponent error={error} />) : null}
            {user && user.notifications && user.notifications.filter(v => !v.seen).map(v => (
                <article key={v._id} className={`ui icon message blur-box ${v.seen ? '' : 'info'}`}>
                    <i onClick={() => removeNotification(v._id)} className='close icon'></i>
                    <section
                        onClick={() => {
                            changeNotification(v._id, { seen: true })
                            redirect(v.href)
                        }}
                        style={{ cursor: 'pointer' }}
                        className='content'
                    >
                        {v.warn ? <i className='attention circle icon'></i> : null}
                        <p>{new Date(v.createdAt).toDateString()} {new Date(v.createdAt).toLocaleTimeString()}</p>
                        <section className='header'>{v.header}</section>
                        <p>{v.message}</p>
                    </section>
                </article>
            ))}
            <br></br>
            {
                user && user.notifications && user.notifications.filter(v => v.seen).length
                    ? (
                        <>
                            <hr></hr>
                            <h3>Seen Notifications</h3>
                        </>
                    )
                    : null
            }
            {user && user.notifications && user.notifications.filter(v => v.seen).map(v => (
                <article key={v._id} className={`ui icon message blur-box ${v.seen ? '' : 'info'}`}>
                    <i onClick={() => removeNotification(v._id)} className='close icon'></i>
                    <section
                        onClick={() => {
                            changeNotification(v._id, { seen: true })
                            redirect(v.href)
                        }}
                        style={{ cursor: 'pointer' }}
                        className='content'
                    >
                        {v.warn ? <i className='attention circle icon'></i> : null}
                        <p>{new Date(v.createdAt).toDateString()} {new Date(v.createdAt).toLocaleTimeString()}</p>
                        <section className='header'>{v.header}</section>
                        <p>{v.message}</p>
                    </section>
                </article>
            ))}
        </article>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default Notifications