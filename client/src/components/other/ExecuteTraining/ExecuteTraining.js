/*_____ IMPORT ALL DEPENDENCIES _____*/
import ErrorComponent from '../ErrorComponent/ErrorComponent.js'
import MessageComponent from '../MessageComponent/MessageComponent.js'
import Loader from '../Loader/Loader.js'
import { CurrentUserContext, ThemeContext } from '../../pages/App/App.js'
import { useContext, useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { readTrainingData, updateTrainingData, pushMetric } from '../../../api/index.js'
import { SHAVED_MODEL_PATH } from './ShavedModelURL.js'
import TrainModelWorker from './TrainModelWorker.js'

/*_____ TRAIN COMPONENT _____*/
const ExecuteTraining = props => {
    const user = useContext(CurrentUserContext)
    const theme = useContext(ThemeContext)
    const redirect = useNavigate()
    /*_____ STORE THE GRAPH SURFACE IN A REF FOR GRAPHING _____*/
    const surface = useRef(null)
    const [liveMetrics, setLiveMetrics] = useState([])
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadingGraph, setLoadingGraph] = useState(false)
    const [training, setTraining] = useState('Loading')
    const [trainingModel, setTrainingModel] = useState(null)
    const [trainingModelReady, setTrainingModelReady] = useState(false)

    /*_____ ASYNC FUNCTION INITAILIZES STATE AND CONTEXT _____*/
    const _init = async () => {
        try {
            /*_____ MESSAGES TO USER _____*/
            setTraining('Loading Graph API...')
            /*_____ GET THE GRAPHING API _____*/
            await (async () => {
                let ret = await fetch('https://cdn.tlm.cloud/tensor-flow/4.13.0/tfjs-vis.umd.min.js')
                ret = await ret.text()
                return eval(ret)
            })()
            /*_____ INITIALIZE GRAPH _____*/
            tfvis.render.linechart(surface.current, { values: liveMetrics })
            setTraining('Loading Training Data...')
            /*_____ GET TRAINING DATA _____*/
            const training_data = await readTrainingData()
            setLoading(false)
            setTraining('Training Data Loaded')
            setTraining('Converting Images To Tensors...')
            setLoadingGraph(true)
            /*_____ NOTIFY WORKER AND PROVIDE DATA _____*/
            await trainingModel.postMessage({
                training_data,
                message: 'train'
            })
        }
        catch (err) {
            setTraining('Training Failed')
            setMessage(null)
            setLoading(false)
            setError(err)
        }
    }

    /*_____ INIT WHEN READY _____*/
    useEffect(() => {
        if (!user || user && user.untrained_set && user.untrained_set.length < 20 || !trainingModelReady || liveMetrics.length) {
            return
        }
        _init()
    }, [user, trainingModelReady])

    /*_____ UPDATE GRAPH ON METRIC CHANGE _____*/
    useEffect(() => {
        if (typeof tfvis === 'undefined') return
        setLoadingGraph(false)
        setTraining('Training In Progress...')
        tfvis.render.linechart(surface.current, { values: liveMetrics })
    }, [liveMetrics])

    /*_____ LOAD UP THE MODEL WORKER _____*/
    useEffect(() => {
        try {
            setLoading(true)
            /*_____ DISABLE THE NAVIGATION BAR FOR NOW _____*/
            props.setDisabled(true)
            /*_____ SEND EXIT SIGNAL WHEN COMPONENT UNMOUNTS _____*/
            if (trainingModel) return () => {
                trainingModel.postMessage({
                    message: 'exit'
                })
            }
            const MODEL = new Worker(TrainModelWorker)
            const TOKEN = window.localStorage.api_token
            /*_____ SEND INITIALIZE SIGNAL _____*/
            MODEL.postMessage({
                message: 'init',
                url: SHAVED_MODEL_PATH,
                token: TOKEN,
                hostname: window.origin
            })
            /*_____ HANDLE RESPONSES _____*/
            MODEL.onmessage = handleModelResponse
            setTrainingModel(MODEL)
            /*_____ SEND EXIT SIGNAL WHEN COMPONENT UNMOUNTS _____*/
            return () => {
                MODEL.postMessage({
                    message: 'exit'
                })
            }
        }
        catch (err) {
            setMessage(null)
            setLoading(false)
            setError(err)
        }
    }, [])

    /*_____ HANDLE WORKER RESPONSES _____*/
    const handleModelResponse = async message => {
        try {
            /*_____ AWAIT READY SIGNAL _____*/
            if (message.data.message === 'ready') {
                setTrainingModelReady(true)
            }
            /*_____ AWAIT COMPLETION SIGNAL _____*/
            else if (message.data.message === 'train_complete') {
                const set_size = (user.untrained_set.length + user.trained_set.length)
                const _metric = {
                    set_size,
                    history: message.data.metrics,
                    timestamp: Date.now()
                }
                /*_____ UPDATE THE DATA ON THE DB _____*/
                setTraining('Updating Statistics')
                await pushMetric(_metric)
                setTraining('Updating Training Sets')
                await updateTrainingData()
                await props.getCurrent()
                setTraining('Training Complete')
                /*_____ WAIT TO REDIRECT _____*/
                await new Promise((resolve, reject) => window.setTimeout(resolve, 1000))
                setTraining('Redirecting To Statistics Page')
                await new Promise((resolve, reject) => window.setTimeout(resolve, 1000))
                props.setDisabled(false)
                redirect('/account/statistics')
            }
            else if (message.data.message === 'callback') {
                if (!surface || !surface.current) return
                const _met = { ...message.data.metric }
                _met.y = _met.acc
                delete _met.acc
                _met.x = message.data.iteration
                delete _met.loss
                setLiveMetrics(prev => [...prev, _met])
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
    /*_____ USER TRAINING SET MUST BE OF SIZE _____*/
    if (user && user.untrained_set && user.untrained_set.length < 20 && !liveMetrics.length) {
        return (
            <article className='ui warning message'>
                <h1 className='header large'>You Do Not Have Enough Images In Your Training Set</h1>
                <Link to='/train' className={`ui button inverted ${theme.action}`}>Go Back</Link>
            </article>
        )
    }
    return (
        <article className='ui segment container warning error success info'
            style={{
                height: '90vh'
            }}
        >
            <h1 style={{ zIndex: 999 }}>Execute Training</h1>
            <hr></hr>
            {
                user && user.untrained_set && user.untrained_set.length
                    ? (
                        <article
                            style={{ zIndex: 999 }}
                            className={`ui relaxed divided items message red`}>
                            <section className='content red'>
                                <span className='header red'>DO NOT NAVIGATE AWAY FROM THIS PAGE!</span>
                            </section>
                        </article>
                    ) : null
            }
            {training ? (
                <section style={{ zIndex: 999 }} className={`ui message${user && user.untrained_set && user.untrained_set.length ? ' yellow' : ' green'}`}>
                    <span className='header content'>{training}</span>
                </section>
            ) : null}
            <article
                style={{ zIndex: 999 }}
                className={`ui relaxed divided items message${user && user.untrained_set && user.untrained_set.length ? ' white' : ' green'}`}>
                <section className='content'>
                    <span className='header'>Untrained Images: {user && user.untrained_set && user.untrained_set.length}</span>
                    <span className='meta'>Trained Images: {user && user.trained_set && user.trained_set.length}</span>
                </section>
            </article>
            <section ref={surface} style={{ height: '60%' }} className='ui segment graph-surface'>
                {loadingGraph ? (<Loader global={true} />) : null}
            </section>
            {loading ? (<Loader global={true} />) : null}
            {error ? (<ErrorComponent error={error} />) : null}
            {message ? (<MessageComponent {...message} />) : null}
        </article>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default ExecuteTraining