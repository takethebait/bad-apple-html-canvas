type PixelData = {
    redIndex: number,
    greenIndex: number,
    blueIndex: number,
    opacityIndex: number
}

type DrawSegment = {
    count: number,
    value: number
}

const getPixelData = (x: number, y: number): PixelData => {
    const red = y * (WIDTH * 4) + x * 4;
    return {
        redIndex: red,
        greenIndex: red + 1,
        blueIndex: red + 2,
        opacityIndex: red + 3
    }
}

const getColorValue = (value: number): number => {
    return value === 0 ? 0 : 255;
}

let fileData: string[];

const inputHtmlElement = document.getElementById("textFile") as HTMLInputElement;
inputHtmlElement.addEventListener("change", () => {
    if (inputHtmlElement.files === null) return;
    const file = inputHtmlElement.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
        console.log("File loaded");
        if (event.target !== null) {
            const splitData = event.target.result as string;
            fileData = splitData.split("|");
            setupAudioContext();
            audioElement.play();
            drawLoop();
        }
    });
    reader.readAsText(file);
});

const WIDTH = 320;
const HEIGHT = 240;
const FRAME_PIXEL_COUNT = WIDTH * HEIGHT;
const FRAME_TIME = 1000 / 30;
const frameBuffer = new Uint8Array(FRAME_PIXEL_COUNT);
const canvas = document.getElementById("apple") as HTMLCanvasElement;
const ctx = canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;

const imageDt = new ImageData(WIDTH, HEIGHT);

const fps = document.getElementById("fps");

let currentDataSegment = 0;
let pixelsWrittenThisFrame = 0;
let then = Date.now();
let lastFpsUpdate = Date.now();
let framesRendered = 0;

let elapsed = 0;

const drawLoop = () => {
    requestAnimationFrame(drawLoop);
    const now = Date.now();
    elapsed = now - then;

    if (elapsed > FRAME_TIME) {
        then = now - (elapsed % FRAME_TIME);

        let count = 0;
        buildFrame();
        const imgData = imageDt.data;
        for (let i = 0; i < HEIGHT; i++) {
            for (let j = 0; j < WIDTH; j++) {
                const pxData = getPixelData(j, i);
                const cv = getColorValue(frameBuffer[count]);
                imgData[pxData.redIndex] = cv;
                imgData[pxData.blueIndex] = cv;
                imgData[pxData.greenIndex] = cv;
                imgData[pxData.opacityIndex] = 255;
                count++;
            }
        }

        ctx.putImageData(imageDt, 0, 0);
        framesRendered++;
    }

    if (now - lastFpsUpdate > 1000) {
        fps!.innerText = framesRendered.toString();
        framesRendered = 0;
        lastFpsUpdate = now;
    }

    if (currentDataSegment > fileData.length)
        return;
}

const buildFrame = () => {
    while (pixelsWrittenThisFrame < FRAME_PIXEL_COUNT) {
        const segment = fileData[currentDataSegment];
        const values = splitDataSegment(segment);
        for (let i = 0; i < values.count; i++) {
            frameBuffer[pixelsWrittenThisFrame] = values.value;
            pixelsWrittenThisFrame++;
        }
        currentDataSegment++;
    }

    pixelsWrittenThisFrame = 0;
}

const splitDataSegment = (rawFrameData: string): DrawSegment => {
    const subs = rawFrameData.split(":");
    return { count: parseInt(subs[0]), value: parseInt(subs[1]) }
}

const audioElement = document.querySelector("audio")!;
const setupAudioContext = () => {
    let audioCtx = new AudioContext();

    const track = audioCtx.createMediaElementSource(audioElement);
    track.connect(audioCtx.destination);

    const playButton = document.getElementById("play");
    playButton?.addEventListener("click", () => {
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        if (playButton.dataset.playing === "false") {
            audioElement.play();
            playButton.dataset.playing = "true";
        } else if (playButton.dataset.playing === "true") {
            audioElement.pause();
            playButton.dataset.playing = "false";
        }
    });

    audioElement.addEventListener(
        "ended",
        () => {
            playButton!.dataset.playing = "false";
        },
        false
    );
}