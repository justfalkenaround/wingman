/*_____ IMPORT ALL DEPENDENCIES _____*/
import { useRef, useEffect, useState } from 'react'

/*_____ HEARTS ANIMATION COMPONENT _____*/
const HeartsAnimation = props => {
    /*_____ ESCAPE REACT WITH A REF _____*/
    const canvas = useRef(null)
    /*_____ DEFAULT STATES _____*/
    const [ctx, setCtx] = useState(null)
    const [innerWidth, setInnerWidth] = useState(0)
    const [innerHeight, setInnerHeight] = useState(0)
    const [stars, setStars] = useState([])
    const [tick, setTick] = useState(false)
    const [ox, setOx] = useState(0)
    const [oy, setOy] = useState(0)

    /*_____ FUNCTION TO PICK A RANDOM VELOCITY _____*/
    const determineDirection = () => {
        let val = Math.random() * 1.5
        if (Math.random() > 0.5) {
            val *= -1
        }
        return val
    }

    /*_____ FUNCTION TO UPDATE OBJECT STATES _____*/
    const update = (stars, setStars) => {
        let _stars = [...stars]
        for (let i = 0; i < _stars.length; i++) {
            /*_____ COLLISION DETECTION _____*/
            if (_stars[i].y > innerHeight) {
                _stars[i].x = ox
                _stars[i].y = oy
                _stars[i].vx = determineDirection()
                _stars[i].vy = Math.random() * -20 - 1
            }
            /*_____ GRAVITY _____*/
            _stars[i].x += _stars[i].vx
            _stars[i].y += _stars[i].vy
            _stars[i].vy += 0.1
        }
        setStars(_stars)
    }

    /*_____ FUNCTION TO DRAW THE OBJECTS TO THE CANVAS REF _____*/
    const draw = stars => {
        if (!ctx) return
        ctx.clearRect(0, 0, innerWidth, innerHeight)
        const mult = 2
        for (let i = 0; i < stars.length; i++) {
            const x = stars[i].x, y = stars[i].y
            ctx.fillStyle = stars[i].color
            ctx.beginPath()
            ctx.moveTo(mult * 7.5 + x, mult * 4.0 + y)
            /*_____ HEARTS PATTERN INSPIRED FROM DEVDOCS _____*/
            ctx.bezierCurveTo(mult * 7.5 + x, mult * 3.7 + y, mult * 7.0 + x, mult * 2.5 + y, mult * 5.0 + x, mult * 2.5 + y)
            ctx.bezierCurveTo(mult * 2.0 + x, mult * 2.5 + y, mult * 2.0 + x, mult * 6.25 + y, mult * 2.0 + x, mult * 6.25 + y)
            ctx.bezierCurveTo(mult * 2.0 + x, mult * 8.0 + y, mult * 4.0 + x, mult * 10.2 + y, mult * 7.5 + x, mult * 12.0 + y)
            ctx.bezierCurveTo(mult * 11.0 + x, mult * 10.2 + y, mult * 13.0 + x, mult * 8.0 + y, mult * 13.0 + x, mult * 6.25 + y)
            ctx.bezierCurveTo(mult * 13.0 + x, mult * 6.25 + y, mult * 13.0 + x, mult * 2.5 + y, mult * 10.0 + x, mult * 2.5 + y)
            ctx.bezierCurveTo(mult * 8.5 + x, mult * 2.5 + y, mult * 7.5 + x, mult * 3.7 + y, mult * 7.5 + x, mult * 4.0 + y)
            ctx.fill()
        }
    }

    /*_____ RESIZE FUNCTION _____*/
    useEffect(() => {
        const func = () => {
            setInnerWidth(window.innerWidth)
            setInnerHeight(window.innerHeight)
            setOy(window.innerHeight)
            setOx(window.innerWidth / 2)
        }
        window.addEventListener('resize', func)
        func()
        /*_____ CLEAN UP _____*/
        return () => window.removeEventListener('resize', func)
    }, [])

    /*_____ GET CANVAS CONTEXT _____*/
    useEffect(() => {
        setCtx(canvas.current.getContext('2d'))
    }, [canvas])

    /*_____ CREATE OBJECTS WITH STARTING VALUES _____*/
    useEffect(() => {
        if (stars.length || innerWidth === 0 || innerHeight === 0) return
        const _stars = []
        for (let i = 0; i < 350; i++) {
            _stars.push({
                x: ox,
                y: oy,
                vx: determineDirection(),
                vy: Math.random() - 1,
                size: Math.floor(Math.random() * 4) + 1,
                color: `rgb(255, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
            })
        }
        setStars(_stars)
        /*_____ INITIATE ANIMATION LOOP _____*/
        setTick(!tick)
    }, [ctx])

    /*_____ MAIN ANITMATION LOOP _____*/
    useEffect(() => {
        const id = window.requestAnimationFrame(() => {
            update(stars, setStars)
            draw(stars)
            setTick(!tick)
        })
        return () => window.cancelAnimationFrame(id)
    }, [tick])

    /*_____ RENDER THE COMPONENT AS TRANSPARENT OVERLAY _____*/
    return (
        <canvas
            style={{ backgroundColor: 'transparent', padding: 0, border: 'none', zIndex: 9999999, position: 'fixed', top: 0, left: 0, pointerEvents: 'none' }}
            id='star-canvas'
            className='ui segment'
            width={innerWidth}
            height={innerHeight}
            ref={canvas}
        />
    )
}

/*_____ EXPORT COMPONENT _____*/
export default HeartsAnimation