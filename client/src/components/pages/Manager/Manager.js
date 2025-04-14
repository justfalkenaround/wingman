/*_____ IMPORT ALL DEPENDENCIES _____*/
import { Link, useParams } from 'react-router-dom'
import { useContext } from 'react'
import { CurrentUserContext, ThemeContext } from '../App/App.js'
import Account from '../Account/Account.js'
import Notifications from '../Notifications/Notifications.js'
import Matches from '../Matches/Matches.js'
import Chats from '../Chats/Chats.js'
import Statistics from '../Statistics/Statistics.js'

/*_____ MANAGER COMPONENT _____*/
const Manager = props => {
    /*_____ GET CONTEXT AND PARAMS AND SET STATES _____*/
    const sub = useParams().sub || 'account'
    const user = useContext(CurrentUserContext)
    const theme = useContext(ThemeContext)

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
    /*_____ MAIN COMPONENT _____*/
    return (
        <main>
            <aside className={`${props.width < 625 ? 'ui segment container' : 'ui container'}`}>
                <article className={`${props.width < 625 ? 'ui vertical menu' : 'ui five item menu'}`}>
                    <Link
                        to='/account/account'
                        className={`item ${sub === 'account' ? 'active' : ''}`}
                    >Edit Profile</Link>
                    <Link
                        to='/account/notifications'
                        className={`item ${sub === 'notifications' ? 'active' : ''}`}
                    >Notifications<span className='ui tiny label'>{user && user.notifications && user.notifications.filter(v => !v.seen).length || 0}</span></Link>
                    <Link
                        to='/account/matches'
                        className={`item ${sub === 'matches' ? 'active' : ''}`}
                    >Matches<span className='ui tiny label'>{user && user.matches && user.matches.length || 0}</span></Link>
                    <Link
                        to='/account/chats'
                        className={`item ${sub === 'chats' ? 'active' : ''}`}
                    >Chats<span className='ui tiny label'>{user && user.chats && user.chats.length || 0}</span></Link>
                    <Link
                        to='/account/statistics'
                        className={`item ${sub === 'statistics' ? 'active' : ''}`}
                    >A.I Statistics</Link>
                </article>
            </aside>
            {
                sub === 'account'
                    ? (
                        <Account width={props.width} themeName={props.themeName} setTheme={props.setTheme} getCurrent={props.getCurrent} />
                    )
                    : sub === 'notifications'
                        ? (
                            <Notifications width={props.width} getCurrent={props.getCurrent} />
                        )
                        : sub === 'matches'
                            ? (
                                <Matches width={props.width} getCurrent={props.getCurrent} />
                            )
                            : sub === 'chats'
                                ? (
                                    <Chats width={props.width} getCurrent={props.getCurrent} />
                                )
                                : sub === 'statistics'
                                    ? (
                                        <Statistics width={props.width} getCurrent={props.getCurrent} />
                                    ) : null
            }
        </main>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default Manager