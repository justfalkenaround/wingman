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

    /*_____ LIVE CALLBACK FUNCTION _____*/
    self.callback = (type, outcome) => {
        self.postMessage({
            message: 'callback',
            outcome,
            type
        })
    }

    /*_____ MODULARIZATION OF MODEL AND PROFILE IMAGE EXAMINATION _____*/
    self._examine = async (model, profile) => {
        tf.engine().startScope()
        /*_____ CREATE BITMAP _____*/
        const img_data = await fetch(profile.image.url)
        const buff = await img_data.blob()
        const img_data_obj = await createImageBitmap(buff)
        /*_____ CONVERT TO TENSOR _____*/
        const data_tensor = tf.browser.fromPixels(img_data_obj)
        /*_____ RESIZE _____*/
        const data_tensor_resized = tf.image.resizeBilinear(data_tensor, [224, 224]).asType('float32')
        /*_____ NORMALIZE _____*/
        const image_tensor = data_tensor_resized.div(255)
        /*_____ STACK AS A BATCH OF ONE _____*/
        const image_tensor_stacked = tf.stack([image_tensor])
        const _output = model.predict(image_tensor_stacked)
        const output = _output.arraySync()[0]
        tf.engine().endScope()
        img_data_obj.close()
        return output
    }

    self.match = async potentials => {
        tf.engine().startScope()
        const opinions_recieved = [], opinions_given = []
        for await (let profile of potentials) {
            tf.engine().startScope()
            const model = await tf.loadLayersModel(tf.io.http(
                `${self.hostname}/api/profile/readmodel/${profile._id}/model.json`,
                {
                    requestInit: {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${self.token}`
                        }
                    }
                }
            ))
            tf.engine().endScope()
            tf.engine().startScope()
            const _output = await self._examine(model, profile)
            opinions_recieved.push(_output)
            self.callback('recieved', _output)
            tf.engine().endScope()
            model.dispose()
        }
        tf.engine().endScope()
        tf.engine().startScope()
        const model = await tf.loadLayersModel(tf.io.http(
            `${self.hostname}/api/profile/readmodel/${self.user._id}/model.json`,
            {
                requestInit: {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${self.token}`
                    }
                }
            }
        ))
        tf.engine().endScope()
        tf.engine().startScope()
        for await (let profile of potentials) {
            const _output = await self._examine(model, profile)
            opinions_given.push(_output)
            self.callback('given', _output)
        }
        let best = -Infinity, best_index = null
        for (let i = 0; i < opinions_given.length; i++) {
            if (opinions_given[i] * opinions_recieved[i] > best) {
                best = opinions_given[i] * opinions_recieved[i]
                best_index = i
            }
        }
        tf.engine().endScope()
        model.dispose()
        return potentials[best_index]
    }

    /*_____ RECIEVER FUNCTION _____*/
    self.onmessage = async message => {
        /*_____ HANDLE INITIALIZATION SIGNAL _____*/
        if (message.data.message === 'init') {
            self.user = message.data.user
            self.token = message.data.token
            self.hostname = message.data.hostname
            /*_____ AWAIT THE LOADING OF THE TENSORFLOW LIBRARY _____*/
            await (async () => {
                let ret = await fetch('https://cdnjs.cloudflare.com/ajax/libs/tensorflow/4.13.0/tf.min.js')
                ret = await ret.text()
                return eval(ret)
            })()
            await tf.ready()
            self.ready()
        }
        /*_____ HANDLE MATCH SIGNAL _____*/
        if (message.data.message === 'match') {
            if (!self.ready) return
            const _match = await self.match(message.data.potentials)
            self.postMessage({
                message: 'match_found',
                match: _match,
            })
        }
        /*_____ HANDLE EXIT SIGNAL _____*/
        if (message.data.message === 'exit') {
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