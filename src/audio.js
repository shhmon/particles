let audioElement = document.getElementById('source')
let audioCtx = new AudioContext()

let analyser = audioCtx.createAnalyser()
analyser.fftSize = 2048

let source = audioCtx.createMediaElementSource(audioElement)

source.connect(analyser) //this connects our music back to the default output, such as your //speakers
source.connect(audioCtx.destination)
audioCtx.resume()
audioElement.onplay = () => {
    audioCtx.resume()
}

export { analyser, source }
