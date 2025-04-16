'use strict'

const WorkerFunction = () => {
    /*_____ DEFAULT READY STATE FALSE _____*/
    self._ready = false

    /*_____ SET READY STATE AND EMIT _____*/
    self.ready = () => {
        self.postMessage({
            message: 'ready'
        })
        self._ready = true
    }

    /*_____ METHOD TO ANALYZE IMAGE AND POST RESULT _____*/
    self.analyze = async (image, url) => {
        if (!self._ready) return
        /*_____ ANALYZE THE IMAGE _____*/
        tf.engine().startScope()
        const image_tensor = tf.stack([tf.image.resizeBilinear(tf.browser.fromPixels(image), [224, 224]).asType('float32')])
        const image_tensor_normalized = image_tensor.div(255)
        const result = self.model.predict(image_tensor_normalized).arraySync()[0][0]
        tf.engine().endScope()
        self.postMessage({
            message: 'result',
            url,
            result
        })
    }

    /*_____ RECIEVER FUNCTION _____*/
    self.onmessage = async message => {
        /*_____ HANDLE INITIALIZTION SIGNAL _____*/
        if (message.data.message === 'init') {
            self.garbage = []
            /*_____ AWAIT THE LOADING OF THE TENSORFLOW LIBRARY _____*/
            await (async () => {
                let ret = await fetch('https://cdnjs.cloudflare.com/ajax/libs/tensorflow/4.13.0/tf.min.js')
                ret = await ret.text()
                return eval(ret)
            })()
            await tf.ready()
            /*_____ LOAD THE MODEL _____*/
            tf.engine().startScope()
            self.model = await tf.loadLayersModel(message.data.url)
            /*_____ CREATE A TENSOR REPRESENTING AN IMAGE _____*/
            const tensor = tf.zeros([224, 224, 3])
            /*_____ WARM THE MODEL FOR FUTURE SPEED _____*/
            const stacked = tf.stack([tensor])
            /*_____ EXECUTE THE MODEL WITH DUMMY DATA _____*/
            self.model.predict(stacked)
            self.ready()
            tf.engine().endScope()
        }
        /*_____ HANDLE ANALYZR SIGNAL _____*/
        if (message.data.message === 'analyze') {
            self.analyze(message.data.image, message.data.url)
        }
        /*_____ HANDLE EXIT SIGNAL _____*/
        if (message.data.message === 'exit') {
            /*_____ FREE THE TENSORS FROM MEMORY _____*/
            try {
                tf.dispose(self.model)
                self.model = null
            }
            catch (err) { }
            self.close()
        }
    }

    /*_____ ERROR HANDLING _____*/
    self.onerror = error => {
        self.postMessage({
            message: 'error',
            error
        })
        self.close()
    }
}

/*_____ SOME ROUNDABOUT CODE TO ENCLOSE THE WORKER IN A VALID URL THAT WONT VIOLATE CORS _____*/
let STEP = WorkerFunction.toString()

STEP = STEP.substring(STEP.indexOf('{') + 1, STEP.lastIndexOf('}'))

const blob = new Blob([STEP], { type: 'application/javascript' })

export default URL.createObjectURL(blob)