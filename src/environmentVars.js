const w =
        0.98 *
        Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
const h =
        0.85 *
        Math.max(
            document.documentElement.clientHeight,
            window.innerHeight || 0
        );
const framesPerSecond = 30;
const smallerSize= w < h ? w : h;
const gridSize= 200;
const scale= smallerSize / gridSize;

const environmentVars = {
    framesPerSecond: framesPerSecond,
    frameLength: 1000 / framesPerSecond,
    smallerSize: smallerSize,
    gridSize: gridSize, // must match Board.maps.maxWidth and maxHeight;
    scale: scale
};
export default environmentVars;
