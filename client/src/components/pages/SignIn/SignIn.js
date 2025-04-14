/*_____ IMPORT ALL DEPENDENCIES _____*/
import { handleSignIn } from '../../../api/index.js'
import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { CurrentUserContext, ThemeContext } from '../App/App.js'
import ErrorComponent from '../../other/ErrorComponent/ErrorComponent.js'
import Loader from '../../other/Loader/Loader.js'

/*_____ SIGNIN COMPONENT _____*/
const SignIn = props => {
    /*_____ GET CONTEXT AND METHODS _____*/
    const user = useContext(CurrentUserContext)
    const theme = useContext(ThemeContext)
    const redirect = useNavigate()
    /*_____ SET DEFAULT STATES _____*/
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    /*_____ SUBMIT HANDER _____*/
    const signIn = async (e) => {
        try {
            e.preventDefault()
            /*_____ CREATE A PAYLOAD _____*/
            const _user = {
                email,
                password
            }
            setLoading(true)
            /*_____ SEND THE PAYLOAD _____*/
            const res = await handleSignIn(_user)
            /*_____ SAVE THE ACCESS TOKEN _____*/
            const { token } = res
            window.localStorage['api_token'] = token
            /*_____ CLEAR THE INPUTS _____*/
            setEmail('')
            setPassword('')
            setError(null)
            /*_____ UPDATE GLOBAL APP STATE _____*/
            await props.getCurrent()
            /*_____ REDIRECT TO THE ACCOUNT PAGE _____*/
            redirect('/account/account')
        }
        catch (err) {
            /*_____ VISUALIZE ANY ERRORS _____*/
            setLoading(false)
            setPassword('')
            setError(err)
        }
    }

    /*_____ RENDER A MESSAGE REDIRECTING THE USER IF THEY ARE ALREADY SIGNED IN _____*/
    if (user) {
        return (
            <article className='ui warning message'>
                <h1 className='header large'>You Are Already Signed In</h1>
            </article>
        )
    }
    return (
        <main className='ui container'>
            <h1 className='ui header'>Sign In</h1>
            {error ? (<ErrorComponent error={error} />) : null}
            <form className='ui form segment' onSubmit={signIn}>
                {loading ? (<Loader global={true} />) : null}
                <article className='two required fields'>
                    <section className='field'>
                        <label htmlFor='email'>Email</label>
                        <input required id='email' placeholder='Please enter your email' type='text'
                            onChange={e => setEmail(e.target.value)} value={email}></input>
                    </section>
                    <section className='field'>
                        <label htmlFor='password'>Password</label>
                        <section className='ui left icon input'>
                            <i className='lock icon'></i>
                            <input required id='password' placeholder='Please enter your password' type='password'
                                onChange={e => setPassword(e.target.value)} value={password}></input>
                        </section>
                    </section>
                    <button type='submit' className={`ui submit button inverted ${theme.action}`}>Submit</button>
                </article>
            </form>
        </main>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default SignIn