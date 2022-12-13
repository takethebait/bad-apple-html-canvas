# Bad Apple in HTML Canvas

This is a learning project of getting familiar with the HTML canvas element by attempting to play "Bad Apple" in it (in a Bad way). Just point the file input element to the `sample.txt` file and it'll start playing. Please do not use this as a reference for anything...seriously this is extremly inefficent. Feel free to fork it and make it better.

## Build

Just run `npm run build` to get the `main.js` file. To get the audio file just go to the original video upload on youtube, inlclude it and it should sync up.

## Internals

The video was preprocessed in OpenCV to clamp the color value to either 0 or 255. Each frame was then serialized to text in a format of `"<repeat the following number this many times>:<color_value>|"`. Since the original video was 320x240 this results in 76800 values per frame.
The `buildFrame` parses these segments until 76800 values have been deserialized. This frame is then put into the `ImageData` element of the canvas. Rinse and repeat.
