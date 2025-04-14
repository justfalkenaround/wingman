'use strict'

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import axios from 'axios'

/*_____ CREATE AN INSTANCE OF AXIOS WITH THE API ROOT PATH _____*/
const api = axios.create({
    baseURL: '/api/',
})

/*_____ READ ML MODEL METRICS _____*/
export const readMetrics = async metric => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.get(`profile/readmetrics`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ PUSH ML MODEL METRIC _____*/
export const pushMetric = async metric => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.put(`profile/pushmetric`, metric, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ SAVE ML MODEL _____*/
export const uploadModel = async (model, tf = null) => {
    try {
        if (!tf) {
            await (async () => {
                let ret = await fetch('https://cdn.tlm.cloud/tensor-flow/4.13.0/tf.min.js')
                ret = await ret.text()
                return eval(ret)
            })()
        }
        const token = window.localStorage['api_token']
        await model.save(tf.io.http(
            '/api/profile/savemodel',
            {
                requestInit: {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            }
        ))
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ GET ML MODEL _____*/
export const downloadModel = async (user_id, tf = null) => {
    try {
        if (!tf) {
            await (async () => {
                let ret = await fetch('https://cdn.tlm.cloud/tensor-flow/4.13.0/tf.min.js')
                ret = await ret.text()
                return eval(ret)
            })()
        }
        const token = window.localStorage['api_token']
        const res = await tf.loadLayersModel(tf.io.http(
            `/api/profile/readmodel/${user_id}/model.json`,
            {
                requestInit: {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            }
        ))
        return res
    }
    catch (err) {
        throw err
    }
}

/*_____ GET TRAINING DATA _____*/
export const getNext = async () => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.get(`profile/nextphoto`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ READ TRAINING DATA _____*/
export const readTrainingData = async () => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.get(`profile/readtrainingsets`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ PUSH TRAINING DATA _____*/
export const updateTrainingData = async () => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.put(`profile/updatetrainingdata`, null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ PUSH TRAINING DATA _____*/
export const skipTrainingImage = async id => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.post(`profile/skiptrainingdata/${id}`, null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ PUSH TRAINING DATA _____*/
export const pushTrainingImage = async document => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.post(`profile/pushtrainingdata`, document, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ DELETE A CHATROOM _____*/
export const deleteChat = async id => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.delete(`profile/chat/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ POST TO A CHATROOM _____*/
export const postMessageToChat = async (id, data) => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.put(`profile/chat/${id}`, data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ GET A CHATROOM _____*/
export const getChat = async id => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.get(`profile/chat/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        res.socket = io({
            extraHeaders: {
                authorization: `Bearer ${token}`
            }
        })
        await new Promise((resolve, reject) => {
            res.socket.on('connect', resolve)
            res.socket.on('connect_failed', reject)
        })
        return res
    }
    catch (err) {
        throw err
    }
}

/*_____ CREATE A NEW MATCH _____*/
export const createMatch = async id => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.post(`profile/match/${id}`, null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ READ PROFILES BASED ON QUERY JUST COUNT _____*/
export const readCount = async (minage = 0, maxage = 999, maxdist = 999999999) => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.get(`profile/count/${minage}/${maxage}/${maxdist}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ READ PROFILES BASED ON QUERY _____*/
export const readPotentials = async (minage = 0, maxage = 999, maxdist = 999999999) => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.get(`profile/potentials/${minage}/${maxage}/${maxdist}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ UPDATE A MATCH DOCUMENT _____*/
export const updateMatch = async (id, disposition) => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.put(`profile/match/${id}/${disposition}`, null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ GET ALL MATCH DATA _____*/
export const getMatches = async () => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.get(`profile/matches`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ CLEAR ALL NOTIFICATONS _____*/
export const clearAllNotification = async () => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.put(`profile/notification/clearall`, null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ SET ALL NOTIFICATIONS AS SEEN _____*/
export const allSeenNotification = async () => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.put(`profile/notification/allseen`, null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ UPDATE A NOTIFICATION DOCUMENT _____*/
export const updateNotification = async (id, data) => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.put(`profile/notification/${id}`, data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ ADD A NOTIFICATION _____*/
export const pushNotification = async data => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.post(`profile/notification`, data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ REMOVE A NOTIFICATION _____*/
export const deleteNotification = async id => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.delete(`profile/notification/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ GET TWENTY CITIES MATCHING A SEARCE _____*/
export const searchCities = async search => {
    try {
        const res = await api.get(`citie/twenty/${search}`)
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ SIGN UP A NEW PROFILE _____*/
export const handleSignUp = async profile => {
    try {
        const res = await api.post('profile/signup', profile)
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ SIGN IN A PROFILE AND RETURN THE ACCESS TOKEN _____*/
export const handleSignIn = async profile => {
    try {
        const res = await api.post('profile/signin', profile)
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ DELETE A PROFILE _____*/
export const handleDeleteProfile = async () => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.delete('profile/deleteprofile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ UPDATE A PROFILE _____*/
export const handleUpdateProfile = async update => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.put('profile/updateprofile', update, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ UPDATE A PROFILES IMAGES _____*/
export const handleUpdateProfileImages = async update => {
    try {
        const token = window.localStorage['api_token']
        const res = await api.put('profile/updateprofileimages', update, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    }
    catch (err) {
        throw err
    }
}

/*_____ GET THE CURRENTLY SIGNED IN PROFILE _____*/
export const currentProfile = async (SOCKET = null) => {
    try {
        const token = window.localStorage['api_token']
        if (!token || token === 'null') {
            return null
        }
        const res = await api.get('profile/currentprofile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (SOCKET) {
            res.socket = SOCKET
            return res
        }
        res.init = true
        res.socket = io({
            extraHeaders: {
                authorization: `Bearer ${token}`
            }
        })
        await new Promise((resolve, reject) => {
            res.socket.on('connect', resolve)
            res.socket.on('connect_failed', reject)
        })
        return res
    }
    catch (err) {
        throw err
    }
}

/*_____ EXPORT THE API OBJECT _____*/
export default
    {
        readMetrics,
        pushMetric,
        downloadModel,
        uploadModel,
        getNext,
        readTrainingData,
        updateTrainingData,
        pushTrainingImage,
        skipTrainingImage,
        deleteChat,
        postMessageToChat,
        getChat,
        readPotentials,
        readCount,
        updateMatch,
        createMatch,
        getMatches,
        updateNotification,
        deleteNotification,
        allSeenNotification,
        clearAllNotification,
        searchCities,
        handleSignUp,
        handleSignIn,
        currentProfile,
        handleUpdateProfile,
        handleUpdateProfileImages
    }