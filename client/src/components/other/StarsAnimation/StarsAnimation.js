/*_____ IMPORT ALL DEPENDENCIES _____*/
import { useRef, useEffect } from 'react'
/*_____ LOAD IMAGES AS DATA URL _____*/
import PEACH from './assets/peach.png'
import EGGPLANT from './assets/eggplant.png'

/*_____ STARS ANIMATION COMPONENT _____*/
const StarsAnimation = props => {
    /*_____ STORE THE CANVAS IN A REF FOR ANIMATION _____*/
    const canvas = useRef(null)

    /*_____ SETUP ANIMATION WHEN CANVAS IS READY _____*/
    useEffect(() => {
        if (!canvas.current) return;

        /*_____ GET THE CANVAS CONTEXT _____*/
        const ctx = canvas.current.getContext('2d'), stars = [];

        /*_____ POPULATE THE STARS _____*/
        for (let i = 0; i < 600; i++) {
            stars.push({ x: canvas.current.width * Math.random(), y: canvas.current.height * Math.random() })
        }
        for (let i = 0; i < 20; i++) {
            stars.push({ x: canvas.current.width * Math.random(), y: canvas.current.height * Math.random(), image: Math.random() > 0.5 ? 'peach' : 'eggplant' })
        }

        /*_____ LOAD THE IMAGES _____*/
        const peach = new Image()
        peach.src = PEACH
        const eggplant = new Image()
        eggplant.src = EGGPLANT

        /*_____ UPDATE FUNCTION TO MOVE THE POSITION OF THE STAR OBJECTS EACH TICK _____*/
        const update = () => {
            for (let i = 0; i < stars.length; i++) {
                stars[i].x += -0.4
                stars[i].y += -0.4
                stars[i].x <= 0 ? stars[i].x += canvas.current.width - stars[i].x : null
                stars[i].y <= 0 ? stars[i].y += canvas.current.height - stars[i].y : null
            }
        }

        /*_____ DRAW FUNCTION TO CLEAR AND DRAW THE STARS ON THE CANVAS EACH TICK _____*/
        const draw = () => {
            if (!ctx) return
            ctx.clearRect(0, 0, canvas.current.width, canvas.current.height)
            ctx.fillStyle = `rgba(255, 255, 255, 1)`
            ctx.font = '18px serif'
            for (let i = 0; i < stars.length; i++) {
                if (stars[i].image && (!peach || !eggplant)) continue
                stars[i].image
                    ? ctx.drawImage(stars[i].image === 'peach' ? peach : eggplant, 0, 0, 300, 300, stars[i].x, stars[i].y, 24, 24)
                    : ctx.fillRect(stars[i].x, stars[i].y, 2, 2)
            }
        }
        
        /*_____ ANIMATION LOOP _____*/
        const loop = () => {
            update()
            draw()
            id = window.requestAnimationFrame(() => loop())
        }
        let id = window.requestAnimationFrame(() => loop())
        return () => window.cancelAnimationFrame(id)
    }, [canvas, canvas.current])

    return (
        <canvas
            style={
                {
                    padding: 0,
                    backgroundColor: 'black',
                    border: 'none',
                    zIndex: -999999,
                    position: 'fixed',
                    top: 0,
                    left: 0
                }
            }
            id='star-canvas'
            className='ui segment'
            width={window.innerWidth}
            height={window.innerHeight}
            ref={canvas}
        />
    )
}

/*_____ EXPORT COMPONENT _____*/
export default StarsAnimation