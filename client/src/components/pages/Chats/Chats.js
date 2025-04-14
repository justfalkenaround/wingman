/*_____ IMPORT ALL DEPENDENCIES _____*/
import MessageComponent from '../../other/MessageComponent/MessageComponent.js'
import { CurrentUserContext } from '../App/App.js'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'

/*_____ CHATS COMPONENT _____*/
const Chats = props => {
    /*_____ GET CONTEXT AND METHODS _____*/
    const redirect = useNavigate()
    const user = useContext(CurrentUserContext)

    /*_____ FALLBACK COMPONENT _____*/
    if (user && user.chats && !user.chats.length) {
        return (
            <article className='ui segment container warning error success'>
                <MessageComponent
                    header='You Currently Have No Open Chats'
                    message='Try Putting Some Time In On The Match Page'
                    type='info'
                />
            </article>
        )
    }
    /*_____ MAIN COMPONENT _____*/
    return (
        <article className='ui segment container warning error success info'>
            <h3>Chats</h3>
            {user && user.chats && user.chats.sort((a, b) => a.updatedAt < b.updatedAt ? 1 : -1).map(chat => (
                <article
                    onClick={() => redirect(`/chat/${chat._id}`)}
                    style={{ cursor: 'pointer' }}
                    key={chat._id}
                    className={`ui icon message blur-box ${chat.unread_owners && chat.unread_owners.includes(user._id) ? 'info' : ''}`}>
                    <section className='ui tiny image circle icon'>
                        <img
                            style={{ width: '80px' }}
                            src={chat.owners && chat.owners.filter(x => x._id !== user._id)[0].image.url} />
                    </section>
                    <section className='content'>
                        <p>Last Message On: {new Date(chat.updatedAt).toDateString()} {new Date(chat.updatedAt).toLocaleTimeString()}</p>
                        <section className='header'>{chat.owners.filter(x => x._id !== user._id)[0].name}</section>
                        <p>{chat.unread_owners && chat.unread_owners.includes(user._id) ? 'You have unread messages in this chat.' : `${chat.owners.filter(x => x._id !== user._id)[0].name.split(' ')[0]} can\'t wait to hear from you!`}</p>
                    </section>
                </article>
            ))}
        </article>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default Chats