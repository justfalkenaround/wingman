/*_____ IMPORT ALL DEPENDENCIES _____*/
import './ImageInput.css'
import { useState, useRef, useEffect } from 'react'
import Loader from '../Loader/Loader.js'
import HumanDetectorWorker from './HumanDetectorWorker.js'
/*_____ A COMPUTER VISION CONVOLUTIONAL NEURAL CREATED ESPECIALLY FOR THIS APP _____*/
import { HumanDetectorModelURL } from './HumanDetectorModelURL.js'

/*_____

A NICE LITTLE COMPONENT LETS USERS SUBMIT A PHOTO AND RESIZE/CROP IT.
AI THEN ANALYZES THE IMAGE AND ONLY ALLOWS SUBMISSION IF IT THINKS IT CONTAINS A HUMAN.

_____*/

const ImageInput = props => {
    /*_____ CLAMP A NUMBER BETWEEN TWO VALUES INCLUSIVE _____*/
    const clamp = (num, low = -Infinity, high = Infinity) => num < low ? low : num > high ? high : num
    /*_____ ESCAPE FROM REACT CONTEXT FOR THE CANVAS _____*/
    const canvas = useRef(null)
    /*_____ SET ALL OF THE DEFAULT STATES _____*/
    const [image, setImage] = useState(null)
    const [ctx, setCtx] = useState(null)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 })
    const [mouse, setMouse] = useState(false)
    const [touch, setTouch] = useState(false)
    const [scale, setScale] = useState(1)
    const [valid, setValid] = useState(false)
    const [humanDetector, setHumanDetector] = useState(null)
    const [humanDetectorReady, setHumanDetectorReady] = useState(false)
    const [request, setRequest] = useState(false)
    const [tested, setTested] = useState(false)

    /*_____ SENDS IMAGE TO WORKER TO BE ANALYZED _____*/
    const testImage = () => {
        if (!humanDetector) return
        humanDetector.postMessage({
            message: 'analyze',
            image: ctx.getImageData(0, 0, canvas.current.width, canvas.current.height),
            url: canvas.current.toDataURL()
        })
    }

    /*_____ DEBOUNCE THE TEST IMAGE CALLS _____*/
    useEffect(() => {
        if (!humanDetector) return
        setValid(false)
        props.setValidImage(null)
        const timer = setTimeout(() => {
            testImage()
        }, 200)
        return () => {
            clearTimeout(timer)
        }
    }, [request])

    /*_____ HANDLE THE UPLOAD OF A NEW IMAGE _____*/
    const handleUpload = (e) => {
        const Reader = new FileReader()
        Reader.addEventListener('load', () => {
            const img = new Image()
            img.src = Reader.result
            setImage(img)
            /*_____ ANALYZE THE IMAGE UPON LOADING _____*/
            setRequest(!request)
            setTested(false)
        })
        Reader.readAsDataURL(Array.from(e.target.files)[0])
        /*_____ SET UI MESSAGE WITH WARNING _____*/
        props.setMessage({
            header: 'Drag The Photo To Adjust',
            message: 'Photo Must Contain A Person Or The A.I Will Get Mad.',
            type: 'warning'
        })
    }

    /*_____ GET THE LARGEST POSSIBLE FITTING SCALE OF THE IMAGE _____*/
    const getScale = () => {
        return image.width <= image.height
            ? canvas.current.width / image.width
            : canvas.current.height / image.height
    }

    /*_____ MOUSE HANDLER _____*/
    const handleMouseMove = (e) => {
        if (!mouse || !image) return
        setOffset({ x: clamp(offset.x + e.movementX, -(image.width * scale) + canvas.current.width, 0), y: clamp(offset.y + e.movementY, -(image.height * scale) + canvas.current.height, 0) })
        setRequest(!request)
    }

    /*_____ TOUCH HANDLER _____*/
    const handleTouchMove = (e) => {
        if (!touch || !image) return
        setOffset({ x: clamp(offset.x + (e.touches[0].clientX - lastTouch.x), -(image.width * scale) + canvas.current.width, 0), y: clamp(offset.y + (e.touches[0].clientY - lastTouch.y), -(image.height * scale) + canvas.current.height, 0) })
        setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY })
        setRequest(!request)
    }

    /*_____ RENDER THE CANVAS WITH STATE WHEN REACT RENDERS _____*/
    useEffect(() => {
        if (image && image.complete && image.src) {
            setScale(getScale())
            ctx.clearRect(0, 0, canvas.current.width, canvas.current.height)
            ctx.drawImage(image, offset.x, offset.y, image.width * scale, image.height * scale)
            if (!tested) {
                setRequest(!request)
                setTested(true)
            }
        }
    })

    /*_____ AQUIRE THE CANVAS CONTEXT _____*/
    useEffect(() => {
        setCtx(canvas.current.getContext('2d'))
    }, [canvas])

    /*_____ LOAD UP THE MODEL WORKER _____*/
    useEffect(() => {
        /*_____ SEND EXIT SIGNAL WHEN COMPONENT UNMOUNTS _____*/
        if (humanDetector) return () => {
            humanDetector.postMessage({
                message: 'exit'
            })
        }
        const MODEL = new Worker(HumanDetectorWorker)
        /*_____ SEND INITIALIZE SIGNAL _____*/
        MODEL.postMessage({
            message: 'init',
            url: HumanDetectorModelURL
        })
        /*_____ HANDLE RESPONSES _____*/
        MODEL.onmessage = handleModelResponse
        setHumanDetector(MODEL)
        /*_____ SEND EXIT SIGNAL WHEN COMPONENT UNMOUNTS _____*/
        return () => {
            MODEL.postMessage({
                message: 'exit'
            })
        }
    }, [])

    /*_____ HANDLE WORKER RESPONSES _____*/
    const handleModelResponse = message => {
        /*_____ AWAIT READY SIGNAL _____*/
        if (message.data.message === 'ready') {
            setHumanDetectorReady(true)
        }
        /*_____ HANDLE RESULT MESSAGE _____*/
        else if (message.data.message === 'result') {
            if (message.data.result > 0.99) {
                /*_____ UPDATE THE MOST RECENT VALID IMAGE _____*/
                setValid(true)
                props.setValidImage(message.data.url)
                props.setMessage({
                    header: 'Drag The Photo To Adjust',
                    message: 'The A.I Likes This Picture',
                    type: 'success'
                })
            }
            /*_____ OTHERWISE MAKE VALID STATE FALSE AND UPDATE TO NEGATIVE MESSAGE _____*/
            else {
                props.setMessage({
                    header: 'Drag The Photo To Adjust Or Select Another Photo',
                    message: 'Photo Must Contain A Person And The A.I Doesn\'t See One',
                    type: 'warning'
                })
                setValid(false)
                props.setValidImage(null)
            }
        }
        /*_____ HANDLE ERRORS _____*/
        else if (message.data.message === 'error') {
            props.setMessage({
                header: 'Something Went Wrong With The A.I',
                message: 'Please Try Again',
                type: 'error'
            })
        }
    }

    return (
        <article className='ui field'>
            <section className='field max-target'>
                <label htmlFor='image-input'>{props.alternate || 'Please Select A Profile Picture'}</label>
                <input
                    accept='image/*'
                    multiple={false}
                    required
                    id='image-input'
                    type='file'
                    onChange={handleUpload}
                >
                </input>
                {
                    humanDetectorReady
                        ? null
                        : <Loader global={true} />
                }
                <canvas
                    willreadfrequently='true'
                    id='image-cropper'
                    className='ui segment'
                    style={
                        valid
                            ? { boxShadow: '0px 0px 4px 2px rgba(46, 255, 0, 0.50)' }
                            : { boxShadow: '0px 0px 4px 2px rgba(255, 0, 0, 0.50)' }
                    }
                    width={300}
                    height={300}
                    ref={canvas}
                    onMouseMove={handleMouseMove}
                    onMouseDown={() => setMouse(true)}
                    onMouseUp={() => {
                        setMouse(false)
                        setRequest(!request)
                    }}
                    onMouseLeave={() => setMouse(false)}
                    onTouchMove={handleTouchMove}
                    onTouchStart={(e) => {
                        setTouch(true)
                        setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY })
                    }}
                    onTouchEnd={() => {
                        setTouch(false)
                        setRequest(!request)
                    }}
                />
            </section>
        </article>
    )
}

/*_____ EXPORT COMPONENT _____*/
export default ImageInput