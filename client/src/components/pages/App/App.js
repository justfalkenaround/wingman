/*_____ IMPORT ALL DEPENDENCIES _____*/
import './App.css'
import Home from '../Home/Home.js'
import SignUp from '../SignUp/SignUp.js'
import SignIn from '../SignIn/SignIn.js'
import ErrorComponent from '../../other/ErrorComponent/ErrorComponent.js'
import ErrorBoundary from '../../other/ErrorBoundary/ErrorBoundary.js'
import NavBar from '../../other/NavBar/NavBar.js'
import Manager from '../Manager/Manager.js'
import Chat from '../Chat/Chat.js'
import Match from '../Match/Match.js'
import Train from '../Train/Train.js'
import ExecuteTraining from '../../other/ExecuteTraining/ExecuteTraining.js'
import themes from './themes.js'
import { Routes, Route } from 'react-router-dom'
import { useState, createContext, useEffect } from 'react'
import { currentProfile } from '../../../api/index.js'

/*_____ EXPORT THE CONTEXTS FOR THE WHOLE APP _____*/
export const CurrentUserContext = createContext(null)
export const ThemeContext = createContext(themes.light)

/*_____ APP COMPONENT _____*/
const App = () => {
    /*_____ SET DEFAULT STATES _____*/
    const [user, setUser] = useState(null)
    const [theme, setTheme] = useState('light')
    const [width, setWidth] = useState(0)
    const [disabled, setDisabled] = useState(false)
    const [loading, setLoading] = useState(true)
    const [userSocket, setUserSocket] = useState(null)

    /*_____ GET THE CURRENT PROFILE IF THERE IS ONE SIGNED IN _____*/
    const getCurrent = async () => {
        try {
            setLoading(true)
            const res = await currentProfile(userSocket)
            const user = res.data || null
            if (res.init) {
                setUserSocket(res.socket)
                res.socket.on('refresh_user', () => getCurrent())
                res.socket.on('refresh_page', () => window.location.reload())
            }
            setUser(user)
            setTheme(user.theme || 'light')
            setLoading(false)
            return user
        }
        catch (err) {
            setLoading(false)
            setUser(null)
            setTheme('light')
        }
    }

    /*_____ INITIALIZATION _____*/
    useEffect(() => {
        getCurrent()
    }, [])

    /*_____ RESIZE ON MOUNT _____*/
    useEffect(() => {
        const sizefunc = e => setWidth(e.target.innerWidth)
        window.addEventListener('resize', sizefunc)
        setWidth(window.innerWidth)
        return () => window.removeEventListener('resize', sizefunc)
    }, [])

    /*_____ APPLY THEME _____*/
    useEffect(() => {
        let themeStyles = document.head.querySelector('style#theme')
        if (!themeStyles) {
            themeStyles = document.createElement('style')
            themeStyles.setAttribute('id', 'theme')
            document.head.appendChild(themeStyles)
        }
        themeStyles.textContent = themes[theme].master
    }, [theme])

    /*_____ THE MAIN ROUTER AND APP _____*/
    return (
        <CurrentUserContext.Provider value={user}>
            <ThemeContext.Provider value={themes[theme]}>
                <ErrorBoundary>
                    <NavBar loading={loading} disabled={disabled} width={width} />
                </ErrorBoundary>
                <ErrorBoundary>
                    <Routes>
                        <Route
                            path='/'
                            element={<Home width={width} />}
                        />
                        <Route
                            path='/signup'
                            element={<SignUp width={width} getCurrent={getCurrent} />}
                        />
                        <Route
                            path='/signin'
                            element={<SignIn width={width} getCurrent={getCurrent} />}
                        />
                        <Route
                            path='/account/:sub/*'
                            element={<Manager width={width} themeName={theme} setTheme={setTheme} getCurrent={getCurrent} />}
                        />
                        <Route
                            path='/match'
                            element={<Match width={width} setDisabled={setDisabled} getCurrent={getCurrent} />}
                        />
                        <Route
                            path='/train'
                            element={<Train width={width} getCurrent={getCurrent} />}
                        />
                        <Route
                            path='/execute'
                            element={<ExecuteTraining setDisabled={setDisabled} width={width} getCurrent={getCurrent} />}
                        />
                        <Route
                            path='/chat/:id'
                            element={<Chat width={width} getCurrent={getCurrent} />}
                        />
                        <Route
                            path='*'
                            element={<ErrorComponent header='Error 404:' message='Could Not Find That Resource...' />}
                        />
                    </Routes>
                </ErrorBoundary>
            </ThemeContext.Provider>
        </CurrentUserContext.Provider>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default App