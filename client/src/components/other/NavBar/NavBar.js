/*_____ IMPORT ALL DEPENDENCIES _____*/
import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { CurrentUserContext, ThemeContext } from '../../pages/App/App.js'
import Loader from '../Loader/Loader.js'

/*_____ NAVBAR COMPONENT _____*/
const NavBar = props => {
    /*_____ GET CONTEXTS _____*/
    const user = useContext(CurrentUserContext)
    const theme = useContext(ThemeContext)

    /*_____ RENDER THE COMPONENT _____*/
    return (
        <nav className='ui large top menu'>
            {props.disabled ? (
                <section className='special-disabled'></section>
            ) : null}
            <section className='ui container'>
                {
                    props.width > 410
                        ? (<Link to='/' className='item ui header'>🍑 WingMan</Link>)
                        : (<Link to='/' className='item ui header'>🍑</Link>)
                }
                <article className='right menu'>
                    {
                        !user
                            ? (
                                <>
                                    <section className='item'>
                                        <Link to='/signin' className={`ui button`}>Log in</Link>
                                    </section>
                                    <section className='item'>
                                        <Link to='/signup' className={`ui button inverted ${theme.action}`}>Sign Up</Link>
                                    </section>
                                </>
                            )
                            : props.loading
                                ? (
                                    <section className='item'>
                                        <Loader />
                                    </section>
                                )
                                : (
                                    <>
                                        <section className='item'>
                                            <Link to='/match' className={`ui button ${theme.action}`}>Match</Link>
                                        </section>
                                        <section className='item small'>
                                            <Link to='/account/account' className={`ui button inverted ${theme.action}`}>
                                                {
                                                    props.width < 540
                                                        ? user && user.name.split(' ')[0]
                                                        : user && user.name
                                                }{' '}
                                                <span className='ui tiny label'>{user && user.notifications && user.notifications.filter(v => !v.seen).length || 0}</span>
                                            </Link>
                                        </section>
                                    </>
                                )
                    }
                </article>
            </section>
        </nav>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default NavBar