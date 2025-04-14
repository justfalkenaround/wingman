/*_____ IMPORT ALL DEPENDENCIES _____*/
import { handleSignUp } from '../../../api/index.js'
import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { CurrentUserContext, ThemeContext } from '../App/App.js'
import ErrorComponent from '../../other/ErrorComponent/ErrorComponent.js'
import ErrorBoundary from '../../other/ErrorBoundary/ErrorBoundary.js'
import MessageComponent from '../../other/MessageComponent/MessageComponent.js'
import ImageInput from '../../other/ImageInput/ImageInput.js'
import { searchCities } from '../../../api/index.js'
import Loader from '../../other/Loader/Loader.js'

/*_____ CREDIT FOR REGEX : https://stack.tlm.cloud/webapps/103901 _____*/
const VALIDATE_EMAIL = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

/*_____ ARRAY OF SOME POSSIBLE GENDERS _____*/
const GENDERS = [
    'male',
    'female',
    'other'
]

/*_____ SIGNUP COMPONENT _____*/
const SignUp = props => {
    /*_____ GET CONTEXT AND METHODS _____*/
    const user = useContext(CurrentUserContext)
    const theme = useContext(ThemeContext)
    const redirect = useNavigate()
    /*_____ SET FORM STATES _____*/
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmed, setPasswordConfirmed] = useState('')
    const [gender, setGender] = useState('')
    const [preference, setPreference] = useState('')
    const [bio, setBio] = useState('')
    const [age, setAge] = useState(0)
    const [validImage, setValidImage] = useState('')
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [cities, setCities] = useState([])
    const [locationInput, setLocationInput] = useState('')
    const [locationSelection, setLocationSelection] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingLocation, setLoadingLocation] = useState(false)
    const [locationRequest, setLocationRequest] = useState(false)

    /*_____ DEBOUNCE FUNCTION FOR SEARCHING THE LIST OF LOCATIONS _____*/
    useEffect(() => {
        try {
            setLoadingLocation(true)
            const timer = setTimeout(async () => {
                try {
                    const list = await searchCities(locationInput || 'undefined')
                    setCities(list)
                    setLoadingLocation(false)
                }
                catch (err) {
                    setLoadingLocation(false)
                }
            }, 350)
            return () => {
                clearTimeout(timer)
            }
        }
        catch (err) {
            setError(err)
        }
    }, [locationRequest])

    /*_____ SUBMIT HANDLER _____*/
    const signUp = async e => {
        try {
            e.preventDefault()
            const err = new Error()
            /*_____ VALIDATE USER INPUT _____*/
            if (password !== passwordConfirmed || password.length < 6 || password.trim().length < 6) {
                setPassword('')
                setPasswordConfirmed('')
                err._object = {
                    message: 'Passwords Must Match And Be At Least Six Characters'
                }
                setError(err)
                return
            }
            /*_____ APPLY EMAIL TO REGEX _____*/
            else if (!VALIDATE_EMAIL.test(email) || !email.trim().length) {
                err._object = {
                    header: 'Invalid Email',
                    message: `Please Enter A Valid Email Address`
                }
                setError(err)
                return
            }
            /*_____ UNSURE VALID INPUT FOR NAME _____*/
            else if (!name.trim().length) {
                err._object = {
                    header: 'Invalid Name',
                    message: `Please Enter A Real Name`
                }
                setError(err)
                return
            }
            /*_____ MAKE SURE THERE IS A VALID IMAGE UPLOADED _____*/
            else if (!validImage) {
                setPassword('')
                setPasswordConfirmed('')
                err._object = {
                    message: 'Please Select An Image Of Yourself'
                }
                setError(err)
                return
            }
            /*_____ MAKE SURE AGE IS CORRECT _____*/
            else if (age < 18) {
                setPassword('')
                setPasswordConfirmed('')
                err._object = {
                    message: 'Must Be At Least 18 Years Of Age'
                }
                setError(err)
                return
            }
            /*_____ THERE SHOULD BE A LOCATION SELECTED _____*/
            const location = JSON.parse(locationSelection)
            if (!location) {
                const err = new Error()
                err._object = {
                    message: 'Must Select A Valid Location Near You'
                }
                setError(err)
                return
            }
            /*_____ BUILD A PAYLOAD _____*/
            const profile = {
                name,
                email,
                password,
                image: validImage,
                gender,
                preference,
                bio,
                age,
                coord: [location.lng, location.lat],
                location: `${location.city_ascii}, ${location.admin_name}, ${location.country}`
            }
            setLoading(true)
            /*_____ SEND THE PACKAGE _____*/
            const res = await handleSignUp(profile)
            const { token } = res
            window.localStorage['api_token'] = token
            /*_____ CLEAR THE INPUTS _____*/
            setName('')
            setEmail('')
            setPassword('')
            setPasswordConfirmed('')
            setValidImage('')
            setGender('')
            setPreference('')
            setBio('')
            setLocationInput('')
            setLocationSelection('')
            setAge(0)
            setError(null)
            /*_____ UPDATE GLOBAL APP STATE _____*/
            await props.getCurrent()
            /*_____ REDIRECT TO ACCOUNT PAGE _____*/
            redirect('/account/account')
        }
        catch (err) {
            setLoading(false)
            setPassword('')
            setPasswordConfirmed('')
            setError(err)
        }
    }

    /*_____ NOTIFY USER IF THEY ARE ALREADY SIGNED IN _____*/
    if (user) {
        return (
            <article className='ui warning message'>
                <h1 className='header large'>You Are Already Signed Up</h1>
            </article>
        )
    }
    /*_____ OTHERWISE RENDER THE COMPONENT _____*/
    return (
        <ErrorBoundary>
            <main className='ui container'>
                <h1 className='ui header'>Sign Up</h1>
                <section>
                    {error ? (<ErrorComponent error={error} />) : null}
                    {message ? (<MessageComponent {...message} />) : null}
                </section>
                <form className='ui form segment' onSubmit={signUp}>
                    {loading ? (<Loader global={true} />) : null}
                    <article className='ui segment'>
                        <article className='one required fields'>
                            <ImageInput setValidImage={setValidImage} setMessage={setMessage} />
                        </article>
                    </article>
                    <br></br>
                    <article className='ui segment'>
                        <article className='two required fields'>
                            <section className='field'>
                                <label htmlFor='name'>Name</label>
                                <input required id='name' placeholder='John Doe' type='text' value={name}
                                    onChange={e => setName(e.target.value)}></input>
                            </section>
                            <section className='field'>
                                <label htmlFor='email'>Email</label>
                                <input required id='email' placeholder='john.doe@fake.com' type='email' value={email}
                                    onChange={e => setEmail(e.target.value)}></input>
                            </section>
                        </article>
                        <br></br>
                        <article className='two required fields'>
                            <section className='field'>
                                <label htmlFor='password'>Password</label>
                                <section className='ui left icon input'>
                                    <i className='lock icon'></i>
                                    <input required id='password' placeholder='Please enter a password' value={password} type='password'
                                        onChange={e => setPassword(e.target.value)}></input>
                                </section>
                            </section>
                            <section className='field'>
                                <label htmlFor='password-again'>Repeat Password</label>
                                <section className='ui left icon input'>
                                    <i className='lock icon'></i>
                                    <input required id='password-again' placeholder='Please enter your password again' value={passwordConfirmed} type='password'
                                        onChange={e => setPasswordConfirmed(e.target.value)}></input>
                                </section>
                            </section>
                        </article>
                    </article>
                    <br></br>
                    <article className='ui segment'>
                        <article className='two required fields'>
                            <section className='field'>
                                <label htmlFor='gender-input'>Gender</label>
                                <select
                                    value={gender}
                                    onChange={e => setGender(e.target.value)}
                                    id='gender-input'>
                                    <option value=''>Please Select One</option>
                                    {GENDERS.map(v => <option
                                        key={v}
                                        value={v}>{`${v[0].toUpperCase()}${v.substring(1)}`}</option>)}
                                </select>
                            </section>
                            <section className='field'>
                                <label htmlFor='preference-input'>Preference</label>
                                <select
                                    value={preference}
                                    onChange={e => setPreference(e.target.value)}
                                    id='preference-input'>
                                    <option value=''>Please Select One</option>
                                    {GENDERS.map(v => <option
                                        key={v}
                                        value={v}>{`${v[0].toUpperCase()}${v.substring(1)}`}</option>)}
                                    <option value='any'>Any</option>
                                </select>
                            </section>
                        </article>
                    </article>
                    <br></br>
                    <article className='ui segment'>
                        <section className='field'>
                            <label htmlFor='location-search'>Search Locations</label>
                            <section className='ui input'>
                                <input id='location-search' placeholder='Please search for a city, province, or country near you.' value={locationInput} type='text'
                                    onChange={e => {
                                        setLocationInput(e.target.value)
                                        setLocationSelection('')
                                        setLocationRequest(!locationRequest)
                                    }}
                                ></input>
                            </section>
                        </section>
                        <section className='field'>
                            {loadingLocation ? (<Loader global={true} />) : null}
                            <label htmlFor='location-input'>Location</label>
                            <select
                                required
                                value={locationSelection}
                                onChange={e => setLocationSelection(e.target.value)}
                                id='location-input'>
                                <option value=''>Please Select One</option>
                                {cities && cities.map(v => (
                                    <option
                                        value={JSON.stringify(v)}
                                        key={v._id}
                                        className='ui segment'>
                                        {v.city_ascii}, {v.admin_name}, {v.country}
                                    </option>)
                                )}
                            </select>
                        </section>
                    </article>
                    <br></br>
                    <article className='ui segment'>
                        <section className='field'>
                            <label htmlFor='age-input'>Age</label>
                            <input
                                type='number'
                                value={age}
                                onChange={e => setAge(e.target.value)}
                                placeholder='Please Enter Your Real Age'
                                id='age-input'></input>
                        </section>
                    </article>
                    <br></br>
                    <article className='ui segment'>
                        <section className='field'>
                            <label htmlFor='bio-input'>Bio</label>
                            <textarea
                                maxLength={500}
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                placeholder='A short but personal bio can go a long way.'
                                id='bio-input'></textarea>
                        </section>
                    </article>
                    <br></br>
                    <button type='submit' className={`ui submit inverted button ${theme.action}`}>Submit</button>
                </form>
            </main>
        </ErrorBoundary>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default SignUp