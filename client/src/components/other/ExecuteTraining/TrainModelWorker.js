'use strict'

/*_____

I am aware that this model structure is not correct for this specific task. Unfortunatly I do not have access to tfjs-node and therefore am unable to train a conv-net from scratch to recognize common image features relevant to the task of recognizing subjective attractiveness. The GPU memory space required is simply beyond the capacity of a browser tab, and even if it wasn't, the speed of training would be very very slow. I am confident that if the convulutonal side of the model were trained on the server side and the neural net on the client, that this would be an effective system. Periodically the convulutonal could be retrained on the server with the ever-growing dataset to produce even better outcomes. In a way, when it's lifespan is over, the model would learn from it's children, die, and be reborn, then repeat.

_____*/

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

    /*_____ RECIEVER FUNCTION _____*/
    self.onmessage = async message => {
        /*_____ HANDLE INITIALIZATION SIGNAL _____*/
        if (message.data.message === 'init') {
            self.hostname = message.data.hostname
            self.token = message.data.token
            /*_____ AWAIT THE LOADING OF THE TENSORFLOW LIBRARY _____*/
            await (async () => {
                let ret = await fetch('https://cdnjs.cloudflare.com/ajax/libs/tensorflow/4.13.0/tf.min.js')
                ret = await ret.text()
                return eval(ret)
            })()
            await tf.ready()
            tf.engine().startScope()
            /*_____ LOAD THE MODEL _____*/
            self.shaved_model = await tf.loadLayersModel(message.data.url)
            tf.engine().endScope()
            self.ready()
        }
        /*_____ HANDLE TRAIN SIGNAL _____*/
        if (message.data.message === 'train') {
            tf.engine().startScope()
            /*_____ SHUFFLE THE DATA _____*/
            message.data.training_data.sort(() => Math.random() - 0.5)
            /*_____ SEPERATE THE RATINGS _____*/
            const test_ratings = message.data.training_data.map(v => [v.rating])
            /*_____ SEPERATE AND AWAIT THE LOADING OF ALL IMAGES _____*/
            const test_images_raw = []
            for await (let img of message.data.training_data) {
                const img_data = await fetch(img.image.url)
                const buff = await img_data.blob()
                const img_data_obj = await createImageBitmap(buff)
                test_images_raw.push(img_data_obj)
            }
            /*_____ CONVERT TO TENSORS _____*/
            const test_images = test_images_raw.map(v => {
                const data_tensor = tf.browser.fromPixels(v)
                /*_____ RESIZE _____*/
                const data_tensor_resized = tf.image.resizeBilinear(data_tensor, [224, 224]).asType('float32')
                /*_____ NORMALIZE _____*/
                return data_tensor_resized.div(255)
            })
            /*_____ DOUBLE DATA SET SIZE BY REVERSING ALL IMAGES _____*/
            const test_images_reversed = test_images.map(v => {
                /*_____ REVERSE _____*/
                const data_tensor_reversed = tf.reverse(v, 1)
                return data_tensor_reversed
            })
            /*_____ RELEASE THE DATA FORM GPU MEMORY _____*/
            for (let bitmap of test_images_raw) {
                bitmap.close()
            }
            /*_____ CREATE IO TENSORS _____*/
            const images_tensor = tf.stack([...test_images, ...test_images_reversed])
            const ratings_tensor = tf.tensor([...test_ratings, ...test_ratings])
            /*_____ USE THE MOBILENET CONVOLUTION LAYERS FREEZE THE OUTPUT _____*/
            const frozen_features = self.shaved_model.predict(images_tensor)
            /*_____ CREATE A DEEPLY CONNECTED NEURAL NET _____*/
            const neural_net = tf.sequential({
                layers: [
                    /*_____ FLATTEN THE INPUT TO MATCH THE OUTPUT OF THE CONVOLUTION _____*/
                    tf.layers.flatten({ inputShape: frozen_features.shape.slice(1) }),
                    /*_____ DROPOUT LAYERS PREVENT OVERFITTING _____*/
                    tf.layers.dropout({ rate: 0.25 }),
                    /*_____ DENSE LAYERS POWERS OF 2 _____*/
                    tf.layers.dense({ units: 128, activation: 'relu' }),
                    tf.layers.dropout({ rate: 0.25 }),
                    /*_____ MANY HIDDEN LAYERS INCREASE THE CAPACITY _____*/
                    tf.layers.dense({ units: 64, activation: 'relu' }),
                    tf.layers.dropout({ rate: 0.25 }),
                    /*_____ RELU ACTIVATION ADD NON_LINEARITY _____*/
                    tf.layers.dense({ units: 32, activation: 'relu' }),
                    /*_____ OUTPUT IS A SCALAR REPRESENTING THE BINARY CLASSIFICAION _____*/
                    tf.layers.dense({ units: 1, activation: 'sigmoid' })
                ]
            })
            /*_____ COMPILE USING HYPERPARAMETERS GOOD FOR THE TASK _____*/
            neural_net.compile({
                optimizer: 'adam',
                loss: 'binaryCrossentropy',
                metrics: ['accuracy'],
            })
            const _train = async () => {
                const result = await neural_net.fit(frozen_features, ratings_tensor, {
                    epochs: 1,
                    batchSize: 64,
                    callbacks: {
                        onEpochEnd: (iteration, metric) => {
                            self.postMessage({
                                message: 'callback',
                                iteration,
                                metric
                            })
                        },
                    }
                })
                return result
            }
            /*_____ TRAIN THE NEURAL NET ON THE DATA _____*/
            const _trap = async (history = { acc: [], loss: [] }) => {
                let _history = await _train()
                history.acc.push(_history.history.acc[0])
                history.loss.push(_history.history.loss[0])
                if (history.acc[history.acc.length - 1] < 0.95) {
                    history = await _trap(history)
                }
                return history
            }
            const history = await _trap()
            /*_____ CREATE A NEW MODEL _____*/
            const convolutional_neural_net = tf.sequential()
            /*_____ COMBINE THE CONVOLUTION MODEL _____*/
            convolutional_neural_net.add(self.shaved_model)
            /*_____ AND THE NEURAL NET _____*/
            convolutional_neural_net.add(neural_net)
            /*_____ AND FINALLY SAVE THE RESULT _____*/
            await convolutional_neural_net.save(tf.io.http(
                `${self.hostname}/api/profile/savemodel`,
                {
                    requestInit: {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${self.token}`
                        }
                    }
                }
            ))
            tf.engine().endScope()
            /*_____ NOTIFY THE CLIENT _____*/
            self.postMessage({
                message: 'train_complete',
                metrics: history,
            })
        }
        /*_____ HANDLE EXIT SIGNAL _____*/
        if (message.data.message === 'exit') {
            /*_____ CLEAN UP ON THE WAY OUT _____*/
            try {
                tf.dispose(self.shaved_model)
                self.shaved_model = null
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