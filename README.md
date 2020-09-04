# Chord Detector

Detect what chords are being played in an [AudioBuffer] in the browser's [AudioContext].  Also exposes a [Chromagram] that will show you what notes are being played.

This is a javascript wrapper that uses [Emscripten] to wrap [Adam Stark]'s [Chord-Detector-and-Chromagram]

 [AudioBuffer]: https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
 [AudioContext]: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
 [Chromagram]: https://en.wikipedia.org/wiki/Chroma_feature
 [Adam Stark]: https://github.com/adamstark
 [Chord-Detector-and-Chromagram]: https://github.com/adamstark/Chord-Detector-and-Chromagram
 [Emscripten]: http://kripken.github.io/emscripten-site/

# Building

```bash
git submodule update --init
npm install webworkify
npm install serve
source ~/git/emsdk/emsdk_env.sh
npm run build
npm run serve
```

# Demo

[Demo](https://myers.github.com/chord_detector/) where you can play different sound clips of a chord and see what is detected.

# Projects Built On This

Let me know if you build something on this, and I will list it here.
