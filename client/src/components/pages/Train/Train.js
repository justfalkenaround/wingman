/*_____ IMPORT ALL DEPENDENCIES _____*/
import ErrorComponent from '../../other/ErrorComponent/ErrorComponent.js'
import MessageComponent from '../../other/MessageComponent/MessageComponent.js'
import Loader from '../../other/Loader/Loader.js'
import SafeButton from '../../other/SafeButton/SafeButton.js'
import { CurrentUserContext, ThemeContext } from '../App/App.js'
import { useContext, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { pushTrainingImage, skipTrainingImage, getNext } from '../../../api/index.js'

/*_____ TRAIN COMPONENT _____*/
const Train = props => {
    /*_____ SET STATE AND CONTEXT _____*/
    const user = useContext(CurrentUserContext)
    const theme = useContext(ThemeContext)
    const redirect = useNavigate()
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [next, setNext] = useState(null)
    const [rating, setRating] = useState(null)

    /*_____ AQUIRE NEXT TRAINING IMAGE _____*/
    const _getNext = async () => {
        try {
            setLoading(true)
            /*_____ ASK THE SERVER FOR ANOTHER IMAGE _____*/
            const _next = await getNext()
            if (!_next) {
                setMessage({
                    header: 'Oh No!',
                    message: 'There Are No More Images To Train On.'
                })
            }
            else {
                setNext(_next)
                setMessage(null)
                setError(null)
            }
            setLoading(false)
        }
        catch (err) {
            setMessage(null)
            setLoading(false)
            setError(err)
        }
    }

    /*_____ INITIALIZE THE APP AND GET AN IMAGE _____*/
    useEffect(() => {
        if (!user) return;
        _getNext()
    }, [user])

    /*_____ RATE A PHOTO _____*/
    const ratePhoto = async () => {
        try {
            if (rating === null) {
                setMessage({
                    header: 'You Must Rate The Photo First',
                    message: `Please Select Hot Or Not`,
                    type: 'warning'
                })
                return
            }
            setLoading(true)
            /*_____ SEND RATING TO DB _____*/
            await pushTrainingImage({
                rating: rating,
                image: next._id
            })
            /*_____ UPDATE STATE _____*/
            await resetState()
            await props.getCurrent()
            /*_____ GET ANOTHER PHOTO _____*/
            await _getNext()
            setMessage(null)
            setError(null)
            setLoading(false)
        }
        catch (err) {
            setMessage(null)
            setLoading(false)
            setError(err)
        }
    }

    /*_____ SKIP A DATA ITEM _____*/
    const skipPhoto = async () => {
        try {
            setLoading(true)
            /*_____ CALL TO API _____*/
            await skipTrainingImage(next._id)
            /*_____ UPDATE STATE _____*/
            await resetState()
            /*_____ GET ANOTHER PHOTO _____*/
            await _getNext()
            setMessage(null)
            setError(null)
            setLoading(false)
        }
        catch (err) {
            setMessage(null)
            setLoading(false)
            setError(err)
        }
    }

    /*_____ RESET STATE _____*/
    const resetState = async () => {
        try {
            setLoading(true)
            setNext(null)
            setRating(null)
            setError(null)
            setLoading(false)
        }
        catch (err) {
            setMessage(null)
            setLoading(false)
            setError(err)
        }
    }

    /*_____ FALLBACK COMPONENT _____*/
    if (!user) {
        return (
            <article className='ui warning message'>
                <h1 className='header large'>You Are Not Signed In</h1>
                <Link to='/signin' className='ui button'>Log in</Link>
                <Link to='/signup' className={`ui button inverted ${theme.action}`}>Sign Up</Link>
            </article>
        )
    }
    return (
        <article className='ui segment container warning error success info'>
            <h1>Training Your A.I</h1>
            <hr></hr>
            <article
                style={
                    user && user.untrained_set && user.untrained_set.length >= 20
                        ? { boxShadow: '0px 0px 4px 2px rgba(46, 255, 0, 0.50)' }
                        : { boxShadow: '0px 0px 4px 2px rgba(255, 0, 0, 0.30)' }
                }
                className={`ui relaxed divided items message ${user && user.untrained_set && user.untrained_set.length >= 20 ? 'success' : 'error'}`}>
                <section className='content'>
                    <span className='header'>Images Ready For Training: {user && user.untrained_set && user.untrained_set.length}</span>
                    {
                        user && user.untrained_set && user.untrained_set.length < 20
                            ? (<section className='description'>Please Rate At Least 20 Images</section>) : null
                    }
                    <span className='meta'>Images Already Trained On: {user && user.trained_set && user.trained_set.length}</span>
                    {
                        user && user.untrained_set && user.untrained_set.length >= 20 ? (
                            <>
                                <br></br>
                                <SafeButton
                                    color='red'
                                    onClick={() => redirect('/execute')}
                                >
                                    EXECUTE TRAINING
                                </SafeButton>
                            </>
                        ) : null
                    }
                </section>
            </article>
            {loading ? (<Loader global={true} />) : null}
            {error ? (<ErrorComponent error={error} />) : null}
            {message ? (<MessageComponent {...message} />) : null}
            {
                next
                    ? (
                        <>
                            <h3 className='header'>Please Rate This Image</h3>
                            <section className={`ui container segment one cards form warning info error success`}>
                                <article style={{ maxWidth: '370px' }} className='ui card'>
                                    <img src={next && next.url} />
                                    <section className='content'>
                                        <article className='ui two item menu'>
                                            <a
                                                onClick={() => setRating(0)}
                                                className={`item rating-button ${rating === 0 ? 'active' : ''}`}>Not</a>
                                            <a
                                                onClick={() => setRating(1)}
                                                className={`item rating-button ${rating === 1 ? 'active' : ''}`}>Hot</a>
                                        </article>
                                    </section>
                                    {message ? (<MessageComponent {...message} />) : null}
                                    <button
                                        onClick={() => ratePhoto()}
                                        className={`ui submit inverted button ${theme.action}`}>Rate</button>
                                    <button
                                        onClick={() => skipPhoto()}
                                        className={`ui submit inverted button red`}>Not Sure</button>
                                </article>
                            </section>
                        </>
                    ) : null
            }
        </article>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default Train