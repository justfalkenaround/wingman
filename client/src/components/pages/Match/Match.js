/*_____ IMPORT ALL DEPENDENCIES _____*/
import ErrorComponent from '../../other/ErrorComponent/ErrorComponent.js'
import Loader from '../../other/Loader/Loader.js'
import HeartsAnimation from '../../other/HeartsAnimation/HeartsAnimation.js'
import { CurrentUserContext, ThemeContext } from '../App/App.js'
import { useContext, useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { readPotentials, createMatch, readCount } from '../../../api/index.js'
import MatchWorker from './MatchWorker.js'

/*_____ MATCH COMPONENT _____*/
const Match = props => {
    /*_____ GET CONTEXT AND SET STATES _____*/
    const redirect = useNavigate()
    const user = useContext(CurrentUserContext)
    const theme = useContext(ThemeContext)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [loading, setLoading] = useState(true)
    const [minage, setMinage] = useState(18)
    const [maxage, setMaxage] = useState(100)
    const [maxdist, setMaxdist] = useState(7918)
    const [count, setCount] = useState(0)
    const [countRequest, setCountRequest] = useState(false)
    const [matchWorkerInstance, setMatchWorkerInstance] = useState(null)
    const [matchWorkerReady, setMatchWorkerReady] = useState(false)
    const [metricsGive, setMetricsGive] = useState([])
    const [metricsRec, setMetricsRec] = useState([])
    /*_____ STORE THE GRAPH SURFACE _____*/
    const surface = useRef(null)

    /*_____ LOAD UP THE MODEL WORKER _____*/
    useEffect(() => {
        try {
            if (!user) return
            setLoading(true)
            /*_____ SEND EXIT SIGNAL WHEN COMPONENT UNMOUNTS _____*/
            if (matchWorkerInstance) return () => {
                matchWorkerInstance.postMessage({
                    message: 'exit'
                })
            }
            /*_____ GET THE GRAPHING API _____*/
            (async () => {
                let ret = await fetch('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-vis@1.5.1/dist/tfjs-vis.umd.min.js')
                ret = await ret.text()
                return eval(ret)
            })()
            /*_____ CREATE THE WORKER _____*/
            const MODEL = new Worker(MatchWorker)
            const TOKEN = window.localStorage.api_token
            /*_____ SEND INITIALIZE SIGNAL _____*/
            MODEL.postMessage({
                message: 'init',
                token: TOKEN,
                hostname: window.origin,
                user
            })
            /*_____ HANDLE RESPONSES _____*/
            MODEL.onmessage = handleModelResponse
            setMatchWorkerInstance(MODEL)
            /*_____ SEND EXIT SIGNAL WHEN COMPONENT UNMOUNTS _____*/
            return () => {
                MODEL.postMessage({
                    message: 'exit'
                })
            }
        }
        catch (err) {
            setError(err)
        }
    }, [user])

    useEffect(() => {
        try {
            /*_____ UPDATE GRAPH WITH LIVE METRICS _____*/
            if (typeof tfvis === 'undefined' || !surface || !surface.current) return
            const max = Math.max(metricsGive.length, metricsRec.length)
            const graph = []
            let z = 0
            /*_____ SORT AND SEPERATE FOR VISUALIZATION OF MODEL OUTCOMES AND CHOICE _____*/
            for (let i = 0; i < max; i++) {
                graph.push({ value: metricsRec[i] || 0, index: z })
                graph.push({ value: metricsGive[i] || 0, index: z + 1 })
                graph.push({ value: 0, index: z + 2 })
                z += 3
            }
            /*_____ RERENDER THE CHART _____*/
            tfvis.render.barchart(surface.current, graph)
        }
        catch (err) { }
    }, [metricsRec, metricsGive])

    /*_____ DEBOUNCE COUNT REQUEST FUNCTION _____*/
    useEffect(() => {
        try {
            const timer = setTimeout(async () => {
                setLoading(true)
                const _count = await readCount(minage || -Infinity, maxage || Infinity, maxdist / 3959)
                setCount(_count)
                setLoading(false)
            }, 1200)
            return () => {
                clearTimeout(timer)
            }
        }
        catch (err) {
            setError(err)
        }
    }, [countRequest])

    /*_____ HANDLE WORKER RESPONSES _____*/
    const handleModelResponse = async message => {
        try {
            /*_____ AWAIT READY SIGNAL _____*/
            if (message.data.message === 'ready') {
                setMatchWorkerReady(true)
                setLoading(false)
            }
            /*_____ HANDLE RESULT MESSAGE _____*/
            else if (message.data.message === 'match_found') {
                /*_____ SAVE THE BEST _____*/
                await createMatch(message.data.match._id)
                /*_____ UPDATE GLOBAL STATE _____*/
                await props.getCurrent()
                /*_____ NOTIFY THE USER _____*/
                setMessage({
                    header: 'You Got A Match!',
                    message: `You Matched With ${message.data.match.name}!`,
                    src: message.data.match.image.url
                })
                /*_____ DECREMENT THE COUNT _____*/
                setCount(count - 1)
                setLoading(false)
                props.setDisabled(false)
            }
            /*_____ HANDLE LIVE UPDATE MESSAGE _____*/
            else if (message.data.message === 'callback') {
                if (message.data.type === 'recieved') {
                    setMetricsRec(prev => [...prev, message.data.outcome])
                }
                else {
                    setMetricsGive(prev => [...prev, message.data.outcome])
                }
            }
            /*_____ HANDLE ERRORS _____*/
            else if (message.data.message === 'error') {
                props.setMessage({
                    header: 'Something Went Wrong With The A.I',
                    message: 'Please Try Again',
                    type: 'error'
                })
            }
        }
        catch (err) {
            setError(err)
        }
    }

    /*_____ SEND MATCH REQUEST _____*/
    const match = async () => {
        try {
            if (!matchWorkerReady) return
            setLoading(true)
            props.setDisabled(true)
            const profiles = await readPotentials(minage, maxage, maxdist / 3959)
            matchWorkerInstance.postMessage({
                message: 'match',
                potentials: profiles,
            })
        }
        catch (err) {
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
    /*_____ MODEL NEEDS TRAINING _____*/
    if (!user || user && user.needs_training || user && (!user.model || Math.abs(user.model_last_trained - Date.now()) > 2592000000)) {
        return (
            <main className={`ui container segment form warning error success`}>
                {message ? (
                    <>
                        <HeartsAnimation />
                        <article
                            onClick={() => redirect(`/account/matches`)}
                            style={{ cursor: 'pointer' }}
                            className={`ui relaxed divided items blur-box success message`}>
                            <section className='item'>
                                <section className='ui image'>
                                    <img src={message.src} />
                                </section>
                                <section className='content'>
                                    <span className='header'>{message && message.header}</span>
                                    <section className='description'>{message && message.message}</section>
                                </section>
                            </section>
                        </article>
                    </>
                ) : null}
                <article className='ui segment container'>
                    <h1 className='ui header'>Your A.I Needs Some More Training Before You Can Match</h1>
                    <Link
                        to='/train'
                        className={`ui button inverted ${theme.action}`}>Start Training</Link>
                </article>
            </main>
        )
    }
    /*_____ RENDER THE COMPONENT _____*/
    return (
        <main className={`ui container segment form warning error success`}>
            {message ? (
                <>
                    <HeartsAnimation />
                    <article
                        onClick={() => redirect(`/account/matches`)}
                        style={{ cursor: 'pointer' }}
                        className={`ui relaxed divided items blur-box success message`}>
                        <section className='item'>
                            <section className='ui image'>
                                <img src={message.src} />
                            </section>
                            <section className='content'>
                                <span className='header'>{message && message.header}</span>
                                <section className='description'>{message && message.message}</section>
                            </section>
                        </section>
                    </article>
                </>
            ) : null}
            <article className='ui segment container message info'>
                <h3 className='ui header green'>Your A.I Model Is Ready To Find You The Perfect Match!</h3>
            </article>
            <section style={{ height: '290px' }} ref={surface} className='ui segment graph-surface'></section>
            {error ? (<ErrorComponent error={error} />) : null}
            <h2 style={{ color: 'black' }} className='ui header segment'>{!count ? 'No Profiles Fit Your Search' : count === 1 ? `1 Profile Fits Your Search` : `${count} Profiles Fit Your Search`}</h2>
            <article className='ui form'>
                {loading ? (<Loader global={true} />) : null}
                <section className='ui segment'>
                    <section className='field'>
                        <label htmlFor='minage-input'>Minumum Age</label>
                        <input
                            type='number'
                            value={minage}
                            onChange={e => {
                                setCountRequest(!countRequest)
                                setMinage(e.target.value)
                            }}
                            placeholder='Enter Minimum Age'
                            id='minage-input'></input>
                    </section>
                    <section className='field'>
                        <label htmlFor='maxage-input'>Maximum Age</label>
                        <input
                            type='number'
                            value={maxage}
                            onChange={e => {
                                setCountRequest(!countRequest)
                                setMaxage(e.target.value)
                            }}
                            placeholder='Enter Maximum Age'
                            id='maxage-input'></input>
                    </section>
                    <section className='field'>
                        <label htmlFor='maxdist-input'>Maximum Distance In Miles</label>
                        <input
                            type='number'
                            value={maxdist}
                            min='10'
                            max='7918'
                            onChange={e => {
                                setCountRequest(!countRequest)
                                setMaxdist(e.target.value)
                            }}
                            placeholder='Enter Maximum Distance In Miles'
                            id='maxdist-input'></input>
                    </section>
                </section>
                <button
                    disabled={count && matchWorkerReady && !loading ? false : true}
                    onClick={() => match()}
                    className={`ui button inverted ${theme.action}`}>{message ? 'Find Another Match' : 'Find A Match'}</button>
            </article>
        </main>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default Match