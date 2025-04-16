/*_____ IMPORT ALL DEPENDENCIES _____*/
import ErrorComponent from '../../other/ErrorComponent/ErrorComponent.js'
import Loader from '../../other/Loader/Loader.js'
import { Link } from 'react-router-dom'
import { CurrentUserContext, ThemeContext } from '../App/App.js'
import { useContext, useState, useEffect, useRef } from 'react'
import { readMetrics } from '../../../api/index.js'

/*_____ STATISTICS COMPONENT _____*/
const Statistics = props => {
    /*_____ SET STATE AND CONTEXT _____*/
    const user = useContext(CurrentUserContext)
    const theme = useContext(ThemeContext)
    const surface = useRef(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(null)
    const [metrics, setMetrics] = useState([])
    const [size, setSize] = useState(0)

    /*_____ INIT FUNCTION _____*/
    const _getMetrics = async () => {
        try {
            if (!user || user && !user.model) return
            setLoading(true)
            /*_____ READ THE MODEL METRIC DATA _____*/
            const _metrics = await readMetrics()
            /*_____ LOAD THE GRAPHING API _____*/
            await (async () => {
                let ret = await fetch('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-vis@1.5.1/dist/tfjs-vis.umd.min.js')
                ret = await ret.text()
                return eval(ret)
            })()
            /*_____ UPDATE STATE _____*/
            setMetrics(_metrics.metrics)
            setSize(_metrics.size)
            setLoading(false)
            setError(null)
        }
        catch (err) {
            setLoading(false)
            setError(err)
        }
    }

    /*_____ CALL THE INIT ON MOUNT _____*/
    useEffect(() => {
        _getMetrics()
    }, [user])

    useEffect(() => {
        /*_____ UPDATE THE GRAPH WITH THE DATA _____*/
        if (typeof tfvis === 'undefined') return
        const graph = metrics.map((v, i) => ({ value: v.set_size, index: i }))
        tfvis.render.barchart(surface.current, graph)
    }, [metrics])

    /*_____ FALLBACK COMPONENT _____*/
    if (user && !user.model) {
        return (
            <article className='ui segment container warning error success info'>
                <article className='ui segment container'>
                    <h1 className='ui header'>You Have Not Yet Trained Your A.I</h1>
                    <Link
                        to='/train'
                        className={`ui button inverted ${theme.action}`}>Train My A.I</Link>
                </article>
            </article>
        )
    }
    return (
        <article className='ui segment container warning error success info'>
            <h1>Your A.I's Statistics</h1>
            <hr></hr>
            <br></br>
            {loading ? (<Loader global={true} />) : null}
            {error ? (<ErrorComponent error={error} />) : null}
            {
                !user || user && user.needs_training || user && (!user.model || Math.abs(user.model_last_trained - Date.now()) > 2592000000)
                    ? (
                        <article className='ui segment container'>
                            <h1 className='ui header'>Your A.I Needs Some Training Before You Can Start Matching</h1>
                            <Link
                                to='/train'
                                className={`ui button inverted ${theme.action}`}>Train My A.I</Link>
                        </article>
                    )
                    : (
                        <Link
                            to='/train'
                            className={`ui button inverted ${theme.action}`}>Train My A.I</Link>
                    )
            }
            <article
                className={`ui white message`}>
                <section className='content'>
                    <span className='header'>Images Ready For Training: {user && user.untrained_set && user.untrained_set.length}</span>
                    <span className='meta'>Images Already Trained On: {user && user.trained_set && user.trained_set.length}</span>
                </section>
            </article>
            <article
                className={`ui white message`}>
                <section className='content'>
                    <span className='header'>Model Size: {(size / 1000 / 1000).toFixed(3)} Mb</span>
                </section>
            </article>
            <article
                className={`ui ${user && Math.abs(user.model_last_trained - Date.now()) < 2592000000 ? 'success' : 'error'} message`}>
                <section className='content'>
                    {
                        user && Math.round(Math.abs(user.model_last_trained - Date.now()) / 1000 / 60 / 60 / 24)
                            ? (
                                <span className='header'>Model Last Trained {user && Math.round(Math.abs(user.model_last_trained - Date.now()) / 1000 / 60 / 60 / 24)} Days Ago</span>
                            )
                            : (
                                <span className='header'>Model Last Trained Today</span>
                            )
                    }
                </section>
            </article>
            <h3>Data Set Chart</h3>
            <hr></hr>
            <section style={{ height: '300px' }} ref={surface} className='ui segment graph-surface'></section>
            <h3>Training History</h3>
            <hr></hr>
            <table className='ui celled table'>
                <thead>
                    <tr>
                        <th>Training Date</th>
                        <th>Total Set Size</th>
                        <th>Epochs</th>
                        <th>Final Accuracy</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        metrics && metrics.flat().sort((a, b) => a.timestamp > b.timestamp ? -1 : 1).map((v, i) => (
                            <tr key={i}>
                                <td>{new Date(v.timestamp).toLocaleDateString()} {new Date(v.timestamp).toLocaleTimeString() || 'N/A'}</td>
                                <td className={`${v.set_size < 50 ? 'negative' : v.set_size < 100 ? 'warning' : 'positive'}`}>{v.set_size || 'N/A'}</td>
                                <td>{v.history.acc.length || 'N/A'}</td>
                                <td className='positive'>{(v.history.acc[v.history.acc.length - 1] * 100).toFixed(2) + ' %' || 'N/A'}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </article>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default Statistics