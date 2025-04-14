/*_____ IMPORT ALL DEPENDENCIES _____*/
import Loader from '../../other/Loader/Loader.js'
import ErrorComponent from '../../other/ErrorComponent/ErrorComponent.js'
import SafeButton from '../../other/SafeButton/SafeButton.js'
import ProfileCard from '../../other/ProfileCard/ProfileCard.js'
import { CurrentUserContext, ThemeContext } from '../App/App.js'
import { useContext, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getChat, postMessageToChat, deleteChat } from '../../../api/index.js'

/*_____ CHAT COMPONENT _____*/
const Chat = props => {
    /*_____ GET CONTEXT AND PARAMS _____*/
    const { id } = useParams()
    const redirect = useNavigate()
    const user = useContext(CurrentUserContext)
    const theme = useContext(ThemeContext)
    /*_____ SET STATES _____*/
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(null)
    const [chatroom, setChatroom] = useState(null)
    const [post, setPost] = useState('')
    const [typing, setTyping] = useState([])
    const [members, setMembers] = useState(1)
    const [localSocket, setLocalSocket] = useState(null)
    const [expanded, setExpanded] = useState(false)

    /*_____ GET THE CHATROOM _____*/
    const _getChat = async () => {
        try {
            setLoading(true)
            const res = await getChat(id)
            const _chatroom = res.data
            const chatroom_socket = res.socket || null
            /*_____ SOCKET HANDLER _____*/
            if (chatroom_socket) {
                /*_____ JOIN THE ROOM _____*/
                chatroom_socket.emit('join_chat', id)
                /*_____ UPDATE STATE ON EVENTS _____*/
                chatroom_socket.on('push_chat', message => {
                    const _chatroom_copy = { ..._chatroom }
                    _chatroom_copy.messages.unshift(message)
                    setChatroom(_chatroom_copy)
                })
                /*_____ USER IS TYPING _____*/
                chatroom_socket.on('type', user_id => {
                    setTyping(prev => {
                        if (!prev.includes(user_id)) {
                            return [user_id, ...prev]
                        }
                        return [...prev]
                    })
                })
                chatroom_socket.on('type_end', user_id => {
                    setTyping(prev => {
                        if (prev.includes(user_id)) {
                            const temp = [...prev]
                            temp.splice(temp.indexOf(user_id), 1)
                            return temp
                        }
                        return [...prev]
                    })
                })
                /*_____ TRACK MEMBERS _____*/
                chatroom_socket.on('members', mems => setMembers(mems))
                /*_____ STORE THE SOCKET IN STATE _____*/
                setLocalSocket(chatroom_socket)
            }
            setChatroom(_chatroom)
            setLoading(false)
        }
        catch (err) {
            setLoading(false)
            setError(err)
        }
    }

    /*_____ INITIALIZATION _____*/
    useEffect(() => {
        _getChat()
    }, [])

    /*_____ REGISTER EXIT FUNCTION _____*/
    useEffect(() => {
        return () => localSocket && localSocket.emit('exit_room', 'exit_room')
    }, [localSocket])

    /*_____ ADD A MESSAGE TO THE CHAT _____*/
    const postMessage = async e => {
        try {
            e.preventDefault()
            if (!post) return
            const payload = {
                owner: user._id,
                content: post,
                timestamp: Date.now()
            }
            setLoading(true)
            await postMessageToChat(id, payload)
            setPost('')
            /*_____ EMIT TO ALL MEMBERS OF THE CHAT _____*/
            user && localSocket && localSocket.emit('type_end', user._id)
            setLoading(false)
        }
        catch (err) {
            setLoading(false)
            setError(err)
        }
    }

    /*_____ UNMATCH FROM THE USER AND DELETE THE CHAT _____*/
    const unmatch = async () => {
        try {
            setLoading(true)
            await deleteChat(chatroom._id)
            await props.getCurrent()
            redirect('/account/chats')
            setLoading(false)
        }
        catch (err) {
            setLoading(false)
            setError(err)
        }
    }

    /*_____ IF THE CHATROOM DOESNT EXIST _____*/
    if (error && error.status === 404) {
        return (<ErrorComponent error={error} />)
    }
    /*_____ IF LOADING _____*/
    if (!chatroom) {
        return (
            <Loader global={true} />
        )
    }
    /*_____ THE MAIN COMPONENT _____*/
    return (
        <aside className={`ui segment container warning error success info`}>
            <article className={`ui segment container warning error success info${expanded ? ' one cards' : ''}`}>
                {
                    expanded
                        ? (
                            <ProfileCard
                                specialOnClick={() => setExpanded(false)}
                                special={true}
                                key={chatroom && chatroom.owners.filter(x => x._id !== user._id)[0]._id}
                                image={chatroom && chatroom.owners.filter(x => x._id !== user._id)[0].image}
                                name={chatroom && chatroom.owners.filter(x => x._id !== user._id)[0].name}
                                gender={chatroom && chatroom.owners.filter(x => x._id !== user._id)[0].gender}
                                age={chatroom && chatroom.owners.filter(x => x._id !== user._id)[0].age}
                                bio={chatroom && chatroom.owners.filter(x => x._id !== user._id)[0].bio}
                                location={chatroom && chatroom.owners.filter(x => x._id !== user._id)[0].location}
                                images={chatroom && chatroom.owners.filter(x => x._id !== user._id)[0].images}
                            >
                                <button
                                    className={`ui button inverted ${theme.action}`}
                                    onClick={() => setExpanded(false)}
                                >Collapse</button>
                            </ProfileCard>
                        )
                        : (
                            <article
                                onClick={() => setExpanded(true)}
                                style={{ cursor: 'pointer' }}
                                className={`ui icon message blur-box`}>
                                <section className='ui tiny image circle icon'>
                                    <img
                                        style={{ width: '80px' }}
                                        src={chatroom && chatroom.owners.filter(x => x._id !== user._id)[0].image.url} />
                                </section>
                                <section className='item'>
                                    <section className='content'>
                                        <span className='header'>You Are Chatting With {chatroom && chatroom.owners.filter(x => x._id !== user._id)[0].name}</span>
                                        <br></br>
                                        <section className='description'>{chatroom && chatroom.owners.filter(x => x._id !== user._id)[0].name.split(' ')[0]}{members === 2 ? ' Is Online ✅' : ' Is Offline 🔴'}</section>
                                    </section>
                                </section>
                            </article>
                        )
                }
            </article>
            {loading ? (<Loader global={true} />) : null}
            {error ? (<ErrorComponent error={error} />) : null}
            <section
                style={{ height: '65vh', overflowY: 'auto' }}
                className='ui segment container warning error success info'>
                <form
                    onSubmit={e => postMessage(e)}
                    className='ui segment form'>
                    <section className='field'>
                        <label htmlFor='post-input'>Send A Message</label>
                        <input
                            type='text'
                            maxLength={500}
                            value={post}
                            onChange={e => {
                                setPost(e.target.value)
                                if (e.target.value === '') {
                                    user && localSocket && localSocket.emit('type_end', user._id)
                                }
                                else {
                                    user && localSocket && localSocket.emit('type', user._id)
                                }
                            }}
                            placeholder='Be nice.'
                            id='post-input'></input>
                    </section>
                    <button type='submit' className={`ui button inverted ${theme.action}`}>Send</button>
                </form>
                {
                    typing && typing.map(v => (
                        <article
                            key={v}
                            style={{ width: '80%', marginLeft: v !== user._id ? '20%' : null, textAlign: v === user._id ? 'left' : 'right' }}
                            className={`ui icon message floated ${v === user._id ? 'info left' : 'success right'}`}
                        >{chatroom && chatroom.owners.filter(x => x._id === v)[0].name} is typing...</article>
                    ))
                }
                {chatroom && chatroom.messages && chatroom.messages.sort((a, b) => a.timestamp < b.timestamp ? 1 : -1).map(v => (
                    <article
                        key={v.timestamp}
                        style={{ width: '80%', marginLeft: v.owner !== user._id ? '20%' : null, textAlign: v.owner === user._id ? 'left' : 'right' }}
                        className={`ui icon message floated ${v.owner === user._id ? 'info left' : 'success right'}`}
                    >
                        <section className='content'>
                            <p>{new Date(v.timestamp).toDateString()} {new Date(v.timestamp).toLocaleTimeString()}</p>
                            <p>{v.content}</p>
                        </section>
                    </article>
                ))}
            </section>
            <SafeButton
                onClick={() => unmatch()}
                color='red'>Unmatch</SafeButton>
        </aside>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default Chat