/*_____ IMPORT ALL DEPENDENCIES _____*/
import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { CurrentUserContext, ThemeContext } from '../App/App.js'
import StarsAnimation from '../../other/StarsAnimation/StarsAnimation.js'

/*_____ HOME COMPONENT _____*/
const Home = () => {
    /*_____ GET THE CONTEXTS _____*/
    const user = useContext(CurrentUserContext)
    const theme = useContext(ThemeContext)

    /*_____ RENDER THE COOL ANIMATED HOMEPAGE _____*/
    /*_____ EVERYBODY NEEDS THIER FRUITS AND VEGETABLES _____*/
    return (
        <main className='ui container'>
            <StarsAnimation />
            <header className='ui text container'>
                <h1 style={{ color: 'white', fontSize: '480%' }} className='ui header'>WingMan</h1>
                <h2 style={{ color: 'white' }}>There's plenty of trash in the sea, find yourself some fish!</h2>
                {
                    !user
                        ? (
                            <Link to='/signup' className={`ui huge button inverted ${theme.action}`}>Get Started <i className='right arrow icon'></i></Link>
                        )
                        : (
                            <Link to='/match' className={`ui huge button inverted ${theme.action}`}>Start Matching<i className='right arrow icon'></i></Link>
                        )
                }
            </header>
        </main>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default Home