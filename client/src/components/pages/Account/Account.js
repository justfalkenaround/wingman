/*_____ IMPORT ALL DEPENDENCIES _____*/
import { Link, useNavigate } from 'react-router-dom'
import { useContext, useState, useEffect } from 'react'
import { CurrentUserContext, ThemeContext } from '../App/App.js'
import { handleDeleteProfile, handleUpdateProfile, handleUpdateProfileImages } from '../../../api/index.js'
import { searchCities } from '../../../api/index.js'
import ErrorComponent from '../../other/ErrorComponent/ErrorComponent.js'
import MessageComponent from '../../other/MessageComponent/MessageComponent.js'
import themes_obj from '../App/themes.js'
import ImageInput from '../../other/ImageInput/ImageInput.js'
import Loader from '../../other/Loader/Loader.js'
import ProfileCard from '../../other/ProfileCard/ProfileCard.js'
import SafeButton from '../../other/SafeButton/SafeButton.js'

/*_____ CREDIT FOR REGEX : https://stack.tlm.cloud/webapps/103901 _____*/
const VALIDATE_EMAIL = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

/*_____ SOME GENDERS _____*/
const GENDERS = [
    'male',
    'female',
    'other'
]

/*_____ IMAGE CARD COMPONENT IS FOR THE USERS ADDITIONAL IMAGES _____*/
const ImageCard = props => {
    return (
        <section className='card'>
            <section className='image'>
                <img src={props.v.url} />
            </section>
            <SafeButton onClick={() => props.changeProfileImage(props.id)}>Make Profile Photo</SafeButton>
            <SafeButton color='red' onClick={() => props.deleteImage(props.id)}>Delete</SafeButton>
        </section>
    )
}

/*_____ ACCOUNT COMPONENT _____*/
const Account = props => {
    /*_____ CAPITALIZE A STRING _____*/
    const capitalize = string => `${string[0].toUpperCase()}${string.substring(1)}`
    const redirect = useNavigate()
    /*_____ GET CONTEXTS _____*/
    const user = useContext(CurrentUserContext)
    const theme = useContext(ThemeContext)
    /*_____ INITIALIZE STATE _____*/
    const [error, setError] = useState(null)
    const [deleteWarning, setDeleteWarning] = useState(null)
    const [message, setMessage] = useState(null)
    const [userMods, setUserMods] = useState({})
    const [passwordAgain, setPasswordAgain] = useState('')
    const [locationInput, setLocationInput] = useState('')
    const [locationSelection, setLocationSelection] = useState('')
    const [cities, setCities] = useState([])
    const [validImage, setValidImage] = useState('')
    const [showCropper, setShowCropper] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingLocation, setLoadingLocation] = useState(false)
    const [locationRequest, setLocationRequest] = useState(false)

    /*_____ DEBOUNCE THE LOCATION INPUT _____*/
    useEffect(() => {
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
    }, [locationRequest])

    /*_____ USERMODS OBJECT REPRESENTS UNSAVED CHANGES TO THE PROFILE THAT THE USER CAN SEE _____*/
    useEffect(() => user ? setUserMods({ ...user }) : undefined, [user])

    /*_____ SIGN OUT FUNCTION _____*/
    const signOut = async () => {
        window.localStorage['api_token'] = null
        await props.getCurrent()
        redirect('/')
    }

    /*_____ FUNCTION TO WARN THE USER BEFORE PROFILE DELETION _____*/
    const deleteProfilePre = async () => {
        setDeleteWarning({
            type: 'error',
            header: 'You Are About To Delete Your Profile Permanently',
            message: 'Are You Sure You Want To Proceed?'
        })
    }

    /*_____ FUNCTION DELETES THE PROFILE _____*/
    const deleteProfile = async () => {
        try {
            setLoading(true)
            await handleDeleteProfile()
            await signOut()
        }
        catch (err) {
            setLoading(false)
            setError(err)
        }
    }

    /*_____ ATTEMPT TO BRING DB STATE UP TO SPEED WITH LOCAL STATE _____*/
    const updateProfile = async () => {
        try {
            if (!VALIDATE_EMAIL.test(userMods.email || '') || userMods.email && !userMods.email.trim().length) {
                setError({
                    _object: {
                        header: 'Invalid Email',
                        message: `Please Enter A Valid Email Address`
                    }
                })
                return
            }
            else if (userMods.password !== '' && userMods.password && (userMods.password !== passwordAgain || userMods.password.length < 6 || userMods.password.trim().length < 6)) {
                setError({
                    _object: {
                        header: 'Invalid Password',
                        message: 'Passwords Must Match And Be At Least Six Characters'
                    }
                })
                return
            }
            else if (userMods.age < 18) {
                setError({
                    _object: {
                        header: 'Invalid Age',
                        message: 'Must Be At Least 18 Years Of Age'
                    }
                })
                return
            }
            /*_____ UNSURE VALID INPUT FOR NAME _____*/
            else if (!userMods.name || !userMods.name.length || !userMods.name.trim().length) {
                setError({
                    _object: {
                        header: 'Invalid Name',
                        message: `Please Enter A Real Name`
                    }
                })
                return
            }
            setLoading(true)
            await handleUpdateProfile(userMods)
            /*_____ CLEAR THE INPUTS _____*/
            const copy = { ...userMods }
            copy.password = undefined
            setUserMods(copy)
            setPasswordAgain('')
            setLocationInput('')
            setLocationSelection('')
            setValidImage(null)
            setError(null)
            setMessage({
                header: 'Success',
                message: `Profile Has Been Updated`
            })
            await props.getCurrent()
            setLoading(false)
        }
        catch (err) {
            console.log(err)
            setLoading(false)
            setError(err)
        }
    }

    /*_____ UPDATE THE USERS THEME _____*/
    const updateTheme = async () => {
        try {
            setLoading(true)
            await handleUpdateProfile({ theme: props.themeName })
            setMessage({
                header: 'Profile Theme Has Been Updated',
                message: `New Theme: ${capitalize(props.themeName)}`
            })
            const copy = { ...userMods }
            user.theme = copy.theme = props.themeName
            setUserMods(copy)
            setLoading(false)
        }
        catch (err) {
            setLoading(false)
            setError(err)
        }
    }

    /*_____ SET USER MODS REUSABLE FUNCTION _____*/
    const setModifier = (e, name) => {
        try {
            const copy = { ...userMods }
            copy[name] = e.target.value
            setUserMods(copy)
        }
        catch (err) {
            setError(err)
        }
    }

    /*_____ ADD AN IMAGE TO THE PROFILE _____*/
    const addImage = async () => {
        try {
            setLoading(true)
            await handleUpdateProfileImages({ newImage: validImage })
            setMessage({
                header: 'Success',
                message: `Image Has Been Added Successfully`
            })
            setShowCropper(false)
            setValidImage('')
            setError(null)
            await props.getCurrent()
            setLoading(false)
        }
        catch (err) {
            setLoading(false)
            setError(err)
        }
    }

    /*_____ DELETE AN IMAGE FROM THE PROFILE _____*/
    const deleteImage = async id => {
        try {
            setLoading(true)
            await handleUpdateProfileImages({ deleteImage: id })
            setMessage({
                header: 'Success',
                message: `Image Has Been Deleted Successfully`
            })
            setError(null)
            await props.getCurrent()
            setLoading(false)
        }
        catch (err) {
            setLoading(false)
            setError(err)
        }
    }

    /*_____ SWAP IMAGES FOR PROFILE PICTURE _____*/
    const changeProfileImage = async id => {
        try {
            setLoading(true)
            await handleUpdateProfileImages({ swapImage: id })
            await props.getCurrent()
            setMessage({
                header: 'Success',
                message: `Image Has Been Swapped Successfully`
            })
            setError(null)
            setLoading(false)
        }
        catch (err) {
            setLoading(false)
            setError(err)
        }
    }

    /*_____ ONLY RENDER IF SIGNED IN _____*/
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
        <article className='ui container form warning error success'>
            {loading ? (<Loader global={true} />) : null}
            {message ? (<MessageComponent {...message} />) : null}
            {error ? (<ErrorComponent error={error} />) : null}
            <br></br>
            <article className={`ui container segment${props.width > 720 ? ' two cards' : ' one cards'}`}>
                <ProfileCard
                    image={user && user.image}
                    name={userMods && userMods.name}
                    gender={userMods && userMods.gender}
                    age={userMods && userMods.age}
                    bio={userMods && userMods.bio}
                    location={userMods && userMods.location}
                />
                <br></br>
                <article className='ui form card'>
                    <section className='ui segment'>
                        <section className='field'>
                            <label htmlFor='name-input'>Name: </label>
                            <input id='name-input' type='text' value={userMods.name || ''}
                                onChange={e => setModifier(e, 'name')}></input>
                        </section>
                        <section className='field'>
                            <label htmlFor='gender-input'>Gender:</label>
                            <select
                                value={userMods.gender || ''}
                                onChange={e => setModifier(e, 'gender')}
                                id='gender-input'>
                                {GENDERS.map(v => <option
                                    key={v}
                                    value={v}>{`${v[0].toUpperCase()}${v.substring(1)}`}</option>)}
                            </select>
                        </section>
                        <section className='field'>
                            <label htmlFor='gender-preference-input'>Gender Preference:</label>
                            <select
                                value={userMods.preference || ''}
                                onChange={e => setModifier(e, 'preference')}
                                id='gender-preference-input'>
                                {GENDERS.map(v => <option
                                    key={v}
                                    value={v}>{`${v[0].toUpperCase()}${v.substring(1)}`}</option>)}
                                <option value='any'>Any</option>
                            </select>
                        </section>
                        <section className='field'>
                            <label htmlFor='age-input'>Age</label>
                            <input
                                type='number'
                                value={userMods.age || 18}
                                onChange={e => setModifier(e, 'age')}
                                placeholder='Please Enter Your Real Age'
                                id='age-input'></input>
                        </section>
                        <br></br>
                        <button onClick={updateProfile} className={`ui button submit inverted ${theme.action}`}>Save</button>
                    </section>
                </article>
            </article>
            <br></br>

            <article className='ui segment container form'>
                {
                    showCropper
                        ? (<article className='one required fields'>
                            <ImageInput alternate='Add Another Photo' setValidImage={setValidImage} setMessage={setMessage} />
                        </article>)
                        : (
                            <article className={`ui container segment${props.width > 760 ? ' three cards' : ' one cards'}`}>
                                {
                                    (user && user.images && user.images.map((v => (<ImageCard
                                        changeProfileImage={changeProfileImage}
                                        deleteImage={deleteImage}
                                        id={v._id || v.id}
                                        v={v}
                                        key={v._id} />))))
                                }
                            </article>
                        )
                }
                <br></br>
                <button disabled={
                    (user && user.images && user.images.length >= 3)
                    ||
                    (validImage && showCropper || !showCropper ? false : true)
                }
                    onClick={e => {
                        !showCropper ? setShowCropper(true) : addImage()
                    }}
                    className={`ui button submit inverted ${theme.action}`}>Add Photo</button>
            </article>

            <article className='ui segment container form'>
                <section className='field'>
                    <label htmlFor='bio-input'>Bio: </label>
                    <textarea id='bio-input' type='text' value={userMods.bio || ''}
                        onChange={e => setModifier(e, 'bio')}></textarea>
                </section>
            </article>

            <article className='ui segment container form'>
                <section className='field'>
                    <label htmlFor='email-input'>Change Email: </label>
                    <input id='email-input' type='email' value={userMods.email || ''}
                        onChange={e => setModifier(e, 'email')}></input>
                </section>
                <section className='field'>
                    <label htmlFor='password'>Change Password:</label>
                    <section className='ui left icon input'>
                        <i className='lock icon'></i>
                        <input required id='password' placeholder='Please enter a new password' value={userMods.password || ''} type='password'
                            onChange={e => setModifier(e, 'password')}></input>
                    </section>
                </section>
                <section className='field'>
                    <label htmlFor='password-again'>Repeat New Password:</label>
                    <section className='ui left icon input'>
                        <i className='lock icon'></i>
                        <input required id='password-again' placeholder='Please enter the new password again' value={passwordAgain} type='password'
                            onChange={e => setPasswordAgain(e.target.value)}></input>
                    </section>
                </section>
                <button onClick={updateProfile} className={`ui button submit inverted ${theme.action}`}>Save</button>
            </article>

            <article className='ui segment container form'>
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
                        onChange={e => {
                            setLocationSelection(e.target.value)
                            const copy = { ...userMods }
                            const data = JSON.parse(e.target.value)
                            copy.coord = [data.lng, data.lat]
                            copy.location = `${data.city_ascii}, ${data.admin_name}, ${data.country}`
                            setUserMods(copy)
                        }}
                        id='location-input'>
                        {!locationInput ? <option value=''>{userMods.location || ''}</option> : <option value=''>Please Select One</option>}
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
                <button onClick={updateProfile} className={`ui button submit inverted ${theme.action}`}>Save</button>
            </article>

            <article className='ui segment container form'>
                <section className='field'>
                    <label htmlFor='theme-input'>Theme: </label>
                    <select value={props.themeName} onChange={e => props.setTheme(e.target.value)} id='theme-input'>
                        {Object.keys(themes_obj).map(v => <option
                            key={v} value={v}>{capitalize(v)}</option>)}
                    </select>
                </section>
                <button onClick={updateTheme} className={`ui button submit inverted ${theme.action}`}>Save Theme</button>
            </article>

            <article className='ui container segment'>
                <SafeButton onClick={signOut}>Sign Out</SafeButton>
                {
                    !deleteWarning
                        ? (
                            <button onClick={deleteProfilePre} className='ui inverted red button'>Delete Profile</button>
                        )
                        : (
                            <section className='ui segment container'>
                                <MessageComponent {...deleteWarning} />
                                <SafeButton color='red' onClick={() => deleteProfile()}>Delete Profile</SafeButton>
                            </section>
                        )
                }
            </article>
        </article>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default Account